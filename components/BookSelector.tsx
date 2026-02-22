'use client'

import { Book, ScrollText } from 'lucide-react'

interface BookSelectorProps {
  books: Array<{ id: string; name: string; abbreviation: string; chapters: any[] }>
  selectedBookId: string | null
  onSelectBook: (bookId: string) => void
}

export default function BookSelector({ books, selectedBookId, onSelectBook }: BookSelectorProps) {
  // New Testament book IDs
  const ntBookIds = ['MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH',
                     'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS',
                     '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV']

  // Split books into Old and New Testament
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
                ? 'bg-beige-gradient-dark text-white shadow-lg scale-105'
                : 'bg-white/70 hover:bg-white text-beige-800'
            }
          `}
        >
          <div className="font-display font-semibold text-sm md:text-base mb-1">
            {book.name}
          </div>
          <div className={`text-xs ${selectedBookId === book.id ? 'text-beige-100' : 'text-beige-600'}`} aria-hidden="true">
            {book.chapters.length} chapter{book.chapters.length !== 1 ? 's' : ''}
          </div>
        </button>
      ))}
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Old Testament Section */}
      <div className="bg-beige-100/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-beige-300">
          <div className="flex items-center gap-3">
            <ScrollText className="w-7 h-7 md:w-8 md:h-8 text-amber-700" aria-hidden="true" />
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-beige-800">
                Old Testament
              </h2>
              <p className="text-sm text-beige-600 font-sans mt-1">
                {oldTestamentBooks.length} books • {oldTestamentBooks.reduce((sum, book) => sum + book.chapters.length, 0)} chapters
              </p>
            </div>
          </div>
        </div>

        <nav aria-label="Old Testament book selection">
          {renderBookGrid(oldTestamentBooks)}
        </nav>
      </div>

      {/* New Testament Section */}
      <div className="bg-beige-100/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-beige-300">
          <div className="flex items-center gap-3">
            <Book className="w-7 h-7 md:w-8 md:h-8 text-blue-700" aria-hidden="true" />
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-beige-800">
                New Testament
              </h2>
              <p className="text-sm text-beige-600 font-sans mt-1">
                {newTestamentBooks.length} books • {newTestamentBooks.reduce((sum, book) => sum + book.chapters.length, 0)} chapters
              </p>
            </div>
          </div>
        </div>

        <nav aria-label="New Testament book selection">
          {renderBookGrid(newTestamentBooks)}
        </nav>
      </div>
    </div>
  )
}
