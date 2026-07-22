/**
 * Contextual capitalization: Gospel of John.
 * Run: node scripts/apply-john-capitalization.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { applyProgrammaticRules } = require('./lib/gospel-capitalization-rules');

const NT_FILE = path.join(__dirname, '..', 'data', 'new-testament-data.json');
const DRY_RUN = process.argv.includes('--dry-run');
const APOS = '\u2019';
const LDQ = '\u201c';
const RDQ = '\u201d';

/** Verse tags where initial "he" is NOT Jesus (John 3–21 programmatic pass) */
const VERSE_HE_EXCLUDE = new Set([
  // John 3 — Nicodemus; John the Baptist (vv.27–30)
  'John 3|[4]',
  'John 3|[9]',
  'John 3|[27]',
  'John 3|[29]',
  'John 3|[30]',
  // John 4 — Samaritan woman, villagers, nobleman
  'John 4|[9]',
  'John 4|[11]',
  'John 4|[15]',
  'John 4|[17]',
  'John 4|[19]',
  'John 4|[27]',
  'John 4|[31]',
  'John 4|[32]',
  'John 4|[33]',
  'John 4|[39]',
  'John 4|[40]',
  'John 4|[41]',
  'John 4|[49]',
  // John 5 — paralytic; pool custom
  'John 5|[7]',
  // John 6 — Philip, Andrew, crowd
  'John 6|[7]',
  'John 6|[14]',
  // John 7 — Jews, officers
  'John 7|[13]',
  'John 7|[45]',
  // John 8 — accusers; woman; they
  'John 8|[5]',
  'John 8|[9]',
  'John 8|[59]',
  // John 9 — blind man narrative
  'John 9|[1]',
  'John 9|[6]',
  'John 9|[8]',
  'John 9|[9]',
  'John 9|[10]',
  'John 9|[11]',
  'John 9|[12]',
  'John 9|[15]',
  'John 9|[17]',
  'John 9|[18]',
  'John 9|[20]',
  'John 9|[21]',
  'John 9|[25]',
  'John 9|[26]',
  'John 9|[27]',
  'John 9|[30]',
  'John 9|[34]',
  'John 9|[36]',
  'John 9|[38]',
  'John 9|[40]',
  // John 10 — Jews
  'John 10|[20]',
  'John 10|[21]',
  // John 11 — Lazarus/Martha/Mary/Thomas; Jews
  'John 11|[6]',
  'John 11|[8]',
  'John 11|[12]',
  'John 11|[16]',
  'John 11|[24]',
  'John 11|[29]',
  'John 11|[36]',
  'John 11|[37]',
  // John 12 — Judas
  'John 12|[4]',
  // John 18 — Peter; Pilate (not Jesus)
  'John 18|[17]',
  'John 18|[25]',
  'John 18|[38]',
  // John 19 — John the evangelist; Joseph
  'John 19|[35]',
  'John 19|[38]',
  // John 20 — disciples at tomb
  'John 20|[5]',
  'John 20|[6]',
  'John 20|[10]',
  // John 21 — Peter; beloved disciple
  'John 21|[3]',
  'John 21|[16]',
  'John 21|[17]',
]);

