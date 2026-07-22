/**
 * Revert Old Testament only to lowercase pronoun baseline.
 * Run: node scripts/revert-ot-baseline.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const OT_FILE = path.join(__dirname, '..', 'data', 'old-testament-data.json');
const DRY_RUN = process.argv.includes('--dry-run');

const REVERT = [
  [/\bHimself\b/g, 'himself'],
  [/\bHim\b/g, 'him'],
  [/\bHis\b/g, 'his'],
  [/\bHe\b/g, 'he'],
];

function main() {
  const data = JSON.parse(fs.readFileSync(OT_FILE, 'utf8'));
  let total = 0;
  for (const book of data.books) {
    for (const chapter of book.chapters) {
      if (!chapter.content) continue;
      let text = chapter.content;
      for (const [re, rep] of REVERT) {
        const n = (text.match(re) || []).length;
        total += n;
        text = text.replace(re, rep);
      }
      chapter.content = text;
    }
  }
  console.log(`Reverted OT pronouns (${total} replacements).`);
  if (!DRY_RUN) {
    fs.writeFileSync(OT_FILE, JSON.stringify(data, null, 2) + '\n');
    console.log(`Updated ${OT_FILE}`);
  }
}

main();
