/**
 * Old Testament contextual divine pronoun rules.
 * Capitalize he/him/his/himself when referent is God (not humans, serpent, etc.).
 */

const DIVINE_NAME = /\b(God|Yahweh(?: God)?|the Lord)\b/;
const HUMAN_OR_CREATURE =
  /\b(Abram|Abraham|Noah|Moses|Aaron|Adam|Eve|the man|the woman|serpent|Pharaoh|Sarah|Isaac|Jacob|Esau|Lot|Cain|Abel|Seth|Enoch|Methuselah|Lamech|Ham|Shem|Japheth|Hagar|Ishmael|Rebekah|Laban|Joseph|Judah|Benjamin|Leah|Rachel|Dinah|Tamar|Potiphar|Pharaoh's|Midwife|servant girls|angel of Yahweh|Malak|Balaam|Joshua|Caleb|Miriam|Jethro|Zipporah|Gershom|Eliezer|Amalekite|Edomite|Canaanite|Hittite|Hivite|Perizzite|Girgashite|Amorite|Jebusite|Nimrod|Terah|Nahor|Haran|Lot's|Moab|Ben-Ammi|Esau's|Reuben|Simeon|Levi|Dan|Naphtali|Gad|Asher|Issachar|Zebulun|Manasseh|Ephraim|Benjamin| Saul|David|Jonathan|Saul's|Goliath|Samuel|Eli|Hannah|Peninnah|Delilah|Samson|Gideon|Deborah|Barak|Jephthah|Samson|Boaz|Ruth|Naomi|Orpah|Obed|Jesse|Eliab|Abinadab|Shammah|Jonadab|Absalom|Amnon|Tamar|Solomon|Rehoboam|Jeroboam|Ahab|Jezebel|Elijah|Elisha|Isaiah|Jeremiah|Ezekiel|Daniel|Nehemiah|Ezra|Esther|Mordecai|Haman|Job|Eliphaz|Bildad|Zophar|Elihu|Jonah|Nineveh|Balak|Og|Sihon|Korah|Dathan|Abiram|Nadab|Abihu|Eleazar|Ithamar|Phinehas|Woman|women|wife|husband|brother|sister|son|daughter|child|children|boy|girl|king(?!dom)|queen|prince|princess|priest(?!hood)|prophet(?!s)|elder|young man|old man|foreigner|stranger|neighbor|shepherd|farmer|soldier|servant|slave|master(?!piece)|owner|herdsman|flock|beast|animal|cattle|donkey|camel|horse|ox|lamb|bird|fish|serpent|dragon|demon|devil|Satan|Lucifer)\b/i;


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

function capSubjectAfterDivine(segment) {
  return segment.replace(PRONOUN_SUBJECT, (pron, offset) => {
    const before = segment.slice(0, offset);
    if (HUMAN_OR_CREATURE.test(before)) return pron.toLowerCase();
    return titleCasePronoun(pron);
  });
}

function processSentence(sentence) {
  if (!DIVINE_NAME.test(sentence)) return sentence;

  // Divine-only sentence (no human/creature indicator): capitalize subject pronouns
  if (!HUMAN_OR_CREATURE.test(sentence)) {
    return capitalizeSubjectPronouns(sentence);
  }

  // Mixed: capitalize subject pronouns after divine name unless a human appears earlier in the clause
  return sentence.replace(
    /(\b(?:God|Yahweh(?: God)?|the Lord)\b)([^.!?]*)/g,
    (match, divineName, rest) => divineName + capSubjectAfterDivine(decapitalizePronouns(rest))
  );
}

function processVerse(verseText) {
  if (!verseText || !DIVINE_NAME.test(verseText)) return verseText;

  // Split on sentence boundaries while keeping delimiters
  const parts = verseText.split(/([.!?](?:\s|$))/);
  let result = '';
  for (let i = 0; i < parts.length; i++) {
    result += /[.!?]/.test(parts[i]) ? parts[i] : processSentence(parts[i]);
  }
  return result;
}

function applyOtProgrammaticRules(content) {
  const tagRegex = /(\[\d+\])/g;
  const parts = content.split(tagRegex);
  let out = '';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (/^\[\d+\]$/.test(part)) {
      out += part;
      continue;
    }
    out += processVerse(part);
  }
  return out;
}

module.exports = {
  DIVINE_NAME,
  HUMAN_OR_CREATURE,
  applyOtProgrammaticRules,
  capitalizePronouns,
  processVerse,
};
