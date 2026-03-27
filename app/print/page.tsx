'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import type { Session, LeaveCluster } from '@/lib/types'

interface PrintConfig {
  session: Session
  includeSummary: boolean
  includeCalendar: boolean
  includeHolidayList: boolean
  clusterIds: string[]
  shareUrl: string
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function MonthGrid({ year, month, clusters, holidayLabels }: {
  year: number
  month: number
  clusters: LeaveCluster[]
  holidayLabels: Record<string, string>
}) {
  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const holidayDates = new Set(Object.keys(holidayLabels))
  const leaveDates = new Set<string>()
  const clusterDates = new Set<string>()

  for (const cluster of clusters) {
    for (const day of cluster.days) {
      clusterDates.add(day.dateString)
      if (day.needToApply) leaveDates.add(day.dateString)
    }
  }

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const cellStyle = (dayNum: number | null): React.CSSProperties => {
    if (!dayNum) return { background: 'transparent', border: '1px solid transparent' }
    const m = String(month + 1).padStart(2, '0')
    const d = String(dayNum).padStart(2, '0')
    const ds = `${year}-${m}-${d}`
    if (holidayDates.has(ds)) return { background: '#dcfce7', border: '1px solid #86efac' }
    if (leaveDates.has(ds)) return { background: '#dbeafe', border: '1px solid #93c5fd' }
    if (clusterDates.has(ds)) return { background: '#ede9fe', border: '1px solid #c4b5fd' }
    return { background: '#f8fafc', border: '1px solid #e2e8f0' }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 5, color: '#1e293b' }}>
        {MONTH_NAMES[month]}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 8, fontWeight: 600, color: '#94a3b8', padding: '2px 0' }}>
            {d}
          </div>
        ))}
        {cells.map((dayNum, i) => (
          <div
            key={i}
            style={{
              textAlign: 'center',
              fontSize: 9,
              padding: '3px 1px',
              borderRadius: 2,
              color: dayNum ? '#1e293b' : 'transparent',
              ...cellStyle(dayNum),
            }}
          >
            {dayNum ?? '·'}
          </div>
        ))}
      </div>
    </div>
  )
}

function QRCodeCanvas({ url, onReady }: { url: string; onReady: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, { width: 64, margin: 1 })
        .then(onReady)
        .catch(onReady) // call onReady even on error so printing doesn't stall
    }
  }, [url, onReady])

  return (
    <div style={{ textAlign: 'center' }}>
      <canvas ref={canvasRef} />
      <div style={{ fontSize: 8, color: '#94a3b8', marginTop: 3 }}>Scan to open plan</div>
    </div>
  )
}

