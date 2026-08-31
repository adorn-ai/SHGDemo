// Vercel serverless function at /api/guarantor-response-submit.js.
// Called by the guarantor response page when the guarantor submits
// their decision. Needs Gmail credentials too, since a successful
// response triggers notification emails to the loanee and SHG office.

import { submitGuarantorResponse } from './_lib/guarantorResponseHandler.js';

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
    const result = await submitGuarantorResponse(req.body, { gmailUser, gmailAppPassword });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Guarantor response submit error:', error);
    return res.status(error.status || 500).json({ error: error.message || 'Failed to submit your response' });
  }
}
