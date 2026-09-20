export interface Chapter {
  id: string
  number: string
  reference: string
  content: string
}

export interface Book {
  id: string
  name: string
  abbreviation: string
  chapters: Chapter[]
}

export interface BibleData {
  bibleName: string
  bibleId: string
  books: Book[]
}

export type Testament = 'old' | 'new'
export type MatchMode = 'phrase' | 'all' | 'any'

export interface SearchOptions {
  query: string
  testament: 'all' | Testament
  bookId: string | null
  matchMode: MatchMode
  caseSensitive: boolean
}

export type SearchResultKind = 'book' | 'verse'

export interface SearchResult {
  kind: SearchResultKind
  bookId: string
  bookName: string
  testament: Testament
  chapterId: string
  chapterNumber: string
  reference: string
  verseNumber: number
  text: string
}

const NT_BOOK_IDS = new Set([
  'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH',
  'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS',
  '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV',
])

export const MAX_SEARCH_RESULTS = 150

const BOOK_ALIASES: Record<string, string[]> = {
  GEN: ['gen', 'gn'],
  EXO: ['exod'],
  LEV: ['lev'],
  NUM: ['num', 'nm', 'numb'],
  DEU: ['deut', 'dt'],
  JOS: ['josh'],
  JDG: ['judg', 'jdg'],
  RUT: ['ru'],
  '1SA': ['1 sam', '1sa', 'i samuel', 'first samuel'],
  '2SA': ['2 sam', '2sa', 'ii samuel', 'second samuel'],
  '1KI': ['1 kgs', '1ki', 'i kings', 'first kings'],
  '2KI': ['2 kgs', '2ki', 'ii kings', 'second kings'],
  '1CH': ['1 chron', '1 chr', '1ch', 'i chronicles', 'first chronicles'],
  '2CH': ['2 chron', '2 chr', '2ch', 'ii chronicles', 'second chronicles'],
  EZR: ['ezr'],
  NEH: ['neh'],
  EST: ['est', 'esth'],
  JOB: [],
  PSA: ['psalm', 'ps', 'pss'],
  PRO: ['prov', 'prv'],
  ECC: ['eccl', 'qoh', 'qoheleth'],
  SNG: ['song of songs', 'canticles', 'sos', 'song'],
  ISA: ['isa'],
  JER: ['jer'],
  LAM: ['lam'],
  EZK: ['ezek', 'eze'],
  DAN: ['dan'],
  HOS: ['hos'],
  JOL: ['jl'],
  AMO: [],
  OBA: ['ob', 'obad'],
  JON: ['jnh'],
  MIC: ['mic'],
  NAM: ['nah'],
  HAB: ['hab'],
  ZEP: ['zeph', 'zep'],
  HAG: ['hag'],
  ZEC: ['zech', 'zec'],
  MAL: ['mal'],
  MAT: ['matt', 'mt'],
  MRK: ['mk', 'mr'],
  LUK: ['lk'],
  JHN: ['jn'],
  ACT: ['acts of the apostles'],
  ROM: ['rom', 'ro'],
  '1CO': ['1 cor', '1co', 'i corinthians', 'first corinthians'],
  '2CO': ['2 cor', '2co', 'ii corinthians', 'second corinthians'],
  GAL: ['gal'],
  EPH: ['eph'],
  PHP: ['phil', 'php'],
  COL: ['col'],
  '1TH': ['1 thess', '1 th', '1th', 'i thessalonians', 'first thessalonians'],
  '2TH': ['2 thess', '2 th', '2th', 'ii thessalonians', 'second thessalonians'],
  '1TI': ['1 tim', '1ti', 'i timothy', 'first timothy'],
  '2TI': ['2 tim', '2ti', 'ii timothy', 'second timothy'],
  TIT: ['tit'],
  PHM: ['phm', 'philem'],
  HEB: ['heb'],
  JAS: ['jas', 'jam'],
  '1PE': ['1 pet', '1pe', 'i peter', 'first peter'],
  '2PE': ['2 pet', '2pe', 'ii peter', 'second peter'],
  '1JN': ['1 jn', '1jn', 'i john', 'first john'],
  '2JN': ['2 jn', '2jn', 'ii john', 'second john'],
  '3JN': ['3 jn', '3jn', 'iii john', 'third john'],
  JUD: ['jud'],
  REV: ['rev', 'apocalypse'],
}

export function getTestament(bookId: string): Testament {
  return NT_BOOK_IDS.has(bookId) ? 'new' : 'old'
}

function normalizeForCompare(text: string, caseSensitive: boolean): string {
  const trimmed = text.trim().replace(/\s+/g, ' ')
  return caseSensitive ? trimmed : trimmed.toLowerCase()
}

function normalizeBookKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(first|1st)\s+/, '1 ')
    .replace(/^(second|2nd)\s+/, '2 ')
    .replace(/^(third|3rd)\s+/, '3 ')
    .replace(/^iii\s+/, '3 ')
    .replace(/^ii\s+/, '2 ')
    .replace(/^i\s+/, '1 ')
}

function compactBookKey(text: string): string {
  return normalizeBookKey(text).replace(/\s+/g, '')
}

function parseReferenceQuery(query: string): {
  bookQuery: string
  chapter?: string
  verse?: number
} {
  const trimmed = query.trim()
  const match = trimmed.match(/^(.*?)\s+(\d+)(?:\s*[:.]\s*(\d+))?\s*$/)
  if (match?.[1]?.trim()) {
    return {
      bookQuery: match[1].trim(),
      chapter: match[2],
      verse: match[3] ? Number.parseInt(match[3], 10) : undefined,
    }
  }
  return { bookQuery: trimmed }
}

