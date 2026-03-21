import { describe, it, expect } from 'vitest'
import { validateBankHolidays, ValidationError } from '../validation'

describe('validateBankHolidays', () => {
  it('accepts a valid array of DD-MM-YYYY dates', () => {
    const input = ['01-01-2025', '25-12-2025', '14-02-2025']
    const result = validateBankHolidays(input)
    expect(result).toEqual(input)
  })

  it('returns empty array for empty input', () => {
    const result = validateBankHolidays([])
    expect(result).toEqual([])
  })

  it('throws ValidationError for non-array input', () => {
    expect(() => validateBankHolidays('not an array')).toThrow(ValidationError)
    expect(() => validateBankHolidays(null)).toThrow(ValidationError)
    expect(() => validateBankHolidays(undefined)).toThrow(ValidationError)
    expect(() => validateBankHolidays(42)).toThrow(ValidationError)
    expect(() => validateBankHolidays({ date: '01-01-2025' })).toThrow(ValidationError)
  })

  it('throws ValidationError with statusCode 400', () => {
    try {
      validateBankHolidays('not an array')
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError)
      expect((e as ValidationError).statusCode).toBe(400)
    }
  })

  it('throws ValidationError when array has more than 365 items', () => {
    const tooMany = Array(366).fill('01-01-2025')
    expect(() => validateBankHolidays(tooMany)).toThrow(ValidationError)
  })

  it('accepts exactly 365 items', () => {
    const justRight = Array(365).fill('01-01-2025')
    // Should not throw (though dedup will reduce to 1 unique date)
    expect(() => validateBankHolidays(justRight)).not.toThrow()
  })

  it('throws for wrong date format (YYYY-MM-DD)', () => {
    expect(() => validateBankHolidays(['2025-01-01'])).toThrow(ValidationError)
  })

  it('throws for wrong date format (DD/MM/YYYY)', () => {
    expect(() => validateBankHolidays(['01/01/2025'])).toThrow(ValidationError)
  })

  it('throws for non-string items', () => {
    expect(() => validateBankHolidays([20250101])).toThrow(ValidationError)
    expect(() => validateBankHolidays([null])).toThrow(ValidationError)
  })

  it('throws for invalid real dates like Feb 30', () => {
    expect(() => validateBankHolidays(['30-02-2025'])).toThrow(ValidationError)
  })

  it('throws for Feb 29 in non-leap year', () => {
    expect(() => validateBankHolidays(['29-02-2025'])).toThrow(ValidationError)
  })

  it('accepts Feb 29 in a leap year', () => {
    expect(() => validateBankHolidays(['29-02-2024'])).not.toThrow()
  })

  it('throws for month 13', () => {
    expect(() => validateBankHolidays(['01-13-2025'])).toThrow(ValidationError)
  })

  it('throws for day 00', () => {
    expect(() => validateBankHolidays(['00-01-2025'])).toThrow(ValidationError)
  })

  it('deduplicates identical dates', () => {
    const result = validateBankHolidays(['01-01-2025', '01-01-2025', '25-12-2025'])
    expect(result).toHaveLength(2)
    expect(result).toContain('01-01-2025')
    expect(result).toContain('25-12-2025')
  })

  it('trims whitespace from date strings', () => {
    const result = validateBankHolidays(['  01-01-2025  ', '25-12-2025'])
    expect(result).toContain('01-01-2025')
    expect(result).toContain('25-12-2025')
  })
})
