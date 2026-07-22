/**
 * Sentence-initial capitalization (grammar layer).
 * Capitalize pronouns at sentence starts without changing mid-sentence reverential rules.
 */

/** Books where newline-indented lines are poetry, not sentence breaks. */
const POETRY_LAYOUT_BOOKS = new Set([
  'Psalms',
  'Proverbs',
  'Song of Solomon',
  'Lamentations',
  'Job',
]);

/** Lowercase at sentence start per style guide (divine speech). */
const NEVER_CAPITALIZE = new Set(['us', 'our']);

/** Pronouns to capitalize when they begin a sentence. */
const SENTENCE_PRONOUN = /^(he|she|they|it|we|him|his|her|them)\b/i;

const ABBREVIATIONS = new Set([
  'mr',
  'mrs',
  'ms',
  'dr',
  'rev',
  'st',
  'mt',
  'no',
  'vs',
  'etc',
  'ie',
  'eg',
  'viz',
  'jr',
  'sr',
]);

function isAbbreviationPeriod(text, periodIndex) {
  const before = text.slice(Math.max(0, periodIndex - 12), periodIndex);
  const word = before.match(/([A-Za-z]+)\.$/);
  if (!word) return false;
  return ABBREVIATIONS.has(word[1].toLowerCase());
}

function isSentenceEndingPunctuation(text, index) {
  const ch = text[index];
  if (ch !== '.' && ch !== '!' && ch !== '?') return false;
  if (ch === '.' && isAbbreviationPeriod(text, index)) return false;
  if (ch === '.' && index > 0 && index < text.length - 1 && /\d/.test(text[index - 1]) && /\d/.test(text[index + 1])) {
    return false;
  }
  return true;
}

/**
 * Returns indices in `text` where a sentence begins.
 * @param {string} text
 * @param {{ poetryLayout?: boolean }} options
 * @returns {number[]}
 */
function findSentenceStarts(text, options = {}) {
  const poetryLayout = options.poetryLayout === true;
  const starts = new Set();

  if (text.length > 0) {
    starts.add(0);
  }

  for (let i = 0; i < text.length; i++) {
    if (isSentenceEndingPunctuation(text, i)) {
      let j = i + 1;
      while (j < text.length && /[\s\n]/.test(text[j])) j++;
      if (j < text.length) starts.add(j);
    }

    if (text[i] === '\n' && !poetryLayout) {
      let j = i + 1;
      while (j < text.length && /[ \t]/.test(text[j])) j++;
      if (j < text.length && /[a-zA-Z\[“"']/.test(text[j])) starts.add(j);
    }

    const verseMatch = text.slice(i).match(/^\[\d+\]\s+/);
    if (verseMatch) {
      const j = i + verseMatch[0].length;
      starts.add(j);
    }
  }

  return [...starts].sort((a, b) => a - b);
}

/**
 * Capitalize sentence-initial pronouns in chapter content.
 * @param {string} content
 * @param {{ poetryLayout?: boolean }} options
 * @returns {{ content: string, changes: number }}
 */
function applySentenceInitialCaps(content, options = {}) {
  const starts = findSentenceStarts(content, options);
  let changes = 0;
  const chars = [...content];

  for (const start of starts) {
    const slice = content.slice(start);
    const match = slice.match(SENTENCE_PRONOUN);
    if (!match) continue;

    const word = match[1];
    const lower = word.toLowerCase();
    if (NEVER_CAPITALIZE.has(lower)) continue;
    if (word === word.toUpperCase()) continue;
    if (word[0] === word[0].toUpperCase()) continue;

    const offset = start + match.index;
    chars[offset] = chars[offset].toUpperCase();
    changes++;
  }

  return { content: chars.join(''), changes };
}

/**
 * Audit sentence-initial lowercase pronouns.
 * @param {string} content
 * @param {{ poetryLayout?: boolean, reference?: string }} meta
 * @returns {Array<{ reference?: string, index: number, word: string, snippet: string }>}
 */
function auditSentenceInitialCaps(content, meta = {}) {
  const starts = findSentenceStarts(content, meta);
  const findings = [];

  for (const start of starts) {
    const slice = content.slice(start);
    const match = slice.match(SENTENCE_PRONOUN);
    if (!match) continue;

    const word = match[1];
    const lower = word.toLowerCase();
    if (NEVER_CAPITALIZE.has(lower)) continue;
    if (word[0] === word[0].toUpperCase()) continue;

    const index = start + match.index;
    findings.push({
      reference: meta.reference,
      index,
      word: lower,
      snippet: content.slice(Math.max(0, index - 25), index + 55).replace(/\s+/g, ' '),
    });
  }

  return findings;
}

function isPoetryLayoutBook(bookName) {
  return POETRY_LAYOUT_BOOKS.has(bookName);
}

module.exports = {
  POETRY_LAYOUT_BOOKS,
  NEVER_CAPITALIZE,
  findSentenceStarts,
  applySentenceInitialCaps,
  auditSentenceInitialCaps,
  isPoetryLayoutBook,
};
