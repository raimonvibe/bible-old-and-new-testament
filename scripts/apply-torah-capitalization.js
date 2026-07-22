/**
 * Contextual capitalization: Torah (Genesis–Deuteronomy).
 * Run after revert-ot-baseline.js on a lowercase WEB baseline.
 *
 * Run: node scripts/apply-torah-capitalization.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { applyOtProgrammaticRules } = require('./lib/ot-capitalization-rules');

const OT_FILE = path.join(__dirname, '..', 'data', 'old-testament-data.json');
const DRY_RUN = process.argv.includes('--dry-run');

const TORAH = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'];

/** @type {Array<[string, string, string, string]>} [book, chapterRef, from, to] */
const REPLACEMENTS = [
  // Add explicit mixed-verse fixes here as needed (book-specific overrides).
];

function main() {
  const data = JSON.parse(fs.readFileSync(OT_FILE, 'utf8'));
  let applied = 0;
  const missed = [];

  for (const bookName of TORAH) {
    const book = data.books.find((b) => b.name === bookName);
    if (!book) {
      console.warn(`Book not found: ${bookName}`);
      continue;
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

    for (const chapter of book.chapters) {
      const before = chapter.content;
      chapter.content = applyOtProgrammaticRules(chapter.content);
      if (chapter.content !== before) applied++;
    }
  }

  console.log(`Applied Torah capitalization (${applied} chapter passes + explicit fixes).`);
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
