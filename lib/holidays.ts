import type { Country } from './types'

class ExternalApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ExternalApiError'
  }
}

// Convert YYYY-MM-DD (Nager.Date format) to DD-MM-YYYY (algorithm format)
function nagerDateToAlgorithmDate(nagerDate: string): string {
  const [year, month, day] = nagerDate.split('-')
  return `${day}-${month}-${year}`
}

export async function getCountries(): Promise<Country[]> {
  const res = await fetch('https://date.nager.at/api/v3/AvailableCountries', {
    next: { revalidate: 604800 }, // 7 days
  })
  if (!res.ok) throw new ExternalApiError(`Failed to fetch countries: ${res.status}`)
  const data = await res.json()
  // Nager.Date returns { countryCode, name } objects — map to our Country type
  const countries: Country[] = data.map((c: { countryCode: string; name: string }) => ({
    countryCode: c.countryCode,
    name: c.name,
  }))
  return countries.sort((a, b) => a.name.localeCompare(b.name))
}

export async function getPublicHolidays(year: number, countryCode: string): Promise<string[]> {
  const res = await fetch(
    `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`,
    { next: { revalidate: 86400 } } // 1 day
  )
  // 204 = no data for this country/year
  if (res.status === 204) return []
  if (!res.ok) throw new ExternalApiError(`Failed to fetch holidays: ${res.status}`)
  const data = await res.json()
  // Convert from YYYY-MM-DD to DD-MM-YYYY
  return data.map((h: { date: string }) => nagerDateToAlgorithmDate(h.date))
}
