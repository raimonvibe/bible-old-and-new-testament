/**
 * Old Testament contextual divine pronoun rules.
 * Capitalize he/him/his/himself when referent is God (not humans, serpent, etc.).
 */

const DIVINE_NAME = /\b(God|Yahweh(?: God)?|the Lord)\b/;
const HUMAN_OR_CREATURE =
  /\b(Abram|Abraham|Noah|Moses|Aaron|Adam|Eve|the man|the woman|serpent|Pharaoh|Sarah|Isaac|Jacob|Esau|Lot|Cain|Abel|Seth|Enoch|Methuselah|Lamech|Ham|Shem|Japheth|Hagar|Ishmael|Rebekah|Laban|Joseph|Judah|Benjamin|Leah|Rachel|Dinah|Tamar|Potiphar|Pharaoh's|Midwife|servant girls|angel of Yahweh|Malak|Balaam|Joshua|Caleb|Miriam|Jethro|Zipporah|Gershom|Eliezer|Amalekite|Edomite|Canaanite|Hittite|Hivite|Perizzite|Girgashite|Amorite|Jebusite|Nimrod|Terah|Nahor|Haran|Lot's|Moab|Ben-Ammi|Esau's|Reuben|Simeon|Levi|Dan|Naphtali|Gad|Asher|Issachar|Zebulun|Manasseh|Ephraim| Saul|David|Jonathan|Saul's|Goliath|Samuel|Eli|Hannah|Peninnah|Delilah|Samson|Gideon|Deborah|Barak|Jephthah|Othniel|Ehud|Shamgar|Abimelech|Tola|Jair|Ibzan|Elon|Abdon|Jesse|Eliab|Abinadab|Shammah|Jonadab|Absalom|Amnon|Solomon|Rehoboam|Jeroboam|Ahab|Jezebel|Elijah|Elisha|Isaiah|Jeremiah|Ezekiel|Daniel|Nehemiah|Ezra|Esther|Mordecai|Haman|Cyrus|Darius|Artaxerxes|Xerxes|Vashti|Job|Eliphaz|Bildad|Zophar|Elihu|Jonah|Nineveh|Balak|Og|Sihon|Korah|Dathan|Abiram|Nadab|Abihu|Eleazar|Ithamar|Phinehas|Boaz|Ruth|Naomi|Orpah|Obed|Woman|women|wife|husband|brother|sister|son|daughter|child|children|boy|girl|king(?!dom)|queen|prince|princess|priest(?!hood)|prophet(?!s)|elder|elders|Israel|Israelite|Levite|Levites|wicked|fool|sinner|sluggard|young man|old man|foreigner|stranger|neighbor|shepherd|farmer|soldier|servant|slave|master(?!piece)|owner|herdsman|flock|beast|animal|cattle|donkey|camel|horse|ox|lamb|bird|fish|dragon|demon|devil|Satan|Lucifer)\b/i;


const PRONOUN_SUBJECT = /\bhe\b|\bhis\b|\bhimself\b/gi;

function titleCasePronoun(pron) {
  const lower = pron.toLowerCase();
  if (lower === 'he') return 'He';
  if (lower === 'his') return 'His';
  if (lower === 'himself') return 'Himself';
  return pron;
}

function decapitalizePronouns(text) {
  return text
    .replace(/\bHe\b/g, 'he')
    .replace(/\bHim\b/g, 'him')
    .replace(/\bHis\b/g, 'his')
    .replace(/\bHimself\b/g, 'himself');
}

function capitalizeSubjectPronouns(text) {
  return text
    .replace(/\bhe\b/g, 'He')
    .replace(/\bhis\b/g, 'His')
    .replace(/\bhimself\b/g, 'Himself');
}

function capitalizePronouns(text) {
  return capitalizeSubjectPronouns(text).replace(/\bhim\b/g, 'Him');
}

