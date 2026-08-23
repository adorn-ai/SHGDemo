// Vercel serverless function. Place this file at /api/chat.js in your project root
// (a sibling of /src, NOT inside it). Vercel auto-deploys anything in /api as an
// endpoint, so this becomes reachable at POST /api/chat — no extra config needed.
//
// This must stay a thin wrapper around handleChatRequest() from ./_lib/chatHandler.js -
// that's the one place the RAG logic (embedding the question, retrieving relevant
// chunks from knowledgeBase.js, the strict system prompt, the hard relevance gate,
// rate limiting) lives. vite.config.mts's dev proxy calls the exact same function, so
// this file and local `npm run dev` are guaranteed to behave identically. Do NOT
// re-implement any Mistral API calls directly in this file - that's what caused
// production to silently diverge from dev before (a bare, promptless call to
// mistral-tiny-latest with no retrieval, no system prompt, and no guardrails at all).

import { handleChatRequest } from './_lib/chatHandler.js';

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

  // Identify the caller for chatHandler's rate limiting. Vercel sits behind a
  // proxy, so the real client IP is in x-forwarded-for, not req.socket.
  const clientId =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';

  try {
    const { reply } = await handleChatRequest(messages, apiKey, clientId);
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat proxy error:', error);
    const status = error?.status || 500;
    return res.status(status).json({ error: error?.message || 'Failed to reach chat service' });
  }
}