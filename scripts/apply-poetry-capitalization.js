/**
 * Contextual capitalization: Poetry (Job–Song of Solomon).
 * Uses full OT rules plus cross-verse divine referent tracking for psalms.
 *
 * Run: node scripts/apply-poetry-capitalization.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { applyOtPoetryRules } = require('./lib/ot-capitalization-rules');

const OT_FILE = path.join(__dirname, '..', 'data', 'old-testament-data.json');
const DRY_RUN = process.argv.includes('--dry-run');

const POETRY = ['Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon'];

/** @type {Array<[string, string, string, string]>} [book, chapterRef, from, to] */
const REPLACEMENTS = [
  // Job 28:28 — God spoke to man (divine subject after programmatic pass)
  ['Job', 'Job 28', 'To man he said', 'To man He said'],
];

function main() {
  const data = JSON.parse(fs.readFileSync(OT_FILE, 'utf8'));
  let applied = 0;
  const missed = [];

  for (const bookName of POETRY) {
    const book = data.books.find((b) => b.name === bookName);
    if (!book) {
      console.warn(`Book not found: ${bookName}`);
      continue;
    }

    for (const chapter of book.chapters) {
      const before = chapter.content;
      chapter.content = applyOtPoetryRules(chapter.content);
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

  console.log(`Applied Poetry capitalization (${applied} chapter passes + explicit fixes).`);
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
