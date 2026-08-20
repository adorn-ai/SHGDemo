// Vercel serverless function at /api/notify-loan-application.js.

import { sendLoanApplicationNotification } from './_lib/loanNotifyHandler.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    console.error('GMAIL_USER or GMAIL_APP_PASSWORD is not set on the server');
    return res.status(500).json({ error: 'Notification service is not configured' });
  }

  try {
    const result = await sendLoanApplicationNotification(req.body, { gmailUser, gmailAppPassword });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Loan notification proxy error:', error);
    return res.status(error.status || 500).json({ error: error.message || 'Failed to send notification' });
  }
}