/** @type {Array<[string, string, string, string]>} */
const REPLACEMENTS = [
  // John 1 — Word/Logos (capitalize); John the Baptist stays lowercase
  ['John', 'John 1', 'All things were made through him. Without him, nothing was made that has been made.  [4] In him was life, and the life was the light of men.', 'All things were made through Him. Without Him, nothing was made that has been made.  [4] In Him was life, and the life was the light of men.'],
  ['John', 'John 1', 'that all might believe through him.  [8] he was not the light, but was sent that he might testify about the light.', 'that all might believe through Him.  [8] he was not the light, but was sent that he might testify about the light.'],
  ['John', 'John 1', '     [10] he was in the world, and the world was made through him, and the world didn' + APOS + 't recognize him.  [11] he came to his own, and those who were his own didn' + APOS + 't receive him.', '     [10] He was in the world, and the world was made through Him, and the world didn' + APOS + 't recognize Him.  [11] He came to His own, and those who were His own didn' + APOS + 't receive Him.'],
  ['John', 'John 1', 'We saw his glory, such glory as of the only born Son of the Father, full of grace and truth.  [15] John testified about him. he cried out, saying, ' + LDQ + 'This was he of whom I said, ' + APOS + 'he who comes after me has surpassed me, for he was before me.' + APOS + RDQ, 'We saw His glory, such glory as of the only born Son of the Father, full of grace and truth.  [15] John testified about Him. he cried out, saying, ' + LDQ + 'This was He of whom I said, ' + APOS + 'He who comes after me has surpassed me, for He was before me.' + APOS + RDQ],
  ['John', 'John 1', 'From his fullness we all received grace upon grace.', 'From His fullness we all received grace upon grace.'],
  ['John', 'John 1', '     [27] he is the one who comes after me, who is preferred before me, whose sandal strap I' + APOS + 'm not worthy to loosen.', '     [27] He is the one who comes after me, who is preferred before me, whose sandal strap I' + APOS + 'm not worthy to loosen.'],
  ['John', 'John 1', 'This is he of whom I said, ' + APOS + 'After me comes a man who is preferred before me, for he was before me.' + APOS + '  [31] I didn' + APOS + 't know him, but for this reason I came baptizing in water, that he would be revealed to Israel.', 'This is He of whom I said, ' + APOS + 'After me comes a man who is preferred before me, for He was before me.' + APOS + '  [31] I didn' + APOS + 't know Him, but for this reason I came baptizing in water, that He would be revealed to Israel.'],
  ['John', 'John 1', 'and it remained on him.  [33] I didn' + APOS + 't recognize Him', 'and it remained on Him.  [33] I didn' + APOS + 't recognize Him'],
  ['John', 'John 1', '     [39] he said to them, ' + LDQ + 'Come and see.' + RDQ + '\n    They came and saw where he was staying, and they stayed with him that day.', '     [39] He said to them, ' + LDQ + 'Come and see.' + RDQ + '\n    They came and saw where He was staying, and they stayed with Him that day.'],
  ['John', 'John 1', 'Philip found Nathanael, and said to Him, ' + LDQ + 'We have found Him of whom Moses in the law and also the prophets, wrote: Jesus of Nazareth, the son of Joseph.' + RDQ, 'Philip found Nathanael, and said to him, ' + LDQ + 'We have found Him of whom Moses in the law and also the prophets, wrote: Jesus of Nazareth, the son of Joseph.' + RDQ],
  ['John', 'John 1', 'Jesus said to Him, ' + LDQ + 'Follow me.' + RDQ, 'Jesus said to him, ' + LDQ + 'Follow me.' + RDQ],

  // John 2 — Jesus narrative (outside programmatic range)
  ['John', 'John 2', '     [5] his mother said to the servants, ' + LDQ + 'Whatever he says to you, do it.' + RDQ, '     [5] His mother said to the servants, ' + LDQ + 'Whatever He says to you, do it.' + RDQ],
  ['John', 'John 2', '     [8] he said to them, ' + LDQ + 'Now draw some out, and take it to the ruler of the feast.' + RDQ, '     [8] He said to them, ' + LDQ + 'Now draw some out, and take it to the ruler of the feast.' + RDQ],
  ['John', 'John 2', 'After this, he went down to Capernaum, he, and his mother, his brothers, and his disciples; and they stayed there a few days.', 'After this, He went down to Capernaum, He, and His mother, His brothers, and His disciples; and they stayed there a few days.'],
  ['John', 'John 2', '     [14] he found in the temple those who sold oxen, sheep, and doves, and the changers of money sitting.  [15] he made a whip of cords and drove all out of the temple, both the sheep and the oxen; and he poured out the changers' + APOS + ' money and overthrew their tables.  [16] To those who sold the doves, he said, ' + LDQ + 'Take these things out of here! Don' + APOS + 't make my Father' + APOS + 's house a marketplace!' + RDQ + '  [17] his disciples remembered that it was written, ' + LDQ + 'Zeal for your house will eat me up.' + RDQ, '     [14] He found in the temple those who sold oxen, sheep, and doves, and the changers of money sitting.  [15] He made a whip of cords and drove all out of the temple, both the sheep and the oxen; and He poured out the changers' + APOS + ' money and overthrew their tables.  [16] To those who sold the doves, He said, ' + LDQ + 'Take these things out of here! Don' + APOS + 't make my Father' + APOS + 's house a marketplace!' + RDQ + '  [17] His disciples remembered that it was written, ' + LDQ + 'Zeal for your house will eat me up.' + RDQ],
  ['John', 'John 2', 'But he spoke of the temple of his body.', 'But He spoke of the temple of His body.'],
  ['John', 'John 2', 'Now when he was in Jerusalem at the Passover, during the feast, many believed in his name, observing his signs which he did.', 'Now when He was in Jerusalem at the Passover, during the feast, many believed in His name, observing His signs which He did.'],

  // John 3 — John the Baptist on Christ (vv.31–36)
  ['John', 'John 3', LDQ + 'he who comes from above is above all. he who is from the earth belongs to the earth and speaks of the earth. he who comes from heaven is above all.  [32] What he has seen and heard, of that he testifies; and no one receives his witness.', LDQ + 'He who comes from above is above all. he who is from the earth belongs to the earth and speaks of the earth. He who comes from heaven is above all.  [32] What He has seen and heard, of that He testifies; and no one receives His witness.'],

  // John 4 — nobleman; fix over-capitalized sick child narrative
  ['John', 'John 4', 'When He heard that Jesus had come out of Judea into Galilee, He went to Him and begged Him that He would come down and heal his son, for He was at the point of death.', 'When he heard that Jesus had come out of Judea into Galilee, he went to Him and begged Him that He would come down and heal his son, for he was at the point of death.'],
  ['John', 'John 4', 'Jesus said to Him, ' + LDQ + 'Go your way. Your son lives.' + RDQ + ' The man believed the word that Jesus spoke to Him, and He went His way.', 'Jesus said to him, ' + LDQ + 'Go your way. Your son lives.' + RDQ + ' The man believed the word that Jesus spoke to him, and he went his way.'],
  ['John', 'John 4', 'So the father knew that it was at that hour in which Jesus said to Him, ' + LDQ + 'Your son lives.' + RDQ + ' He believed, as did His whole house.', 'So the father knew that it was at that hour in which Jesus said to him, ' + LDQ + 'Your son lives.' + RDQ + ' He believed, as did his whole house.'],

  // John 5 — paralytic
  ['John', 'John 5', 'When Jesus saw Him lying there, and knew that He had been sick for a long time, He asked Him, ' + LDQ + 'Do you want to be made well?' + RDQ, 'When Jesus saw him lying there, and knew that he had been sick for a long time, He asked him, ' + LDQ + 'Do you want to be made well?' + RDQ],
  ['John', 'John 5', 'Jesus said to Him, ' + LDQ + 'Arise, take up your mat, and walk.' + RDQ, 'Jesus said to him, ' + LDQ + 'Arise, take up your mat, and walk.' + RDQ],

  // John 9 — blind man
  ['John', 'John 9', 'Jesus said to Him, ' + LDQ + 'You have both seen Him, and it is He who speaks with you.' + RDQ, 'Jesus said to him, ' + LDQ + 'You have both seen Him, and it is He who speaks with you.' + RDQ],

  // John 11 — Lazarus (decapitalize wrongly capitalized Lazarus refs)
  ['John', 'John 11', 'So when Jesus came, He found that He had been in the tomb four days already.', 'So when Jesus came, He found that he had been in the tomb four days already.'],
  ['John', 'John 11', 'Martha, the sister of Him who was dead, said to Him, ' + LDQ + 'Lord, by this time there is a stench, for He has been dead four days.' + RDQ, 'Martha, the sister of him who was dead, said to Him, ' + LDQ + 'Lord, by this time there is a stench, for he has been dead four days.' + RDQ],
  ['John', 'John 11', 'He who was dead came out, bound hand and foot with wrappings, and His face was wrapped around with a cloth.\n    Jesus said to them, ' + LDQ + 'Free Him, and let Him go.' + RDQ, 'He who was dead came out, bound hand and foot with wrappings, and his face was wrapped around with a cloth.\n    Jesus said to them, ' + LDQ + 'Free him, and let him go.' + RDQ],

  // John 13–14 — disciples (Jesus said to Him → him)
  ['John', 'John 13', 'Jesus answered Him, ' + LDQ + 'You don' + APOS + 't know what I am doing now, but you will understand later.' + RDQ, 'Jesus answered him, ' + LDQ + 'You don' + APOS + 't know what I am doing now, but you will understand later.' + RDQ],
  ['John', 'John 13', 'Then Jesus said to Him, ' + LDQ + 'What you do, do quickly.' + RDQ, 'Then Jesus said to him, ' + LDQ + 'What you do, do quickly.' + RDQ],
  ['John', 'John 14', 'Jesus said to Him, ' + LDQ + 'I am the way, the truth, and the life. No one comes to the Father, except through me.', 'Jesus said to him, ' + LDQ + 'I am the way, the truth, and the life. No one comes to the Father, except through me.'],
  ['John', 'John 14', 'Jesus said to Him, ' + LDQ + 'Have I been with you such a long time, and do you not know me, Philip? He who has seen me has seen the Father. How do you say, ' + APOS + 'Show us the Father?' + APOS + RDQ, 'Jesus said to him, ' + LDQ + 'Have I been with you such a long time, and do you not know me, Philip? He who has seen me has seen the Father. How do you say, ' + APOS + 'Show us the Father?' + APOS + RDQ],

  // John 18–19 — passion
  ['John', 'John 18', 'When therefore he said to them, ' + LDQ + 'I am he,' + RDQ + ' they went backward and fell to the ground.', 'When therefore He said to them, ' + LDQ + 'I am he,' + RDQ + ' they went backward and fell to the ground.'],
  ['John', 'John 18', 'that the word might be fulfilled which he spoke, ' + LDQ + 'Of those whom you have given me, I have lost none.' + RDQ, 'that the word might be fulfilled which He spoke, ' + LDQ + 'Of those whom you have given me, I have lost none.' + RDQ],
  ['John', 'John 18', 'and led him to Annas first, for he was father-in-law to Caiaphas', 'and led Him to Annas first, for he was father-in-law to Caiaphas'],
  ['John', 'John 18', 'Pilate asked him, ' + LDQ + 'Are you the King of the Jews?' + RDQ, 'Pilate asked Him, ' + LDQ + 'Are you the King of the Jews?' + RDQ],
  ['John', 'John 19', 'The soldiers twisted thorns into a crown and put it on his head, and dressed him in a purple garment.  [3] They kept saying, ' + LDQ + 'Hail, King of the Jews!' + RDQ + ' and they kept slapping him.', 'The soldiers twisted thorns into a crown and put it on His head, and dressed Him in a purple garment.  [3] They kept saying, ' + LDQ + 'Hail, King of the Jews!' + RDQ + ' and they kept slapping Him.'],
  ['John', 'John 19', 'Then Pilate went out again, and said to them, ' + LDQ + 'Behold, I bring him out to you, that you may know that I find no basis for a charge against him.' + RDQ, 'Then Pilate went out again, and said to them, ' + LDQ + 'Behold, I bring Him out to you, that you may know that I find no basis for a charge against Him.' + RDQ],
  ['John', 'John 19', 'When therefore the chief priests and the officers saw him, they shouted, saying, ' + LDQ + 'Crucify! Crucify!' + RDQ + '\n    Pilate said to them, ' + LDQ + 'Take him yourselves and crucify him, for I find no basis for a charge against him.' + RDQ, 'When therefore the chief priests and the officers saw Him, they shouted, saying, ' + LDQ + 'Crucify! Crucify!' + RDQ + '\n    Pilate said to them, ' + LDQ + 'Take him yourselves and crucify him, for I find no basis for a charge against Him.' + RDQ],
  ['John', 'John 19', 'At this, Pilate was seeking to release him, but the Jews cried out', 'At this, Pilate was seeking to release Him, but the Jews cried out'],
  ['John', 'John 19', '     [14] Now it was the Preparation Day of the Passover, at about the sixth hour. he said to the Jews, ' + LDQ + 'Behold, your King!' + RDQ, '     [14] Now it was the Preparation Day of the Passover, at about the sixth hour. He said to the Jews, ' + LDQ + 'Behold, your King!' + RDQ],
  ['John', 'John 19', '     [17] he went out, bearing his cross, to the place called ' + LDQ + 'The Place of a Skull' + RDQ, '     [17] He went out, bearing His cross, to the place called ' + LDQ + 'The Place of a Skull' + RDQ],
  ['John', 'John 19', 'so they put a sponge full of the vinegar on hyssop, and held it at his mouth.', 'so they put a sponge full of the vinegar on hyssop, and held it at His mouth.'],
  ['John', 'John 19', 'However, one of the soldiers pierced his side with a spear', 'However, one of the soldiers pierced His side with a spear'],
  ['John', 'John 19', 'Therefore when Jesus saw his mother, and the disciple whom He loved standing there, He said to his mother, ' + LDQ + 'Woman, behold, your son!' + RDQ, 'Therefore when Jesus saw His mother, and the disciple whom He loved standing there, He said to His mother, ' + LDQ + 'Woman, behold, your son!' + RDQ],

  // John 20–21 — resurrection
  ['John', 'John 20', 'For as yet they didn' + APOS + 't know the Scripture, that he must rise from the dead.', 'For as yet they didn' + APOS + 't know the Scripture, that He must rise from the dead.'],
  ['John', 'John 20', 'She said to them, ' + LDQ + 'Because they have taken away my Lord, and I don' + APOS + 't know where they have laid him.' + RDQ, 'She said to them, ' + LDQ + 'Because they have taken away my Lord, and I don' + APOS + 't know where they have laid Him.' + RDQ],
  ['John', 'John 20', '     [27] Then he said to Thomas, ' + LDQ + 'Reach here your finger, and see my hands. Reach here your hand, and put it into my side. Don' + APOS + 't be unbelieving, but believing.' + RDQ, '     [27] Then He said to Thomas, ' + LDQ + 'Reach here your finger, and see my hands. Reach here your hand, and put it into my side. Don' + APOS + 't be unbelieving, but believing.' + RDQ],
  ['John', 'John 21', '     [6] he said to them, ' + LDQ + 'Cast the net on the right side of the boat, and you will find some.' + RDQ, '     [6] He said to them, ' + LDQ + 'Cast the net on the right side of the boat, and you will find some.' + RDQ],
  ['John', 'John 21', 'So when Simon Peter heard that it was the Lord, He wrapped His coat around Himself (for He was naked), and threw Himself into the sea.', 'So when Simon Peter heard that it was the Lord, he wrapped his coat around himself (for he was naked), and threw himself into the sea.'],
  ['John', 'John 21', 'Jesus said to Him, ' + LDQ + 'If I desire that He stay until I come, what is that to you? You follow me.' + RDQ, 'Jesus said to him, ' + LDQ + 'If I desire that he stay until I come, what is that to you? You follow me.' + RDQ],
  ['John', 'John 21', 'Yet Jesus didn' + APOS + 't say to Him that He wouldn' + APOS + 't die, but, ' + LDQ + 'If I desire that He stay until I come, what is that to you?' + RDQ, 'Yet Jesus didn' + APOS + 't say to him that he wouldn' + APOS + 't die, but, ' + LDQ + 'If I desire that he stay until I come, what is that to you?' + RDQ],
];

