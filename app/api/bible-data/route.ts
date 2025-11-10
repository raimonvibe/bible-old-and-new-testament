import { NextResponse } from 'next/server'
import bibleData from '@/data/new-testament-data.json'

export async function GET() {
  return NextResponse.json(bibleData)
}
