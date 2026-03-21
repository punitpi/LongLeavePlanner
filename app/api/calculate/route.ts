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

  try {
    const result = processHolidays(validatedHolidays)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Algorithm error:', error)
    return NextResponse.json({ error: 'Failed to process holidays' }, { status: 500 })
  }
}
