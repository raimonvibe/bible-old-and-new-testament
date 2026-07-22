/**
 * Contextual capitalization: Gospel of Matthew.
 * Run: node scripts/apply-matthew-capitalization.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const NT_FILE = path.join(__dirname, '..', 'data', 'new-testament-data.json');
const DRY_RUN = process.argv.includes('--dry-run');
const APOS = '\u2019';
const LDQ = '\u201c';
const RDQ = '\u201d';

/** Verse tags where initial "he" is NOT Jesus */
const VERSE_HE_EXCLUDE = new Set([
  'Matthew 2|[8]', // Herod sent
  'Matthew 2|[14]', // Joseph fled
  'Matthew 2|[21]', // Joseph returned
  'Matthew 4|[9]', // devil spoke
  'Matthew 10|[37]', // he who loves father
  'Matthew 10|[38]', // he who does not take cross
  'Matthew 10|[39]', // he who finds his life
  'Matthew 10|[41]', // he who receives prophet
  'Matthew 11|[15]', // he who has ears
  'Matthew 12|[19]', // Isaiah servant quote
  'Matthew 12|[20]', // Isaiah quote continuation
  'Matthew 13|[9]', // he who has ears
  'Matthew 13|[24]', // parable: man sowed
  'Matthew 13|[31]', // parable: mustard
  'Matthew 13|[33]', // parable: yeast
  'Matthew 20|[3]', // landowner
  'Matthew 20|[4]', // landowner
  'Matthew 21|[29]', // parable son
  'Matthew 21|[30]', // parable son
  'Matthew 22|[20]', // Caesar coin
  'Matthew 25|[20]', // servant
  'Matthew 25|[33]', // king
  'Matthew 27|[5]', // Judas
]);

