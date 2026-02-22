/**
 * Capitalizes pronouns (He, Him, His, Himself) when they refer to God or Jesus
 * in Bible JSON data. Processes verse-by-verse: only verses that contain
 * a divine referent (God, Yahweh, Lord, Jesus, Christ, Holy Spirit) get
 * pronoun capitalization.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const OT_FILE = path.join(DATA_DIR, 'old-testament-data.json');
const NT_FILE = path.join(DATA_DIR, 'new-testament-data.json');

// Divine referents - verses containing these get pronoun capitalization
const DIVINE_REFERENT_REGEX = /\b(God|Yahweh|Jesus|Christ|Holy Spirit|Spirit of God|the Lord)\b/i;

// Word-boundary regexes for pronouns (lowercase) - we replace with capitalized
const PRONOUN_REPLACEMENTS = [
  [/\bhe\b/g, 'He'],
  [/\bhim\b/g, 'Him'],
  [/\bhis\b/g, 'His'],
  [/\bhimself\b/g, 'Himself'],
];

function processContent(content) {
  if (!content || typeof content !== 'string') return content;

  // Split into verse segments: keep delimiters so we can identify "[1]", "[2]", etc.
  // Verses look like: "     [1] verse text here  [2] next verse..."
  const verseRegex = /(\s*\[\d+\]\s*)/g;
  const parts = content.split(verseRegex);

  let result = '';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    // Check if this part is a verse number (e.g. "     [1] ")
    if (/^\s*\[\d+\]\s*$/.test(part)) {
      result += part;
      continue;
    }
    // This part is verse text (between two verse markers or after last marker)
    if (part.length === 0) {
      result += part;
      continue;
    }
    // If this verse text contains a divine referent, capitalize pronouns
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

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`  Updated ${chapterCount} chapters.`);
}

function main() {
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
