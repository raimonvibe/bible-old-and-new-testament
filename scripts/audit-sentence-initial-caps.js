/**
 * Audit sentence-initial lowercase pronouns (read-only).
 *
 * Usage:
 *   node scripts/audit-sentence-initial-caps.js
 *   node scripts/audit-sentence-initial-caps.js --json
 */

const fs = require('fs');
const path = require('path');
const { auditSentenceInitialCaps, isPoetryLayoutBook } = require('./lib/sentence-initial-capitalization');

const DATA_DIR = path.join(__dirname, '..', 'data');
const NT_FILE = path.join(DATA_DIR, 'new-testament-data.json');
const OT_FILE = path.join(DATA_DIR, 'old-testament-data.json');
const JSON_OUT = process.argv.includes('--json');

function loadExcluded() {
  const excludePath = path.join(__dirname, 'sentence-cap-exclude.json');
  if (!fs.existsSync(excludePath)) return new Set();
  const list = JSON.parse(fs.readFileSync(excludePath, 'utf8'));
  return new Set(list.chapters || []);
}

function scanDataset(data, findings, excluded) {
  for (const book of data.books || []) {
    for (const chapter of book.chapters || []) {
      if (excluded.has(chapter.reference)) continue;
      const rows = auditSentenceInitialCaps(chapter.content, {
        poetryLayout: isPoetryLayoutBook(book.name),
        reference: chapter.reference,
      });
      findings.push(...rows);
    }
  }
}

function main() {
  const nt = JSON.parse(fs.readFileSync(NT_FILE, 'utf8'));
  const ot = JSON.parse(fs.readFileSync(OT_FILE, 'utf8'));
  const excluded = loadExcluded();
  const findings = [];

  scanDataset(nt, findings, excluded);
  scanDataset(ot, findings, excluded);

  if (JSON_OUT) {
    console.log(JSON.stringify({ count: findings.length, findings }, null, 2));
    return;
  }

  const byWord = {};
  for (const row of findings) {
    byWord[row.word] = (byWord[row.word] || 0) + 1;
  }

  console.log(`Sentence-initial lowercase pronouns: ${findings.length} candidates`);
  console.log('By word:', byWord);
  console.log('');
  console.log('Sample (first 30):');
  for (const row of findings.slice(0, 30)) {
    console.log(`  ${row.reference}: …${row.snippet}…`);
  }
}

main();
