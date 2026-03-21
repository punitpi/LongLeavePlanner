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

// Server-side result cache — key is sorted holiday fingerprint so order doesn't matter.
// No TTL: results are deterministic; evict oldest when size limit reached.
const resultCache = new Map<string, CalculateResponse>()
const CACHE_MAX = 500

function getCacheKey(holidays: string[]): string {
  return holidays.sort().join(',')
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
  const cached = resultCache.get(cacheKey)
  if (cached) {
    return NextResponse.json(cached)
  }

  try {
    const result = processHolidays(validatedHolidays)
    if (resultCache.size >= CACHE_MAX) {
      const firstKey = resultCache.keys().next().value
      if (firstKey !== undefined) resultCache.delete(firstKey)
    }
    resultCache.set(cacheKey, result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Algorithm error:', error)
    return NextResponse.json({ error: 'Failed to process holidays' }, { status: 500 })
  }
}
