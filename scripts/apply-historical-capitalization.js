/**
 * Contextual capitalization: Historical books (Joshua–Esther).
 * Uses conservative OT rules (capitalize after God/Yahweh in clause only).
 *
 * Run: node scripts/apply-historical-capitalization.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { applyOtProgrammaticRules } = require('./lib/ot-capitalization-rules');

const OT_FILE = path.join(__dirname, '..', 'data', 'old-testament-data.json');
const DRY_RUN = process.argv.includes('--dry-run');

const HISTORICAL = [
  'Joshua',
  'Judges',
  'Ruth',
  '1 Samuel',
  '2 Samuel',
  '1 Kings',
  '2 Kings',
  '1 Chronicles',
  '2 Chronicles',
  'Ezra',
  'Nehemiah',
  'Esther',
];

/** @type {Array<[string, string, string, string]>} [book, chapterRef, from, to] */
const REPLACEMENTS = [
  ['Joshua', 'Joshua 8', 'Yahweh\u2019s word which he commanded Joshua', 'Yahweh\u2019s word which He commanded Joshua'],
  ['1 Kings', '1 Kings 8', 'Yahweh has said that he would dwell', 'Yahweh has said that He would dwell'],
  ['2 Chronicles', '2 Chronicles 6', 'Yahweh has said that he would dwell', 'Yahweh has said that He would dwell'],
];

function main() {
  const data = JSON.parse(fs.readFileSync(OT_FILE, 'utf8'));
  let applied = 0;
  const missed = [];

  for (const bookName of HISTORICAL) {
    const book = data.books.find((b) => b.name === bookName);
    if (!book) {
      console.warn(`Book not found: ${bookName}`);
      continue;
    }

    for (const chapter of book.chapters) {
      const before = chapter.content;
      chapter.content = applyOtProgrammaticRules(chapter.content, { conservative: true });
      if (chapter.content !== before) applied++;
    }

    for (const [, chapterRef, from, to] of REPLACEMENTS.filter(([b]) => b === bookName)) {
      const chapter = book.chapters.find((c) => c.reference === chapterRef);
      if (!chapter) {
        missed.push(`${chapterRef}: chapter not found`);
        continue;
      }
      if (from === to) continue;
      if (!chapter.content.includes(from)) {
        missed.push(`${chapterRef}: ${from.slice(0, 50)}...`);
        continue;
      }
      chapter.content = chapter.content.replace(from, to);
      applied++;
    }
  }

  console.log(`Applied Historical capitalization (${applied} chapter passes + explicit fixes).`);
  if (missed.length) {
    console.warn(`Missed ${missed.length} explicit replacements:`);
    missed.forEach((m) => console.warn(`  - ${m}`));
  }

  if (!DRY_RUN) {
    fs.writeFileSync(OT_FILE, JSON.stringify(data, null, 2) + '\n');
    console.log(`Updated ${OT_FILE}`);
  }
}

main();