/** Fixes after programmatic pass (humans / over-corrections) */
const POST_PROGRAMMATIC_REPLACEMENTS = [
  ['John', 'John 3', 'Jesus answered Him, ' + LDQ + 'Most certainly I tell you, unless one is born anew,  He can' + APOS + 't see God' + APOS + 's Kingdom.' + RDQ, 'Jesus answered him, ' + LDQ + 'Most certainly I tell you, unless one is born anew, he can' + APOS + 't see God' + APOS + 's Kingdom.' + RDQ],
  ['John', 'John 3', 'unless one is born of water and Spirit, He can' + APOS + 't enter into God' + APOS + 's Kingdom.', 'unless one is born of water and Spirit, he can' + APOS + 't enter into God' + APOS + 's Kingdom.'],
  ['John', 'John 4', 'For his disciples had gone away into the city to buy food.', 'For His disciples had gone away into the city to buy food.'],
  ['John', 'John 4', 'Just then, his disciples came. They marveled that he was speaking with a woman', 'Just then, His disciples came. They marveled that He was speaking with a woman'],
  ['John', 'John 9', '     [1] As he passed by, he saw a man blind from birth.  [2] his disciples asked him, ' + LDQ + 'Rabbi, who sinned', '     [1] As He passed by, He saw a man blind from birth.  [2] His disciples asked Him, ' + LDQ + 'Rabbi, who sinned'],
  ['John', 'John 11', '     [11] he said these things, and after that, he said to them, ' + LDQ + 'Our friend Lazarus has fallen asleep', '     [11] He said these things, and after that, He said to them, ' + LDQ + 'Our friend Lazarus has fallen asleep'],
  ['John', 'John 18', 'When He had said this, one of the officers standing by slapped Jesus with His hand, saying, ' + LDQ + 'Do you answer the high priest like that?' + RDQ, 'When He had said this, one of the officers standing by slapped Jesus with his hand, saying, ' + LDQ + 'Do you answer the high priest like that?' + RDQ],
  ['John', 'John 19', 'But Jesus gave Him no answer.', 'But Jesus gave him no answer.'],
];

