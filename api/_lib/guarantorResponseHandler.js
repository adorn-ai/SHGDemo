// Shared between the two guarantor-response API routes
// (api/guarantor-response-details.js and api/guarantor-response-submit.js)
// and the Vite dev-server proxy, same dev/prod-parity pattern as the
// other handlers in this folder.

import nodemailer from 'nodemailer';
import { getSupabaseAdmin } from './supabaseAdmin.js';
import { verifyGuarantorToken } from './guarantorTokens.js';

const ADMIN_EMAIL = 'shg@thome.caritasnairobishp.org';

// After this many wrong National ID attempts against a single response
// row, it's locked and the guarantor is told to contact the office
// directly, rather than allowing unlimited guesses against a valid,
// unexpired link. This is a DB-backed counter (not in-memory), so it
// holds up across separate serverless invocations, unlike a purely
// in-process rate limiter would.
const MAX_ID_ATTEMPTS = 5;

function createTransporter(gmailUser, gmailAppPassword) {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    // See loanNotifyHandler.js for why family: 4 is here - avoids
    // ECONNREFUSED against an IPv6 address on networks without a
    // working IPv6 route to Gmail.
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

// National ID comparison is intentionally forgiving of formatting
// (whitespace, dashes, case) but strict on the actual characters -
// people copy IDs from all kinds of sources with inconsistent spacing.
function normalizeId(value) {
  return String(value || '').replace(/[\s-]/g, '').toUpperCase();
}

function statusMessage(status) {
  switch (status) {
    case 'accepted':
      return 'You already accepted this guarantorship request.';
    case 'rejected':
      return 'You already responded to this guarantorship request (declined).';
    case 'locked':
      return 'This link has been locked after too many incorrect ID number attempts. Please contact the SHG office directly to proceed.';
    default:
      return 'This request is no longer available.';
  }
}

async function fetchRow(id) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.from('guarantor_response').select('*').eq('id', id).maybeSingle();
  if (error) {
    console.error('Failed to fetch guarantor_response row:', error);
    const err = new Error('Something went wrong loading this request.');
    err.status = 500;
    throw err;
  }
  if (!data) {
    const err = new Error('This request could not be found.');
    err.status = 404;
    throw err;
  }
  return data;
}

function assertRespondable(row) {
  if (row.status !== 'pending') {
    const err = new Error(statusMessage(row.status));
    err.status = 409;
    throw err;
  }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    const err = new Error('This link has expired. Please contact the SHG office directly.');
    err.status = 410;
    throw err;
  }
}

/**
 * Loads the safe, guarantor-facing subset of a response row for display
 * on the response page - the snapshot the guarantor is deciding against,
 * plus their own name/amount. Never returns the National ID on file
 * (that would defeat the point of asking them to enter it) or anything
 * from loan_registration beyond what was explicitly snapshotted at
 * notification time.
 *
 * @param {string} token
 */
export async function getGuarantorResponseDetails(token) {
  const { id } = verifyGuarantorToken(token);
  const row = await fetchRow(id);
  assertRespondable(row);

  return {
    guarantorName: row.guarantor_name,
    amountOffered: row.amount_offered,
    loan: row.loan_summary,
    expiresAt: row.expires_at,
  };
}

/**
 * Records a guarantor's decision, after verifying both the token and a
 * matching National ID. Both checks must pass - the token alone proves
 * the link is genuine, but not that the person clicking it is actually
 * the guarantor named on it.
 *
 * @param {{ token: string; nationalId: string; decision: 'accepted' | 'rejected'; reason?: string }} body
 * @param {{ gmailUser: string; gmailAppPassword: string }} credentials
 */
