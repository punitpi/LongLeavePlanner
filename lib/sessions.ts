import type { Session } from './types'

const STORAGE_KEY = 'llp_sessions'
const MAX_SESSIONS = 10

export function getSessions(): Session[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Session[]
  } catch {
    return []
  }
}

export function saveSession(session: Session): void {
  if (typeof window === 'undefined') return
  const existing = getSessions()
  // Remove any with same id
  const filtered = existing.filter(s => s.id !== session.id)
  // Add new at front, keep max 10
  const updated = [session, ...filtered].slice(0, MAX_SESSIONS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function deleteSession(id: string): Session[] {
  if (typeof window === 'undefined') return []
  const existing = getSessions()
  const updated = existing.filter(s => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export function generateSessionLabel(
  country: { name: string } | null,
  inputMode: string,
  year: number
): string {
  if (inputMode === 'auto' && country) return `${country.name} ${year}`
  if (inputMode === 'manual') return `Manual ${year}`
  if (inputMode === 'csv') return `CSV ${year}`
  return `Plan ${year}`
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
