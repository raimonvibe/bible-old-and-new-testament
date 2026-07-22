/**
 * Follow-up fixes after apply-luke/john/acts-capitalization.js
 * Run: node scripts/fix-luke-john-acts-followup.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const NT_FILE = path.join(__dirname, '..', 'data', 'new-testament-data.json');
const DRY_RUN = process.argv.includes('--dry-run');

/** @type {Array<[string, string, string, string]>} [book, chapterRef, from, to] */
const FIXES = [
  // Luke — Jesus addressing humans
  ['Luke', 'Luke 4', 'Jesus answered Him, saying, “It is written, ‘Man shall not live by bread alone', 'Jesus answered him, saying, “It is written, ‘Man shall not live by bread alone'],
  ['Luke', 'Luke 4', 'Jesus answered Him, “Get behind me, Satan!', 'Jesus answered him, “Get behind me, Satan!'],
  ['Luke', 'Luke 10', 'Jesus said to Him, “Go and do likewise.”', 'Jesus said to him, “Go and do likewise.”'],
  ['Luke', 'Luke 18', 'Jesus said to Him, “Receive your sight. Your faith has healed you.”', 'Jesus said to him, “Receive your sight. Your faith has healed you.”'],
  ['Luke', 'Luke 22', 'Jesus said to Him, “Judas, do you betray the Son of Man with a kiss?”', 'Jesus said to him, “Judas, do you betray the Son of Man with a kiss?”'],
  ['Luke', 'Luke 23', 'Jesus said to Him, “Assuredly I tell you, today you will be with me in Paradise.”', 'Jesus said to him, “Assuredly I tell you, today you will be with me in Paradise.”'],

  // John 1 — Word and Baptist
  ['John', 'John 1', 'We saw his glory, such glory as of the only born Son of the Father, full of grace and truth.  [15] John testified about him. he cried out, saying, “This was he of whom I said, ‘he who comes after me has surpassed me, for he was before me.’”', 'We saw His glory, such glory as of the only born Son of the Father, full of grace and truth.  [15] John testified about Him. he cried out, saying, “This was He of whom I said, ‘He who comes after me has surpassed me, for He was before me.’”'],
  ['John', 'John 1', 'Jesus answered Him, “Before Philip called you, when you were under the fig tree, I saw you.”', 'Jesus answered him, “Before Philip called you, when you were under the fig tree, I saw you.”'],
  ['John', 'John 1', 'Jesus answered Him, “Because I told you, ‘I saw you underneath the fig tree,’ do you believe?', 'Jesus answered him, “Because I told you, ‘I saw you underneath the fig tree,’ do you believe?'],

  // John — human addressees
  ['John', 'John 3', 'Jesus answered Him, “Are you the teacher of Israel, and don’t understand these things?', 'Jesus answered him, “Are you the teacher of Israel, and don’t understand these things?'],
  ['John', 'John 13', 'Jesus said to Him, “Someone who has bathed only needs to have His feet washed', 'Jesus said to him, “Someone who has bathed only needs to have his feet washed'],
  ['John', 'John 13', 'Jesus answered Him, “If I don’t wash you, you have no part with me.”', 'Jesus answered him, “If I don’t wash you, you have no part with me.”'],
  ['John', 'John 13', 'Jesus answered Him, “Will you lay down your life for me?', 'Jesus answered him, “Will you lay down your life for me?'],
  ['John', 'John 14', 'Jesus said to Him, “Have I been with you such a long time, and do you not know me, Philip?', 'Jesus said to him, “Have I been with you such a long time, and do you not know me, Philip?'],
  ['John', 'John 14', 'Jesus answered Him, “If a man loves me, He will keep my word. My Father will love Him, and we will come to Him and make our home with Him.', 'Jesus answered him, “If a man loves me, he will keep my word. My Father will love him, and we will come to him and make our home with him.'],
  ['John', 'John 18', 'Jesus answered Him, “I spoke openly to the world.', 'Jesus answered him, “I spoke openly to the world.'],
  ['John', 'John 18', 'Jesus answered Him, “If I have spoken evil, testify of the evil; but if well, why do you beat me?”', 'Jesus answered him, “If I have spoken evil, testify of the evil; but if well, why do you beat me?”'],
  ['John', 'John 18', 'Jesus answered Him, “Do you say this by yourself, or did others tell you about me?”', 'Jesus answered him, “Do you say this by yourself, or did others tell you about me?”'],
  ['John', 'John 20', 'Jesus said to Him, “Because you have seen me, you have believed.', 'Jesus said to him, “Because you have seen me, you have believed.'],
  ['John', 'John 13', 'Jesus said to Him, “Buy what things we need for the feast,”', 'Jesus said to him, “Buy what things we need for the feast,”'],
  ['Mark', 'Mark 13', 'Jesus said to Him, “Do you see these great buildings?', 'Jesus said to him, “Do you see these great buildings?'],

  // Acts — Abraham and Christ references
  ['Acts', 'Acts 7', 'The God of glory appeared to our father Abraham when He was in Mesopotamia, before He lived in Haran,', 'The God of glory appeared to our father Abraham when he was in Mesopotamia, before he lived in Haran,'],
  ['Acts', 'Acts 10', 'hanging him on a tree.', 'hanging Him on a tree.'],

  // Luke 18 — parable characters (judge, tax collector, Pharisee)
  ['Luke', 'Luke 18', ' [4] He wouldn’t for a while; but afterward He said to Himself, ‘Though I neither fear God nor respect man,', ' [4] he wouldn’t for a while; but afterward he said to himself, ‘Though I neither fear God nor respect man,'],
  ['Luke', 'Luke 18', 'The Pharisee stood and prayed by Himself like this:', 'The Pharisee stood and prayed by himself like this:'],
  ['Luke', 'Luke 18', 'wouldn’t even lift up His eyes to heaven, but beat His breast, saying, ‘God, be merciful to me, a sinner!’', 'wouldn’t even lift up his eyes to heaven, but beat his breast, saying, ‘God, be merciful to me, a sinner!’'],
];

function main() {
  const data = JSON.parse(fs.readFileSync(NT_FILE, 'utf8'));
  let applied = 0;
  const missed = [];

  for (const [bookName, chapterRef, from, to] of FIXES) {
    const book = data.books.find((b) => b.name === bookName);
    const chapter = book?.chapters.find((c) => c.reference === chapterRef);
    if (!chapter) {
      missed.push(`${chapterRef}: chapter not found`);
      continue;
    }
    if (!chapter.content.includes(from)) {
      missed.push(`${bookName} ${chapterRef}: ${from.slice(0, 55)}...`);
      continue;
    }
    chapter.content = chapter.content.replace(from, to);
    applied++;
  }

  console.log(`Applied ${applied} Luke/John/Acts follow-up fixes.`);
  if (missed.length) {
    console.warn(`Missed ${missed.length}:`);
    missed.forEach((m) => console.warn(`  - ${m}`));
  }

  if (!DRY_RUN) {
    fs.writeFileSync(NT_FILE, JSON.stringify(data, null, 2) + '\n');
    console.log(`Updated ${NT_FILE}`);
  }
}

main();