export async function submitGuarantorResponse(body, { gmailUser, gmailAppPassword }) {
  const { token, nationalId, decision, reason } = body || {};

  if (decision !== 'accepted' && decision !== 'rejected') {
    const err = new Error('Invalid decision');
    err.status = 400;
    throw err;
  }
  if (decision === 'rejected' && (!reason || !String(reason).trim())) {
    const err = new Error('Please provide a reason for declining');
    err.status = 400;
    throw err;
  }
  if (!nationalId || !String(nationalId).trim()) {
    const err = new Error('National ID is required');
    err.status = 400;
    throw err;
  }

  const { id } = verifyGuarantorToken(token);
  const supabaseAdmin = getSupabaseAdmin();
  const row = await fetchRow(id);
  assertRespondable(row);

  // --- Second factor: National ID must match what's on file ---
  if (normalizeId(nationalId) !== normalizeId(row.guarantor_national_id)) {
    const failedAttempts = row.failed_id_attempts + 1;
    const lockedOut = failedAttempts >= MAX_ID_ATTEMPTS;

    await supabaseAdmin
      .from('guarantor_response')
      .update({
        failed_id_attempts: failedAttempts,
        status: lockedOut ? 'locked' : row.status,
      })
      .eq('id', id);

    const err = new Error(
      lockedOut
        ? 'Too many incorrect attempts. This link has been locked - please contact the SHG office directly.'
        : 'That National ID does not match our records for this guarantor. Please try again.'
    );
    err.status = 401;
    throw err;
  }

  // --- Record the decision. Conditioned on status still being 'pending'
  // at the DB level (not just checked a moment ago in JS) so two
  // near-simultaneous submissions - e.g. a double-click, or the same
  // link opened in two tabs - can't both succeed. Whichever request's
  // UPDATE actually matches a row wins; the other gets zero rows back
  // and is treated as "someone already responded". ---
  const { data: updated, error: updateError } = await supabaseAdmin
    .from('guarantor_response')
    .update({
      status: decision,
      rejection_reason: decision === 'rejected' ? String(reason).trim() : null,
      id_number_verified: true,
      responded_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'pending')
    .select()
    .maybeSingle();

  if (updateError) {
    console.error('Failed to record guarantor response:', updateError);
    const err = new Error('Something went wrong recording your response. Please try again.');
    err.status = 500;
    throw err;
  }
  if (!updated) {
    const err = new Error('This request has already been responded to.');
    err.status = 409;
    throw err;
  }

  await notifyOfGuarantorResponse({ row: updated, gmailUser, gmailAppPassword });

  return { ok: true, status: decision };
}

async function notifyOfGuarantorResponse({ row, gmailUser, gmailAppPassword }) {
  const transporter = createTransporter(gmailUser, gmailAppPassword);
  const loanSummary = row.loan_summary || {};
  const decisionLabel = row.status === 'accepted' ? 'ACCEPTED' : 'DECLINED';
  const decisionColor = row.status === 'accepted' ? '#237A17' : '#B00117';

  const bodyHtml = `
    <h2>Guarantor Response Received</h2>
    <p style="background:#F3F0E8; border-left:4px solid ${decisionColor}; padding:10px 14px;">
      <strong style="color:${decisionColor};">${escapeHtml(row.guarantor_name)} has ${decisionLabel} the guarantorship request</strong>
      ${row.amount_offered ? ` for KES ${Number(row.amount_offered).toLocaleString()}` : ''}.
    </p>
    ${row.status === 'rejected' ? `<p><strong>Reason given:</strong> ${escapeHtml(row.rejection_reason)}</p>` : ''}
    <h3>Loan Application</h3>
    <p>
      <strong>Loanee:</strong> ${escapeHtml(loanSummary.loaneeName || '')}<br>
      <strong>Product(s):</strong> ${escapeHtml(Array.isArray(loanSummary.products) ? loanSummary.products.join(', ') : '')}<br>
      ${loanSummary.amountRequested ? `<strong>Amount Requested:</strong> KES ${Number(loanSummary.amountRequested).toLocaleString()}<br>` : ''}
    </p>
    <p>This response has been logged. Guarantor confirmations do not automatically change the application's status - please review and decide next steps as usual.</p>
  `;

  const send = async (to, subject) => {
    try {
      await transporter.sendMail({
        from: `St Gabriel Catholic Church SHG Website <${gmailUser}>`,
        to,
        subject,
        html: bodyHtml,
      });
    } catch (error) {
      console.error(`Failed to send guarantor response notification to ${to}:`, error);
    }
  };

  await send(ADMIN_EMAIL, `Guarantor ${decisionLabel === 'ACCEPTED' ? 'Accepted' : 'Declined'}: ${loanSummary.loaneeName || 'Loan Application'}`);

  // Look up the loanee's email from loan_registration - not stored
  // redundantly on guarantor_response, so a small join here rather than
  // adding another denormalized column just for this one notification.
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: loan } = await supabaseAdmin
      .from('loan_registration')
      .select('email_address')
      .eq('id', row.loan_registration_id)
      .maybeSingle();
    if (loan?.email_address) {
      await send(loan.email_address, `Update on Your Loan Application: A Guarantor Has Responded`);
    }
  } catch (error) {
    console.error('Failed to look up loanee email for guarantor response notification:', error);
  }
}