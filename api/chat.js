// Vercel serverless function. Place this file at /api/chat.js in your project root
// (a sibling of /src, NOT inside it). Vercel auto-deploys anything in /api as an
// endpoint, so this becomes reachable at POST /api/chat — no extra config needed.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Request body must include a non-empty "messages" array' });
  }

  // Basic guardrail: cap how much conversation history can be sent, so a
  // malicious caller can't blow up your Mistral bill with huge payloads.
  if (messages.length > 40) {
    return res.status(400).json({ error: 'Too many messages in conversation history' });
  }

  const apiKey = process.env.MISTRAL_API_KEY; // NOTE: no VITE_ prefix - server-only, never bundled to the client

  if (!apiKey) {
    console.error('MISTRAL_API_KEY is not set on the server');
    return res.status(500).json({ error: 'Chat service is not configured' });
  }

  try {
    const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-tiny-latest',
        messages,
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!mistralResponse.ok) {
      const errorText = await mistralResponse.text();
      console.error('Mistral API error:', mistralResponse.status, errorText);
      return res.status(502).json({ error: 'Chat service is temporarily unavailable' });
    }

    const data = await mistralResponse.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(502).json({ error: 'Chat service returned an unexpected response' });
    }

    // Only forward what the frontend actually needs - never pass through Mistral's
    // full raw response, which could leak details you don't want exposed.
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat proxy error:', error);
    return res.status(500).json({ error: 'Failed to reach chat service' });
  }
}