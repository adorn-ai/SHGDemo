// Vercel serverless function at /api/contact.js.

import { handleContactRequest } from './_lib/contactHandler.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD; // NOTE: no VITE_ prefix - server-only

  if (!gmailUser || !gmailAppPassword) {
    console.error('GMAIL_USER or GMAIL_APP_PASSWORD is not set on the server');
    return res.status(500).json({ error: 'Contact service is not configured' });
  }

  try {
    const result = await handleContactRequest(req.body, { gmailUser, gmailAppPassword });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Contact proxy error:', error);
    return res.status(error.status || 500).json({ error: error.message || 'Failed to send message' });
  }
}