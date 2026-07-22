/**
 * Validates gold-standard capitalization for pilot chapters.
 *
 * Usage: node scripts/validate-capitalization.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const GOLD_DIR = path.join(__dirname, 'gold');
const NT_FILE = path.join(DATA_DIR, 'new-testament-data.json');

function findChapter(data, reference) {
  for (const book of data.books || []) {
    for (const chapter of book.chapters || []) {
      if (chapter.reference === reference) return chapter;
    }
  }
  return null;
}

function validateGold(goldPath, content) {
  const gold = JSON.parse(fs.readFileSync(goldPath, 'utf8'));
  const errors = [];

  for (const phrase of gold.mustContain || []) {
    if (!content.includes(phrase)) {
      errors.push(`Missing expected phrase: "${phrase}"`);
    }
  }

  for (const phrase of gold.mustNotContain || []) {
    if (content.includes(phrase)) {
      errors.push(`Found forbidden phrase: "${phrase}"`);
    }
  }

  return { reference: gold.reference, errors };
}

function main() {
  const nt = JSON.parse(fs.readFileSync(NT_FILE, 'utf8'));
  const goldFiles = fs.readdirSync(GOLD_DIR).filter((f) => f.endsWith('.json'));

  if (goldFiles.length === 0) {
    console.log('No gold files found.');
    process.exit(0);
  }

  let failed = 0;

  for (const file of goldFiles) {
    const goldPath = path.join(GOLD_DIR, file);
    const gold = JSON.parse(fs.readFileSync(goldPath, 'utf8'));
    const chapter = findChapter(nt, gold.reference);

    if (!chapter?.content) {
      console.error(`✗ ${gold.reference}: chapter not found`);
      failed++;
      continue;
    }

    const { errors } = validateGold(goldPath, chapter.content);
    if (errors.length === 0) {
      console.log(`✓ ${gold.reference}`);
    } else {
      console.error(`✗ ${gold.reference}:`);
      for (const err of errors) console.error(`  - ${err}`);
      failed++;
    }
  }

  process.exit(failed > 0 ? 1 : 0);
}

main();
