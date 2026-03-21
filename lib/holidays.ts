import type { Country } from './types'
import { STATIC_COUNTRIES, getStaticHolidays, isStaticCountry } from './staticHolidays'

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

export interface HolidayWithName {
  date: string  // DD-MM-YYYY
  name: string
}

export async function getCountries(): Promise<Country[]> {
  let nagerCountries: Country[] = []
  try {
    const res = await fetch('https://date.nager.at/api/v3/AvailableCountries', {
      next: { revalidate: 604800 }, // 7 days
    })
    if (res.ok) {
      const data = await res.json()
      nagerCountries = data.map((c: { countryCode: string; name: string }) => ({
        countryCode: c.countryCode,
        name: c.name,
      }))
    }
  } catch {
    // If Nager is down, fall back to static list only
  }

  // Merge: add static countries that are NOT already in the Nager list
  const nagerCodes = new Set(nagerCountries.map(c => c.countryCode.toUpperCase()))
  const missingStatic = STATIC_COUNTRIES.filter(c => !nagerCodes.has(c.countryCode.toUpperCase()))

  const merged = [...nagerCountries, ...missingStatic]
  return merged.sort((a, b) => a.name.localeCompare(b.name))
}

export async function getPublicHolidays(year: number, countryCode: string): Promise<HolidayWithName[]> {
  const upper = countryCode.toUpperCase()

  // Check if we have static data for this country
  if (isStaticCountry(upper)) {
    const staticData = getStaticHolidays(year, upper)
    if (staticData !== null) {
      return staticData.map(h => ({
        date: nagerDateToAlgorithmDate(h.date),
        name: h.name || h.localName,
      }))
    }
  }

  // Otherwise fetch from Nager.Date
  const res = await fetch(
    `https://date.nager.at/api/v3/PublicHolidays/${year}/${upper}`,
    { next: { revalidate: 86400 } } // 1 day
  )
  // 204 = no data for this country/year
  if (res.status === 204) return []
  if (!res.ok) throw new ExternalApiError(`Failed to fetch holidays: ${res.status}`)
  const data = await res.json()
  return data.map((h: { date: string; localName: string; name: string }) => ({
    date: nagerDateToAlgorithmDate(h.date),
    name: h.name || h.localName,
  }))
}