/** @type {Array<[string, string, string, string]>} */
const REPLACEMENTS = [
  // Matthew 2 — Herod/Joseph vs Christ
  ['Matthew', 'Matthew 2', 'Gathering together all the chief priests and scribes of the people, He asked them where the Christ would be born.', 'Gathering together all the chief priests and scribes of the people, he asked them where the Christ would be born.'],

  // Matthew 3 — John the Baptist
  ['Matthew', 'Matthew 3', 'For this is He who was spoken of by Isaiah the prophet, saying,', 'For this is he who was spoken of by Isaiah the prophet, saying,'],

  // Matthew 4 — temptation and calling
  ['Matthew', 'Matthew 4', 'When he had fasted forty days and forty nights, he was hungry afterward.', 'When He had fasted forty days and forty nights, He was hungry afterward.'],
  ['Matthew', 'Matthew 4', 'Then the devil took him into the holy city. he set him on the pinnacle of the temple,  [6] and said to Him,', 'Then the devil took Him into the holy city. he set Him on the pinnacle of the temple,  [6] and said to Him,'],
  ['Matthew', 'Matthew 4', 'Again, the devil took him to an exceedingly high mountain, and showed him all the kingdoms of the world and their glory.', 'Again, the devil took Him to an exceedingly high mountain, and showed Him all the kingdoms of the world and their glory.'],
  ['Matthew', 'Matthew 4', 'Jesus said to Him, “Again, it is written, ‘You shall not test the Lord, your God.’”', 'Jesus said to him, “Again, it is written, ‘You shall not test the Lord, your God.’”'],

  // Matthew 5 — Sermon on the Mount
  ['Matthew', 'Matthew 5', 'When he had sat down, his disciples came to him.  [2] he opened his mouth and taught them, saying,', 'When He had sat down, His disciples came to Him.  [2] He opened His mouth and taught them, saying,'],

  // Matthew 8 — leper and centurion
  ['Matthew', 'Matthew 8', 'When he came down from the mountain, great multitudes followed him.  [2] Behold, a leper came to him and worshiped him, saying, “Lord, if you want to, you can make me clean.”\n     [3] Jesus stretched out His hand and touched Him, saying, “I want to. Be made clean.” Immediately His leprosy was cleansed.  [4] Jesus said to Him, “See that you tell nobody; but go, show yourself to the priest, and offer the gift that Moses commanded, as a testimony to them.”\n     [5] When he came into Capernaum, a centurion came to him, asking him for help,  [6] saying, “Lord, my servant lies in the house paralyzed, grievously tormented.”\n     [7] Jesus said to Him, “I will come and heal Him.”', 'When He came down from the mountain, great multitudes followed Him.  [2] Behold, a leper came to Him and worshiped Him, saying, “Lord, if you want to, you can make me clean.”\n     [3] Jesus stretched out His hand and touched him, saying, “I want to. Be made clean.” Immediately his leprosy was cleansed.  [4] Jesus said to him, “See that you tell nobody; but go, show yourself to the priest, and offer the gift that Moses commanded, as a testimony to them.”\n     [5] When He came into Capernaum, a centurion came to Him, asking Him for help,  [6] saying, “Lord, my servant lies in the house paralyzed, grievously tormented.”\n     [7] Jesus said to him, “I will come and heal him.”'],

  // Matthew 9 — Matthew called; paralytic
  ['Matthew', 'Matthew 9', 'As Jesus passed by from there, He saw a man called Matthew sitting at the tax collection office. He said to Him, “Follow me.” He got up and followed Him.', 'As Jesus passed by from there, He saw a man called Matthew sitting at the tax collection office. He said to him, “Follow me.” He got up and followed Him.'],

  // Matthew 11 — John in prison
  ['Matthew', 'Matthew 11', 'Now when John heard in the prison the works of Christ, He sent two of His disciples  [3] and said to him, “Are you he who comes, or should we look for another?”', 'Now when John heard in the prison the works of Christ, he sent two of his disciples  [3] and said to him, “Are you He who comes, or should we look for another?”'],

  // Matthew 12 — David on Sabbath
  ['Matthew', 'Matthew 12', 'how He entered into God’s house and ate the show bread, which was not lawful for Him to eat, nor for those who were with Him, but only for the priests?', 'how he entered into God’s house and ate the show bread, which was not lawful for him to eat, nor for those who were with him, but only for the priests?'],

  // Matthew 15 — tradition quote (Pharisee corban rule)
  ['Matthew', 'Matthew 13', 'Great multitudes gathered to him, so that he entered into a boat and sat; and all the multitude stood on the beach.  [3] he spoke to them many things in parables, saying,', 'Great multitudes gathered to Him, so that He entered into a boat and sat; and all the multitude stood on the beach.  [3] He spoke to them many things in parables, saying,'],
  ['Matthew', 'Matthew 13', 'The disciples came, and said to him, “Why do you speak to them in parables?”\n     [11] he answered them, “To you it is given to know the mysteries of the Kingdom of Heaven, but it is not given to them.', 'The disciples came, and said to Him, “Why do you speak to them in parables?”\n     [11] He answered them, “To you it is given to know the mysteries of the Kingdom of Heaven, but it is not given to them.'],

  // Matthew 15 — tradition quote
  ['Matthew', 'Matthew 15', 'He shall not honor his father or mother.’ You have made the commandment of God void because of your tradition.', 'he shall not honor his father or mother.’ You have made the commandment of God void because of your tradition.'],

  // Matthew 16 — Peter’s confession
  ['Matthew', 'Matthew 16', 'Jesus answered him, “Blessed are you, Simon Bar Jonah, for flesh and blood has not revealed this to you, but my Father who is in heaven.   [18] I also tell you that you are Peter, and on this rock I will build my assembly, and the gates of Hades will not prevail against it.   [19] I will give to you the keys of the Kingdom of Heaven, and whatever you bind on earth will have been bound in heaven; and whatever you release on earth will have been released in heaven.”   [20] Then he commanded the disciples that they should tell no one that he was Jesus the Christ.', 'Jesus answered him, “Blessed are you, Simon Bar Jonah, for flesh and blood has not revealed this to you, but my Father who is in heaven.   [18] I also tell you that you are Peter, and on this rock I will build my assembly, and the gates of Hades will not prevail against it.   [19] I will give to you the keys of the Kingdom of Heaven, and whatever you bind on earth will have been bound in heaven; and whatever you release on earth will have been released in heaven.”   [20] Then He commanded the disciples that they should tell no one that He was Jesus the Christ.'],

  // Matthew 17 — transfiguration
  ['Matthew', 'Matthew 17', 'he was changed before them. his face shone like the sun, and his garments became as white as the light.  [3] Behold, Moses and Elijah appeared to them talking with him.', 'He was changed before them. His face shone like the sun, and His garments became as white as the light.  [3] Behold, Moses and Elijah appeared to them talking with Him.'],

  // Matthew 19 — rich young man
  ['Matthew', 'Matthew 19', 'Jesus said to Him, “Why do you ask me about what is good? There is only one who is good. But if you want to enter into life, keep the commandments.”', 'Jesus said to him, “Why do you ask me about what is good? There is only one who is good. But if you want to enter into life, keep the commandments.”'],
  ['Matthew', 'Matthew 19', 'Jesus said to Him, “If you want to be perfect, go, sell what you have, and give to the poor, and you will have treasure in heaven; and come, follow me.”', 'Jesus said to him, “If you want to be perfect, go, sell what you have, and give to the poor, and you will have treasure in heaven; and come, follow me.”'],

  // Matthew 26 — passion (selected)
  ['Matthew', 'Matthew 26', 'Now when Jesus was in Bethany, in the house of Simon the leper,  [7] a woman came to him having an alabaster jar of very expensive ointment, and she poured it on his head as he sat at the table.', 'Now when Jesus was in Bethany, in the house of Simon the leper,  [7] a woman came to Him having an alabaster jar of very expensive ointment, and she poured it on His head as He sat at the table.'],
  ['Matthew', 'Matthew 26', 'he took the cup, gave thanks, and gave to them, saying, “All of you drink it,', 'He took the cup, gave thanks, and gave to them, saying, “All of you drink it,'],
  ['Matthew', 'Matthew 26', 'Then he came to his disciples and found them sleeping, and said to Peter, “What, couldn’t you watch with me for one hour?   [41] Watch and pray, that you don’t enter into temptation. The spirit indeed is willing, but the flesh is weak.”\n     [42] Again, a second time he went away and prayed, saying, “My Father, if this cup can’t pass away from me unless I drink it, your desire be done.”   [43] he came and found them sleeping again, for their eyes were heavy.  [44] he left them again, departed, and went away and prayed a third time, saying the same words.', 'Then He came to His disciples and found them sleeping, and said to Peter, “What, couldn’t you watch with me for one hour?   [41] Watch and pray, that you don’t enter into temptation. The spirit indeed is willing, but the flesh is weak.”\n     [42] Again, a second time He went away and prayed, saying, “My Father, if this cup can’t pass away from me unless I drink it, your desire be done.”   [43] He came and found them sleeping again, for their eyes were heavy.  [44] He left them again, departed, and went away and prayed a third time, saying the same words.'],

  // Matthew 27 — crucifixion
  ['Matthew', 'Matthew 27', 'he gave him no answer, not even one word, so that the governor marveled greatly.', 'He gave him no answer, not even one word, so that the governor marveled greatly.'],
  ['Matthew', 'Matthew 27', 'The governor’s soldiers took Jesus into the Praetorium, and gathered the whole garrison against him.  [28] They stripped him and put a scarlet robe on him.  [29] They braided a crown of thorns and put it on his head, and a reed in his right hand; and they kneeled down before him and mocked him, saying, “Hail, King of the Jews!”  [30] They spat on him, and took the reed and struck him on the head.  [31] After they had mocked him, they took the robe off him, and put his clothes on him, and led him away to crucify him.', 'The governor’s soldiers took Jesus into the Praetorium, and gathered the whole garrison against Him.  [28] They stripped Him and put a scarlet robe on Him.  [29] They braided a crown of thorns and put it on His head, and a reed in His right hand; and they kneeled down before Him and mocked Him, saying, “Hail, King of the Jews!”  [30] They spat on Him, and took the reed and struck Him on the head.  [31] After they had mocked Him, they took the robe off Him, and put His clothes on Him, and led Him away to crucify Him.'],
  ['Matthew', 'Matthew 27', 'When they had crucified him, they divided his clothing among them, casting lots,', 'When they had crucified Him, they divided His clothing among them, casting lots,'],
  ['Matthew', 'Matthew 27', 'Likewise the chief priests also mocking with the scribes, the Pharisees, and the elders, said,  [42] “He saved others, but he can’t save himself.', 'Likewise the chief priests also mocking with the scribes, the Pharisees, and the elders, said,  [42] “He saved others, but He can’t save Himself.'],

  // Matthew 28 — resurrection
  ['Matthew', 'Matthew 28', 'As they went to tell his disciples, behold, Jesus met them, saying, “Rejoice!”\n    They came and took hold of his feet and worshiped him.\n     [10] Then Jesus said to them, “Don’t be afraid. Go tell my brothers that they may go into Galilee, and there they will see me.”', 'As they went to tell His disciples, behold, Jesus met them, saying, “Rejoice!”\n    They came and took hold of His feet and worshiped Him.\n     [10] Then Jesus said to them, “Don’t be afraid. Go tell my brothers that they may go into Galilee, and there they will see me.”'],
];

