'use client'

import { BookOpen, ChevronLeft } from 'lucide-react'

interface Chapter {
  id: string
  number: string
  reference: string
}

interface ChapterSelectorProps {
  bookName: string
  chapters: Chapter[]
  selectedChapterId: string | null
  onSelectChapter: (chapterId: string) => void
  onBack: () => void
}

export default function ChapterSelector({
  bookName,
  chapters,
  selectedChapterId,
  onSelectChapter,
  onBack,
}: ChapterSelectorProps) {
  return (
    <div className="bg-beige-100/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 md:p-6 lg:p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-beige-700 hover:text-beige-900 mb-6 transition-colors group"
        aria-label="Go back to book selection"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
        <span className="font-sans text-sm md:text-base">Back to Books</span>
      </button>

      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-beige-700" aria-hidden="true" />
        <h2 className="text-2xl md:text-3xl font-display font-bold text-beige-800">
          {bookName}
        </h2>
      </div>

      <nav aria-label={`Chapter selection for ${bookName}`}>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 md:gap-3">
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => onSelectChapter(chapter.id)}
              aria-label={`Chapter ${chapter.number}`}
              aria-pressed={selectedChapterId === chapter.id}
              className={`
                aspect-square rounded-xl transition-all duration-200
                flex items-center justify-center font-display font-semibold text-base md:text-lg
                hover:scale-110 hover:shadow-lg
                ${
                  selectedChapterId === chapter.id
                    ? 'bg-beige-gradient-dark text-white shadow-lg scale-110'
                    : 'bg-white/70 hover:bg-white text-beige-800'
                }
              `}
            >
              {chapter.number}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
