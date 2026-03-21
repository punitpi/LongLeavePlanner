export class ValidationError extends Error {
  statusCode = 400
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function validateBankHolidays(input: unknown): string[] {
  // 1. Must be an array
  if (!Array.isArray(input)) throw new ValidationError('bankHolidays must be an array')

  // 2. Max 365 items
  if (input.length > 365) throw new ValidationError('bankHolidays cannot contain more than 365 dates')

  // 3. Each must be a string matching DD-MM-YYYY
  const DATE_REGEX = /^\d{2}-\d{2}-\d{4}$/
  for (const item of input) {
    if (typeof item !== 'string') throw new ValidationError(`Each date must be a string, got ${typeof item}`)
    const trimmed = item.trim()
    if (!DATE_REGEX.test(trimmed)) throw new ValidationError(`Invalid date format: ${trimmed}. Expected DD-MM-YYYY`)

    // 4. Real calendar date check
    const [day, month, year] = trimmed.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      throw new ValidationError(`Invalid date: ${trimmed}`)
    }
  }

  // 5. Trim, dedup, and return
  const trimmed = input.map((s: string) => s.trim())
  return Array.from(new Set(trimmed))
}
