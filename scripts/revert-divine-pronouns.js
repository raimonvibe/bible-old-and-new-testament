/**
 * Reverts all reverential capitalization: He/Him/His/Himself -> he/him/his/himself
 * in Bible JSON data. Safe to run to get a clean lowercase baseline before
 * re-applying a more conservative capitalization strategy.
 *
 * Usage: node revert-divine-pronouns.js [--dry-run]
 *   --dry-run  Log changes only, do not write files.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const OT_FILE = path.join(DATA_DIR, 'old-testament-data.json');
const NT_FILE = path.join(DATA_DIR, 'new-testament-data.json');

const DRY_RUN = process.argv.includes('--dry-run');

// Word-boundary: capitalized -> lowercase
const REVERT_REPLACEMENTS = [
  [/\bHimself\b/g, 'himself'],
  [/\bHim\b/g, 'him'],
  [/\bHis\b/g, 'his'],
  [/\bHe\b/g, 'he'],
];

function processContent(content) {
  if (!content || typeof content !== 'string') return content;
  let result = content;
  for (const [regex, replacement] of REVERT_REPLACEMENTS) {
    result = result.replace(regex, replacement);
  }
  return result;
}

function processFile(filePath) {
  console.log(`Processing ${path.basename(filePath)}...`);
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);

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
    if (fs.existsSync(filePath)) {
      processFile(filePath);
    } else {
      console.warn(`File not found: ${filePath}`);
    }
  });
  console.log('Done.');
}

main();