function scoreBookMatch(book: Book, query: string): number | null {
  const needle = normalizeBookKey(query)
  const compactNeedle = compactBookKey(query)
  if (needle.length < 2 && compactNeedle.length < 2) return null

  const aliases = BOOK_ALIASES[book.id] ?? []
  const fields = [book.name, book.abbreviation, book.id, ...aliases]
  let best: number | null = null

  const consider = (score: number) => {
    best = best === null ? score : Math.min(best, score)
  }

  for (const field of fields) {
    const hay = normalizeBookKey(field)
    const compactHay = compactBookKey(field)

    if (hay === needle || compactHay === compactNeedle) consider(0)
    else if (
      needle.length >= 3 &&
      (hay.startsWith(needle) || compactHay.startsWith(compactNeedle))
    ) {
      consider(1)
    } else if (
      needle.length >= 3 &&
      (hay.includes(needle) || compactHay.includes(compactNeedle))
    ) {
      consider(3)
    }
  }

  const words = needle.split(/\s+/).filter(Boolean)
  if (words.length > 1) {
    const hay = normalizeBookKey(book.name)
    if (words.every((word) => hay.includes(word))) consider(2)
  }

  return best
}

export function searchBooks(bibleData: BibleData, options: SearchOptions): SearchResult[] {
  const query = options.query.trim()
  if (!query) return []

  const { bookQuery, chapter, verse } = parseReferenceQuery(query)
  const scored: Array<{ book: Book; score: number; testament: Testament }> = []

  for (const book of bibleData.books) {
    const testament = getTestament(book.id)
    if (options.testament !== 'all' && options.testament !== testament) continue
    if (options.bookId && options.bookId !== book.id) continue

    const score = scoreBookMatch(book, bookQuery)
    if (score === null) continue
    scored.push({ book, score, testament })
  }

  scored.sort((a, b) => a.score - b.score || a.book.name.localeCompare(b.book.name))

  const results: SearchResult[] = []

  for (const { book, testament } of scored) {
    if (chapter) {
      const matchedChapter = book.chapters.find((item) => item.number === chapter)
      if (!matchedChapter) continue

      const verses = parseVerses(matchedChapter.content)
      const matchedVerse = verse
        ? verses.find((item) => item.verseNumber === verse)
        : verses[0]
      if (verse && !matchedVerse) continue

      results.push({
        kind: 'verse',
        bookId: book.id,
        bookName: book.name,
        testament,
        chapterId: matchedChapter.id,
        chapterNumber: matchedChapter.number,
        reference: verse
          ? `${book.name} ${matchedChapter.number}:${verse}`
          : `${book.name} ${matchedChapter.number}`,
        verseNumber: matchedVerse?.verseNumber ?? 1,
        text: matchedVerse?.text ?? `Open ${book.name} chapter ${matchedChapter.number}.`,
      })
      continue
    }

    results.push({
      kind: 'book',
      bookId: book.id,
      bookName: book.name,
      testament,
      chapterId: book.chapters[0]?.id ?? '',
      chapterNumber: book.chapters[0]?.number ?? '1',
      reference: book.name,
      verseNumber: 0,
      text: `${book.chapters.length} chapter${book.chapters.length === 1 ? '' : 's'}`,
    })
  }

  return results
}

function matchesQuery(text: string, query: string, options: SearchOptions): boolean {
  const haystack = normalizeForCompare(text, options.caseSensitive)
  const needle = normalizeForCompare(query, options.caseSensitive)

  if (!needle) return false

  if (options.matchMode === 'phrase') {
    return haystack.includes(needle)
  }

  const words = needle.split(/\s+/).filter(Boolean)
  if (words.length === 0) return false

  if (options.matchMode === 'all') {
    return words.every((word) => haystack.includes(word))
  }

  return words.some((word) => haystack.includes(word))
}

function parseVerses(content: string): Array<{ verseNumber: number; text: string }> {
  const verses: Array<{ verseNumber: number; text: string }> = []
  const pattern = /\[(\d+)\]([\s\S]*?)(?=\[\d+\]|$)/g
  let match: RegExpExecArray | null

  while ((match = pattern.exec(content)) !== null) {
    const text = match[2].trim()
    if (!text) continue

    verses.push({
      verseNumber: Number.parseInt(match[1], 10),
      text,
    })
  }

  if (verses.length === 0 && content.trim()) {
    verses.push({ verseNumber: 1, text: content.trim() })
  }

  return verses
}

export function searchBible(bibleData: BibleData, options: SearchOptions): SearchResult[] {
  const query = options.query.trim()
  if (!query) return []

  const results: SearchResult[] = []

  for (const book of bibleData.books) {
    const testament = getTestament(book.id)

    if (options.testament !== 'all' && options.testament !== testament) continue
    if (options.bookId && options.bookId !== book.id) continue

    for (const chapter of book.chapters) {
      const verses = parseVerses(chapter.content)

      for (const verse of verses) {
        if (!matchesQuery(verse.text, query, options)) continue

        results.push({
          kind: 'verse',
          bookId: book.id,
          bookName: book.name,
          testament,
          chapterId: chapter.id,
          chapterNumber: chapter.number,
          reference: `${book.name} ${chapter.number}:${verse.verseNumber}`,
          verseNumber: verse.verseNumber,
          text: verse.text,
        })

        if (results.length >= MAX_SEARCH_RESULTS) {
          return results
        }
      }
    }
  }

  return results
}

export function highlightMatch(text: string, query: string, caseSensitive: boolean): string {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) return text

  const flags = caseSensitive ? 'g' : 'gi'
  const escaped = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped.split(/\s+/).join('|')})`, flags)

  return text.replace(regex, '<mark class="search-highlight">$1</mark>')
}
