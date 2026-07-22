const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/old-testament-data.json', 'utf8'));
const book = data.books.find((b) => b.name === 'Leviticus');

const midCap = /(?:,\s|; |\s)(He|His|Him)\b/g;
const hits = [];

for (const ch of book.chapters) {
  const verses = ch.content.split(/\n\s*/);
  for (const v of verses) {
    const m = v.match(/^\s*\[(\d+)\]\s*(.*)/s);
    if (!m) continue;
    const [, num, text] = m;
    let match;
    while ((match = midCap.exec(text)) !== null) {
      const start = Math.max(0, match.index - 35);
      const snippet = text.slice(start, match.index + match[0].length + 40).replace(/\n/g, ' ');
      hits.push(`Lev ${ch.number}:${num} ${match[1]} — …${snippet}…`);
    }
  }
}

console.log(`Found ${hits.length} mid-sentence He/His/Him in Leviticus`);
hits.forEach((h) => console.log(h));