const JESUS_VERBS =
  'said|went|came|took|looked|asked|answered|called|sent|entered|departed|healed|taught|spoke|saw|left|arose|walked|stood|sat|rose|returned|passed|began|continued|made|gave|received|held|led|followed|warned|rebuked|commanded|perceived|heard|allowed|stretched|touched|moved|sighed|summoned|cast|drove|prayed|cried|wept|ate|drank|fed|broke|blessed|strictly|immediately|was|had|could|would|did|must|will|shall|may|might|can|kept|remained|tried|wanted|needed|forbade|permitted|granted|ordered|directed|instructed|declared|proclaimed|preached|questioned|challenged|tested|refused|accepted|invited|welcomed|raised|lifted|brought|carried|fell|knelt|turned|reached|opened|closed|crossed|calmed|stilled|multiplied|satisfied|anointed|washed|clothed|bound|loosed|released|saved|delivered|judged|condemned|punished|praised|thanked|glorified|suffered|endured|submitted|yielded|obeyed|resisted|overcame|destroyed|struck|awoke|slept|rested|waited|stayed|dwelt|lived|died|breathed|shouted|showed|revealed|hid|approached|withdrew|retreated|advanced|hurried|rushed|paused|stopped|halted|started|resumed|repeated|insisted|finished|completed|fulfilled|set|put|placed|laid|confirmed|denied|acknowledged|confessed|repented|believed|trusted|hoped|feared|grieved|mourned|rejoiced|sang|worshiped|cursed|swore|vowed|promised|pledged|committed|consecrated|ordained|appointed|anointed|commissioned|empowered|strengthened|encouraged|comforted|helped|aided|assisted|served|ministered|worked|labored|struggled|fought|ran|sailed|swam|climbed|fell|slipped|stumbled|recovered|improved|failed|succeeded|obtained|offered|presented|delivered|handed|passed|communicated|announced|declared|stated|affirmed|confirmed|verified|testified|witnessed|disclosed|exposed|uncovered|discovered|found|located|recognized|realized|understood|comprehended|perceived|discerned|separated|divided|cut|broke|shattered|smashed|crushed|beat|hit|slapped|pushed|pulled|dragged|lifted|lowered|dropped|collapsed|hurried|slowed|continued|proceeded|retreated|withdrew|exited|arrived|reached|neared|rotated|spread|gathered|collected|assembled|retained|maintained|protected|defended|guarded|shielded|covered|prepared|served|tasted|devoured|consumed|swallowed|chewed|bit|sipped|fasted|refrained|avoided|shunned|rejected|declined|forbade|prohibited|paid|restored|replaced|exchanged|traded|negotiated|agreed|consented|complied|adhered|attached|fastened|secured|fixed|landed|disembarked|embarked|boarded|mounted|descended|ascended|wrote|read|quoted|mentioned|named|identified|greeted|saluted|hosted|entertained|nourished|preserved|grasped|gripped|seized|grabbed|snatched|caught|surrounded|enclosed|included|united|joined|combined|mixed|stirred|shook|mocked|ridiculed|taunted|insulted|provoked|angered|calmed|soothed|pacified|appeased|reconciled|renewed|revived|resurrected|awakened|aroused|motivated|inspired|influenced|persuaded|convinced|swayed|affected|impacted|changed|converted|transformed|reformed|regenerated|reborn|created|formed|shaped|built|constructed|arranged|organized|planned|devised|designed|detected|noticed|observed|spotted|gazed|stared|glanced|viewed|beheld|experienced|endured|bore|withstood|survived|perished|expired|groaned|screamed|yelled|beckoned|requested|begged|pleaded|supplicated|adored|revered|respected|esteemed|valued|cherished|treasured|enjoyed|admired|extolled|lauded|acclaimed|applauded|cheered|celebrated|magnified|exalted|elevated|promoted|advanced|upgraded|enhanced|favored|graced|dispatched|delegated|authorized|enabled|equipped|furnished|supplied|provided|bestowed|conferred|awarded|transferred|conveyed|transmitted|published|asserted|validated|authenticated|certified|guaranteed|assured|attested|corroborated|substantiated|proved|demonstrated|unveiled|unmasked|apprehended|distinguished|differentiated|severed|sliced|chopped|punched|kicked|hauled|sank|drowned|floated|sprinted|dashed|raced|lingered|proceeded|contacted|connected|linked|merged|blended|winnowed|threshed|ground|milled|baked|cooked|savored|relished|ingested|gnawed|licked|gulped|quenched|hungered|starved|abstained|eschewed|disallowed|banned|outlawed|penalized|fined|taxed|charged|billed|invoiced|compensated|reimbursed|refunded|repaid|substituted|bartered|haggled|dealt|transacted|contracted|assented|acquiesced|conformed|clung|anchored|moored|docked|dismounted|scaled|dictated|cited|referenced|acknowledged|lodged|accommodated|irrigated|fertilized|planted|sowed|reaped|harvested|milled|quenched|thirsted|criminalized|bolstered|reinforced|fortified|sheltered|harbored|allocated|assigned|designated|specified|defined|described|narrated|recounted|reported|informed|notified|alerted|cautioned|advised|counseled|guided|steered|piloted|navigated|tracked|pursued|chased|fled|escaped|evaded|dodged|ducked|watched|observed|monitored|supervised|managed|administered|governed|ruled|reigned|controlled|dominated|subdued|conquered|defeated|vanquished|overthrew|toppled|uprooted|upended|overturned|reversed|undid|corrected|rectified|amended|revised|edited|modified|altered|adjusted|adapted|translated|interpreted|explained|clarified|illustrated|exemplified|modeled|patterned|copied|imitated|emulated|mirrored|reflected|echoed|reiterated|restated|summarized|concluded|terminated|wrapped|sealed|signed|marked|noted|recorded|allocated|accumulated|amassed|hoarded|stored|upheld|sustained|supported';

