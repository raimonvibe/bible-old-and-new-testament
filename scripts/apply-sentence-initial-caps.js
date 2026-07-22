/**
 * Apply safe sentence-initial capitalization across the entire Bible.
 * Capitalizes the first word after . ! ? and [n] verse markers only.
 *
 * Usage:
 *   node scripts/apply-sentence-initial-caps.js           # dry-run (default)
 *   node scripts/apply-sentence-initial-caps.js --apply   # write files
 */

const fs = require('fs');
const path = require('path');
const { applyFullSentenceInitialCaps } = require('./lib/sentence-initial-capitalization');

const DATA_DIR = path.join(__dirname, '..', 'data');
const NT_FILE = path.join(DATA_DIR, 'new-testament-data.json');
const OT_FILE = path.join(DATA_DIR, 'old-testament-data.json');
const APPLY = process.argv.includes('--apply');

function loadExcluded() {
  const excludePath = path.join(__dirname, 'sentence-cap-exclude.json');
  if (!fs.existsSync(excludePath)) return new Set();
  const list = JSON.parse(fs.readFileSync(excludePath, 'utf8'));
  return new Set(list.chapters || []);
}

function processDataset(data, excluded) {
  let chapters = 0;
  let changes = 0;

  for (const book of data.books || []) {
    for (const chapter of book.chapters || []) {
      if (excluded.has(chapter.reference)) continue;

      const { content, changes: n } = applyFullSentenceInitialCaps(chapter.content);

      if (n > 0) {
        chapters++;
        changes += n;
        chapter.content = content;
      }
    }
  }

  return { chapters, changes };
}

function main() {
  const excluded = loadExcluded();
  const nt = JSON.parse(fs.readFileSync(NT_FILE, 'utf8'));
  const ot = JSON.parse(fs.readFileSync(OT_FILE, 'utf8'));

  const ntResult = processDataset(nt, excluded);
  const otResult = processDataset(ot, excluded);

  const totalChanges = ntResult.changes + otResult.changes;
  const totalChapters = ntResult.chapters + otResult.chapters;

  console.log(
    `Sentence-initial caps: ${totalChanges} words in ${totalChapters} chapters` +
      (APPLY ? ' (applied)' : ' (dry-run)')
  );
  console.log(`  NT: ${ntResult.changes} in ${ntResult.chapters} chapters`);
  console.log(`  OT: ${otResult.changes} in ${otResult.chapters} chapters`);

  if (APPLY) {
    fs.writeFileSync(NT_FILE, JSON.stringify(nt, null, 2) + '\n');
    fs.writeFileSync(OT_FILE, JSON.stringify(ot, null, 2) + '\n');
    console.log(`Updated ${NT_FILE}`);
    console.log(`Updated ${OT_FILE}`);
  } else {
    console.log('Run with --apply to write changes.');
  }
}

main();
