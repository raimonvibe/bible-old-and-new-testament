/**
 * Contextual capitalization: Prophets (Isaiah–Malachi).
 * Oracle books use prophet poetry rules; Daniel and Jonah use conservative narrative rules.
 *
 * Run: node scripts/apply-prophets-capitalization.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { applyOtProphetRules } = require('./lib/ot-capitalization-rules');

const OT_FILE = path.join(__dirname, '..', 'data', 'old-testament-data.json');
const DRY_RUN = process.argv.includes('--dry-run');

const CONSERVATIVE_PROPHETS = ['Daniel', 'Jonah'];

const ORACLE_PROPHETS = [
  'Isaiah',
  'Jeremiah',
  'Lamentations',
  'Ezekiel',
  'Hosea',
  'Joel',
  'Amos',
  'Obadiah',
  'Micah',
  'Nahum',
  'Habakkuk',
  'Zephaniah',
  'Haggai',
  'Zechariah',
  'Malachi',
];

/** @type {Array<[string, string, string, string]>} [book, chapterRef, from, to] */
const REPLACEMENTS = [];

function main() {
  const data = JSON.parse(fs.readFileSync(OT_FILE, 'utf8'));
  let applied = 0;
  const missed = [];

  for (const bookName of [...CONSERVATIVE_PROPHETS, ...ORACLE_PROPHETS]) {
    const book = data.books.find((b) => b.name === bookName);
    if (!book) {
      console.warn(`Book not found: ${bookName}`);
      continue;
    }

    const conservative = CONSERVATIVE_PROPHETS.includes(bookName);

    for (const chapter of book.chapters) {
      const before = chapter.content;
      chapter.content = applyOtProphetRules(chapter.content, { conservative });
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

  console.log(`Applied Prophets capitalization (${applied} chapter passes + explicit fixes).`);
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