function applyProgrammaticRules(content, reference) {
  let text = content;

  text = text.replace(/(\[\d+\])\s+he\b/g, (match, tag) => {
    const key = `${reference}|${tag}`;
    if (VERSE_HE_EXCLUDE.has(key)) return match;
    return `${tag} He`;
  });

  text = text.replace(new RegExp(`(\\. )he (${JESUS_VERBS})\\b`, 'g'), '$1He $2');
  text = text.replace(new RegExp(`(\\n    )he (${JESUS_VERBS})\\b`, 'g'), '$1He $2');

  const possessives = [
    ['\\bhis disciples\\b', 'His disciples'],
    ['\\bhis teaching\\b', 'His teaching'],
    ['\\bhis spirit\\b', 'His spirit'],
    ['\\bhis words\\b', 'His words'],
    ['\\bhis cross\\b', 'His cross'],
    ['\\bhis life\\b', 'His life'],
    ['\\bhis blood\\b', 'His blood'],
    ['\\bhis body\\b', 'His body'],
    ['\\bhis hands\\b', 'His hands'],
    ['\\bhis clothes\\b', 'His clothes'],
    ['\\bhis garment\\b', 'His garment'],
    ['\\bhis garments\\b', 'His garments'],
    ['\\bhis own garments\\b', 'His own garments'],
    ['\\bhis boat\\b', 'His boat'],
    ['\\bhis hour\\b', 'His hour'],
    ['\\bhis works\\b', 'His works'],
    ['\\bhis miracles\\b', 'His miracles'],
    ['\\bhis parables\\b', 'His parables'],
  ];
  for (const [from, to] of possessives) {
    text = text.replace(new RegExp(from, 'g'), to);
  }

  return text;
}

