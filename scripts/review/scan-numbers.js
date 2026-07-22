const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/old-testament-data.json', 'utf8'));
const book = data.books.find((b) => b.name === 'Numbers');

const patterns = [
  [/that He came over to see/i, 'Moses over-cap came over'],
  [/Moreover he said, “I am the God/i, 'God under-cap Moreover he'],
  [/and he said, “You shall tell the children of Israel this:/i, 'God under-cap he said tell'],
  [/anger burned against Moses, and he said/i, 'God under-cap anger'],
  [/It will happen that He will be to you a mouth/i, 'Aaron over-cap mouth'],
  [/Moses took God.s rod in His hand/i, 'Moses rod His hand'],
  [/which he swore to your fathers/i, 'God under-cap he swore'],
  [/as he swore to you and to your fathers/i, 'God under-cap as he swore'],
  [/commanded him, and took in His hand/i, 'Moses His hand'],
  [/He was there with Yahweh forty days/i, 'Moses 40 days'],
  [/He took the veil off, until He came out/i, 'Moses veil'],
  [/commanded him, so He did\./i, 'Moses so He did'],
  [/that Yahweh[^.!?]{0,100},\s+and\s+that\s+he\s+/i, 'Yahweh under-cap that he'],
  [/Yahweh[^.!?]{0,80},\s+he\s+said,/i, 'God under-cap he said'],
  [/so that he will not be angry with all the congregation/i, 'Yahweh under-cap not angry'],
  [/so that He will not die/i, 'Aaron over-cap not die?'],
  [/which He had not commanded/i, 'divine He had not commanded (check)'],
  [/He has given it to you to bear/i, 'divine He has given (check)'],
  [/, and He went/i, 'human over-cap and He went'],
  [/Balaam[^.!?]{0,60},\s+and\s+he\s+said/i, 'Balaam under-cap he said?'],
  [/God met Balaam, and he said/i, 'Balaam speech under-cap?'],
  [/Yahweh put a word in Balaam.s mouth/i, 'context'],
  [/having His uncleanness/i, 'human His uncleanness'],
  [/for His sin which He has/i, 'human His sin'],
  [/Yahweh His God has commanded/i, 'ruler his God'],
  [/against Him, and/i, 'check against Him object'],
  [/my lord/i, 'check lord'],
];

const hits = [];
for (const ch of book.chapters) {
  for (const [re, label] of patterns) {
    if (re.test(ch.content)) hits.push(`Num ${ch.number}: ${label}`);
  }
}

// Mid-sentence He after comma/semicolon (exclude verse-number starts)
for (const ch of book.chapters) {
  const verses = ch.content.split(/\n\s*/);
  for (const v of verses) {
    const m = v.match(/^\s*\[(\d+)\]\s*(.*)/s);
    if (!m) continue;
    const [, num, text] = m;
    const bad = [
      ...text.matchAll(/(?:,\s|; )(He|His|Him)\s+(?!said to|shall|will|who|has|had|is|was|went|came|took|spoke|answered|called|commanded|told|sent|gave|made|did|died|burned|killed|presented|offered|returned|departed|lifted|cried|fell|rose|stood|turned|looked|saw|heard|knew|found|left|put|set|lay|led|met|passed|reigned|walked|dwelt|built|fought|prayed|blessed|cursed|prophesied)/g),
    ];
    for (const match of bad) {
      const snippet = text.slice(Math.max(0, match.index - 30), match.index + 50);
      if (/Yahweh|God|Lord/i.test(snippet) && /,\s(he|his)\s/i.test(snippet)) continue;
      // flag suspicious only
      if (match[1] === 'His' && /His hand|His offering|His sin|His God|His people|His name|His glory|His commandments|His statutes|His covenant|His wrath|His anger|His presence|His Spirit|His holiness|His inheritance|His sanctuary|His holy/i.test(text.slice(match.index, match.index + 20))) {
        if (/His people|His name|His glory|His commandments|His statutes|His covenant|His wrath|His anger|His presence|His Spirit|His holiness|His inheritance|His sanctuary|His holy name/i.test(text.slice(match.index, match.index + 25))) continue;
        hits.push(`Num ${ch.number}:${num} mid-cap ${match[1]} — …${snippet.replace(/\n/g, ' ')}…`);
      }
    }
  }
}

console.log([...new Set(hits)].join('\n') || 'No pattern hits');
