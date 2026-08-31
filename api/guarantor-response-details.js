// Vercel serverless function at /api/guarantor-response-details.js.
// Called by the guarantor response page on load, with the token from
// the URL, to fetch what to display. Read-only - no Gmail credentials
// needed here, only Supabase (via the service role key in
// supabaseAdmin.js).

import { getGuarantorResponseDetails } from './_lib/guarantorResponseHandler.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body || {};

  try {
    const details = await getGuarantorResponseDetails(token);
    return res.status(200).json(details);
  } catch (error) {
    console.error('Guarantor response details error:', error);
    return res.status(error.status || 500).json({ error: error.message || 'Failed to load this request' });
  }
}
