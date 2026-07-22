import { NextResponse } from 'next/server'
import newTestamentData from '@/data/new-testament-data.json'
import oldTestamentData from '@/data/old-testament-data.json'

export async function GET() {
  // Combine Old and New Testament data
  const combinedData = {
    bibleName: newTestamentData.bibleName,
    bibleId: newTestamentData.bibleId,
    books: [...oldTestamentData.books, ...newTestamentData.books]
  }

  return NextResponse.json(combinedData)
}
