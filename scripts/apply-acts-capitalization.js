/**
 * Contextual capitalization: Acts of the Apostles.
 * Explicit Jesus/Christ replacements only — no blanket verse-initial he→He.
 * Run: node scripts/apply-acts-capitalization.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const NT_FILE = path.join(__dirname, '..', 'data', 'new-testament-data.json');
const DRY_RUN = process.argv.includes('--dry-run');
const APOS = '\u2019';
const LDQ = '\u201c';
const RDQ = '\u201d';

/** @type {Array<[string, string, string, string]>} */
const REPLACEMENTS = [
  // Acts 1 — ascension; fix Jesus inconsistencies (vv.4–9, 22)
  ['Acts', 'Acts 1', 'Being assembled together with them, he commanded them, ' + LDQ + 'Don' + APOS + 't depart from Jerusalem, but wait for the promise of the Father, which you heard from me.', 'Being assembled together with them, He commanded them, ' + LDQ + 'Don' + APOS + 't depart from Jerusalem, but wait for the promise of the Father, which you heard from me.'],
  ['Acts', 'Acts 1', 'they asked him, ' + LDQ + 'Lord, are you now restoring the kingdom to Israel?' + RDQ, 'they asked Him, ' + LDQ + 'Lord, are you now restoring the kingdom to Israel?' + RDQ],
  ['Acts', 'Acts 1', '     [7] he said to them, ' + LDQ + 'It isn' + APOS + 't for you to know times or seasons which the Father has set within his own authority.', '     [7] He said to them, ' + LDQ + 'It isn' + APOS + 't for you to know times or seasons which the Father has set within his own authority.'],
  ['Acts', 'Acts 1', 'When he had said these things, as they were looking, he was taken up, and a cloud received him out of their sight.  [10] While they were looking steadfastly into the sky as he went', 'When He had said these things, as they were looking, He was taken up, and a cloud received Him out of their sight.  [10] While they were looking steadfastly into the sky as He went'],
  ['Acts', 'Acts 1', 'to the day that he was received up from us, of these one must become a witness with us of his resurrection.' + RDQ, 'to the day that He was received up from us, of these one must become a witness with us of His resurrection.' + RDQ],

  // Acts 2 — Peter' + APOS + 's Pentecost sermon (passion/resurrection)
  ['Acts', 'Acts 2', 'whom you delivered up and denied in the presence of Pilate, when he had determined to release him.  [24] God raised him up, having freed him from the agony of death, because it was not possible that he should be held by it.', 'whom you delivered up and denied in the presence of Pilate, when he had determined to release Him.  [24] God raised Him up, having freed Him from the agony of death, because it was not possible that He should be held by it.'],
  ['Acts', 'Acts 2', 'Being therefore exalted by the right hand of God, and having received from the Father the promise of the Holy Spirit, he has poured out this, which you now see and hear.', 'Being therefore exalted by the right hand of God, and having received from the Father the promise of the Holy Spirit, He has poured out this, which you now see and hear.'],

  // Acts 3 — lame man (decapitalize); Peter on Christ
  ['Acts', 'Acts 3', 'Leaping up, He stood and began to walk. He entered with them into the temple, walking, leaping, and praising God.  [9] All the people saw Him walking and praising God.', 'Leaping up, he stood and began to walk. He entered with them into the temple, walking, leaping, and praising God.  [9] All the people saw him walking and praising God.'],
  ['Acts', 'Acts 3', 'God, having raised up his servant, Jesus, sent him to bless you, in turning away everyone from your wickedness.' + RDQ, 'God, having raised up His servant, Jesus, sent Him to bless you, in turning away everyone from your wickedness.' + RDQ],

  // Acts 7 — Stephen' + APOS + 's speech (Abraham decapitalize)
  ['Acts', 'Acts 7', 'The God of glory appeared to our father Abraham when He was in Mesopotamia, before He lived in Haran,  [3] and said to him, ' + APOS + 'Get out of your land and away from your relatives, and come into a land which I will show you.' + APOS + '  [4] Then He came out of the land of the Chaldaeans and lived in Haran. From there, when his father was dead, God moved Him into this land where you are now living.', 'The God of glory appeared to our father Abraham when he was in Mesopotamia, before he lived in Haran,  [3] and said to him, ' + APOS + 'Get out of your land and away from your relatives, and come into a land which I will show you.' + APOS + '  [4] Then he came out of the land of the Chaldaeans and lived in Haran. From there, when his father was dead, God moved him into this land where you are now living.'],

  // Acts 9 — Peter and Aeneas; Saul (keep lowercase)
  ['Acts', 'Acts 9', 'Peter said to Him, ' + LDQ + 'Aeneas, Jesus Christ heals you. Get up and make your bed!' + RDQ, 'Peter said to him, ' + LDQ + 'Aeneas, Jesus Christ heals you. Get up and make your bed!' + RDQ],
  ['Acts', 'Acts 9', 'preaching boldly in the name of the Lord Jesus. He spoke and disputed against the Hellenists, but they were seeking to kill Him.', 'preaching boldly in the name of the Lord Jesus. He spoke and disputed against the Hellenists, but they were seeking to kill him.'],

  // Acts 10 — Cornelius vision (decapitalize); Peter on Christ
  ['Acts', 'Acts 10', 'a devout man, and one who feared God with all His house, who gave gifts for the needy generously to the people', 'a devout man, and one who feared God with all his house, who gave gifts for the needy generously to the people'],
  ['Acts', 'Acts 10', 'At about the ninth hour of the day, He clearly saw in a vision an angel of God coming to Him and saying to Him, ' + LDQ + 'Cornelius!' + RDQ, 'At about the ninth hour of the day, he clearly saw in a vision an angel of God coming to him and saying to him, ' + LDQ + 'Cornelius!' + RDQ],
  ['Acts', 'Acts 10', 'He, fastening His eyes on Him and being frightened, said, ' + LDQ + 'What is it, Lord?' + RDQ + '\n    He said to Him, ' + LDQ + 'Your prayers and your gifts to the needy have gone up for a memorial before God.', 'He, fastening his eyes on him and being frightened, said, ' + LDQ + 'What is it, Lord?' + RDQ + '\n    He said to him, ' + LDQ + 'Your prayers and your gifts to the needy have gone up for a memorial before God.'],
  ['Acts', 'Acts 10', 'whom they also killed, hanging him on a tree, whom God raised on the third day', 'whom they also killed, hanging Him on a tree, whom God raised on the third day'],
  ['Acts', 'Acts 10', 'All the prophets testify about him, that through his name everyone who believes in him will receive remission of sins.' + RDQ, 'All the prophets testify about Him, that through His name everyone who believes in Him will receive remission of sins.' + RDQ],
  ['Acts', 'Acts 10', 'Then they asked Him to stay some days.', 'Then they asked him to stay some days.'],

  // Acts 13 — Paul at Antioch (Christ passion/resurrection in sermon)
  ['Acts', 'Acts 13', 'because they didn' + APOS + 't know him, nor the voices of the prophets which are read every Sabbath, fulfilled them by condemning him.  [28] When they had found no cause for death, they still asked Pilate to have him killed.  [29] When they had fulfilled all things that were written about him, they took him down from the tree and laid him in a tomb.  [30] But God raised him from the dead.', 'because they didn' + APOS + 't know Him, nor the voices of the prophets which are read every Sabbath, fulfilled them by condemning Him.  [28] When they had found no cause for death, they still asked Pilate to have Him killed.  [29] When they had fulfilled all things that were written about Him, they took Him down from the tree and laid Him in a tomb.  [30] But God raised Him from the dead.'],
  ['Acts', 'Acts 13', 'and he was seen for many days by those who came up with him from Galilee to Jerusalem, who are his witnesses to the people.', 'and He was seen for many days by those who came up with Him from Galilee to Jerusalem, who are His witnesses to the people.'],
];

function main() {
  const data = JSON.parse(fs.readFileSync(NT_FILE, 'utf8'));
  const book = data.books.find((b) => b.name === 'Acts');
  if (!book) {
    console.error('Acts not found');
    process.exit(1);
  }

  let applied = 0;
  const missed = [];

  for (const [, chapterRef, from, to] of REPLACEMENTS) {
    if (from === to) continue;
    const chapter = book.chapters.find((c) => c.reference === chapterRef);
    if (!chapter) {
      missed.push(`${chapterRef}: chapter not found`);
      continue;
    }
    if (!chapter.content.includes(from)) {
      missed.push(`${chapterRef}: ${from.slice(0, 50)}...`);
      continue;
    }
    chapter.content = chapter.content.replace(from, to);
    applied++;
  }

  console.log(`Applied Acts capitalization (${applied} explicit replacements).`);
  if (missed.length) {
    console.warn(`Missed ${missed.length} explicit replacements:`);
    missed.forEach((m) => console.warn(`  - ${m}`));
  }

  if (!DRY_RUN) {
    fs.writeFileSync(NT_FILE, JSON.stringify(data, null, 2) + '\n');
    console.log(`Updated ${NT_FILE}`);
  } else {
    console.log('Dry run — no file written.');
  }
}

main();
