/**
 * Contextual capitalization pass for 1 Corinthians.
 * Run: node scripts/apply-1-corinthians-capitalization.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const NT_FILE = path.join(__dirname, '..', 'data', 'new-testament-data.json');
const BOOK = '1 Corinthians';
const DRY_RUN = process.argv.includes('--dry-run');

/** @type {Array<[string, string, string]>} */
const REPLACEMENTS = [
  // 1 Corinthians 1
  ['1 Corinthians 1', 'that in everything you were enriched in him, in all speech', 'that in everything you were enriched in Him, in all speech'],
  ['1 Corinthians 1', '“He who boasts, let Him boast in the Lord.”', '“He who boasts, let him boast in the Lord.”'],

  // 1 Corinthians 2
  ['1 Corinthians 2', 'except the spirit of the man which is in Him?', 'except the spirit of the man which is in him?'],
  ['1 Corinthians 2', 'for they are foolishness to Him; and He can\u2019t know them', 'for they are foolishness to him; and he can\u2019t know them'],

  // 1 Corinthians 3
  ['1 Corinthians 3', 'and each as the Lord gave to Him?', 'and each as the Lord gave to him?'],
  ['1 Corinthians 3', 'So then neither He who plants is anything, nor He who waters', 'So then neither he who plants is anything, nor he who waters'],
  ['1 Corinthians 3', 'But let each man be careful how He builds on it.', 'But let each man be careful how he builds on it.'],
  ['1 Corinthians 3', 'If anyone destroys God\u2019s temple, God will destroy Him;', 'If anyone destroys God\u2019s temple, God will destroy him;'],

  // 1 Corinthians 4
  ['1 Corinthians 4', 'Then each man will get His praise from God.', 'Then each man will get his praise from God.'],

  // 1 Corinthians 6
  ['1 Corinthians 6', 'But He who is joined to the Lord is one spirit.', 'But he who is joined to the Lord is one spirit.'],

  // 1 Corinthians 7
  ['1 Corinthians 7', 'each man has His own gift from God', 'each man has his own gift from God'],
  ['1 Corinthians 7', 'if any brother has an unbelieving wife, and she is content to live with Him, let Him not leave her.', 'if any brother has an unbelieving wife, and she is content to live with him, let him not leave her.'],
  ['1 Corinthians 7', 'as God has called each, so let Him walk.', 'as God has called each, so let him walk.'],
  ['1 Corinthians 7', 'For He who was called in the Lord being a bondservant is the Lord\u2019s free man. Likewise He who was called being free is Christ\u2019s bondservant.', 'For he who was called in the Lord being a bondservant is the Lord\u2019s free man. Likewise he who was called being free is Christ\u2019s bondservant.'],
  ['1 Corinthians 7', 'let each man, in whatever condition He was called, stay in that condition with God.', 'let each man, in whatever condition he was called, stay in that condition with God.'],
  ['1 Corinthians 7', 'He who is unmarried is concerned for the things of the Lord, how He may please the Lord;', 'He who is unmarried is concerned for the things of the Lord, how he may please the Lord;'],

  // 1 Corinthians 8
  ['1 Corinthians 8', 'And through your knowledge, He who is weak perishes, the brother for whose sake Christ died.', 'And through your knowledge, he who is weak perishes, the brother for whose sake Christ died.'],

  // 1 Corinthians 9
  ['1 Corinthians 9', 'or does he say it assuredly for our sake?', 'or does He say it assuredly for our sake?'],

  // 1 Corinthians 11
  ['1 Corinthians 11', 'For a man indeed ought not to have His head covered, because He is the image and glory of God', 'For a man indeed ought not to have his head covered, because he is the image and glory of God'],
  ['1 Corinthians 11', 'that the Lord Jesus on the night in which He was betrayed took bread.  [24] When he had given thanks, he broke it', 'that the Lord Jesus on the night in which He was betrayed took bread.  [24] When He had given thanks, He broke it'],
  ['1 Corinthians 11', 'In the same way he also took the cup after supper', 'In the same way He also took the cup after supper'],
  ['1 Corinthians 11', 'For He who eats and drinks in an unworthy way eats and drinks judgment to Himself if He doesn\u2019t discern the Lord\u2019s body.', 'For he who eats and drinks in an unworthy way eats and drinks judgment to himself if he doesn\u2019t discern the Lord\u2019s body.'],

  // 1 Corinthians 12
  ['1 Corinthians 12', 'distributing to each one separately as he desires.', 'distributing to each one separately as He desires.'],

  // 1 Corinthians 14
  ['1 Corinthians 14', 'For He who speaks in another language speaks not to men, but to God, for no one understands, but in the Spirit He speaks mysteries.', 'For he who speaks in another language speaks not to men, but to God, for no one understands, but in the Spirit he speaks mysteries.'],
  ['1 Corinthians 14', 'And thus the secrets of His heart are revealed. So He will fall down on His face and worship God', 'And thus the secrets of his heart are revealed. So he will fall down on his face and worship God'],
  ['1 Corinthians 14', 'let Him keep silent in the assembly, and let Him speak to Himself and to God.', 'let him keep silent in the assembly, and let him speak to himself and to God.'],
  ['1 Corinthians 14', 'If any man thinks Himself to be a prophet or spiritual, let Him recognize the things which I write to you', 'If any man thinks himself to be a prophet or spiritual, let him recognize the things which I write to you'],

  // 1 Corinthians 15
  ['1 Corinthians 15', 'that he was buried, that he was raised on the third day according to the Scriptures,  [5] and that he appeared to Cephas', 'that He was buried, that He was raised on the third day according to the Scriptures,  [5] and that He appeared to Cephas'],
  ['1 Corinthians 15', 'Then he appeared to over five hundred brothers', 'Then He appeared to over five hundred brothers'],
  ['1 Corinthians 15', 'Then he appeared to James, then to all the apostles,  [8] and last of all, as to the child born at the wrong time, he appeared to me also.', 'Then He appeared to James, then to all the apostles,  [8] and last of all, as to the child born at the wrong time, He appeared to me also.'],
  ['1 Corinthians 15', 'But each in His own order: Christ the first fruits, then those who are Christ\u2019s at His coming.', 'But each in his own order: Christ the first fruits, then those who are Christ\u2019s at His coming.'],
  ['1 Corinthians 15', 'For he must reign until he has put all his enemies under his feet.', 'For He must reign until He has put all His enemies under His feet.'],
  ['1 Corinthians 15', 'For, “he put all things in subjection under his feet.” But when he says, “All things are put in subjection”, it is evident that he is excepted who subjected all things to him.', 'For, “He put all things in subjection under His feet.” But when He says, “All things are put in subjection”, it is evident that He is excepted who subjected all things to Him.'],

  // 1 Corinthians 16
  ['1 Corinthians 16', 'Now if Timothy comes, see that He is with you without fear, for He does the work of the Lord', 'Now if Timothy comes, see that he is with you without fear, for he does the work of the Lord'],
  ['1 Corinthians 16', 'If any man doesn\u2019t love the Lord Jesus Christ, let Him be cursed.', 'If any man doesn\u2019t love the Lord Jesus Christ, let him be cursed.'],
];

function main() {
  const data = JSON.parse(fs.readFileSync(NT_FILE, 'utf8'));
  let applied = 0;
  const missed = [];

  for (const [chapterRef, from, to] of REPLACEMENTS) {
    const book = data.books.find((b) => b.name === BOOK);
    const chapter = book?.chapters.find((c) => c.reference === chapterRef);
    if (!chapter) {
      missed.push(`${chapterRef}: not found`);
      continue;
    }
    if (!chapter.content.includes(from)) {
      missed.push(`${chapterRef}: ${from.slice(0, 55)}...`);
      continue;
    }
    chapter.content = chapter.content.replace(from, to);
    applied++;
  }

  console.log(`Applied ${applied} replacements to ${BOOK}.`);
  if (missed.length) {
    console.warn('Missed:');
    missed.forEach((m) => console.warn(`  - ${m}`));
  }

  if (!DRY_RUN && applied > 0) {
    fs.writeFileSync(NT_FILE, JSON.stringify(data, null, 2) + '\n');
    console.log(`Updated ${NT_FILE}`);
  }
}

main();
