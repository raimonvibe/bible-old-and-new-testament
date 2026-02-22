/**
 * Uncapitalizes He/Him/His/Himself where the referent is clearly human (or
 * animal), to fix over-capitalization from the original script.
 *
 * Two passes:
 * 1. In verses with NO divine referent: lowercase all four pronouns (fixes
 *    mistaken caps from the "continuation" rule).
 * 2. In all text: apply a list of phrase replacements where the pronoun
 *    unambiguously refers to a human (e.g. "the man and His wife" -> "his").
 *
 * Run after capitalize-divine-pronouns-conservative.js (or after the original
 * capitalize script) to clean up remaining false positives.
 *
 * Usage: node uncapitalize-human-pronouns.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const OT_FILE = path.join(DATA_DIR, 'old-testament-data.json');
const NT_FILE = path.join(DATA_DIR, 'new-testament-data.json');

const DRY_RUN = process.argv.includes('--dry-run');

const DIVINE_REFERENT_REGEX = /\b(God|Yahweh|Jesus|Christ|Holy Spirit|Spirit of God|the Lord|the Son)\b/i;

// In verses with no divine referent, revert to lowercase
const REVERT_IN_VERSE = [
  [/\bHimself\b/g, 'himself'],
  [/\bHim\b/g, 'him'],
  [/\bHis\b/g, 'his'],
  [/\bHe\b/g, 'he'],
];

// Phrase replacements: pronoun clearly refers to human/creature (longer first)
const HUMAN_PHRASE_REPLACEMENTS = [
  [' put Him into the garden ', ' put him into the garden '],
  [' and put Him into ', ' and put him into '],
  [' and put Him ', ' and put him '],
  [' the man and His wife ', ' the man and his wife '],
  [' Adam and His wife ', ' Adam and his wife '],
  [' Noah and His wife ', ' Noah and his wife '],
  [' Abram and His wife ', ' Abram and his wife '],
  [' Abraham and His wife ', ' Abraham and his wife '],
  [' Lot and His ', ' Lot and his '],
  [' Pharaoh and His ', ' Pharaoh and his '],
  [' Cain and His ', ' Cain and his '],
  [' Abel and His ', ' Abel and his '],
  [' the man and His ', ' the man and his '],
  [' knew His wife ', ' knew his wife '],
  [' and His wife ', ' and his wife '], // after any name; may over-apply rarely
  [' His wife ', ' his wife '], // e.g. "for Adam and his wife" already done; "made garments for Adam and his wife"
  [' His flock ', ' his flock '], // e.g. Abel's flock
  [' of His flock ', ' of his flock '],
  [' His offering ', ' his offering '],
  [' and His offering ', ' and his offering '],
  [' the expression on His face ', ' the expression on his face '],
  [' His face fell ', ' his face fell '],
  [' His sons-in-law ', ' his sons-in-law '],
  [' His two daughters ', ' his two daughters '],
  [' His daughter', ' his daughter'],
  [' His son ', ' his son '],
  [' His brother ', ' his brother '],
  [' His sons ', ' his sons '],
  [' His army ', ' his army '],
  // Do NOT uncapitalize "said to Him" — in NT it often refers to Jesus
  [' sent Him out ', ' sent him out '], // e.g. sent him out from the garden (the man)
  [' from which He was taken ', ' from which he was taken '],
  [' breathed into His nostrils ', ' breathed into his nostrils '],
  [' comparable to Him ', ' comparable to him '],
  [' a helper comparable to Him', ' a helper comparable to him'],
  [' found a helper comparable to Him', ' found a helper comparable to him'],
  [' named Him ', ' named him '],
  [' called Him ', ' called him '],
  [' bore Him ', ' bore him '],
  [' bore to Him ', ' bore to him '],
  [' gave birth to Him ', ' gave birth to him '],
  [' the male and His female ', ' the male and his female '],
  [' shut Him in ', ' shut him in '], // Noah in the ship
  [' with Him in the ship ', ' with him in the ship '],
  [' His kingdom ', ' his kingdom '], // e.g. Nimrod's kingdom
  [' the beginning of His kingdom ', ' the beginning of his kingdom '],
];

function processContent(content) {
  if (!content || typeof content !== 'string') return content;

  const verseRegex = /(\s*\[\d+\]\s*)/g;
  const parts = content.split(verseRegex);
  let result = '';

  for (let i = 0; i < parts.length; i++) {
    let part = parts[i];
    if (/^\s*\[\d+\]\s*$/.test(part) || part.length === 0) {
      result += part;
      continue;
    }
    if (!DIVINE_REFERENT_REGEX.test(part)) {
      for (const [regex, replacement] of REVERT_IN_VERSE) {
        part = part.replace(regex, replacement);
      }
    }
    result += part;
  }

  // Apply human-referent phrase replacements (order: list order, longer first in list)
  for (const [from, to] of HUMAN_PHRASE_REPLACEMENTS) {
    result = result.split(from).join(to);
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
