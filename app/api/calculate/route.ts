import { NextRequest, NextResponse } from 'next/server'
import { validateBankHolidays, ValidationError } from '@/lib/validation'
import { processHolidays } from '@/lib/algorithm'
import type { CalculateResponse } from '@/lib/types'

const EMPTY_RESPONSE: CalculateResponse = {
  clusters: [],
  summary: {
    totalDaysOff: 0,
    leaveDaysUsed: 0,
    efficiencyPercent: null,
    clustersFound: 0,
  },
}

// Server-side in-memory cache for calculation results.
// Key: sorted, joined holiday string (order-independent fingerprint).
// A standard year has ~15-20 holidays — the number of unique inputs is small.
const resultCache = new Map<string, CalculateResponse>()
const CACHE_MAX = 500  // evict oldest when limit reached

function getCacheKey(holidays: string[]): string {
  return [...holidays].sort().join(',')
}

function getCached(key: string): CalculateResponse | undefined {
  return resultCache.get(key)
}

function setCached(key: string, value: CalculateResponse): void {
  if (resultCache.size >= CACHE_MAX) {
    // Evict oldest entry (Map preserves insertion order)
    const firstKey = resultCache.keys().next().value
    if (firstKey !== undefined) resultCache.delete(firstKey)
  }
  resultCache.set(key, value)
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const rawInput = (body as Record<string, unknown>)?.bankHolidays

  let validatedHolidays: string[]
  try {
    validatedHolidays = validateBankHolidays(rawInput)
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  if (validatedHolidays.length === 0) {
    return NextResponse.json(EMPTY_RESPONSE)
  }

  const cacheKey = getCacheKey(validatedHolidays)
  const cached = getCached(cacheKey)
  if (cached) {
    return NextResponse.json(cached)
  }

  try {
    const result = processHolidays(validatedHolidays)
    setCached(cacheKey, result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Algorithm error:', error)
    return NextResponse.json({ error: 'Failed to process holidays' }, { status: 500 })
  }
}
