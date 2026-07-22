/**
 * Contextual capitalization: Revelation.
 * Run: node scripts/apply-revelation-capitalization.js [--dry-run]
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
  // Revelation 1 — Christ coming and vision
  ['Revelation', 'Revelation 1', 'Behold, he is coming with the clouds, and every eye will see him, including those who pierced him. All the tribes of the earth will mourn over him.', 'Behold, He is coming with the clouds, and every eye will see Him, including those who pierced Him. All the tribes of the earth will mourn over Him.'],
  ['Revelation', 'Revelation 1', 'clothed with a robe reaching down to his feet, and with a golden sash around his chest.  [14] his head and his hair were white as white wool, like snow. his eyes were like a flame of fire.  [15] his feet were like burnished brass, as if it had been refined in a furnace. his voice was like the voice of many waters.  [16] he had seven stars in his right hand. Out of his mouth proceeded a sharp two-edged sword. his face was like the sun shining at its brightest.  [17] When I saw him, I fell at his feet like a dead man.\n    he laid his right hand on me', 'clothed with a robe reaching down to His feet, and with a golden sash around His chest.  [14] His head and His hair were white as white wool, like snow. His eyes were like a flame of fire.  [15] His feet were like burnished brass, as if it had been refined in a furnace. His voice was like the voice of many waters.  [16] He had seven stars in His right hand. Out of His mouth proceeded a sharp two-edged sword. His face was like the sun shining at its brightest.  [17] When I saw Him, I fell at His feet like a dead man.\n    He laid His right hand on me'],

  // Revelation 2 — letters (Christ vs overcomer)
  ['Revelation', 'Revelation 2', `${LDQ}he who holds the seven stars in his right hand, he who walks among the seven golden lamp stands says these things:`, `${LDQ}He who holds the seven stars in His right hand, He who walks among the seven golden lamp stands says these things:`],
  ['Revelation', 'Revelation 2', 'He who has an ear, let Him hear what the Spirit says to the assemblies. To Him who overcomes I will give to eat from the tree of life', 'He who has an ear, let him hear what the Spirit says to the assemblies. To him who overcomes I will give to eat from the tree of life'],
  ['Revelation', 'Revelation 2', `${LDQ}he who has the sharp two-edged sword says these things:`, `${LDQ}He who has the sharp two-edged sword says these things:`],
  ['Revelation', 'Revelation 2', 'I am he who searches the minds and hearts.', 'I am He who searches the minds and hearts.'],

  // Revelation 3
  ['Revelation', 'Revelation 3', `${LDQ}he who is holy, he who is true, he who has the key of David, he who opens and no one can shut`, `${LDQ}He who is holy, He who is true, He who has the key of David, He who opens and no one can shut`],
  ['Revelation', 'Revelation 3', 'He who overcomes, I will make Him a pillar in the temple of my God, and He will go out from there no more. I will write on Him the name of my God', 'He who overcomes, I will make him a pillar in the temple of my God, and he will go out from there no more. I will write on him the name of my God'],

  // Revelation 5 — Lamb and throne
  ['Revelation', 'Revelation 5', 'in the right hand of him who sat on the throne, a book written inside and outside', 'in the right hand of Him who sat on the throne, a book written inside and outside'],
  ['Revelation', 'Revelation 5', 'has overcome: he who opens the book and its seven seals.', 'has overcome: He who opens the book and its seven seals.'],
  ['Revelation', 'Revelation 5', 'Then he came, and he took it out of the right hand of him who sat on the throne.  [8] Now when he had taken the book', 'Then He came, and He took it out of the right hand of Him who sat on the throne.  [8] Now when He had taken the book'],
  ['Revelation', 'Revelation 5', `${LDQ}To him who sits on the throne and to the Lamb be the blessing`, `${LDQ}To Him who sits on the throne and to the Lamb be the blessing`],

  // Revelation 6 — Lamb opens seals; God on throne
  ['Revelation', 'Revelation 6', 'When he opened the second seal', 'When He opened the second seal'],
  ['Revelation', 'Revelation 6', 'When he opened the third seal', 'When He opened the third seal'],
  ['Revelation', 'Revelation 6', 'When he opened the fourth seal', 'When He opened the fourth seal'],
  ['Revelation', 'Revelation 6', 'I saw when he opened the sixth seal', 'I saw when He opened the sixth seal'],
  ['Revelation', 'Revelation 6', 'hide us from the face of him who sits on the throne, and from the wrath of the Lamb,  [17] for the great day of his wrath has come', 'hide us from the face of Him who sits on the throne, and from the wrath of the Lamb,  [17] for the great day of His wrath has come'],

  // Revelation 10 — God who lives forever
  ['Revelation', 'Revelation 10', 'and swore by him who lives forever and ever, who created heaven', 'and swore by Him who lives forever and ever, who created heaven'],

  // Revelation 14 — Lamb / Son of Man
  ['Revelation', 'Revelation 14', 'the Lamb standing on Mount Zion, and with him a number, one hundred forty-four thousand, having his name and the name of his Father written on their foreheads.', 'the Lamb standing on Mount Zion, and with Him a number, one hundred forty-four thousand, having His name and the name of His Father written on their foreheads.'],
  ['Revelation', 'Revelation 14', 'one sitting like a son of man, having on his head a golden crown, and in his hand a sharp sickle.', 'one sitting like a son of man, having on His head a golden crown, and in His hand a sharp sickle.'],
  ['Revelation', 'Revelation 14', 'he who sat on the cloud thrust his sickle on the earth', 'He who sat on the cloud thrust His sickle on the earth'],

  // Revelation 19 — God and Christ the rider
  ['Revelation', 'Revelation 19', 'for his judgments are true and righteous. For he has judged the great prostitute who corrupted the earth with her sexual immorality, and he has avenged the blood of his servants at her hand.', 'for His judgments are true and righteous. For He has judged the great prostitute who corrupted the earth with her sexual immorality, and He has avenged the blood of His servants at her hand.'],
  ['Revelation', 'Revelation 19', 'let' + APOS + 's give the glory to him. For the wedding of the Lamb has come, and his wife has made herself ready.', 'let' + APOS + 's give the glory to Him. For the wedding of the Lamb has come, and His wife has made herself ready.'],
  ['Revelation', 'Revelation 19', 'he who sat on it is called Faithful and True. In righteousness he judges and makes war.  [12] his eyes are a flame of fire, and on his head are many crowns. he has names written and a name written which no one knows but he himself.  [13] He is clothed in a garment sprinkled with blood. His name is called ' + LDQ + 'The Word of God.' + RDQ + '  [14] The armies which are in heaven, clothed in white, pure, fine linen, followed him on white horses.', 'He who sat on it is called Faithful and True. In righteousness He judges and makes war.  [12] His eyes are a flame of fire, and on His head are many crowns. He has names written and a name written which no one knows but He Himself.  [13] He is clothed in a garment sprinkled with blood. His name is called ' + LDQ + 'The Word of God.' + RDQ + '  [14] The armies which are in heaven, clothed in white, pure, fine linen, followed Him on white horses.'],
  ['Revelation', 'Revelation 19', 'he has on his garment and on his thigh a name written', 'He has on His garment and on His thigh a name written'],
  ['Revelation', 'Revelation 19', 'gathered together to make war against him who sat on the horse and against his army.', 'gathered together to make war against Him who sat on the horse and against His army.'],
  ['Revelation', 'Revelation 19', 'The rest were killed with the sword of him who sat on the horse, the sword which came out of his mouth.', 'The rest were killed with the sword of Him who sat on the horse, the sword which came out of His mouth.'],

  // Revelation 21 — God on throne
  ['Revelation', 'Revelation 21', 'he will wipe away every tear from their eyes.', 'He will wipe away every tear from their eyes.'],
  ['Revelation', 'Revelation 21', 'he said to me, ' + LDQ + 'I am the Alpha and the Omega, the Beginning and the End. I will give freely to him who is thirsty from the spring of the water of life.   [7] He who overcomes, I will give Him these things. I will be His God, and He will be my son.', 'He said to me, ' + LDQ + 'I am the Alpha and the Omega, the Beginning and the End. I will give freely to him who is thirsty from the spring of the water of life.   [7] He who overcomes, I will give him these things. I will be his God, and he will be my son.'],

  // Revelation 22
  ['Revelation', 'Revelation 22', 'They will see his face, and his name will be on their foreheads.', 'They will see His face, and His name will be on their foreheads.'],
  ['Revelation', 'Revelation 22', 'he said to me, ' + LDQ + 'Don' + APOS + 't seal up the words of the prophecy of this book', 'He said to me, ' + LDQ + 'Don' + APOS + 't seal up the words of the prophecy of this book'],
  ['Revelation', 'Revelation 22', 'Blessed are those who do his commandments, that they may have the right to the tree of life', 'Blessed are those who do His commandments, that they may have the right to the tree of life'],
  ['Revelation', 'Revelation 22', 'if anyone adds to them, God will add to Him the plagues which are written in this book.  [19] If anyone takes away from the words of the book of this prophecy, God will take away His part from the tree of life', 'if anyone adds to them, God will add to him the plagues which are written in this book.  [19] If anyone takes away from the words of the book of this prophecy, God will take away his part from the tree of life'],

  ['Revelation', 'Revelation 8', 'When he opened the seventh seal', 'When He opened the seventh seal'],

  // Revelation 17 — Lamb as Lord
  ['Revelation', 'Revelation 17', 'the Lamb will overcome them, for he is Lord of lords and King of kings; and those who are with him are called', 'the Lamb will overcome them, for He is Lord of lords and King of kings; and those who are with Him are called'],

  // Revelation 20 — God on throne; beast image human
  ['Revelation', 'Revelation 20', 'I saw a great white throne and him who sat on it, from whose face the earth and the heaven fled away.', 'I saw a great white throne and Him who sat on it, from whose face the earth and the heaven fled away.'],
  ['Revelation', 'Revelation 20', 'didn' + APOS + 't worship the beast nor His image', 'didn' + APOS + 't worship the beast nor his image'],
];

/** Patterns applied to every Revelation chapter (from, to) */
const GLOBAL_CHAPTER_PATTERNS = [
  ['To Him who overcomes', 'To him who overcomes'],
  ['let Him hear what the Spirit says', 'let him hear what the Spirit says'],
];

function main() {
  const data = JSON.parse(fs.readFileSync(NT_FILE, 'utf8'));
  const book = data.books.find((b) => b.name === 'Revelation');
  if (!book) {
    console.error('Revelation not found');
    process.exit(1);
  }

  let applied = 0;
  const missed = [];

  for (const [bookName, chapterRef, from, to] of REPLACEMENTS) {
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

  for (const chapter of book.chapters) {
    for (const [from, to] of GLOBAL_CHAPTER_PATTERNS) {
      if (chapter.content.includes(from)) {
        const count = chapter.content.split(from).length - 1;
        chapter.content = chapter.content.split(from).join(to);
        applied += count;
      }
    }
  }

  console.log(`Applied ${applied} replacements in Revelation.`);
  if (missed.length) {
    console.warn(`Missed ${missed.length}:`);
    missed.forEach((m) => console.warn(`  - ${m}`));
  }

  if (!DRY_RUN && applied > 0) {
    fs.writeFileSync(NT_FILE, JSON.stringify(data, null, 2) + '\n');
    console.log(`Updated ${NT_FILE}`);
  }
}

main();
