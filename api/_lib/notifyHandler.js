// Shared between api/notify-registration.js (Vercel prod) and the Vite
// dev-server proxy (vite.config.mts) - same dev/prod-parity pattern as
// api/_lib/chatHandler.js and api/_lib/contactHandler.js.
//
// Sends a short heads-up email to the SHG admin address whenever someone
// submits a new membership application, so staff know to check the Admin
// Portal and verify the applicant's details. Uses the same Gmail SMTP setup
// as the contact form (GMAIL_USER / GMAIL_APP_PASSWORD).

import nodemailer from 'nodemailer';

// NOTE: as given - double-check this isn't a typo for shg@thomecaritasnairobi.org,
// the address used elsewhere on the site.
const ADMIN_EMAIL = 'shg@thome.caritasnairobishp.org';

const TYPE_LABELS = {
  member: 'Adult Membership',
  minor: 'Minor Savings Account',
  corporate: 'Corporate Membership',
};

/**
 * @param {{ applicantName: string; registrationType: 'member' | 'minor' | 'corporate' }} body
 * @param {{ gmailUser: string; gmailAppPassword: string }} credentials
 * @returns {Promise<{ ok: true }>}
 */
export async function sendRegistrationNotification(body, { gmailUser, gmailAppPassword }) {
  const { applicantName, registrationType } = body || {};

  if (!applicantName || !String(applicantName).trim()) {
    const err = new Error('Applicant name is required');
    err.status = 400;
    throw err;
  }

  const typeLabel = TYPE_LABELS[registrationType] || 'Membership';

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for port 465, false for port 587
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });

  try {
    await transporter.sendMail({
      from: `St Gabriel Catholic Church SHG Website <${gmailUser}>`,
      to: ADMIN_EMAIL,
      subject: `New ${typeLabel} Application - ${applicantName}`,
      html: `
        <h2>New ${typeLabel} Application</h2>
        <p><strong>${applicantName}</strong> has applied to join St Gabriel Catholic Church SHG.</p>
        <p>Please check the Admin Portal to review and verify their details.</p>
      `,
    });
  } catch (error) {
    console.error('Gmail SMTP error (registration notification):', error);
    const err = new Error('Failed to send notification email');
    err.status = 502;
    throw err;
  }

  return { ok: true };
}