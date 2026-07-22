/**
 * One-time follow-up fixes after apply-matthew-capitalization.js
 * Run: node scripts/fix-matthew-capitalization-followup.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const NT_FILE = path.join(__dirname, '..', 'data', 'new-testament-data.json');
const DRY_RUN = process.argv.includes('--dry-run');

/** @type {Array<[string, string, string]>} [chapterRef, from, to] */
const FIXES = [
  // Matthew 5 — Sermon intro
  ['Matthew 5', 'Seeing the multitudes, he went up onto the mountain.', 'Seeing the multitudes, He went up onto the mountain.'],

  // Matthew 15 — Pharisee tradition quote (human parent)
  ['Matthew 15', ' [6] He shall not honor his father or mother.', ' [6] he shall not honor his father or mother.'],

  // Matthew 16 — Peter
  ['Matthew 16', 'Jesus answered Him, “Blessed are you, Simon Bar Jonah', 'Jesus answered him, “Blessed are you, Simon Bar Jonah'],

  // Matthew 4, 8, 17, 18, 22, 26, 27 — Jesus addressing humans
  ['Matthew 4', 'Then Jesus said to Him, “Get behind me, Satan!', 'Then Jesus said to him, “Get behind me, Satan!'],
  ['Matthew 8', 'Jesus said to Him, “The foxes have holes', 'Jesus said to him, “The foxes have holes'],
  ['Matthew 8', 'But Jesus said to Him, “Follow me, and leave the dead', 'But Jesus said to him, “Follow me, and leave the dead'],
  ['Matthew 17', 'Jesus said to Him, “Therefore the children are exempt.', 'Jesus said to him, “Therefore the children are exempt.'],
  ['Matthew 18', 'Jesus said to Him, “I don’t tell you until seven times', 'Jesus said to him, “I don’t tell you until seven times'],
  ['Matthew 18', 'Jesus called a little child to Himself, and set Him in the middle of them', 'Jesus called a little child to Himself, and set him in the middle of them'],
  ['Matthew 22', 'Jesus said to Him, “‘You shall love the Lord your God', 'Jesus said to him, “‘You shall love the Lord your God'],
  ['Matthew 26', 'Jesus said to Him, “Most certainly I tell you that tonight', 'Jesus said to him, “Most certainly I tell you that tonight'],
  ['Matthew 26', 'Jesus said to Him, “Friend, why are you here?”', 'Jesus said to him, “Friend, why are you here?”'],
  ['Matthew 26', 'Then Jesus said to Him, “Put your sword back into its place', 'Then Jesus said to him, “Put your sword back into its place'],
  ['Matthew 26', 'Jesus said to Him, “You have said so. Nevertheless', 'Jesus said to him, “You have said so. Nevertheless'],
  ['Matthew 27', 'Jesus said to Him, “So you say.”', 'Jesus said to him, “So you say.”'],

  // Matthew 13 — Jesus introducing parables
  ['Matthew 13', ' [24] he set another parable before them, saying, “The Kingdom of Heaven is like a man who sowed good seed in his field,', ' [24] He set another parable before them, saying, “The Kingdom of Heaven is like a man who sowed good seed in his field,'],
  ['Matthew 13', ' [31] he set another parable before them, saying, “The Kingdom of Heaven is like a grain of mustard seed', ' [31] He set another parable before them, saying, “The Kingdom of Heaven is like a grain of mustard seed'],
  ['Matthew 13', ' [33] he spoke another parable to them. “The Kingdom of Heaven is like yeast', ' [33] He spoke another parable to them. “The Kingdom of Heaven is like yeast'],

  // Matthew 21 — triumphal entry
  ['Matthew 21', 'and brought the donkey and the colt and laid their clothes on them; and he sat on them.', 'and brought the donkey and the colt and laid their clothes on them; and He sat on them.'],

  // Matthew 26 — Gethsemane and arrest
  ['Matthew 26', ' [42] Again, a second time he went away and prayed, saying, “My Father, if this cup can’t pass away from me unless I drink it, your desire be done.”', ' [42] Again, a second time He went away and prayed, saying, “My Father, if this cup can’t pass away from me unless I drink it, your desire be done.”'],
  ['Matthew 26', ' [47] While he was still speaking, behold, Judas, one of the twelve, came,', ' [47] While He was still speaking, behold, Judas, one of the twelve, came,'],
  ['Matthew 26', 'one of those who were with Jesus stretched out His hand and drew His sword, and struck the servant of the high priest, and cut off His ear.', 'one of those who were with Jesus stretched out his hand and drew his sword, and struck the servant of the high priest, and cut off his ear.'],
  ['Matthew 26', 'Then all the disciples left him and fled.', 'Then all the disciples left Him and fled.'],
  ['Matthew 26', 'But Peter followed him from a distance to the court of the high priest,', 'But Peter followed Him from a distance to the court of the high priest,'],

  // Matthew 27 — trial and passion
  ['Matthew 27', ' [12] When he was accused by the chief priests and elders, he answered nothing.', ' [12] When He was accused by the chief priests and elders, He answered nothing.'],
  ['Matthew 27', 'They stripped him and put a scarlet robe on him.  [29] They braided a crown of thorns and put it on his head, and a reed in his right hand; and they kneeled down before him and mocked him, saying, “Hail, King of the Jews!”  [30] They spat on him, and took the reed and struck him on the head.  [31] When they had mocked him, they took the robe off him, and put His clothes on him, and led him away to crucify him.', 'They stripped Him and put a scarlet robe on Him.  [29] They braided a crown of thorns and put it on His head, and a reed in His right hand; and they kneeled down before Him and mocked Him, saying, “Hail, King of the Jews!”  [30] They spat on Him, and took the reed and struck Him on the head.  [31] When they had mocked Him, they took the robe off Him, and put His clothes on Him, and led Him away to crucify Him.'],
  ['Matthew 27', 'and they sat and watched him there.', 'and they sat and watched Him there.'],
  ['Matthew 27', 'Then there were two robbers crucified with him, one on his right hand and one on the left.', 'Then there were two robbers crucified with Him, one on His right hand and one on the left.'],
  ['Matthew 27', 'Those who passed by blasphemed him,', 'Those who passed by blasphemed Him,'],
  ['Matthew 27', ' [42] “he saved others, but he can’t save himself. If he is the King of Israel, let him come down from the cross now, and we will believe in him.', ' [42] “He saved others, but He can’t save Himself. If He is the King of Israel, let Him come down from the cross now, and we will believe in Him.'],
  ['Matthew 27', 'and coming out of the tombs after his resurrection, they entered into the holy city', 'and coming out of the tombs after His resurrection, they entered into the holy city'],
  ['Matthew 27', 'Now the centurion and those who were with Him watching Jesus,', 'Now the centurion and those who were with him watching Jesus,'],
  ['Matthew 27', 'a rich man from Arimathaea named Joseph, who Himself was also Jesus’ disciple, came.', 'a rich man from Arimathaea named Joseph, who himself was also Jesus’ disciple, came.'],
];

function main() {
  const data = JSON.parse(fs.readFileSync(NT_FILE, 'utf8'));
  const book = data.books.find((b) => b.name === 'Matthew');
  if (!book) {
    console.error('Matthew not found');
    process.exit(1);
  }

  let applied = 0;
  const missed = [];

  for (const [chapterRef, from, to] of FIXES) {
    const chapter = book.chapters.find((c) => c.reference === chapterRef);
    if (!chapter) {
      missed.push(`${chapterRef}: chapter not found`);
      continue;
    }
    if (!chapter.content.includes(from)) {
      missed.push(`${chapterRef}: ${from.slice(0, 60)}...`);
      continue;
    }
    chapter.content = chapter.content.replace(from, to);
    applied++;
  }

  console.log(`Applied ${applied} Matthew follow-up fixes.`);
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
