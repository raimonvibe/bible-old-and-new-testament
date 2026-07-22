const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/old-testament-data.json', 'utf8'));
const book = data.books.find((b) => b.name === 'Leviticus');
if (!book) {
  console.error('Leviticus not found');
  process.exit(1);
}

const patterns = [
  [/that He came over to see/i, 'Moses over-cap came over'],
  [/Moreover he said, “I am the God/i, 'God under-cap Moreover he'],
  [/I AM WHO I AM,” and he said/i, 'God under-cap I AM he said'],
  [/anger burned against Moses, and he said/i, 'God under-cap anger'],
  [/It will happen that He will be to you a mouth/i, 'Aaron over-cap mouth'],
  [/Moses took God.s rod in His hand/i, 'Moses over-cap rod His'],
  [/which he swore to your fathers/i, 'God under-cap he swore'],
  [/as he swore to you and to your fathers/i, 'God under-cap as he swore'],
  [/commanded him, and took in His hand/i, 'Moses over-cap His hand'],
  [/He was there with Yahweh forty days/i, 'Moses over-cap 40 days'],
  [/He took the veil off, until He came out/i, 'Moses over-cap veil'],
  [/commanded him, so He did/i, 'Moses over-cap so He did'],
  [/Yahweh[^.!?]{0,80},\s+he\s+(?:said|spoke)/i, 'God under-cap he said after Yahweh'],
  [/that Yahweh[^.!?]{0,80},\s+and\s+that\s+he\s+/i, 'God under-cap that he after Yahweh'],
];

const hits = [];
for (const ch of book.chapters) {
  for (const [re, label] of patterns) {
    if (re.test(ch.content)) hits.push(`Lev ${ch.number}: ${label}`);
  }
}
console.log(hits.length ? hits.join('\n') : 'No pattern hits — manual spot-check needed');

// Flag mid-verse He/him after likely human subject
for (const ch of book.chapters) {
  const verses = ch.content.split(/\n\s*/);
  for (const v of verses) {
    const m = v.match(/^\s*\[(\d+)\]\s*(.*)/s);
    if (!m) continue;
    const [, num, text] = m;
    if (/Aaron[^.!?]{0,60},\s+and\s+He\s+(?!said to)/i.test(text)) {
      hits.push(`Lev ${ch.number}:${num} check Aaron He`);
    }
    if (/Moses[^.!?]{0,60},\s+and\s+He\s+(?!said)/i.test(text) && !/Yahweh commanded/i.test(text)) {
      // skip - too noisy
    }
  }
}
