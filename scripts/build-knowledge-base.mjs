// Builds the RAG knowledge base from PDFs, DOCX files, AND the FAQ.
//
// Indexes src/faq.json as retrievable chunks alongside your documents -
// each Q&A pair becomes its own chunk with source "FAQ". This means the
// FAQ is genuinely part of the RAG index (retrieved only when relevant),
// not a separate static block injected into every prompt. The chatbot is
// strict RAG-only: it answers exclusively from whatever is retrieved here.
//
// SETUP (one-time):
//   npm install --save-dev pdf-parse mammoth
//   mkdir knowledge-base
//   -> drop PDFs and/or DOCX files into that folder: Strategic_Plan.pdf,
//      By-laws.docx, etc. - both formats are handled automatically.
//
// RUN (any time you add/change a file in knowledge-base/, or edit src/faq.json):
//   MISTRAL_API_KEY=your_key node scripts/build-knowledge-base.mjs
//   (or export MISTRAL_API_KEY first, or use `node --env-file=.env.local ...`
//   if you're on Node 20.6+)
//
// This writes api/_lib/knowledgeBase.js - a plain ES module (same reasoning
// as sync-faq.mjs: avoids JSON-import-assertion version issues entirely).
// It does NOT run at request time - it's a one-off, offline indexing step.

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { createRequire } from 'module';
import mammoth from 'mammoth';

// pdf-parse is CommonJS, and Node's ESM loader sometimes fails to detect
// its default export via static analysis even though the module itself
// works fine ("does not provide an export named 'default'"). Loading it
// through createRequire bypasses that detection entirely and imports it
// as genuine CommonJS instead.
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const sourceDir = join(projectRoot, 'knowledge-base');
const faqPath = join(projectRoot, 'src/faq.json');
const outputPath = join(projectRoot, 'api/_lib/knowledgeBase.js');

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
if (!MISTRAL_API_KEY) {
  console.error('Set MISTRAL_API_KEY before running this script.');
  process.exit(1);
}

const CHUNK_SIZE = 1200; // characters per chunk - roughly 250-300 tokens
const CHUNK_OVERLAP = 150; // characters of overlap so context isn't cut mid-thought
const EMBED_BATCH_SIZE = 20; // chunks per embeddings API call

function chunkText(text, source) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  const chunks = [];
  let start = 0;
  while (start < cleaned.length) {
    const end = Math.min(start + CHUNK_SIZE, cleaned.length);
    const chunkText = cleaned.slice(start, end).trim();
    if (chunkText.length > 50) {
      // skip near-empty trailing scraps
      chunks.push({ source, text: chunkText });
    }
    if (end >= cleaned.length) break;
    start = end - CHUNK_OVERLAP;
  }
  return chunks;
}

async function extractText(filePath, ext) {
  if (ext === '.pdf') {
    const buffer = readFileSync(filePath);
    const parsed = await pdfParse(buffer);
    return { text: parsed.text, pageInfo: `${parsed.numpages} pages` };
  }
  if (ext === '.docx') {
    const buffer = readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return { text: result.value, pageInfo: `${result.value.length} characters` };
  }
  throw new Error(`Unsupported file type: ${ext}`);
}

// Each FAQ entry becomes its own chunk (short enough to rarely need
// further splitting) so a retrieved FAQ answer is complete, not truncated
// mid-answer the way a generic character-window split might cut it.
function chunkFaq() {
  let faqData;
  try {
    faqData = JSON.parse(readFileSync(faqPath, 'utf-8'));
  } catch {
    console.warn(`Couldn't read ${faqPath} - skipping FAQ indexing.`);
    return [];
  }

  return (faqData.faqs || []).map((faq) => ({
    source: 'FAQ',
    text: `Q: ${faq.question}\nA: ${faq.answer}`,
  }));
}

async function embedBatch(texts) {
  const response = await fetch('https://api.mistral.ai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({ model: 'mistral-embed', input: texts }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mistral embeddings error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.data.map((d) => d.embedding);
}

async function main() {
  let sourceFiles = [];
  try {
    sourceFiles = readdirSync(sourceDir).filter((f) => ['.pdf', '.docx'].includes(extname(f).toLowerCase()));
  } catch {
    console.warn(`Couldn't read ${sourceDir} - no documents will be indexed. Create a "knowledge-base" folder at your project root and put PDFs/DOCX files (Strategic Plan, By-laws, etc.) in it.`);
  }

  let allChunks = [];

  if (sourceFiles.length > 0) {
    console.log(`Found ${sourceFiles.length} document(s): ${sourceFiles.join(', ')}`);
    for (const file of sourceFiles) {
      const ext = extname(file).toLowerCase();
      try {
        const { text, pageInfo } = await extractText(join(sourceDir, file), ext);
        const chunks = chunkText(text, file);
        console.log(`  ${file}: ${pageInfo} -> ${chunks.length} chunks`);
        allChunks = allChunks.concat(chunks);
      } catch (err) {
        console.error(`  ${file}: failed to extract text (${err.message}) - skipping this file`);
      }
    }
  } else {
    console.log('No PDFs or DOCX files found - continuing with FAQ only.');
  }

  const faqChunks = chunkFaq();
  console.log(`FAQ: ${faqChunks.length} chunks`);
  allChunks = allChunks.concat(faqChunks);

  if (allChunks.length === 0) {
    console.error('Nothing to index - add documents to knowledge-base/ and/or populate src/faq.json.');
    process.exit(1);
  }

  console.log(`Embedding ${allChunks.length} chunks in batches of ${EMBED_BATCH_SIZE}...`);

  const knowledgeBase = [];
  for (let i = 0; i < allChunks.length; i += EMBED_BATCH_SIZE) {
    const batch = allChunks.slice(i, i + EMBED_BATCH_SIZE);
    const embeddings = await embedBatch(batch.map((c) => c.text));
    batch.forEach((chunk, j) => {
      knowledgeBase.push({
        id: `${chunk.source}-${i + j}`,
        source: chunk.source,
        text: chunk.text,
        embedding: embeddings[j],
      });
    });
    console.log(`  embedded ${Math.min(i + EMBED_BATCH_SIZE, allChunks.length)}/${allChunks.length}`);
  }

  const output = `// AUTO-GENERATED by scripts/build-knowledge-base.mjs - do not edit directly.
// Rebuild with: MISTRAL_API_KEY=your_key node scripts/build-knowledge-base.mjs
// Source PDFs/DOCX files live in /knowledge-base at the project root; FAQ comes from src/faq.json.

export default ${JSON.stringify(knowledgeBase)};
`;

  writeFileSync(outputPath, output);
  console.log(`\u2713 Wrote ${knowledgeBase.length} chunks to api/_lib/knowledgeBase.js`);
}

main().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
