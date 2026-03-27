import type { Session } from './types'

// Compress bytes using DecompressionStream (built into modern browsers, no library needed)
async function compress(str: string): Promise<string> {
  const bytes = new TextEncoder().encode(str)
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(bytes)
      controller.close()
    },
  })
  const compressed = stream.pipeThrough(new CompressionStream('deflate-raw'))
  const chunks: Uint8Array[] = []
  const reader = compressed.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }
  const merged = new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0))
  let offset = 0
  for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.length }
  return btoa(Array.from(merged).map(b => String.fromCharCode(b)).join(''))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function decompress(encoded: string): Promise<string> {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const stream = new ReadableStream({
    start(controller) { controller.enqueue(bytes); controller.close() },
  })
  const decompressed = stream.pipeThrough(new DecompressionStream('deflate-raw'))
  const chunks: Uint8Array[] = []
  const reader = decompressed.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }
  const merged = new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0))
  let offset = 0
  for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.length }
  return new TextDecoder().decode(merged)
}

export async function encodeSession(session: Session): Promise<string> {
  // Strip `days` from each cluster — it's large and reconstructible from startDate/endDate/holidayLabels
  const slim = {
    ...session,
    clusters: session.clusters.map(({ days: _days, ...rest }) => rest),
  }
  return compress(JSON.stringify(slim))
}

function rebuildDays(startDate: string, endDate: string, holidayLabels: Record<string, string>): import('./types').LeaveDay[] {
  const days: import('./types').LeaveDay[] = []
  const cur = new Date(startDate)
  const end = new Date(endDate)
  while (cur <= end) {
    const y = cur.getFullYear()
    const m = String(cur.getMonth() + 1).padStart(2, '0')
    const d = String(cur.getDate()).padStart(2, '0')
    const dateString = `${y}-${m}-${d}`
    const dow = cur.getDay()
    const isWeekend = dow === 0 || dow === 6
    const isHoliday = dateString in holidayLabels
    days.push({ date: new Date(cur), dateString, needToApply: !isWeekend && !isHoliday })
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

export async function decodeSession(encoded: string): Promise<Session | null> {
  try {
    const json = await decompress(encoded)
    const obj = JSON.parse(json) as Session
    if (!obj.id || !obj.label || !obj.year || !Array.isArray(obj.clusters)) return null
    // Rebuild days array that was stripped during encoding
    obj.clusters = obj.clusters.map(c => ({
      ...c,
      days: c.days ?? rebuildDays(c.startDate, c.endDate, obj.holidayLabels),
    }))
    return obj
  } catch {
    return null
  }
}

export async function buildShareUrl(session: Session): Promise<string> {
  const encoded = await encodeSession(session)
  return `${window.location.origin}/results#plan=${encoded}`
}

export function downloadJson(session: Session): void {
  const json = JSON.stringify(session, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `llp-${session.label.replace(/\s+/g, '-')}-${session.year}.json`
  a.click()
  URL.revokeObjectURL(url)
}
