import { supabase } from './supabaseClient';

const BUCKET = 'shg-documents';

export type DocumentCategory = 'Registration' | 'Loan Registration';

/**
 * Turns a person/group's name plus a unique identifier (National ID,
 * guardian ID, etc.) into a safe, collision-proof folder name, with a
 * per-submission-attempt timestamp so retries never collide with a prior
 * attempt. This is what lets uploads avoid `upsert: true` entirely -
 * Supabase Storage requires SELECT (and UPDATE) permission to support
 * upsert, since it has to check whether a file already exists before
 * deciding whether to insert or overwrite it. Granting SELECT on this
 * bucket would mean anyone with the public key could download uploaded ID
 * documents, not just staff - not a tradeoff worth making for convenience.
 * Failed attempts are cleaned up automatically by deleteDocuments() in
 * registrationApi.ts, so this doesn't accumulate orphaned folders over time.
 * "John Kamau" + "12345678" + attempt 1699999999999 -> "John-Kamau-12345678-1699999999999"
 */
function buildFolderName(displayName: string, uniqueId: string, attemptId: string): string {
  const clean = displayName
    .trim()
    .replace(/[^a-zA-Z0-9\- ]/g, '')
    .replace(/\s+/g, '-');
  return `${clean}-${uniqueId}-${attemptId}`;
}

/**
 * Uploads a single file to Supabase Storage under:
 *   {category}/{Name-UniqueId-AttemptId}/doc_{index}.{ext}
 * e.g. "Registration/John-Kamau-12345678-1699999999999/doc_1.pdf"
 *
 * Returns the storage path (NOT a public URL - the bucket is private).
 * Store this path string in the corresponding table column.
 */
async function uploadDocument(
  category: DocumentCategory,
  displayName: string,
  uniqueId: string,
  attemptId: string,
  docIndex: number,
  file: File
): Promise<string> {
  const folder = buildFolderName(displayName, uniqueId, attemptId);
  const ext = file.name.split('.').pop() || 'bin';
  const path = `${category}/${folder}/doc_${docIndex}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    // No upsert - every submission attempt gets its own unique folder (see
    // buildFolderName), so there's never a path collision to resolve, and
    // this never needs SELECT/UPDATE permission on the bucket.
  });

  if (error) {
    throw new Error(`Failed to upload ${file.name}: ${error.message}`);
  }

  return path;
}

/**
 * Uploads several files under the same person's folder (one shared
 * timestamp for the whole batch, so all files from one submission attempt
 * land together) in one call, returning their paths in the same order.
 * Any single failed upload rejects the whole batch - forms should treat
 * this as "submission failed, try again" rather than partially saving.
 */
export async function uploadDocuments(
  category: DocumentCategory,
  displayName: string,
  uniqueId: string,
  files: File[]
): Promise<string[]> {
  const attemptId = Date.now().toString();
  return Promise.all(files.map((file, i) => uploadDocument(category, displayName, uniqueId, attemptId, i + 1, file)));
}

/**
 * Deletes previously-uploaded files by their storage paths. Used to roll
 * back an upload when the subsequent database insert fails, so a failed
 * registration never leaves orphaned files behind and a retry starts clean.
 * Errors here are logged but not thrown - a failed cleanup shouldn't mask
 * the original registration error that triggered it.
 */
export async function deleteDocuments(paths: (string | null)[]): Promise<void> {
  const realPaths = paths.filter((p): p is string => Boolean(p));
  if (realPaths.length === 0) return;

  const { error } = await supabase.storage.from(BUCKET).remove(realPaths);
  if (error) {
    console.error('Failed to clean up uploaded files after a failed registration:', error);
  }
}