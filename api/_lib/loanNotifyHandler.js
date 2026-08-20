// Shared between api/notify-loan-application.js (Vercel prod) and the Vite
// dev-server proxy (vite.config.mts) - same dev/prod-parity pattern as the
// other handlers in this folder.
//
// Sends three kinds of email once a loan application is successfully saved:
//   1. To the SHG office - full loanee details, full loan details, and
//      every guarantor, so staff have everything needed to review without
//      needing to open the Admin Portal first.
//   2. To the loanee (applicant) - a confirmation summarizing what was
//      submitted.
//   3. To each guarantor with a valid email - notice of what they're
//      guaranteeing and for whom.
// Uses the same Gmail SMTP setup as the contact form and registration
// notifications (GMAIL_USER / GMAIL_APP_PASSWORD).

import nodemailer from 'nodemailer';

// NOTE: same address used for registration notifications - if that one
// turns out to be a typo, this should be corrected the same way.
const ADMIN_EMAIL = 'shg@thome.caritasnairobishp.org';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createTransporter(gmailUser, gmailAppPassword) {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {{
 *   loanee: { name: string; nationalId?: string; phone?: string; email?: string };
 *   loan: { products: string[]; amountRequested: number | string; amountInWords?: string; termMonths?: number | string; purpose?: string };
 *   guarantors: Array<{ name: string; email?: string; amountOffered?: string }>;
 * }} body
 * @param {{ gmailUser: string; gmailAppPassword: string }} credentials
 * @returns {Promise<{ ok: true; sentTo: string[] }>}
 */
export async function sendLoanApplicationNotification(body, { gmailUser, gmailAppPassword }) {
  const { loanee, loan, guarantors } = body || {};

  if (!loanee || !loanee.name || !String(loanee.name).trim()) {
    const err = new Error('Loanee name is required');
    err.status = 400;
    throw err;
  }

  const transporter = createTransporter(gmailUser, gmailAppPassword);
  const productsList = Array.isArray(loan?.products) && loan.products.length > 0 ? loan.products.join(', ') : 'a loan';
  const formattedAmount = loan?.amountRequested ? `KES ${Number(loan.amountRequested).toLocaleString()}` : 'an amount';
  const guarantorList = Array.isArray(guarantors) ? guarantors : [];
  const sentTo = [];

  const send = async (to, subject, html) => {
    try {
      await transporter.sendMail({
        from: `St Gabriel Catholic Church SHG Website <${gmailUser}>`,
        to,
        subject,
        html,
      });
      sentTo.push(to);
    } catch (error) {
      // One recipient failing (e.g. a guarantor's email is malformed)
      // shouldn't block the others - log and continue rather than throw,
      // since the loan application itself already succeeded in the database.
      console.error(`Failed to send loan notification to ${to}:`, error);
    }
  };

  // 1. SHG office - full detail
  await send(
    ADMIN_EMAIL,
    `New Loan Application - ${loanee.name}`,
    `
      <h2>New Loan Application</h2>

      <h3>Loanee Details</h3>
      <p>
        <strong>Name:</strong> ${escapeHtml(loanee.name)}<br>
        ${loanee.nationalId ? `<strong>National ID:</strong> ${escapeHtml(loanee.nationalId)}<br>` : ''}
        ${loanee.phone ? `<strong>Phone:</strong> ${escapeHtml(loanee.phone)}<br>` : ''}
        ${loanee.email ? `<strong>Email:</strong> ${escapeHtml(loanee.email)}<br>` : ''}
      </p>

      <h3>Loan Details</h3>
      <p>
        <strong>Product(s):</strong> ${escapeHtml(productsList)}<br>
        <strong>Amount Requested:</strong> ${escapeHtml(formattedAmount)}${loan?.amountInWords ? ` (${escapeHtml(loan.amountInWords)})` : ''}<br>
        ${loan?.termMonths ? `<strong>Repayment Term:</strong> ${escapeHtml(String(loan.termMonths))} months<br>` : ''}
        ${loan?.purpose ? `<strong>Purpose:</strong> ${escapeHtml(loan.purpose)}<br>` : ''}
      </p>

      <h3>Guarantors</h3>
      ${
        guarantorList.length > 0
          ? `<ul>${guarantorList
              .map(
                (g) =>
                  `<li>${escapeHtml(g.name || 'Unnamed')}${g.amountOffered ? ` - guaranteeing KES ${Number(g.amountOffered).toLocaleString()}` : ''}${g.email ? ` (${escapeHtml(g.email)})` : ''}</li>`
              )
              .join('')}</ul>`
          : '<p>None listed</p>'
      }

      <p>Please check the Admin Portal to review this application.</p>
    `
  );

  // 2. Loanee confirmation - summary of what they submitted
  if (loanee.email && EMAIL_REGEX.test(loanee.email)) {
    await send(
      loanee.email,
      'Your Loan Application Has Been Received',
      `
        <h2>Loan Application Received</h2>
        <p>Dear ${escapeHtml(loanee.name)},</p>
        <p>Your application has been received by St Gabriel Catholic Church SHG and will be reviewed as soon as possible. Here's a summary of what you submitted:</p>
        <p>
          <strong>Product(s):</strong> ${escapeHtml(productsList)}<br>
          <strong>Amount Requested:</strong> ${escapeHtml(formattedAmount)}<br>
          ${loan?.termMonths ? `<strong>Repayment Term:</strong> ${escapeHtml(String(loan.termMonths))} months<br>` : ''}
        </p>
        <p>We'll be in touch once a decision has been made.</p>
      `
    );
  }

  // 3. Each guarantor with a valid email - what they're guaranteeing
  for (const guarantor of guarantorList) {
    if (guarantor.email && EMAIL_REGEX.test(guarantor.email)) {
      await send(
        guarantor.email,
        `You've Been Listed as a Guarantor for ${loanee.name}'s Loan Application`,
        `
          <h2>Guarantor Notification</h2>
          <p>Dear ${escapeHtml(guarantor.name || 'Guarantor')},</p>
          <p>You have been listed as a guarantor on a loan application submitted by <strong>${escapeHtml(loanee.name)}</strong> for ${escapeHtml(productsList)} totalling ${escapeHtml(formattedAmount)}.</p>
          ${guarantor.amountOffered ? `<p>You are guaranteeing <strong>KES ${Number(guarantor.amountOffered).toLocaleString()}</strong> of this amount.</p>` : ''}
          <p>This application is now under review. If you have any questions about your guarantorship, please contact the SHG office.</p>
        `
      );
    }
  }

  return { ok: true, sentTo };
}