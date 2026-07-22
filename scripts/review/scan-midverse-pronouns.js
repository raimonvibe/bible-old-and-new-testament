/**
 * Flag mid-verse He/Him/His/Himself after comma or semicolon (not sentence start).
 * Used as a mandatory pass before marking a book reviewed.
 *
 * Usage: node scripts/review/scan-midverse-pronouns.js [BookName]
 */
const fs = require('fs');
const bookName = process.argv[2] || 'Deuteronomy';
const data = JSON.parse(fs.readFileSync('data/old-testament-data.json', 'utf8'));
const book = data.books.find((b) => b.name === bookName);
if (!book) {
  console.error(`Book not found: ${bookName}`);
  process.exit(1);
}

const midCap = /(?:,\s|;\s)(He|Him|His|Himself)\b/g;
const hits = [];

for (const ch of book.chapters) {
  const verses = ch.content.split(/\n\s*/);
  for (const v of verses) {
    const m = v.match(/^\s*\[(\d+)\]\s*(.*)/s);
    if (!m) continue;
    const [, vnum, text] = m;
    let match;
    while ((match = midCap.exec(text)) !== null) {
      const start = Math.max(0, match.index - 50);
      const end = Math.min(text.length, match.index + match[0].length + 60);
      const snippet = text.slice(start, end).replace(/\n/g, ' ');
      hits.push({
        ref: `${bookName} ${ch.number}:${vnum}`,
        word: match[1],
        snippet: `…${snippet}…`,
      });
    }
  }
}

console.log(`${bookName}: ${hits.length} mid-verse capital pronouns to review\n`);
for (const h of hits) {
  console.log(`${h.ref} ${h.word} ${h.snippet}`);
}
