/**
 * Contextual capitalization: 2 Corinthians through Philemon.
 * Run: node scripts/apply-pauline-epistles-capitalization.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const NT_FILE = path.join(__dirname, '..', 'data', 'new-testament-data.json');
const DRY_RUN = process.argv.includes('--dry-run');
const APOS = '\u2019';

/** @type {Array<[string, string, string, string]>} [book, chapterRef, from, to] */
const REPLACEMENTS = [
  // 2 Corinthians
  ['2 Corinthians', '2 Corinthians 1', 'on whom we have set our hope that he will also still deliver us', 'on whom we have set our hope that He will also still deliver us'],
  ['2 Corinthians', '2 Corinthians 5', 'to be well pleasing to him.', 'to be well pleasing to Him.'],
  ['2 Corinthians', '2 Corinthians 5', 'he died for all, that those who live should no longer live to themselves, but to him who for their sakes died and rose again.', 'He died for all, that those who live should no longer live to themselves, but to Him who for their sakes died and rose again.'],
  ['2 Corinthians', '2 Corinthians 5', 'Therefore if anyone is in Christ, He is a new creation.', 'Therefore if anyone is in Christ, he is a new creation.'],
  ['2 Corinthians', '2 Corinthians 5', 'that each one may receive the things in the body according to what He has done, whether good or bad.', 'that each one may receive the things in the body according to what he has done, whether good or bad.'],
  ['2 Corinthians', '2 Corinthians 6', 'For he says,', 'For He says,'],
  ['2 Corinthians', '2 Corinthians 7', 'His cause that did the wrong, nor for His cause that suffered the wrong', 'his cause that did the wrong, nor for his cause that suffered the wrong'],
  ['2 Corinthians', '2 Corinthians 8', 'but He was also appointed by the assemblies to travel with us', 'but he was also appointed by the assemblies to travel with us'],
  ['2 Corinthians', '2 Corinthians 8', 'As for Titus, He is my partner and fellow worker for you.', 'As for Titus, he is my partner and fellow worker for you.'],
  ['2 Corinthians', '2 Corinthians 9', `Let each man give according as He has determined in His heart`, `Let each man give according as he has determined in his heart`],
  ['2 Corinthians', '2 Corinthians 9', `Now may he who supplies seed to the sower`, `Now may He who supplies seed to the sower`],
  ['2 Corinthians', '2 Corinthians 10', 'If anyone trusts in Himself that He is Christ' + APOS + 's, let Him consider this again with Himself, that even as He is Christ' + APOS + 's', 'If anyone trusts in himself that he is Christ' + APOS + 's, let him consider this again with himself, that even as he is Christ' + APOS + 's'],
  ['2 Corinthians', '2 Corinthians 10', '\u201cHe who boasts, let Him boast in the Lord.\u201d', '\u201cHe who boasts, let him boast in the Lord.\u201d'],
  ['2 Corinthians', '2 Corinthians 10', 'For it isn' + APOS + 't He who commends Himself who is approved', 'For it isn' + APOS + 't he who commends himself who is approved'],
  ['2 Corinthians', '2 Corinthians 11', 'as the serpent deceived Eve in His craftiness', 'as the serpent deceived Eve in his craftiness'],
  ['2 Corinthians', '2 Corinthians 11', 'For if He who comes preaches another Jesus', 'For if he who comes preaches another Jesus'],

  // Galatians
  ['Galatians', 'Galatians 1', 'to reveal his Son in me, that I might preach him among the Gentiles', 'to reveal His Son in me, that I might preach Him among the Gentiles'],
  ['Galatians', 'Galatians 2', 'for he who worked through Peter in the apostleship with the circumcised also worked through me with the Gentiles', 'for He who worked through Peter in the apostleship with the circumcised also worked through me with the Gentiles'],
  ['Galatians', 'Galatians 3', 'he therefore who supplies the Spirit to you and does miracles among you, does he do it', 'He therefore who supplies the Spirit to you and does miracles among you, does He do it'],
  ['Galatians', 'Galatians 3', '\u201cbelieved God, and it was counted to Him for righteousness.\u201d', '\u201cbelieved God, and it was counted to him for righteousness.\u201d'],
  ['Galatians', 'Galatians 3', 'Now the promises were spoken to Abraham and to His offspring.', 'Now the promises were spoken to Abraham and to his offspring.'],
  ['Galatians', 'Galatians 4', 'that he might redeem those who were under the law', 'that He might redeem those who were under the law'],
  ['Galatians', 'Galatians 5', 'This persuasion is not from him who calls you.', 'This persuasion is not from Him who calls you.'],
  ['Galatians', 'Galatians 5', 'But He who troubles you will bear His judgment, whoever He is.', 'But he who troubles you will bear his judgment, whoever he is.'],
  ['Galatians', 'Galatians 6', 'for whatever a man sows, that He will also reap.', 'for whatever a man sows, that he will also reap.'],

  // Ephesians 1 — God/Christ pronouns in blessing passage
  ['Ephesians', 'Ephesians 1', 'even as he chose us in him before the foundation of the world, that we would be holy and without defect before him in love', 'even as He chose us in Him before the foundation of the world, that we would be holy and without defect before Him in love'],
  ['Ephesians', 'Ephesians 1', 'to the praise of the glory of his grace, by which he freely gave us favor in the Beloved.', 'to the praise of the glory of His grace, by which He freely gave us favor in the Beloved.'],
  ['Ephesians', 'Ephesians 1', 'In him we have our redemption through his blood, the forgiveness of our trespasses, according to the riches of his grace  [8] which he made to abound toward us in all wisdom and prudence,  [9] making known to us the mystery of his will, according to his good pleasure which he purposed in him', 'In Him we have our redemption through His blood, the forgiveness of our trespasses, according to the riches of His grace  [8] which He made to abound toward us in all wisdom and prudence,  [9] making known to us the mystery of His will, according to His good pleasure which He purposed in Him'],
  ['Ephesians', 'Ephesians 1', 'We were also assigned an inheritance in him, having been foreordained according to the purpose of him who does all things after the counsel of his will', 'We were also assigned an inheritance in Him, having been foreordained according to the purpose of Him who does all things after the counsel of His will'],
  ['Ephesians', 'Ephesians 1', 'that you may know what is the hope of his calling, and what are the riches of the glory of his inheritance in the saints,  [19] and what is the exceeding greatness of his power toward us who believe, according to that working of the strength of his might', 'that you may know what is the hope of His calling, and what are the riches of the glory of His inheritance in the saints,  [19] and what is the exceeding greatness of His power toward us who believe, according to that working of the strength of His might'],
  ['Ephesians', 'Ephesians 1', 'he put all things in subjection under his feet, and gave him to be head over all things for the assembly,  [23] which is his body, the fullness of him who fills all in all.', 'He put all things in subjection under His feet, and gave Him to be head over all things for the assembly,  [23] which is His body, the fullness of Him who fills all in all.'],

  // Ephesians 2
  ['Ephesians', 'Ephesians 2', 'For he is our peace, who made both one, and broke down the middle wall of separation,  [15] having abolished in his flesh the hostility', 'For He is our peace, who made both one, and broke down the middle wall of separation,  [15] having abolished in His flesh the hostility'],
  ['Ephesians', 'Ephesians 2', 'that he might create in himself one new man of the two, making peace,  [16] and might reconcile them both in one body to God through the cross, having killed the hostility through it.  [17] he came and preached peace to you who were far off and to those who were near.  [18] For through him we both have our access in one Spirit to the Father.', 'that He might create in Himself one new man of the two, making peace,  [16] and might reconcile them both in one body to God through the cross, having killed the hostility through it.  [17] He came and preached peace to you who were far off and to those who were near.  [18] For through Him we both have our access in one Spirit to the Father.'],

  // Ephesians 3–4
  ['Ephesians', 'Ephesians 3', 'as it has now been revealed to his holy apostles and prophets in the Spirit', 'as it has now been revealed to His holy apostles and prophets in the Spirit'],
  ['Ephesians', 'Ephesians 3', 'In him we have boldness and access in confidence through our faith in him.', 'In Him we have boldness and access in confidence through our faith in Him.'],
  ['Ephesians', 'Ephesians 3', 'that he would grant you, according to the riches of his glory, that you may be strengthened with power through his Spirit in the inner person', 'that He would grant you, according to the riches of His glory, that you may be strengthened with power through His Spirit in the inner person'],
  ['Ephesians', 'Ephesians 4', '\u201cWhen he ascended on high,\n    he led captivity captive,\n    and gave gifts to people.\u201d', '\u201cWhen He ascended on high,\n    He led captivity captive,\n    and gave gifts to people.\u201d'],
  ['Ephesians', 'Ephesians 4', '\u201che ascended\u201d, what is it but that he also first descended into the lower parts of the earth?  [10] he who descended is the one who also ascended far above all the heavens, that he might fill all things.\n     [11] he gave some to be apostles', '\u201cHe ascended\u201d, what is it but that He also first descended into the lower parts of the earth?  [10] He who descended is the one who also ascended far above all the heavens, that He might fill all things.\n     [11] He gave some to be apostles'],

  // Ephesians 5
  ['Ephesians', 'Ephesians 5', 'that he might sanctify her, having cleansed her by the washing of water with the word,  [27] that he might present the assembly to himself gloriously', 'that He might sanctify her, having cleansed her by the washing of water with the word,  [27] that He might present the assembly to Himself gloriously'],
  ['Ephesians', 'Ephesians 5', 'For no man ever hated His own flesh, but nourishes and cherishes it, even as the Lord also does the assembly,  [30] because we are members of his body, of his flesh and bones.', 'For no man ever hated his own flesh, but nourishes and cherishes it, even as the Lord also does the assembly,  [30] because we are members of His body, of His flesh and bones.'],

  // Ephesians 6
  ['Ephesians', 'Ephesians 6', 'knowing that whatever good thing each one does, He will receive the same good again from the Lord, whether He is bound or free.', 'knowing that whatever good thing each one does, he will receive the same good again from the Lord, whether he is bound or free.'],

  // Philippians
  ['Philippians', 'Philippians 2', 'but emptied himself, taking the form of a servant, being made in the likeness of men.  [8] And being found in human form, he humbled himself, becoming obedient to the point of death', 'but emptied Himself, taking the form of a servant, being made in the likeness of men.  [8] And being found in human form, He humbled Himself, becoming obedient to the point of death'],
  ['Philippians', 'Philippians 2', 'For indeed He was sick nearly to death, but God had mercy on Him, and not on Him only, but on me also', 'For indeed he was sick nearly to death, but God had mercy on him, and not on him only, but on me also'],
  ['Philippians', 'Philippians 2', 'Receive Him therefore in the Lord with all joy', 'Receive him therefore in the Lord with all joy'],
  ['Philippians', 'Philippians 2', 'because for the work of Christ He came near to death, risking His life to supply that which was lacking in your service toward me.', 'because for the work of Christ he came near to death, risking his life to supply that which was lacking in your service toward me.'],
  ['Philippians', 'Philippians 3', 'that I may know him and the power of his resurrection, and the fellowship of his sufferings, becoming conformed to his death', 'that I may know Him and the power of His resurrection, and the fellowship of His sufferings, becoming conformed to His death'],
  ['Philippians', 'Philippians 3', 'who will change the body of our humiliation to be conformed to the body of his glory, according to the working by which he is able even to subject all things to himself.', 'who will change the body of our humiliation to be conformed to the body of His glory, according to the working by which He is able even to subject all things to Himself.'],

  // Colossians 1 — Christ hymn
  ['Colossians', 'Colossians 1', 'For by him all things were created in the heavens and on the earth, visible things and invisible things, whether thrones or dominions or principalities or powers. All things have been created through him and for him.  [17] he is before all things, and in him all things are held together.  [18] he is the head of the body, the assembly, who is the beginning, the firstborn from the dead, that in all things he might have the preeminence.  [19] For all the fullness was pleased to dwell in him,  [20] and through him to reconcile all things to himself by him', 'For by Him all things were created in the heavens and on the earth, visible things and invisible things, whether thrones or dominions or principalities or powers. All things have been created through Him and for Him.  [17] He is before all things, and in Him all things are held together.  [18] He is the head of the body, the assembly, who is the beginning, the firstborn from the dead, that in all things He might have the preeminence.  [19] For all the fullness was pleased to dwell in Him,  [20] and through Him to reconcile all things to Himself by Him'],
  ['Colossians', 'Colossians 1', 'yet now he has reconciled in the body of his flesh through death, to present you holy and without defect and blameless before him', 'yet now He has reconciled in the body of His flesh through death, to present you holy and without defect and blameless before Him'],
  ['Colossians', 'Colossians 2', 'His philosophy and vain deceit', 'his philosophy and vain deceit'],
  ['Colossians', 'Colossians 2', 'he made you alive together with him, having forgiven us all our trespasses,  [14] wiping out the handwriting in ordinances which was against us. he has taken it out of the way, nailing it to the cross.  [15] Having stripped the principalities and the powers, he made a show of them openly', 'He made you alive together with Him, having forgiven us all our trespasses,  [14] wiping out the handwriting in ordinances which was against us. He has taken it out of the way, nailing it to the cross.  [15] Having stripped the principalities and the powers, He made a show of them openly'],

  // 1 Thessalonians
  ['1 Thessalonians', '1 Thessalonians 5', 'who died for us, that, whether we wake or sleep, we should live together with him.', 'who died for us, that, whether we wake or sleep, we should live together with Him.'],
  ['1 Thessalonians', '1 Thessalonians 5', 'he who calls you is faithful, who will also do it.', 'He who calls you is faithful, who will also do it.'],

  // 2 Thessalonians
  ['2 Thessalonians', '2 Thessalonians 1', 'when he comes in that day to be glorified in his saints and to be admired among all those who have believed', 'when He comes in that day to be glorified in His saints and to be admired among all those who have believed'],
  ['2 Thessalonians', '2 Thessalonians 2', 'He opposes and exalts Himself against all that is called God or that is worshiped, so that He sits as God in the temple of God, setting Himself up as God.', 'He opposes and exalts himself against all that is called God or that is worshiped, so that he sits as God in the temple of God, setting himself up as God.'],

  // 1 Timothy
  ['1 Timothy', '1 Timothy 2', 'who gave himself as a ransom for all', 'who gave Himself as a ransom for all'],
  ['1 Timothy', '1 Timothy 3', 'for how could someone who doesn' + APOS + 't know how to rule His own house take care of God' + APOS + 's assembly?', 'for how could someone who doesn' + APOS + 't know how to rule his own house take care of God' + APOS + 's assembly?'],
  ['1 Timothy', '1 Timothy 6', 'which at the right time he will show, who is the blessed and only Ruler, the King of kings and Lord of lords.  [16] he alone has immortality', 'which at the right time He will show, who is the blessed and only Ruler, the King of kings and Lord of lords.  [16] He alone has immortality'],

  // 2 Timothy
  ['2 Timothy', '2 Timothy 1', 'for I know him whom I have believed, and I am persuaded that he is able to guard that which I have committed to him against that day.', 'for I know Him whom I have believed, and I am persuaded that He is able to guard that which I have committed to Him against that day.'],
  ['2 Timothy', '2 Timothy 1', 'May the Lord grant mercy to the house of Onesiphorus, for He often refreshed me', 'May the Lord grant mercy to the house of Onesiphorus, for he often refreshed me'],
  ['2 Timothy', '2 Timothy 1', '(the Lord grant to Him to find the Lord' + APOS + 's mercy in that day); and in how many things He served at Ephesus', '(the Lord grant to him to find the Lord' + APOS + 's mercy in that day); and in how many things he served at Ephesus'],
  ['2 Timothy', '2 Timothy 2', 'For if we died with him,\n    we will also live with him.', 'For if we died with Him,\n    we will also live with Him.'],
  ['2 Timothy', '2 Timothy 2', 'If we deny him,\n    he also will deny us.', 'If we deny Him,\n    He also will deny us.'],
  ['2 Timothy', '2 Timothy 2', 'If we are faithless,\n    he remains faithful;\n    for he can' + APOS + 't deny himself.\u201d', 'If we are faithless,\n    He remains faithful;\n    for He can' + APOS + 't deny Himself.\u201d'],
  ['2 Timothy', '2 Timothy 2', 'in gentleness correcting those who oppose Him.', 'in gentleness correcting those who oppose him.'],
  ['2 Timothy', '2 Timothy 4', 'The Lord will repay Him according to His deeds.', 'The Lord will repay him according to his deeds.'],

  // Titus
  ['Titus', 'Titus 2', 'who gave himself for us, that he might redeem us from all iniquity and purify for himself a people for his own possession', 'who gave Himself for us, that He might redeem us from all iniquity and purify for Himself a people for His own possession'],
  ['Titus', 'Titus 3', 'that being justified by his grace, we might be made heirs according to the hope of eternal life.', 'that being justified by His grace, we might be made heirs according to the hope of eternal life.'],
];

function main() {
  const data = JSON.parse(fs.readFileSync(NT_FILE, 'utf8'));
  let applied = 0;
  const missed = [];

  for (const [bookName, chapterRef, from, to] of REPLACEMENTS) {
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

  console.log(`Applied ${applied} replacements across Pauline epistles.`);
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
