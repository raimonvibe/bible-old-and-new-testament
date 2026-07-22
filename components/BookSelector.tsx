'use client'

import { Book, ScrollText } from 'lucide-react'

interface BookSelectorProps {
  books: Array<{ id: string; name: string; abbreviation: string; chapters: any[] }>
  selectedBookId: string | null
  onSelectBook: (bookId: string) => void
}

export default function BookSelector({ books, selectedBookId, onSelectBook }: BookSelectorProps) {
  const ntBookIds = ['MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH',
                     'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS',
                     '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV']

  const oldTestamentBooks = books.filter(book => !ntBookIds.some(id => book.id.includes(id)))
  const newTestamentBooks = books.filter(book => ntBookIds.some(id => book.id.includes(id)))

  const renderBookGrid = (booksList: typeof books) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
      {booksList.map((book) => (
        <button
          key={book.id}
          onClick={() => onSelectBook(book.id)}
          aria-label={`${book.name}, ${book.chapters.length} chapter${book.chapters.length !== 1 ? 's' : ''}`}
          aria-pressed={selectedBookId === book.id}
          className={`
            p-3 md:p-4 rounded-xl transition-all duration-200
            text-left hover:scale-105 hover:shadow-lg
            ${
              selectedBookId === book.id
                ? 'bg-selection-gradient text-white shadow-lg scale-105'
                : 'btn-surface hover:shadow-md'
            }
          `}
        >
          <div className="font-display font-semibold text-sm md:text-base mb-1">
            {book.name}
          </div>
          <div
            className={`text-xs ${
              selectedBookId === book.id
                ? 'text-beige-100 dark:text-brown-100'
                : 'text-beige-600 dark:text-brown-400'
            }`}
            aria-hidden="true"
          >
            {book.chapters.length} chapter{book.chapters.length !== 1 ? 's' : ''}
          </div>
        </button>
      ))}
    </div>
  )

  return (
    <div className="space-y-8">
      <section data-read-aloud-block className="card-surface p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-beige-300 dark:border-brown-700">
          <div className="flex items-center gap-3">
            <ScrollText className="w-7 h-7 md:w-8 md:h-8 text-amber-700 dark:text-amber-500" aria-hidden="true" />
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-beige-800 dark:text-brown-50">
                Old Testament
              </h2>
              <p className="text-sm text-beige-600 dark:text-brown-400 font-sans mt-1">
                {oldTestamentBooks.length} books • {oldTestamentBooks.reduce((sum, book) => sum + book.chapters.length, 0)} chapters
              </p>
            </div>
          </div>
        </div>

        <nav data-read-aloud-ignore aria-label="Old Testament book selection">
          {renderBookGrid(oldTestamentBooks)}
        </nav>
      </section>

      <section data-read-aloud-block className="card-surface p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-beige-300 dark:border-brown-700">
          <div className="flex items-center gap-3">
            <Book className="w-7 h-7 md:w-8 md:h-8 text-blue-700 dark:text-blue-400" aria-hidden="true" />
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-beige-800 dark:text-brown-50">
                New Testament
              </h2>
              <p className="text-sm text-beige-600 dark:text-brown-400 font-sans mt-1">
                {newTestamentBooks.length} books • {newTestamentBooks.reduce((sum, book) => sum + book.chapters.length, 0)} chapters
              </p>
            </div>
          </div>
        </div>

        <nav data-read-aloud-ignore aria-label="New Testament book selection">
          {renderBookGrid(newTestamentBooks)}
        </nav>
      </section>
    </div>
  )
}
