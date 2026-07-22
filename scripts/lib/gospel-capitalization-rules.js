/**
 * Shared programmatic rules for Gospel capitalization passes.
 */

const JESUS_VERBS =
  'said|went|came|took|looked|asked|answered|called|sent|entered|departed|healed|taught|spoke|saw|left|arose|walked|stood|sat|rose|returned|passed|began|continued|made|gave|received|held|led|followed|warned|rebuked|commanded|perceived|heard|allowed|stretched|touched|moved|sighed|summoned|cast|drove|prayed|cried|wept|ate|drank|fed|broke|blessed|strictly|immediately|was|had|could|would|did|must|will|shall|may|might|can|kept|remained|tried|wanted|needed|forbade|permitted|granted|ordered|directed|instructed|declared|proclaimed|preached|questioned|challenged|tested|refused|accepted|invited|welcomed|raised|lifted|brought|carried|fell|knelt|turned|reached|opened|closed|crossed|calmed|stilled|multiplied|satisfied|anointed|washed|clothed|bound|loosed|released|saved|delivered|judged|condemned|punished|praised|thanked|glorified|suffered|endured|submitted|yielded|obeyed|resisted|overcame|destroyed|struck|awoke|slept|rested|waited|stayed|dwelt|lived|died|breathed|shouted|showed|revealed|hid|approached|withdrew|retreated|advanced|hurried|rushed|paused|stopped|halted|started|resumed|repeated|insisted|finished|completed|fulfilled|set|put|placed|laid|confirmed|denied|acknowledged|confessed|repented|believed|trusted|hoped|feared|grieved|mourned|rejoiced|sang|worshiped|cursed|swore|vowed|promised|pledged|committed|consecrated|ordained|appointed|anointed|commissioned|empowered|strengthened|encouraged|comforted|helped|aided|assisted|served|ministered|worked|labored|struggled|fought|ran|sailed|swam|climbed|fell|slipped|stumbled|recovered|improved|failed|succeeded|obtained|offered|presented|delivered|handed|passed|communicated|announced|declared|stated|affirmed|confirmed|verified|testified|witnessed|disclosed|exposed|uncovered|discovered|found|located|recognized|realized|understood|comprehended|perceived|discerned|separated|divided|cut|broke|shattered|smashed|crushed|beat|hit|slapped|pushed|pulled|dragged|lifted|lowered|dropped|collapsed|hurried|slowed|continued|proceeded|retreated|withdrew|exited|arrived|reached|neared|rotated|spread|gathered|collected|assembled|retained|maintained|protected|defended|guarded|shielded|covered|prepared|served|tasted|devoured|consumed|swallowed|chewed|bit|sipped|fasted|refrained|avoided|shunned|rejected|declined|forbade|prohibited|paid|restored|replaced|exchanged|traded|negotiated|agreed|consented|complied|adhered|attached|fastened|secured|fixed|landed|disembarked|embarked|boarded|mounted|descended|ascended|wrote|read|quoted|mentioned|named|identified|greeted|saluted|hosted|entertained|nourished|preserved|grasped|gripped|seized|grabbed|snatched|caught|surrounded|enclosed|included|united|joined|combined|mixed|stirred|shook|mocked|ridiculed|taunted|insulted|provoked|angered|calmed|soothed|pacified|appeased|reconciled|renewed|revived|resurrected|awakened|aroused|motivated|inspired|influenced|persuaded|convinced|swayed|affected|impacted|changed|converted|transformed|reformed|regenerated|reborn|created|formed|shaped|built|constructed|arranged|organized|planned|devised|designed|detected|noticed|observed|spotted|gazed|stared|glanced|viewed|beheld|experienced|endured|bore|withstood|survived|perished|expired|groaned|screamed|yelled|beckoned|requested|begged|pleaded|supplicated|adored|revered|respected|esteemed|valued|cherished|treasured|enjoyed|admired|extolled|lauded|acclaimed|applauded|cheered|celebrated|magnified|exalted|elevated|promoted|advanced|upgraded|enhanced|favored|graced|dispatched|delegated|authorized|enabled|equipped|furnished|supplied|provided|bestowed|conferred|awarded|transferred|conveyed|transmitted|published|asserted|validated|authenticated|certified|guaranteed|assured|attested|corroborated|substantiated|proved|demonstrated|unveiled|unmasked|apprehended|distinguished|differentiated|severed|sliced|chopped|punched|kicked|hauled|sank|drowned|floated|sprinted|dashed|raced|lingered|proceeded|contacted|connected|linked|merged|blended|dictated|cited|referenced|acknowledged|lodged|accommodated|allocated|assigned|designated|specified|defined|described|narrated|recounted|reported|informed|notified|alerted|cautioned|advised|counseled|guided|steered|piloted|navigated|tracked|pursued|chased|fled|escaped|evaded|ducked|watched|observed|monitored|supervised|managed|administered|governed|ruled|reigned|controlled|dominated|subdued|conquered|defeated|vanquished|overthrew|toppled|uprooted|upended|overturned|reversed|undid|corrected|rectified|amended|revised|edited|modified|altered|adjusted|adapted|translated|interpreted|explained|clarified|illustrated|exemplified|modeled|patterned|copied|imitated|emulated|mirrored|reflected|echoed|reiterated|restated|summarized|concluded|terminated|wrapped|sealed|signed|marked|noted|recorded|accumulated|amassed|hoarded|stored|upheld|sustained|supported|fixed|healed|made|built|prepared|found|saw|endured|suffered|died|called|prayed|praised|sent|gave|showed|proclaimed|declared|promised|testified|returned|welcomed|received|held|seized|joined|stirred|mocked|restored|moved|changed|fed|served|refused|denied|climbed|wrote|named|invited|begged|worshiped|honored|loved|glorified|raised|blessed|anointed|presented|handed|found|understood|perceived|broke|struck|carried|fell|walked|stopped|waited|stayed|continued|left|entered|arrived|turned|gathered|kept|guarded|agreed|embarked|disembarked|descended|ascended|quoted|identified|greeted|hosted|entertained|fed|grasped|gripped|grabbed|caught|surrounded|united|combined|mixed|shook|ridiculed|taunted|insulted|provoked|angered|soothed|pacified|appeased|reconciled|renewed|revived|awakened|aroused|motivated|inspired|persuaded|convinced|swayed|touched|affected|impacted|converted|transformed|reformed|regenerated|reborn|revived|restored|created|formed|shaped|constructed|assembled|arranged|organized|planned|devised|designed|discovered|located|recognized|realized|comprehended|discerned|separated|divided|cut|shattered|smashed|crushed|beat|struck|hit|slapped|pushed|pulled|dragged|lowered|dropped|collapsed|sprinted|dashed|raced|lingered|proceeded|contacted|connected|linked|merged|blended|bolstered|reinforced|fortified|sheltered|harbored';

const POSSESSIVES = [
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
  ['\\bhis name\\b', 'His name'],
];

function applyProgrammaticRules(content, reference, verseHeExclude = new Set()) {
  let text = content;

  text = text.replace(/(\[\d+\])\s+he\b/g, (match, tag) => {
    const key = `${reference}|${tag}`;
    if (verseHeExclude.has(key)) return match;
    return `${tag} He`;
  });

  text = text.replace(new RegExp(`(\\. )he (${JESUS_VERBS})\\b`, 'g'), '$1He $2');
  text = text.replace(new RegExp(`(\\n    )he (${JESUS_VERBS})\\b`, 'g'), '$1He $2');

  for (const [from, to] of POSSESSIVES) {
    text = text.replace(new RegExp(from, 'g'), to);
  }

  return text;
}

module.exports = { JESUS_VERBS, POSSESSIVES, applyProgrammaticRules };
