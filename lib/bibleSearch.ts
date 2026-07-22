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

export interface SearchResult {
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

export function getTestament(bookId: string): Testament {
  return NT_BOOK_IDS.has(bookId) ? 'new' : 'old'
}

function normalizeForCompare(text: string, caseSensitive: boolean): string {
  const trimmed = text.trim().replace(/\s+/g, ' ')
  return caseSensitive ? trimmed : trimmed.toLowerCase()
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
