/**
 * Conservative divine pronoun capitalization: only in verses that actually
 * contain a divine referent (God, Yahweh, Jesus, etc.). No "continuation"
 * rule — the verse after a divine verse is not capitalized, which reduces
 * false positives when the subject switches to a human.
 *
 * Run revert-divine-pronouns.js first if you want a clean baseline.
 *
 * Usage: node capitalize-divine-pronouns-conservative.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const OT_FILE = path.join(DATA_DIR, 'old-testament-data.json');
const NT_FILE = path.join(DATA_DIR, 'new-testament-data.json');

const DRY_RUN = process.argv.includes('--dry-run');

const DIVINE_REFERENT_REGEX = /\b(God|Yahweh|Jesus|Christ|Holy Spirit|Spirit of God|the Lord|the Son)\b/i;

const PRONOUN_REPLACEMENTS = [
  [/\bhe\b/g, 'He'],
  [/\bhim\b/g, 'Him'],
  [/\bhis\b/g, 'His'],
  [/\bhimself\b/g, 'Himself'],
];

function processContent(content) {
  if (!content || typeof content !== 'string') return content;

  const verseRegex = /(\s*\[\d+\]\s*)/g;
  const parts = content.split(verseRegex);
  let result = '';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (/^\s*\[\d+\]\s*$/.test(part) || part.length === 0) {
      result += part;
      continue;
    }
    // Only capitalize in verses that contain a divine referent (no continuation)
    if (DIVINE_REFERENT_REGEX.test(part)) {
      let verseText = part;
      for (const [regex, replacement] of PRONOUN_REPLACEMENTS) {
        verseText = verseText.replace(regex, replacement);
      }
      result += verseText;
    } else {
      result += part;
    }
  }

  return result;
}

function processFile(filePath) {
  console.log(`Processing ${path.basename(filePath)}...`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let chapterCount = 0;
  for (const book of data.books || []) {
    for (const chapter of book.chapters || []) {
      if (chapter.content) {
        chapter.content = processContent(chapter.content);
        chapterCount++;
      }
    }
  }
  if (!DRY_RUN) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }
  console.log(`  Updated ${chapterCount} chapters.`);
}

function main() {
  if (DRY_RUN) console.log('DRY RUN — no files will be written.\n');
  [OT_FILE, NT_FILE].forEach((filePath) => {
    if (fs.existsSync(filePath)) processFile(filePath);
    else console.warn(`File not found: ${filePath}`);
  });
  console.log('Done.');
}

main();
