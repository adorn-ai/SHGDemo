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
//   3. To each guarantor with a valid email AND national ID on file - a
//      notice of what they're guaranteeing, PLUS a signed, time-limited
//      link to accept or reject the guarantorship. Sending this link
//      also creates the guarantor_response row it points to (status
//      'pending') - see guarantorResponseHandler.js for what happens
//      when the guarantor actually uses it.
// Uses the same Gmail SMTP setup as the contact form and registration
// notifications (GMAIL_USER / GMAIL_APP_PASSWORD).

import nodemailer from 'nodemailer';
import { getSupabaseAdmin } from './supabaseAdmin.js';
import { signGuarantorToken, TOKEN_EXPIRY_DAYS } from './guarantorTokens.js';

// NOTE: same address used for registration notifications - if that one
// turns out to be a typo, this should be corrected the same way.
const ADMIN_EMAIL = 'shg@thome.caritasnairobishp.org';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Base URL used to build the guarantor response link. Prefer an explicit
// env var (set this in Vercel) over hardcoding a domain here - falls
// back to the current known production URL only so local/preview
// testing isn't silently blocked if the env var is missing, but you
// should set SITE_URL explicitly rather than relying on the fallback.
const SITE_URL = process.env.SITE_URL || 'https://shg-demo.vercel.app';

function createTransporter(gmailUser, gmailAppPassword) {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    // family: 4 forces IPv4 resolution for smtp.gmail.com. Without this,
    // Node's DNS resolver can return an IPv6 address first on some
    // networks (common on Windows/local dev) that has no actual working
    // IPv6 route to Gmail, causing every send to hang and fail with
    // ECONNREFUSED against an IPv6 address - not a credentials or code
    // problem, purely a connection-family issue.
    family: 4,
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
 * Creates (or refreshes, if one already exists for this loan+guarantor -
 * e.g. a retried notification) the guarantor_response row backing this
 * guarantor's accept/reject link, and returns the signed token for it.
 * Guarantors missing an email or a national ID are skipped entirely by
 * the caller before this is invoked - both are required for the digital
 * flow to be possible at all.
 */
async function createGuarantorResponseRow({ loanRegistrationId, guarantor, loanSummary }) {
  const supabaseAdmin = getSupabaseAdmin();
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from('guarantor_response')
    .upsert(
      {
        loan_registration_id: loanRegistrationId,
        guarantor_name: guarantor.name || 'Guarantor',
        guarantor_email: guarantor.email,
        guarantor_national_id: String(guarantor.idNumber || '').trim(),
        amount_offered: Number(guarantor.amountOffered) || null,
        loan_summary: loanSummary,
        status: 'pending',
        expires_at: expiresAt,
      },
      { onConflict: 'loan_registration_id,guarantor_email' }
    )
    .select('id')
    .single();

  if (error) {
    // A failure here means this one guarantor doesn't get a working
    // link - log it and let the caller fall back to a link-less email
    // rather than failing the whole notification batch over one row.
    console.error(`Failed to create guarantor_response row for ${guarantor.email}:`, error);
    return null;
  }

  return data.id;
}

/**
 * @param {{
 *   loanRegistrationId: string | number;
 *   loanee: { name: string; nationalId?: string; phone?: string; email?: string };
 *   loan: { products: string[]; amountRequested: number | string; amountInWords?: string; termMonths?: number | string; purpose?: string };
 *   guarantors: Array<{ name: string; email?: string; idNumber?: string; amountOffered?: string }>;
 * }} body
 * @param {{ gmailUser: string; gmailAppPassword: string }} credentials
 * @returns {Promise<{ ok: true; sentTo: string[] }>}
 */
export async function sendLoanApplicationNotification(body, { gmailUser, gmailAppPassword }) {
  const { loanRegistrationId, loanee, loan, guarantors } = body || {};

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

      <p>Guarantors with a valid email and National ID on file have been sent a link to accept or reject their guarantorship directly. You'll receive a separate email as each one responds.</p>
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
        <p>Your listed guarantors are being asked to confirm their guarantorship. We'll let you know as each one responds, and be in touch once a final decision has been made.</p>
      `
    );
  }

  // 3. Each guarantor with a valid email AND a national ID on file gets
  // a response link - both are required, since the response page checks
  // the ID as a second factor beyond the link itself. Guarantors missing
  // either still get the old-style informational email, just without a
  // working link, since there'd be nothing valid to verify them against.
  const loanSummary = {
    loaneeName: loanee.name,
    products: loan?.products || [],
    amountRequested: loan?.amountRequested,
    amountInWords: loan?.amountInWords,
    termMonths: loan?.termMonths,
    purpose: loan?.purpose,
  };

  for (const guarantor of guarantorList) {
    if (!guarantor.email || !EMAIL_REGEX.test(guarantor.email)) continue;

    const hasNationalId = String(guarantor.idNumber || '').trim().length > 0;
    let responseLinkHtml = '';

    if (hasNationalId && loanRegistrationId) {
      // Isolated on purpose - unlike send() below, this wasn't wrapped
      // before, and an uncaught throw here (a Supabase hiccup, a token-
      // signing error) would propagate out of the whole for-loop and
      // silently kill every remaining guarantor's email too, including
      // this guarantor's own fallback send() a few lines down. A failure
      // creating the response row should only cost this one guarantor
      // their working accept/reject link, not their email entirely.
      try {
        const guarantorResponseId = await createGuarantorResponseRow({ loanRegistrationId, guarantor, loanSummary });
        if (guarantorResponseId) {
          const token = signGuarantorToken(guarantorResponseId);
          const link = `${SITE_URL}/guarantor-response?token=${encodeURIComponent(token)}`;
          const expiryDate = new Date(Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          responseLinkHtml = `
            <p style="background:#F3F0E8; border-left:4px solid #16210E; padding:14px 18px; margin:20px 0;">
              <strong>Please respond to this request:</strong><br>
              <a href="${link}" style="color:#16210E; font-weight:bold;">Accept or Reject This Guarantorship</a><br>
              You'll be asked to confirm your National ID on that page. This link expires on <strong>${expiryDate}</strong>.
            </p>
          `;
        }
      } catch (error) {
        console.error(`Failed to create guarantor response link for ${guarantor.email}:`, error);
        // responseLinkHtml stays '' - the guarantor still gets their
        // email below, just with the plain informational fallback text
        // instead of a working link.
      }
    }

    await send(
      guarantor.email,
      `Action Needed: You've Been Listed as a Guarantor for ${loanee.name}'s Loan Application`,
      `
        <h2>Guarantor Notification</h2>
        <p>Dear ${escapeHtml(guarantor.name || 'Guarantor')},</p>
        <p>You have been listed as a guarantor on a loan application submitted by <strong>${escapeHtml(loanee.name)}</strong> for ${escapeHtml(productsList)} totalling ${escapeHtml(formattedAmount)}.</p>
        ${guarantor.amountOffered ? `<p>You are guaranteeing <strong>KES ${Number(guarantor.amountOffered).toLocaleString()}</strong> of this amount.</p>` : ''}
        ${
          responseLinkHtml ||
          '<p>This application is now under review. If you have any questions about your guarantorship, please contact the SHG office.</p>'
        }
      `
    );
  }

  return { ok: true, sentTo };
}