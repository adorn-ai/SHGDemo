// Signs and verifies the short-lived JWTs embedded in guarantor
// accept/reject email links. The token's only job is to prove "this
// link is genuine and not expired" - it carries no secret data, just
// the guarantor_response row's own id as `sub`, so a forwarded or
// leaked link exposes nothing beyond what the email itself already
// says. Actual authorization to write a decision additionally requires
// the National ID check in guarantorResponseHandler.js - the token
// alone is not sufficient to record a response.
//
// Required env var: GUARANTOR_TOKEN_SECRET
// Generate one with: openssl rand -hex 32

import jwt from 'jsonwebtoken';

// Expiry duration was still being decided as of this writing - this is
// the one place to change it once that's settled. Everything else
// (the DB's own `expires_at` column, the email copy) derives from this
// constant rather than hardcoding the number elsewhere.
export const TOKEN_EXPIRY_DAYS = 14;

function getSecret() {
  const secret = process.env.GUARANTOR_TOKEN_SECRET;
  if (!secret) {
    throw new Error('GUARANTOR_TOKEN_SECRET is not set on the server');
  }
  return secret;
}

export function signGuarantorToken(guarantorResponseId) {
  return jwt.sign({ sub: guarantorResponseId }, getSecret(), {
    expiresIn: `${TOKEN_EXPIRY_DAYS}d`,
  });
}

/**
 * @param {string} token
 * @returns {{ id: string }} the guarantor_response row id encoded in the token
 * @throws {Error & { status: number }} if the token is missing, malformed, expired, or has a bad signature
 */
export function verifyGuarantorToken(token) {
  if (!token || typeof token !== 'string') {
    const err = new Error('Missing token');
    err.status = 400;
    throw err;
  }
  try {
    const payload = jwt.verify(token, getSecret());
    if (!payload.sub) {
      const err = new Error('Malformed token');
      err.status = 400;
      throw err;
    }
    return { id: payload.sub };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const err = new Error('This link has expired. Please contact the SHG office directly.');
      err.status = 410;
      throw err;
    }
    const err = new Error('This link is invalid.');
    err.status = 400;
    throw err;
  }
}