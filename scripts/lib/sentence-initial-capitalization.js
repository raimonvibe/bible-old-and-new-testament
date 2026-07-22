/**
 * Sentence-initial capitalization (grammar layer).
 * Safely capitalizes the first word after strong sentence boundaries.
 * Does not change mid-sentence reverential pronoun rules.
 */

/** Books with line-break layout; verse-only boundaries still apply. */
const POETRY_LAYOUT_BOOKS = new Set([
  'Psalms',
  'Proverbs',
  'Song of Solomon',
  'Lamentations',
  'Job',
]);

/** Always lowercase at sentence start (style guide — divine speech). */
const NEVER_CAPITALIZE = new Set(['us', 'our']);

/** Skip punctuation/quotes before the first word at a sentence start. */
const LEADING_JUNK = /^[\s"'‘’“”]+/;

/** First word at a sentence start (must begin with lowercase letter). */
const SENTENCE_START_WORD = /^([a-z][a-z']*)/;

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
  if (
    ch === '.' &&
    index > 0 &&
    index < text.length - 1 &&
    /\d/.test(text[index - 1]) &&
    /\d/.test(text[index + 1])
  ) {
    return false;
  }
  return true;
}

/**
 * Strong sentence boundaries only (safe for poetry/prophets):
 * - start of text
 * - after . ! ? (skipping trailing quotes/whitespace)
 * - after [n] verse markers
 *
 * Does NOT treat bare newlines or semicolons as boundaries.
 * @param {string} text
 * @returns {number[]}
 */
function findSentenceStarts(text) {
  const starts = new Set();

  if (text.length > 0) {
    starts.add(0);
  }

  for (let i = 0; i < text.length; i++) {
    if (isSentenceEndingPunctuation(text, i)) {
      let j = i + 1;
      while (j < text.length && /[\s\n"'‘’“”]/.test(text[j])) j++;
      if (j < text.length) starts.add(j);
    }

    const verseMatch = text.slice(i).match(/^\[\d+\]\s+/);
    if (verseMatch) {
      starts.add(i + verseMatch[0].length);
    }
  }

  return [...starts].sort((a, b) => a - b);
}

/**
 * Locate the first word at a sentence-start index.
 * @returns {{ word: string, offset: number } | null}
 */
function wordAtSentenceStart(content, start) {
  let pos = start;
  const tail = content.slice(pos);
  const lead = tail.match(LEADING_JUNK);
  if (lead) pos += lead[0].length;

  const slice = content.slice(pos);
  const match = slice.match(SENTENCE_START_WORD);
  if (!match) return null;

  const word = match[1];
  if (NEVER_CAPITALIZE.has(word.toLowerCase())) return null;
  if (word[0] === word[0].toUpperCase()) return null;

  return { word, offset: pos + match.index };
}

/**
 * Capitalize the first word at each safe sentence start.
 * @param {string} content
 * @returns {{ content: string, changes: number }}
 */
function applyFullSentenceInitialCaps(content) {
  const starts = findSentenceStarts(content);
  let changes = 0;
  const chars = [...content];

  for (const start of starts) {
    const hit = wordAtSentenceStart(content, start);
    if (!hit) continue;

    chars[hit.offset] = chars[hit.offset].toUpperCase();
    changes++;
  }

  return { content: chars.join(''), changes };
}

/** @deprecated alias — applies full safe sentence-initial pass (includes pronouns). */
function applySentenceInitialCaps(content, _options = {}) {
  return applyFullSentenceInitialCaps(content);
}

/**
 * Audit lowercase words at safe sentence starts.
 */
function auditFullSentenceInitialCaps(content, meta = {}) {
  const starts = findSentenceStarts(content);
  const findings = [];

  for (const start of starts) {
    const hit = wordAtSentenceStart(content, start);
    if (!hit) continue;

    findings.push({
      reference: meta.reference,
      index: hit.offset,
      word: hit.word.toLowerCase(),
      snippet: content.slice(Math.max(0, hit.offset - 25), hit.offset + 55).replace(/\s+/g, ' '),
    });
  }

  return findings;
}

/** @deprecated alias */
function auditSentenceInitialCaps(content, meta = {}) {
  return auditFullSentenceInitialCaps(content, meta);
}

function isPoetryLayoutBook(bookName) {
  return POETRY_LAYOUT_BOOKS.has(bookName);
}

module.exports = {
  POETRY_LAYOUT_BOOKS,
  NEVER_CAPITALIZE,
  findSentenceStarts,
  wordAtSentenceStart,
  applyFullSentenceInitialCaps,
  applySentenceInitialCaps,
  auditFullSentenceInitialCaps,
  auditSentenceInitialCaps,
  isPoetryLayoutBook,
};