function capSubjectAfterDivine(segment, sentenceBeforeSegment = '') {
  return segment.replace(PRONOUN_SUBJECT, (pron, offset) => {
    const before = sentenceBeforeSegment + segment.slice(0, offset);
    if (HUMAN_OR_CREATURE.test(before)) return pron.toLowerCase();
    return titleCasePronoun(pron);
  });
}

function processSentence(sentence, options = {}) {
  if (!DIVINE_NAME.test(sentence)) return sentence;

  const conservative = options.conservative === true;
  const hasHuman = HUMAN_OR_CREATURE.test(sentence);

  // Divine-only sentence: capitalize subject pronouns (Torah / poetry); skip in conservative mode
  if (!conservative && !hasHuman) {
    return capitalizeSubjectPronouns(sentence);
  }

  // Mixed or conservative: capitalize after divine name unless a human appears earlier in the sentence
  return sentence.replace(
    /(\b(?:God|Yahweh(?: God)?|the Lord)\b)([^.!?]*)/g,
    (match, divineName, rest, offset) =>
      divineName +
      capSubjectAfterDivine(decapitalizePronouns(rest), sentence.slice(0, offset))
  );
}

function processVerse(verseText, options = {}) {
  if (!verseText || !DIVINE_NAME.test(verseText)) return verseText;

  // Split on sentence boundaries while keeping delimiters
  const parts = verseText.split(/([.!?](?:\s|$))/);
  let result = '';
  for (let i = 0; i < parts.length; i++) {
    result += /[.!?]/.test(parts[i]) ? parts[i] : processSentence(parts[i], options);
  }
  return result;
}

function applyOtProgrammaticRules(content, options = {}) {
  const tagRegex = /(\[\d+\])/g;
  const parts = content.split(tagRegex);
  let out = '';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (/^\[\d+\]$/.test(part)) {
      out += part;
      continue;
    }
    out += processVerse(part, options);
  }
  return out;
}

/** Poetry: psalms/wisdom often use he/his for God across verse breaks without repeating Yahweh. */
const POETRY_HUMAN =
  /\b(Blessed is the man|when he (fled|sang|went|prayed)|which he sang|If a man|the wicked|the fool|the sluggard|the sinner|with the wicked|\bman who\b|\bman's wisdom\b|\bA man to whom\b|wise man thinks|a man labors)\b/i;
const POETRY_DIVINE =
  /\b(Yahweh|God|the Lord|Lord)\s+(is|was|will|my|has|had|administers|knows|lives|reigns|restored|gave)\b|\bhe who sits in the heavens\b|\bThe Lord will\b|\bI love you, Yahweh\b|\bYahweh restored\b/i;
const POETRY_HUMAN_BLOCK = /\b(Job|David|Solomon|wise man|wicked|fool|sinner)\b/i;

function applyOtPoetryRules(content) {
  const tagRegex = /(\[\d+\])/g;
  const parts = content.split(tagRegex);
  let referent = null;
  let out = '';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (/^\[\d+\]$/.test(part)) {
      out += part;
      continue;
    }

    let chunk = applyOtProgrammaticRules(part);

    if (POETRY_DIVINE.test(part)) referent = 'divine';
    else if (POETRY_HUMAN.test(part) || POETRY_HUMAN_BLOCK.test(part)) referent = 'human';

    const humanCtx =
      POETRY_HUMAN.test(part) || POETRY_HUMAN_BLOCK.test(part) || referent === 'human';

    if (humanCtx) {
      chunk = decapitalizePronouns(chunk);
      referent = 'human';
    } else if (referent === 'divine' && /\b(he|his|himself)\b/i.test(chunk)) {
      chunk = capitalizeSubjectPronouns(chunk);
    }

    out += chunk;
  }
  return out;
}

module.exports = {
  DIVINE_NAME,
  HUMAN_OR_CREATURE,
  applyOtProgrammaticRules,
  applyOtPoetryRules,
  capitalizePronouns,
  processVerse,
};
