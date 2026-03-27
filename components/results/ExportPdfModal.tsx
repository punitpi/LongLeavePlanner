'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { buildShareUrl } from '@/lib/exportUtils'
import type { Session } from '@/lib/types'

export interface PrintConfig {
  session: Session
  includeSummary: boolean
  includeCalendar: boolean
  includeHolidayList: boolean
  clusterIds: string[]
}

interface ExportPdfModalProps {
  session: Session
  onClose: () => void
}

export function ExportPdfModal({ session, onClose }: ExportPdfModalProps) {
  const [includeSummary, setIncludeSummary] = useState(true)
  const [includeCalendar, setIncludeCalendar] = useState(true)
  const [includeHolidayList, setIncludeHolidayList] = useState(true)
  const [selectedClusterIds, setSelectedClusterIds] = useState<Set<string>>(
    new Set(session.clusters.map((c) => c.id))
  )

  const toggleCluster = (id: string) => {
    setSelectedClusterIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleGenerate = async () => {
    const shareUrl = await buildShareUrl(session)
    const config = {
      session,
      includeSummary,
      includeCalendar,
      includeHolidayList,
      clusterIds: Array.from(selectedClusterIds),
      shareUrl,
    }
    sessionStorage.setItem('llp_print_config', JSON.stringify(config))
    window.open('/print', '_blank')
    onClose()
  }

  const allSelected = selectedClusterIds.size === session.clusters.length
  const toggleAllClusters = () => {
    if (allSelected) {
      setSelectedClusterIds(new Set())
    } else {
      setSelectedClusterIds(new Set(session.clusters.map((c) => c.id)))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-xl font-bold text-on-surface">Export PDF</h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">Sections</p>
          {[
            { label: 'Summary stats', value: includeSummary, set: setIncludeSummary },
            { label: 'Full year calendar', value: includeCalendar, set: setIncludeCalendar },
            { label: 'Holiday reference list', value: includeHolidayList, set: setIncludeHolidayList },
          ].map(({ label, value, set }) => (
            <label key={label} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => set(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="font-body text-sm text-on-surface">{label}</span>
            </label>
          ))}
        </div>

        {/* Clusters */}
        {session.clusters.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">Clusters</p>
              <button
                onClick={toggleAllClusters}
                className="font-label text-xs text-primary hover:underline"
              >
                {allSelected ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            {session.clusters.map((cluster) => {
              const start = new Date(cluster.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
              const end = new Date(cluster.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
              return (
                <label key={cluster.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedClusterIds.has(cluster.id)}
                    onChange={() => toggleCluster(cluster.id)}
                    className="w-4 h-4 accent-primary shrink-0"
                  />
                  <span className="font-body text-sm text-on-surface flex-1">
                    {cluster.emoji} {start} – {end}
                  </span>
                  <span className="font-label text-xs text-on-surface-variant shrink-0">
                    {cluster.totalDays}d · {cluster.leaveDaysRequired} leave
                  </span>
                </label>
              )
            })}
          </div>
        )}

        {/* Footer note */}
        <div className="bg-surface-container rounded-lg px-4 py-3 text-xs text-on-surface-variant font-body">
          PDF will include a subtle footer with the app URL + a QR code linking back to this plan.
        </div>

        <Button
          variant="primary"
          onClick={handleGenerate}
          className="w-full"
          disabled={selectedClusterIds.size === 0 && !includeSummary && !includeCalendar && !includeHolidayList}
        >
          Generate PDF
        </Button>
      </div>
    </div>
  )
}