function chapterNum(reference) {
  return parseInt(reference.split(' ')[1], 10);
}

function applyReplacementList(book, list, label, counters) {
  const missed = [];
  for (const [, chapterRef, from, to] of list) {
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
    counters[label]++;
  }
  return missed;
}

function main() {
  const data = JSON.parse(fs.readFileSync(NT_FILE, 'utf8'));
  const book = data.books.find((b) => b.name === 'John');
  if (!book) {
    console.error('John not found');
    process.exit(1);
  }

  const counters = { explicit: 0, programmatic: 0, postFix: 0 };
  const missed = [];

  missed.push(...applyReplacementList(book, REPLACEMENTS, 'explicit', counters));

  for (const chapter of book.chapters) {
    const n = chapterNum(chapter.reference);
    if (n >= 3 && n <= 21) {
      const before = chapter.content;
      chapter.content = applyProgrammaticRules(chapter.content, chapter.reference, VERSE_HE_EXCLUDE);
      if (chapter.content !== before) counters.programmatic++;
    }
  }

  missed.push(...applyReplacementList(book, POST_PROGRAMMATIC_REPLACEMENTS, 'postFix', counters));

  const total = counters.explicit + counters.programmatic + counters.postFix;
  console.log(
    `Applied John capitalization (${counters.explicit} explicit, ${counters.programmatic} programmatic chapter passes, ${counters.postFix} post-fix; ${total} total operations).`
  );
  if (missed.length) {
    console.warn(`Missed ${missed.length} replacements:`);
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
