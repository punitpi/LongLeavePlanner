/**
 * Simple in-memory cache for client-side API responses.
 * Survives re-renders and component remounts within the same browser session.
 * TTLs are generous since the underlying data (holidays, countries) rarely changes.
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const cache = new Map<string, CacheEntry<unknown>>()

export function cacheGet<T>(key: string): T | undefined {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return undefined
  }
  return entry.value
}

export function cacheSet<T>(key: string, value: T, ttlMs: number): void {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs })
}

// TTL constants
export const TTL_COUNTRIES = 7 * 24 * 60 * 60 * 1000  // 7 days
export const TTL_HOLIDAYS  = 24 * 60 * 60 * 1000       // 1 day
