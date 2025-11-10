'use client'

import { Book } from 'lucide-react'

interface BookSelectorProps {
  books: Array<{ id: string; name: string; abbreviation: string; chapters: any[] }>
  selectedBookId: string | null
  onSelectBook: (bookId: string) => void
}

export default function BookSelector({ books, selectedBookId, onSelectBook }: BookSelectorProps) {
  return (
    <div className="bg-beige-100/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Book className="w-6 h-6 md:w-7 md:h-7 text-beige-700" aria-hidden="true" />
        <h2 className="text-2xl md:text-3xl font-display font-bold text-beige-800">
          Select a Book
        </h2>
      </div>

      <nav aria-label="Book selection">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
          {books.map((book) => (
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
      </nav>
    </div>
  )
}
