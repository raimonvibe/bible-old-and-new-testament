/**
 * Contextual capitalization pass for the book of Romans.
 * Run once: node scripts/apply-romans-capitalization.js
 * Dry run: node scripts/apply-romans-capitalization.js --dry-run
 */

const fs = require('fs');
const path = require('path');

const NT_FILE = path.join(__dirname, '..', 'data', 'new-testament-data.json');
const DRY_RUN = process.argv.includes('--dry-run');

/** @type {Array<[string, string, string]>} [chapterRef, from, to] */
const REPLACEMENTS = [
  // Romans 1
  ['Romans 1', 'which he promised before through his prophets', 'which He promised before through His prophets'],
  ['Romans 1', 'For the invisible things of him since the creation of the world are clearly seen, being perceived through the things that are made, even his everlasting power and divinity', 'For the invisible things of Him since the creation of the world are clearly seen, being perceived through the things that are made, even His everlasting power and divinity'],

  // Romans 2
  ['Romans 2', 'but He is a Jew who is one inwardly', 'but he is a Jew who is one inwardly'],

  // Romans 4
  ['Romans 4', 'For if Abraham was justified by works, He has something to boast about', 'For if Abraham was justified by works, he has something to boast about'],
  ['Romans 4', 'but believes in him who justifies the ungodly', 'but believes in Him who justifies the ungodly'],
  ['Romans 4', 'Yet, looking to the promise of God, He didn\u2019t waver through unbelief', 'Yet, looking to the promise of God, he didn\u2019t waver through unbelief'],
  ['Romans 4', 'being fully assured that what he had promised, he was also able to perform', 'being fully assured that what He had promised, He was also able to perform'],

  // Romans 6
  ['Romans 6', 'For if we have become united with him in the likeness of his death, we will also be part of his resurrection', 'For if we have become united with Him in the likeness of His death, we will also be part of His resurrection'],
  ['Romans 6', 'knowing this, that our old man was crucified with him', 'knowing this, that our old man was crucified with Him'],

  // Romans 8
  ['Romans 8', 'But if any man doesn\u2019t have the Spirit of Christ, He is not His.', 'But if any man doesn\u2019t have the Spirit of Christ, he is not His.'],
  ['Romans 8', 'but because of him who subjected it, in hope', 'but because of Him who subjected it, in hope'],
  ['Romans 8', 'But the Spirit himself makes intercession for us', 'But the Spirit Himself makes intercession for us'],
  ['Romans 8', 'For whom he foreknew, he also predestined to be conformed to the image of his Son, that he might be the firstborn among many brothers.', 'For whom He foreknew, He also predestined to be conformed to the image of His Son, that He might be the firstborn among many brothers.'],
  ['Romans 8', 'Whom he predestined, those he also called. Whom he called, those he also justified. Whom he justified, those he also glorified.', 'Whom He predestined, those He also called. Whom He called, those He also justified. Whom He justified, those He also glorified.'],
  ['Romans 8', 'he who didn\u2019t spare his own Son, but delivered him up for us all, how would he not also with him freely give us all things?', 'He who didn\u2019t spare His own Son, but delivered Him up for us all, how would He not also with Him freely give us all things?'],
  ['Romans 8', 'we are more than conquerors through him who loved us.', 'we are more than conquerors through Him who loved us.'],

  // Romans 10
  ['Romans 10', '“Whoever believes in him will not be disappointed.”', '“Whoever believes in Him will not be disappointed.”'],
  ['Romans 10', 'and is rich to all who call on him.', 'and is rich to all who call on Him.'],
  ['Romans 10', 'How then will they call on him in whom they have not believed? How will they believe in him whom they have not heard?', 'How then will they call on Him in whom they have not believed? How will they believe in Him whom they have not heard?'],
  ['Romans 10', 'But about Israel he says, “All day long I stretched out my hands', 'But about Israel He says, “All day long I stretched out my hands'],

  // Romans 11
  ['Romans 11', 'How He pleads with God against Israel:', 'How he pleads with God against Israel:'],
  ['Romans 11', 'But how does God answer Him?', 'But how does God answer him?'],
  ['Romans 11', '    and he will turn away ungodliness from Jacob.', '    and He will turn away ungodliness from Jacob.'],
  ['Romans 11', '     [36] For of him and through him and to him are all things. To him be the glory for ever! Amen.', '     [36] For of Him and through Him and to Him are all things. To Him be the glory for ever! Amen.'],

  // Romans 13 — human rulers, not God
  ['Romans 13', 'Therefore He who resists the authority withstands the ordinance of God', 'Therefore he who resists the authority withstands the ordinance of God'],
  ['Romans 13', 'for He is a servant of God to you for good. But if you do that which is evil, be afraid, for He doesn\u2019t bear the sword in vain; for He is a servant of God, an avenger for wrath to Him who does evil.', 'for he is a servant of God to you for good. But if you do that which is evil, be afraid, for he doesn\u2019t bear the sword in vain; for he is a servant of God, an avenger for wrath to him who does evil.'],

  // Romans 14 — believers, not God
  ['Romans 14', 'Don\u2019t let Him who eats despise Him who doesn\u2019t eat. Don\u2019t let Him who doesn\u2019t eat judge Him who eats, for God has accepted Him.', 'Don\u2019t let him who eats despise him who doesn\u2019t eat. Don\u2019t let him who doesn\u2019t eat judge him who eats, for God has accepted him.'],
  ['Romans 14', 'He who observes the day, observes it to the Lord; and He who does not observe the day, to the Lord He does not observe it. He who eats, eats to the Lord, for He gives God thanks. He who doesn\u2019t eat, to the Lord He doesn\u2019t eat, and gives God thanks.', 'He who observes the day, observes it to the Lord; and he who does not observe the day, to the Lord he does not observe it. He who eats, eats to the Lord, for he gives God thanks. He who doesn\u2019t eat, to the Lord he doesn\u2019t eat, and gives God thanks.'],
  ['Romans 14', 'Don\u2019t destroy with your food Him for whom Christ died.', 'Don\u2019t destroy with your food him for whom Christ died.'],
  ['Romans 14', 'Happy is He who doesn\u2019t judge Himself in that which He approves.', 'Happy is he who doesn\u2019t judge himself in that which he approves.'],

  // Romans 15
  ['Romans 15', '     [10] Again he says,', '     [10] Again He says,'],
  ['Romans 15', '    he who arises to rule over the Gentiles;\n    in him the Gentiles will hope.”', '    He who arises to rule over the Gentiles;\n    in Him the Gentiles will hope.”'],
];

function main() {
  const data = JSON.parse(fs.readFileSync(NT_FILE, 'utf8'));
  let totalChanges = 0;
  const missed = [];

  for (const [chapterRef, from, to] of REPLACEMENTS) {
    let chapter = null;
    for (const book of data.books || []) {
      if (book.name !== 'Romans') continue;
      chapter = book.chapters.find((c) => c.reference === chapterRef);
      if (chapter) break;
    }

    if (!chapter) {
      missed.push(`${chapterRef}: chapter not found`);
      continue;
    }

    if (!chapter.content.includes(from)) {
      missed.push(`${chapterRef}: pattern not found: ${from.slice(0, 60)}...`);
      continue;
    }

    chapter.content = chapter.content.replace(from, to);
    totalChanges++;
  }

  console.log(`Applied ${totalChanges} replacements.`);

  if (missed.length) {
    console.warn('Missed patterns:');
    for (const m of missed) console.warn(`  - ${m}`);
  }

  if (!DRY_RUN && totalChanges > 0) {
    fs.writeFileSync(NT_FILE, JSON.stringify(data, null, 2) + '\n');
    console.log(`Updated ${NT_FILE}`);
  } else if (DRY_RUN) {
    console.log('Dry run — no files written.');
  }
}

main();
