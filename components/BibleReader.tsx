'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, ArrowLeft, Eye, EyeOff, Home } from 'lucide-react'

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
}

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
): string {
  const parts = content.split(VERSE_MARKER)
  const verses: string[] = []
  let current = ''

  for (const part of parts) {
    if (!part) continue
    if (VERSE_MARKER.test(part)) {
      if (current.trim()) {
        verses.push(current.trim())
        current = ''
      }
      const num = part.match(/\[(\d+)\]/)?.[1]
      if (showVerseNumbers && num) {
        current += `<sup class="verse-num">[${num}]</sup> `
      }
    } else {
      current += escapeHtml(part)
    }
  }

  if (current.trim()) verses.push(current.trim())

  if (verses.length === 0) {
    return `<p class="verse">${escapeHtml(content)}</p>`
  }

  const intro = `<p class="verse">${escapeHtml(reference)}. ${escapeHtml(bookName)}, chapter ${escapeHtml(chapterNumber)}.</p>`
  return intro + verses.map((text) => `<p class="verse">${text}</p>`).join('')
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
      ),
    [chapter.content, showVerseNumbers, chapter.reference, chapter.number, bookName],
  )

  return (
    <article className="bg-beige-100/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 md:p-6 lg:p-10">
      <nav
        data-read-aloud-ignore
        className="flex items-center gap-2 text-sm text-beige-600 mb-4 font-sans"
        aria-label="Breadcrumb"
      >
        <button
          onClick={onBackToBooks}
          className="hover:text-beige-900 transition-colors flex items-center gap-1"
          aria-label="Go to home"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </button>
        <span>/</span>
        <button
          onClick={onBack}
          className="hover:text-beige-900 transition-colors"
          aria-label="Go back to chapter list"
        >
          {bookName}
        </button>
        <span>/</span>
        <span className="text-beige-800 font-medium">Chapter {chapter.number}</span>
      </nav>

      <div
        data-read-aloud-ignore
        className="flex items-center justify-between mb-6 pb-4 border-b border-beige-300"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevChapter}
            disabled={!hasPrev}
            aria-label="Go to previous chapter"
            className={`
              p-2 rounded-lg transition-all
              ${
                hasPrev
                  ? 'bg-white/70 hover:bg-white text-beige-800 hover:shadow-md'
                  : 'bg-beige-200/50 text-beige-400 cursor-not-allowed'
              }
            `}
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            onClick={onNextChapter}
            disabled={!hasNext}
            aria-label="Go to next chapter"
            className={`
              p-2 rounded-lg transition-all
              ${
                hasNext
                  ? 'bg-white/70 hover:bg-white text-beige-800 hover:shadow-md'
                  : 'bg-beige-200/50 text-beige-400 cursor-not-allowed'
              }
            `}
          >
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            onClick={onBack}
            className="ml-2 flex items-center gap-2 px-3 py-2 bg-white/70 hover:bg-white text-beige-800 rounded-lg transition-all hover:shadow-md font-sans text-sm"
            aria-label="Select different chapter"
          >
            <span>Ch. {chapter.number}</span>
          </button>
        </div>

        <button
          onClick={() => setShowVerseNumbers(!showVerseNumbers)}
          className="flex items-center gap-2 px-3 py-2 bg-white/70 hover:bg-white text-beige-800 rounded-lg transition-all hover:shadow-md font-sans text-sm"
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
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-beige-800 mb-2">
          {chapter.reference}
        </h1>
        <p className="text-beige-600 font-sans text-sm md:text-base">
          {bookName} - Chapter {chapter.number}
        </p>
      </div>

      <div className="prose prose-beige max-w-none mb-8">
        <div
          className="text-beige-900 leading-relaxed text-base md:text-lg lg:text-xl"
          dangerouslySetInnerHTML={{ __html: processedContent }}
          aria-live="polite"
        />
      </div>

      <footer
        data-read-aloud-ignore
        className="flex justify-between items-center pt-6 border-t border-beige-300"
      >
        <button
          onClick={onPrevChapter}
          disabled={!hasPrev}
          aria-label={`Go to previous chapter${hasPrev ? '' : ' (not available)'}`}
          className={`
            flex items-center gap-2 px-4 py-3 rounded-xl font-sans font-medium transition-all
            ${
              hasPrev
                ? 'bg-white/70 hover:bg-white text-beige-800 hover:shadow-lg hover:-translate-x-1'
                : 'bg-beige-200/50 text-beige-400 cursor-not-allowed'
            }
          `}
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="text-beige-600 font-sans text-sm md:text-base" aria-live="polite">
          Chapter {chapter.number}
        </div>

        <button
          onClick={onNextChapter}
          disabled={!hasNext}
          aria-label={`Go to next chapter${hasNext ? '' : ' (not available)'}`}
          className={`
            flex items-center gap-2 px-4 py-3 rounded-xl font-sans font-medium transition-all
            ${
              hasNext
                ? 'bg-white/70 hover:bg-white text-beige-800 hover:shadow-lg hover:translate-x-1'
                : 'bg-beige-200/50 text-beige-400 cursor-not-allowed'
            }
          `}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </button>
      </footer>
    </article>
  )
}
