import { NextRequest, NextResponse } from 'next/server'
import { getPublicHolidays } from '@/lib/holidays'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const country = searchParams.get('country')
  const yearParam = searchParams.get('year')

  // Validate country param
  if (!country || !/^[A-Za-z]{2}$/.test(country)) {
    return NextResponse.json(
      { error: 'country must be a 2-letter ISO code' },
      { status: 400 }
    )
  }

  // Validate year param
  if (!yearParam || !/^\d{4}$/.test(yearParam)) {
    return NextResponse.json(
      { error: 'year must be a 4-digit year' },
      { status: 400 }
    )
  }

  const year = parseInt(yearParam, 10)
  const currentYear = new Date().getFullYear()
  if (year < currentYear || year > currentYear + 1) {
    return NextResponse.json(
      { error: `year must be ${currentYear} or ${currentYear + 1}` },
      { status: 400 }
    )
  }

  try {
    // Returns [{ date: 'DD-MM-YYYY', name: 'Holiday Name' }]
    const holidays = await getPublicHolidays(year, country.toUpperCase())
    return NextResponse.json(holidays)
  } catch (error) {
    console.error('Failed to fetch holidays:', error)
    return NextResponse.json(
      { error: 'Could not fetch holiday data' },
      { status: 502 }
    )
  }
}
