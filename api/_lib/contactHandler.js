// Shared between api/contact.js (Vercel prod) and the Vite dev-server proxy
// (vite.config.mts) - same dev/prod-parity pattern as api/_lib/chatHandler.js.
//
// Sends via Gmail SMTP (nodemailer) rather than a transactional API like
// Resend - no domain required, but note Gmail is built for personal use,
// not automated servers: Google's security systems occasionally block
// logins from cloud/datacenter IPs (which is what Vercel serverless
// functions use) as "suspicious". Fine for low-volume traffic; worth
// revisiting with a real transactional provider if volume grows or
// deliverability becomes unreliable.

import nodemailer from 'nodemailer';

const RECIPIENT_EMAIL = 'shg@thomecaritasnairobi.org';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @param {{ name: string; email: string; phone?: string; subject: string; message: string }} body
 * @param {{ gmailUser: string; gmailAppPassword: string }} credentials
 * @returns {Promise<{ ok: true }>}
 */
export async function handleContactRequest(body, { gmailUser, gmailAppPassword }) {
  const { name, email, phone, subject, message } = body || {};

  if (!name || !String(name).trim()) {
    const err = new Error('Name is required');
    err.status = 400;
    throw err;
  }
  if (!email || !EMAIL_REGEX.test(String(email))) {
    const err = new Error('A valid email address is required');
    err.status = 400;
    throw err;
  }
  if (!subject || !String(subject).trim()) {
    const err = new Error('Subject is required');
    err.status = 400;
    throw err;
  }
  if (!message || !String(message).trim()) {
    const err = new Error('Message is required');
    err.status = 400;
    throw err;
  }
  if (String(message).length > 5000) {
    const err = new Error('Message is too long (max 5000 characters)');
    err.status = 400;
    throw err;
  }

  const escapeHtml = (str) =>
    String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const htmlBody = `
    <h2>New message from the SHG website contact form</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ''}
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
  `;

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for port 465, false for port 587
    auth: {
      user: gmailUser,
      pass: gmailAppPassword, // the 16-character App Password, not the account password
    },
  });

  try {
    await transporter.sendMail({
      // Gmail always overwrites the "from" address with the authenticated
      // account anyway, so this display name is mostly cosmetic.
      from: `St Gabriel Catholic Church SHG Website <${gmailUser}>`,
      to: RECIPIENT_EMAIL,
      replyTo: String(email),
      subject: `[Website Contact] ${subject}`,
      html: htmlBody,
    });
  } catch (error) {
    console.error('Gmail SMTP error:', error);
    const err = new Error('Failed to send message. Please try again or email us directly.');
    err.status = 502;
    throw err;
  }

  return { ok: true };
}