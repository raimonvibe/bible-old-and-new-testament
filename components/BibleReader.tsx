'use client'

import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Eye, EyeOff, Home } from 'lucide-react'

interface Chapter {
  id: string
  number: string
  reference: string
  content: string
}

interface BibleReaderProps {
  bookName: string
  chapter: Chapter
  onBack: () => void
  onPrevChapter?: () => void
  onNextChapter?: () => void
  hasPrev: boolean
  hasNext: boolean
  onBackToBooks?: () => void
  /** Inclusive verse range to spotlight, e.g. from the guided tour. */
  highlightVerses?: [number, number] | null
}

/** Anchor id given to the first highlighted verse so it can be scrolled to. */
const HIGHLIGHT_ANCHOR_ID = 'verse-highlight-anchor'

const VERSE_MARKER = /(\s*\[\d+\]\s*)/

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatChapterHtml(
  content: string,
  showVerseNumbers: boolean,
  reference: string,
  bookName: string,
  chapterNumber: string,
  highlightVerses?: [number, number] | null,
): string {
  const parts = content.split(VERSE_MARKER)
  const verses: { num: number | null; html: string }[] = []
  let currentNum: number | null = null
  let current = ''

  const flush = () => {
    if (current.trim()) verses.push({ num: currentNum, html: current.trim() })
    current = ''
  }

  for (const part of parts) {
    if (!part) continue
    if (VERSE_MARKER.test(part)) {
      flush()
      const num = part.match(/\[(\d+)\]/)?.[1]
      currentNum = num ? Number(num) : null
      if (showVerseNumbers && num) {
        current += `<sup class="verse-num">[${num}]</sup> `
      }
    } else {
      current += escapeHtml(part)
    }
  }

  flush()

  if (verses.length === 0) {
    return `<p class="verse">${escapeHtml(content)}</p>`
  }

  const [from, to] = highlightVerses ?? [0, -1]
  let anchored = false

  const intro = `<p class="verse">${escapeHtml(reference)}. ${escapeHtml(bookName)}, chapter ${escapeHtml(chapterNumber)}.</p>`

  const body = verses
    .map(({ num, html }) => {
      const spotlit = num !== null && num >= from && num <= to
      const isAnchor = spotlit && !anchored
      if (isAnchor) anchored = true

      const attrs = [
        `class="verse${spotlit ? ' verse-spotlight' : ''}"`,
        num !== null ? `data-verse="${num}"` : '',
        isAnchor ? `id="${HIGHLIGHT_ANCHOR_ID}"` : '',
      ]
        .filter(Boolean)
        .join(' ')

      return `<p ${attrs}>${html}</p>`
    })
    .join('')

  return intro + body
}

