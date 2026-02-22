'use client'

import { useState, useEffect } from 'react'
import BookSelector from '@/components/BookSelector'
import ChapterSelector from '@/components/ChapterSelector'
import BibleReader from '@/components/BibleReader'
import { BookMarked, Heart } from 'lucide-react'

interface Chapter {
  id: string
  number: string
  reference: string
  content: string
}

interface Book {
  id: string
  name: string
  abbreviation: string
  chapters: Chapter[]
}

interface BibleData {
  bibleName: string
  bibleId: string
  books: Book[]
}

export default function Home() {
  const [bibleData, setBibleData] = useState<BibleData | null>(null)
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null)
  const [view, setView] = useState<'books' | 'chapters' | 'reader'>('books')

  useEffect(() => {
    // Load Bible data
    fetch('/api/bible-data')
      .then((res) => res.json())
      .then((data) => setBibleData(data))
      .catch((err) => console.error('Failed to load Bible data:', err))
  }, [])

  if (!bibleData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookMarked className="w-16 h-16 text-beige-600 mx-auto mb-4 animate-pulse" />
          <p className="text-beige-700 font-sans text-lg">Loading the Bible...</p>
        </div>
      </main>
    )
  }

  const selectedBook = selectedBookId
    ? bibleData.books.find((b) => b.id === selectedBookId)
    : null

  const selectedChapter = selectedBook && selectedChapterId
    ? selectedBook.chapters.find((c) => c.id === selectedChapterId)
    : null

  const handleSelectBook = (bookId: string) => {
    setSelectedBookId(bookId)
    setSelectedChapterId(null)
    setView('chapters')
  }

  const handleSelectChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId)
    setView('reader')
  }

  const handleBackToBooks = () => {
    setSelectedBookId(null)
    setSelectedChapterId(null)
    setView('books')
  }

  const handleBackToChapters = () => {
    setSelectedChapterId(null)
    setView('chapters')
  }

  const handlePrevChapter = () => {
    if (!selectedBook || !selectedChapterId || !bibleData) return
    const currentChapterIndex = selectedBook.chapters.findIndex((c) => c.id === selectedChapterId)

    if (currentChapterIndex > 0) {
      // Go to previous chapter in same book
      setSelectedChapterId(selectedBook.chapters[currentChapterIndex - 1].id)
    } else {
      // Go to last chapter of previous book
      const currentBookIndex = bibleData.books.findIndex((b) => b.id === selectedBook.id)
      if (currentBookIndex > 0) {
        const prevBook = bibleData.books[currentBookIndex - 1]
        setSelectedBookId(prevBook.id)
        setSelectedChapterId(prevBook.chapters[prevBook.chapters.length - 1].id)
      }
    }
  }

  const handleNextChapter = () => {
    if (!selectedBook || !selectedChapterId || !bibleData) return
    const currentChapterIndex = selectedBook.chapters.findIndex((c) => c.id === selectedChapterId)

    if (currentChapterIndex < selectedBook.chapters.length - 1) {
      // Go to next chapter in same book
      setSelectedChapterId(selectedBook.chapters[currentChapterIndex + 1].id)
    } else {
      // Go to first chapter of next book
      const currentBookIndex = bibleData.books.findIndex((b) => b.id === selectedBook.id)
      if (currentBookIndex < bibleData.books.length - 1) {
        const nextBook = bibleData.books[currentBookIndex + 1]
        setSelectedBookId(nextBook.id)
        setSelectedChapterId(nextBook.chapters[0].id)
      }
    }
  }

  const getCurrentChapterIndex = () => {
    if (!selectedBook || !selectedChapterId) return -1
    return selectedBook.chapters.findIndex((c) => c.id === selectedChapterId)
  }

  const hasPrev = (() => {
    if (!selectedBook || !bibleData) return false
    const currentChapterIndex = getCurrentChapterIndex()
    const currentBookIndex = bibleData.books.findIndex((b) => b.id === selectedBook.id)
    return currentChapterIndex > 0 || currentBookIndex > 0
  })()

  const hasNext = (() => {
    if (!selectedBook || !bibleData) return false
    const currentChapterIndex = getCurrentChapterIndex()
    const currentBookIndex = bibleData.books.findIndex((b) => b.id === selectedBook.id)
    return currentChapterIndex < selectedBook.chapters.length - 1 || currentBookIndex < bibleData.books.length - 1
  })()

  return (
    <main className="min-h-screen py-6 md:py-10 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <BookMarked className="w-10 h-10 md:w-12 md:h-12 text-beige-700" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-beige-800 mb-3">
            The Holy Bible
          </h1>
          <p className="text-beige-600 font-sans text-base md:text-lg max-w-2xl mx-auto">
            Read the complete Old and New Testament from the {bibleData.bibleName} in a beautiful,
            modern interface
          </p>
        </header>

        {/* Main Content */}
        <div className="mb-8">
          {view === 'books' && (
            <BookSelector
              books={bibleData.books}
              selectedBookId={selectedBookId}
              onSelectBook={handleSelectBook}
            />
          )}

          {view === 'chapters' && selectedBook && (
            <ChapterSelector
              bookName={selectedBook.name}
              chapters={selectedBook.chapters}
              selectedChapterId={selectedChapterId}
              onSelectChapter={handleSelectChapter}
              onBack={handleBackToBooks}
            />
          )}

          {view === 'reader' && selectedBook && selectedChapter && (
            <BibleReader
              bookName={selectedBook.name}
              chapter={selectedChapter}
              onBack={handleBackToChapters}
              onBackToBooks={handleBackToBooks}
              onPrevChapter={handlePrevChapter}
              onNextChapter={handleNextChapter}
              hasPrev={hasPrev}
              hasNext={hasNext}
            />
          )}
        </div>

        {/* Footer */}
        <footer className="text-center text-beige-600 font-sans text-sm md:text-base py-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span>Made with</span>
            <Heart className="w-4 h-4 fill-beige-600" />
            <span>for Bible readers</span>
          </div>
          <p className="text-beige-500 text-xs md:text-sm">
            {bibleData.bibleName} • {bibleData.books.length} Books •{' '}
            {bibleData.books.reduce((sum, book) => sum + book.chapters.length, 0)} Chapters
          </p>
        </footer>
      </div>
    </main>
  )
}
