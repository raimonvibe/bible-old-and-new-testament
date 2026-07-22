/**
 * Contextual capitalization: Hebrews through Jude.
 * Run: node scripts/apply-general-epistles-capitalization.js [--dry-run]
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
  // Hebrews 1 — Son/Father discourse
  ['Hebrews', 'Hebrews 1', 'spoken to us by his Son, whom he appointed heir of all things, through whom also he made the worlds.  [3] his Son is the radiance of his glory, the very image of his substance, and upholding all things by the word of his power, who, when he had by himself purified us of our sins', 'spoken to us by His Son, whom He appointed heir of all things, through whom also He made the worlds.  [3] His Son is the radiance of His glory, the very image of His substance, and upholding all things by the word of His power, who, when He had by Himself purified us of our sins'],
  ['Hebrews', 'Hebrews 1', 'the more excellent name he has inherited is better than theirs.  [5] For to which of the angels did he say', 'the more excellent name He has inherited is better than theirs.  [5] For to which of the angels did He say'],
  ['Hebrews', 'Hebrews 1', `${LDQ}I will be to him a Father,\n    and he will be to me a Son?${RDQ}`, `${LDQ}I will be to him a Father,\n    and He will be to me a Son?${RDQ}`],
  ['Hebrews', 'Hebrews 1', 'Of the angels he says,\n  ' + LDQ + 'he makes his angels winds,\n    and his servants a flame of fire.' + RDQ, 'Of the angels He says,\n  ' + LDQ + 'He makes His angels winds,\n    and His servants a flame of fire.' + RDQ],
  ['Hebrews', 'Hebrews 1', 'But which of the angels has he told at any time,', 'But which of the angels has He told at any time,'],

  // Hebrews 2
  ['Hebrews', 'Hebrews 2', 'For he didn' + APOS + 't subject the world to come', 'For He didn' + APOS + 't subject the world to come'],
  ['Hebrews', 'Hebrews 2', 'For in that he subjected all things to him, he left nothing that is not subject to him.', 'For in that He subjected all things to him, He left nothing that is not subject to him.'],

  // Hebrews 3
  ['Hebrews', 'Hebrews 3', 'who was faithful to him who appointed him, as also Moses was in all his house.  [3] For he has been counted worthy of more glory than Moses, because he who built the house has more honor than the house.', 'who was faithful to Him who appointed Him, as also Moses was in all his house.  [3] For He has been counted worthy of more glory than Moses, because He who built the house has more honor than the house.'],
  ['Hebrews', 'Hebrews 3', `${LDQ}Today if you will hear his voice,\n    don${APOS}t harden your hearts, as in the rebellion.${RDQ}`, `${LDQ}Today if you will hear His voice,\n    don${APOS}t harden your hearts, as in the rebellion.${RDQ}`],
  ['Hebrews', 'Hebrews 3', 'With whom was he displeased forty years?', 'With whom was He displeased forty years?'],
  ['Hebrews', 'Hebrews 3', 'To whom did he swear that they wouldn' + APOS + 't enter into his rest', 'To whom did He swear that they wouldn' + APOS + 't enter into His rest'],

  // Hebrews 4
  ['Hebrews', 'Hebrews 4', 'should seem to have come short of a promise of entering into his rest.', 'should seem to have come short of a promise of entering into His rest.'],
  ['Hebrews', 'Hebrews 4', 'even as he has said, ' + LDQ + 'As I swore in my wrath', 'even as He has said, ' + LDQ + 'As I swore in my wrath'],
  ['Hebrews', 'Hebrews 4', 'he again defines a certain day, ' + LDQ + 'today' + RDQ, 'He again defines a certain day, ' + LDQ + 'today' + RDQ],
  ['Hebrews', 'Hebrews 4', `${LDQ}Today if you will hear his voice,\n    don${APOS}t harden your hearts.${RDQ}`, `${LDQ}Today if you will hear His voice,\n    don${APOS}t harden your hearts.${RDQ}`],
  ['Hebrews', 'Hebrews 4', 'if Joshua had given them rest, he would not have spoken afterward of another day.', 'if Joshua had given them rest, He would not have spoken afterward of another day.'],
  ['Hebrews', 'Hebrews 4', 'For he who has entered into his rest has himself also rested from his works, as God did from his.', 'For he who has entered into His rest has himself also rested from his works, as God did from His.'],

  // Hebrews 5 — Christ as high priest
  ['Hebrews', 'Hebrews 5', 'As he says also in another place,', 'As He says also in another place,'],
  ['Hebrews', 'Hebrews 5', 'he, in the days of his flesh, having offered up prayers and petitions with strong crying and tears to him who was able to save him from death, and having been heard for his godly fear,  [8] though he was a Son, yet learned obedience by the things which he suffered.  [9] Having been made perfect, he became to all of those who obey him the author of eternal salvation', 'He, in the days of His flesh, having offered up prayers and petitions with strong crying and tears to Him who was able to save Him from death, and having been heard for His godly fear,  [8] though He was a Son, yet learned obedience by the things which He suffered.  [9] Having been made perfect, He became to all of those who obey Him the author of eternal salvation'],
  ['Hebrews', 'Hebrews 5', 'About him we have many words to say', 'About Him we have many words to say'],

  // Hebrews 6
  ['Hebrews', 'Hebrews 6', 'and put him to open shame.', 'and put Him to open shame.'],

  // Hebrews 7 — Abraham human
  ['Hebrews', 'Hebrews 7', 'who met Abraham returning from the slaughter of the kings and blessed Him,', 'who met Abraham returning from the slaughter of the kings and blessed him,'],

  // Hebrews 8
  ['Hebrews', 'Hebrews 8', 'For if he were on earth, he would not be a priest at all', 'For if He were on earth, He would not be a priest at all'],
  ['Hebrews', 'Hebrews 8', 'But now he has obtained a more excellent ministry, by as much as he is also the mediator of a better covenant', 'But now He has obtained a more excellent ministry, by as much as He is also the mediator of a better covenant'],
  ['Hebrews', 'Hebrews 8', 'In that he says, ' + LDQ + 'A new covenant' + RDQ + ', he has made the first obsolete.', 'In that He says, ' + LDQ + 'A new covenant' + RDQ + ', He has made the first obsolete.'],

  // Hebrews 10 — incarnation quote
  ['Hebrews', 'Hebrews 10', 'Therefore when he comes into the world, he says,', 'Therefore when He comes into the world, He says,'],
  ['Hebrews', 'Hebrews 10', 'then he has said, ' + LDQ + 'Behold, I have come to do your will.' + RDQ + ' he takes away the first, that he may establish the second', 'then He has said, ' + LDQ + 'Behold, I have come to do your will.' + RDQ + ' He takes away the first, that He may establish the second'],

  // Hebrews 12
  ['Hebrews', 'Hebrews 12', 'For consider him who has endured such contradiction of sinners against himself,', 'For consider Him who has endured such contradiction of sinners against Himself,'],

  // Hebrews 13
  ['Hebrews', 'Hebrews 13', 'Jesus Christ is the same yesterday, today, and forever.', 'Jesus Christ is the same yesterday, today, and forever.'],
  ['Hebrews', 'Hebrews 13', 'Now may the God of peace, who brought again from the dead the great shepherd of the sheep with the blood of an eternal covenant, our Lord Jesus,  [21] make you complete in every good work to do his will', 'Now may the God of peace, who brought again from the dead the great shepherd of the sheep with the blood of an eternal covenant, our Lord Jesus,  [21] make you complete in every good work to do His will'],
  ['Hebrews', 'Hebrews 13', 'working in you that which is well pleasing in his sight, through Jesus Christ', 'working in you that which is well pleasing in His sight, through Jesus Christ'],

  // James — mostly human; God already capitalized in ch 4
  ['James', 'James 1', 'For that man shouldn' + APOS + 't think that He will receive anything from the Lord.  [8] he is a double-minded man', 'For that man shouldn' + APOS + 't think that he will receive anything from the Lord.  [8] he is a double-minded man'],
  ['James', 'James 4', 'Whoever therefore wants to be a friend of the world makes Himself an enemy of God.', 'Whoever therefore wants to be a friend of the world makes himself an enemy of God.'],
  ['James', 'James 4', 'Resist the devil, and He will flee from you.', 'Resist the devil, and he will flee from you.'],

  // 1 Peter
  ['1 Peter', '1 Peter 1', 'In him, though now you don' + APOS + 't see him, yet believing', 'In Him, though now you don' + APOS + 't see Him, yet believing'],
  ['1 Peter', '1 Peter 1', 'but just as he who called you is holy', 'but just as He who called you is holy'],
  ['1 Peter', '1 Peter 1', 'If you call on him as Father, who without respect of persons judges', 'If you call on Him as Father, who without respect of persons judges'],
  ['1 Peter', '1 Peter 2', 'he who believes in him will not be disappointed.' + RDQ, 'he who believes in Him will not be disappointed.' + RDQ],
  ['1 Peter', '1 Peter 2', 'When he was cursed, he didn' + APOS + 't curse back. When he suffered, he didn' + APOS + 't threaten, but committed himself to him who judges righteously', 'When He was cursed, He didn' + APOS + 't curse back. When He suffered, He didn' + APOS + 't threaten, but committed Himself to Him who judges righteously'],
  ['1 Peter', '1 Peter 3', 'because Christ also suffered for sins once, the righteous for the unrighteous, that he might bring you to God', 'because Christ also suffered for sins once, the righteous for the unrighteous, that He might bring you to God'],

  // 2 Peter
  ['2 Peter', '2 Peter 1', 'seeing that his divine power has granted to us all things that pertain to life and godliness, through the knowledge of him who called us by his own glory and virtue,  [4] by which he has granted to us his precious and exceedingly great promises', 'seeing that His divine power has granted to us all things that pertain to life and godliness, through the knowledge of Him who called us by His own glory and virtue,  [4] by which He has granted to us His precious and exceedingly great promises'],
  ['2 Peter', '2 Peter 1', 'For we didn' + APOS + 't follow cunningly devised fables when we made known to you the power and coming of our Lord Jesus Christ, but we were eyewitnesses of His majesty.  [17] For He received from God the Father honor and glory', 'For we didn' + APOS + 't follow cunningly devised fables when we made known to you the power and coming of our Lord Jesus Christ, but we were eyewitnesses of His majesty.  [17] For He received from God the Father honor and glory'],
  ['2 Peter', '2 Peter 2', 'when he brought a flood on the world of the ungodly', 'when He brought a flood on the world of the ungodly'],

  // 1 John
  ['1 John', '1 John 1', 'If we confess our sins, he is faithful and righteous to forgive us the sins', 'If we confess our sins, He is faithful and righteous to forgive us the sins'],
  ['1 John', '1 John 1', 'we make him a liar, and his word is not in us.', 'we make Him a liar, and His word is not in us.'],
  ['1 John', '1 John 2', 'And he is the atoning sacrifice for our sins', 'And He is the atoning sacrifice for our sins'],
  ['1 John', '1 John 2', 'This is how we know that we know him: if we keep his commandments.  [4] One who says, ' + LDQ + 'I know him,' + RDQ + ' and doesn' + APOS + 't keep his commandments, is a liar, and the truth isn' + APOS + 't in him.', 'This is how we know that we know Him: if we keep His commandments.  [4] One who says, ' + LDQ + 'I know Him,' + RDQ + ' and doesn' + APOS + 't keep His commandments, is a liar, and the truth isn' + APOS + 't in him.'],
  ['1 John', '1 John 2', 'he who says he remains in him ought himself also to walk just like he walked.', 'he who says he remains in Him ought himself also to walk just like He walked.'],
  ['1 John', '1 John 3', 'Behold, what manner of love the Father has given to us, that we should be called children of God! For this cause the world doesn' + APOS + 't know us, because it didn' + APOS + 't know him.', 'Behold, what manner of love the Father has given to us, that we should be called children of God! For this cause the world doesn' + APOS + 't know us, because it didn' + APOS + 't know Him.'],
  ['1 John', '1 John 3', 'he who keeps his commandments remains in him, and he in him. By this we know that he remains in us, by the Spirit which he gave us.', 'he who keeps His commandments remains in Him, and he in Him. By this we know that He remains in us, by the Spirit which He gave us.'],
  ['1 John', '1 John 4', 'No one has seen God at any time. If we love one another, God remains in us, and his love has been perfected in us.', 'No one has seen God at any time. If we love one another, God remains in us, and His love has been perfected in us.'],
  ['1 John', '1 John 5', 'This is the boldness which we have toward him, that if we ask anything according to his will, he listens to us.  [15] And if we know that he listens to us, whatever we ask, we know that we have the petitions which we have asked of him.', 'This is the boldness which we have toward Him, that if we ask anything according to His will, He listens to us.  [15] And if we know that He listens to us, whatever we ask, we know that we have the petitions which we have asked of Him.'],

  // 2 & 3 John
  ['2 John', '2 John 1', 'Grace, mercy, and peace will be with us, from God the Father and from the Lord Jesus Christ, the Son of the Father, in truth and love.', 'Grace, mercy, and peace will be with us, from God the Father and from the Lord Jesus Christ, the Son of the Father, in truth and love.'],
  ['2 John', '2 John 1', 'Whoever transgresses and doesn' + APOS + 't remain in the teaching of Christ, doesn' + APOS + 't have God. He who remains in the teaching, the same has both the Father and the Son.', 'Whoever transgresses and doesn' + APOS + 't remain in the teaching of Christ, doesn' + APOS + 't have God. He who remains in the teaching, the same has both the Father and the Son.'],
  ['3 John', '3 John 1', 'Beloved, you do a faithful work in whatever you do for the brothers and for strangers who have testified about your love before the assembly.  [7] For they went out for the sake of the Name, accepting nothing from the Gentiles.  [8] We therefore ought to receive such people, that we may be fellow workers for the truth.', 'Beloved, you do a faithful work in whatever you do for the brothers and for strangers who have testified about your love before the assembly.  [7] For they went out for the sake of the Name, accepting nothing from the Gentiles.  [8] We therefore ought to receive such people, that we may be fellow workers for the truth.'],

  // Jude
  ['Jude', 'Jude 1', 'Angels who didn' + APOS + 't keep their first domain, but deserted their own dwelling place, he has kept in everlasting bonds', 'Angels who didn' + APOS + 't keep their first domain, but deserted their own dwelling place, He has kept in everlasting bonds'],
  ['Jude', 'Jude 1', 'Now to him who is able to keep them from stumbling, and to present you faultless before the presence of his glory in great joy', 'Now to Him who is able to keep them from stumbling, and to present you faultless before the presence of His glory in great joy'],
];

function main() {
  const data = JSON.parse(fs.readFileSync(NT_FILE, 'utf8'));
  let applied = 0;
  const missed = [];

  for (const [bookName, chapterRef, from, to] of REPLACEMENTS) {
    if (from === to) continue;
    const book = data.books.find((b) => b.name === bookName);
    const chapter = book?.chapters.find((c) => c.reference === chapterRef);
    if (!chapter) {
      missed.push(`${bookName} ${chapterRef}: chapter not found`);
      continue;
    }
    if (!chapter.content.includes(from)) {
      missed.push(`${bookName} ${chapterRef}: ${from.slice(0, 50)}...`);
      continue;
    }
    chapter.content = chapter.content.replace(from, to);
    applied++;
  }

  console.log(`Applied ${applied} replacements across general epistles.`);
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