export default function PrintPage() {
  const [config, setConfig] = useState<PrintConfig | null>(null)
  const [qrReady, setQrReady] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('llp_print_config')
    if (!raw) return
    const parsed = JSON.parse(raw) as PrintConfig
    setConfig(parsed)
    // Set document title to control the PDF filename
    document.title = parsed.session.label
  }, [])

  // Only print once the QR code has rendered
  useEffect(() => {
    if (config && qrReady) {
      // Small delay to let the canvas paint finish
      setTimeout(() => window.print(), 300)
    }
  }, [config, qrReady])

  if (!config) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif', color: '#64748b' }}>
        Loading...
      </div>
    )
  }

  const { session, includeSummary, includeCalendar, includeHolidayList, clusterIds, shareUrl } = config
  const selectedClusters = session.clusters.filter(c => clusterIds.includes(c.id))
  const holidays = Object.entries(session.holidayLabels).sort(([a], [b]) => a.localeCompare(b))
  // Use the actual app origin, not any hardcoded domain
  const appUrl = window.location.origin

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; background: white; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }

        @media print {
          /* margin: 0 removes the browser's built-in header/footer (URL, page number, date).
             Page padding is handled by the content wrapper instead. */
          @page {
            size: A4;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            padding: 1.5cm 1.5cm 2cm;
          }

          .page-break { page-break-before: always; break-before: page; }
          .no-break { page-break-inside: avoid; break-inside: avoid; }

          /* Fixed footer on every printed page */
          .print-footer {
            position: fixed;
            bottom: 0.4cm;
            left: 1.5cm;
            right: 1.5cm;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-top: 1px solid #e2e8f0;
            padding-top: 4px;
            font-size: 9px;
            color: #94a3b8;
            background: white;
          }
        }

        @media screen {
          .print-footer { display: none; }
        }
      `}</style>

      {/* Fixed print footer — appears on every page */}
      <div className="print-footer">
        <span>Made with <strong style={{ color: '#6366f1' }}>Long Leave Planner</strong> · {appUrl}</span>
        <span>{session.label}</span>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 40px', fontSize: 13, lineHeight: 1.5, color: '#1e293b' }}>

        {/* Page header */}
        <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: 16, marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6366f1', marginBottom: 6 }}>
              Long Leave Planner
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: '#0f172a', lineHeight: 1.1 }}>
              {session.label}
            </h1>
            <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 12 }}>
              Generated {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <QRCodeCanvas url={shareUrl} onReady={() => setQrReady(true)} />
          </div>
        </div>

        {/* Summary stats */}
        {includeSummary && (
          <div className="no-break" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
            {[
              { label: 'Total Days Off', value: session.summary.totalDaysOff },
              { label: 'Leave Days Used', value: session.summary.leaveDaysUsed },
              { label: 'Efficiency', value: session.summary.efficiencyPercent != null ? `${Math.round(session.summary.efficiencyPercent)}%` : '—' },
              { label: 'Clusters Found', value: session.summary.clustersFound },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{value}</div>
                <div style={{ fontSize: 9, color: '#64748b', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Calendar */}
        {includeCalendar && (
          <div className="page-break" style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
              Year Calendar — {session.year}
            </h2>
            <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
              {[
                { color: '#dcfce7', border: '#86efac', label: 'Public holiday' },
                { color: '#dbeafe', border: '#93c5fd', label: 'Apply leave' },
                { color: '#ede9fe', border: '#c4b5fd', label: 'Weekend in cluster' },
              ].map(({ color, border, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10 }}>
                  <div style={{ width: 11, height: 11, background: color, border: `1px solid ${border}`, borderRadius: 2, flexShrink: 0 }} />
                  <span style={{ color: '#64748b' }}>{label}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {Array.from({ length: 12 }, (_, i) => (
                <MonthGrid
                  key={i}
                  year={session.year}
                  month={i}
                  clusters={session.clusters}
                  holidayLabels={session.holidayLabels}
                />
              ))}
            </div>
          </div>
        )}

        {/* Cluster cards */}
        {selectedClusters.length > 0 && (
          <div className="page-break" style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
              Leave Opportunities
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {selectedClusters.map((cluster) => {
                const clusterHolidays = cluster.days
                  .filter(d => !d.needToApply && session.holidayLabels[d.dateString])
                  .map(d => session.holidayLabels[d.dateString])
                  .filter((v, i, arr) => arr.indexOf(v) === i)

                return (
                  <div key={cluster.id} className="no-break" style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', background: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 18 }}>{cluster.emoji}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                          {formatDate(cluster.startDate)} – {formatDate(cluster.endDate)}
                        </span>
                      </div>
                      <div style={{ background: '#f1f5f9', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700, color: '#475569', flexShrink: 0 }}>
                        {cluster.totalDays}d
                      </div>
                    </div>
                    {clusterHolidays.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                        {clusterHolidays.map(h => (
                          <span key={h} style={{ background: '#dcfce7', color: '#166534', fontSize: 9, padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>
                            {h}
                          </span>
                        ))}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: '#475569', background: '#f8fafc', borderRadius: 6, padding: '6px 10px' }}>
                      {cluster.leaveDaysRequired === 0
                        ? '✨ Pure holiday — no leave needed'
                        : `📋 Apply ${cluster.leaveDaysRequired} leave day${cluster.leaveDaysRequired > 1 ? 's' : ''}`}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Holiday reference */}
        {includeHolidayList && holidays.length > 0 && (
          <div className="no-break" style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
              Holiday Reference
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <tbody>
                {Array.from({ length: Math.ceil(holidays.length / 2) }, (_, row) => (
                  <tr key={row}>
                    {[0, 1].map(col => {
                      const entry = holidays[row * 2 + col]
                      if (!entry) return <td key={col} style={{ width: '50%' }} />
                      const [dateStr, name] = entry
                      return (
                        <td key={col} style={{ padding: '4px 16px 4px 0', verticalAlign: 'top', width: '50%' }}>
                          <span style={{ color: '#64748b', display: 'inline-block', minWidth: 72 }}>
                            {new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                          <span style={{ color: '#1e293b' }}>{name}</span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </>
  )
}