export default function BibleReader({
  bookName,
  chapter,
  onBack,
  onPrevChapter,
  onNextChapter,
  hasPrev,
  hasNext,
  onBackToBooks,
  highlightVerses = null,
}: BibleReaderProps) {
  const [showVerseNumbers, setShowVerseNumbers] = useState(true)

  const processedContent = useMemo(
    () =>
      formatChapterHtml(
        chapter.content,
        showVerseNumbers,
        chapter.reference,
        bookName,
        chapter.number,
        highlightVerses,
      ),
    [
      chapter.content,
      showVerseNumbers,
      chapter.reference,
      chapter.number,
      bookName,
      highlightVerses,
    ],
  )

  // Bring the spotlit passage into view whenever the tour moves to a new one.
  const highlightKey = highlightVerses
    ? `${chapter.id}:${highlightVerses[0]}-${highlightVerses[1]}`
    : null

  useEffect(() => {
    if (!highlightKey) return
    const anchor = document.getElementById(HIGHLIGHT_ANCHOR_ID)
    if (!anchor) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    // Let the new chapter paint before measuring.
    const id = window.requestAnimationFrame(() => {
      // An overlay (the guided tour on narrow screens) may be covering the
      // bottom of the viewport; centre the passage in what is left.
      const safeBottom =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            '--reader-safe-bottom',
          ),
        ) || 0

      const rect = anchor.getBoundingClientRect()
      const visibleHeight = window.innerHeight - safeBottom
      const offsetFromTop = Math.max(16, (visibleHeight - rect.height) / 2)

      window.scrollTo({
        top: Math.max(0, window.scrollY + rect.top - offsetFromTop),
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      })
    })
    return () => window.cancelAnimationFrame(id)
  }, [highlightKey, processedContent])

  return (
    <article className="card-surface p-4 md:p-6 lg:p-10">
      <nav
        data-read-aloud-ignore
        className="flex items-center gap-2 text-sm text-beige-600 dark:text-brown-400 mb-4 font-sans"
        aria-label="Breadcrumb"
      >
        <button
          onClick={onBackToBooks}
          className="hover:text-beige-900 dark:hover:text-brown-50 transition-colors flex items-center gap-1"
          aria-label="Go to home"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </button>
        <span>/</span>
        <button
          onClick={onBack}
          className="hover:text-beige-900 dark:hover:text-brown-50 transition-colors"
          aria-label="Go back to chapter list"
        >
          {bookName}
        </button>
        <span>/</span>
        <span className="text-beige-800 dark:text-brown-200 font-medium">Chapter {chapter.number}</span>
      </nav>

      <div
        data-read-aloud-ignore
        className="flex items-center justify-between mb-6 pb-4 border-b border-beige-300 dark:border-brown-700"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevChapter}
            disabled={!hasPrev}
            aria-label="Go to previous chapter"
            className={`p-2 rounded-lg transition-all ${hasPrev ? 'btn-surface hover:shadow-md' : 'btn-surface-muted'}`}
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            onClick={onNextChapter}
            disabled={!hasNext}
            aria-label="Go to next chapter"
            className={`p-2 rounded-lg transition-all ${hasNext ? 'btn-surface hover:shadow-md' : 'btn-surface-muted'}`}
          >
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            onClick={onBack}
            className="ml-2 flex items-center gap-2 px-3 py-2 btn-surface rounded-lg hover:shadow-md font-sans text-sm"
            aria-label="Select different chapter"
          >
            <span>Ch. {chapter.number}</span>
          </button>
        </div>

        <button
          onClick={() => setShowVerseNumbers(!showVerseNumbers)}
          className="flex items-center gap-2 px-3 py-2 btn-surface rounded-lg hover:shadow-md font-sans text-sm"
          aria-label={showVerseNumbers ? 'Hide verse numbers' : 'Show verse numbers'}
          aria-pressed={showVerseNumbers}
        >
          {showVerseNumbers ? (
            <>
              <EyeOff className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Hide Numbers</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Show Numbers</span>
            </>
          )}
        </button>
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-beige-800 dark:text-brown-50 mb-2">
          {chapter.reference}
        </h1>
        <p className="text-beige-600 dark:text-brown-400 font-sans text-sm md:text-base">
          {bookName} - Chapter {chapter.number}
        </p>

        {highlightVerses && (
          <p
            data-read-aloud-ignore
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-100/80 px-3 py-1 font-sans text-xs font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:bg-amber-300" />
            Highlighted: verses {highlightVerses[0]}
            {highlightVerses[1] !== highlightVerses[0] && `–${highlightVerses[1]}`}
          </p>
        )}
      </div>

      <div className="prose max-w-none mb-8">
        <div
          className="text-beige-900 dark:text-brown-100 leading-relaxed text-base md:text-lg lg:text-xl"
          dangerouslySetInnerHTML={{ __html: processedContent }}
          aria-live="polite"
        />
      </div>

      <footer
        data-read-aloud-ignore
        className="flex justify-between items-center pt-6 border-t border-beige-300 dark:border-brown-700"
      >
        <button
          onClick={onPrevChapter}
          disabled={!hasPrev}
          aria-label={`Go to previous chapter${hasPrev ? '' : ' (not available)'}`}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-sans font-medium transition-all ${
            hasPrev ? 'btn-surface hover:shadow-lg hover:-translate-x-1' : 'btn-surface-muted'
          }`}
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="text-beige-600 dark:text-brown-400 font-sans text-sm md:text-base" aria-live="polite">
          Chapter {chapter.number}
        </div>

        <button
          onClick={onNextChapter}
          disabled={!hasNext}
          aria-label={`Go to next chapter${hasNext ? '' : ' (not available)'}`}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-sans font-medium transition-all ${
            hasNext ? 'btn-surface hover:shadow-lg hover:translate-x-1' : 'btn-surface-muted'
          }`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </button>
      </footer>
    </article>
  )
}
