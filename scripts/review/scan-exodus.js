const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/old-testament-data.json', 'utf8'));
const ex = data.books.find((b) => b.name === 'Exodus');

const suspects = [];
for (const ch of ex.chapters) {
  const verses = ch.content.split(/\n\s*/);
  for (const v of verses) {
    const m = v.match(/^\s*\[(\d+)\]\s*(.*)/s);
    if (!m) continue;
    const [, num, text] = m;
    // Yahweh/God speaking: lowercase "he said" mid-verse after divine context
    if (/Yahweh|God said|Lord said/i.test(text)) {
      const bad = text.match(/(?:Yahweh|God)[^.!?]{0,120},\s+he\s+(?:said|spoke)/i);
      if (bad) suspects.push(`Ex ${ch.number}:${num} God under-cap: ...${bad[0].slice(-50)}`);
    }
    // After "that Yahweh" lowercase he/him for divine action
    if (/that Yahweh|Yahweh had|Yahweh has/i.test(text)) {
      const bad = text.match(/Yahweh[^.!?]{0,80},\s+and\s+that\s+he\s+/i);
      if (bad) suspects.push(`Ex ${ch.number}:${num} Yahweh under-cap: ...${bad[0]}`);
    }
    // Moses mid-sentence capital He (not sentence start)
    if (/Moses[^.!?]{0,80},\s+and\s+He\s+(?!said)/i.test(text)) {
      const bad = text.match(/Moses[^.!?]{0,80},\s+and\s+He\s+\w+/i);
      if (bad && !/Yahweh commanded Moses,\s+and\s+He/i.test(text))
        suspects.push(`Ex ${ch.number}:${num} Moses over-cap?: ${bad[0]}`);
    }
    // His hand after Moses/him (human)
    if (/commanded him, and took in His hand/i.test(text))
      suspects.push(`Ex ${ch.number}:${num} Moses His hand`);
    if (/Moses took God.s rod in His hand/i.test(text))
      suspects.push(`Ex ${ch.number}:${num} Moses rod His hand`);
    if (/He was there with Yahweh forty days/i.test(text))
      suspects.push(`Ex ${ch.number}:${num} Moses 40 days He`);
    if (/He took the veil off, until He came out/i.test(text))
      suspects.push(`Ex ${ch.number}:${num} Moses veil He`);
    if (/commanded him, so He did/i.test(text))
      suspects.push(`Ex ${ch.number}:${num} Moses so He did`);
    if (/which he swore to your fathers to give you, a land flowing with milk and honey, that you shall keep this service/i.test(text))
      suspects.push(`Ex ${ch.number}:${num} God he swore`);
    if (/that He came over to see/i.test(text))
      suspects.push(`Ex ${ch.number}:${num} Moses He came over`);
    if (/Moreover he said, .I am the God/i.test(text))
      suspects.push(`Ex ${ch.number}:${num} God Moreover he`);
    if (/I AM WHO I AM,. and he said/i.test(text))
      suspects.push(`Ex ${ch.number}:${num} God I AM he said`);
    if (/anger burned against Moses, and he said/i.test(text))
      suspects.push(`Ex ${ch.number}:${num} God anger he said`);
    if (/It will happen that He will be to you a mouth/i.test(text))
      suspects.push(`Ex ${ch.number}:${num} Aaron He mouth`);
  }
}
console.log(suspects.join('\n') || 'No suspects');