function main() {
  const data = JSON.parse(fs.readFileSync(NT_FILE, 'utf8'));
  const book = data.books.find((b) => b.name === 'Matthew');
  if (!book) {
    console.error('Matthew not found');
    process.exit(1);
  }

  let applied = 0;
  const missed = [];

  for (const [, chapterRef, from, to] of REPLACEMENTS) {
    const chapter = book.chapters.find((c) => c.reference === chapterRef);
    if (!chapter) {
      missed.push(`${chapterRef}: chapter not found`);
      continue;
    }
    if (from === to) continue;
    if (!chapter.content.includes(from)) {
      missed.push(`${chapterRef}: ${from.slice(0, 50)}...`);
      continue;
    }
    chapter.content = chapter.content.replace(from, to);
    applied++;
  }

  for (const chapter of book.chapters) {
    const before = chapter.content;
    chapter.content = applyProgrammaticRules(chapter.content, chapter.reference);
    if (chapter.content !== before) applied++;
  }

  console.log(`Applied Matthew capitalization (${applied} explicit + programmatic passes).`);
  if (missed.length) {
    console.warn(`Missed ${missed.length} explicit replacements:`);
    missed.forEach((m) => console.warn(`  - ${m}`));
  }

  if (!DRY_RUN) {
    fs.writeFileSync(NT_FILE, JSON.stringify(data, null, 2) + '\n');
    console.log(`Updated ${NT_FILE}`);
  }
}

main();
