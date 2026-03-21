'use client'

import type { LeaveCluster } from '@/lib/types'

interface OpportunityCardProps {
  cluster: LeaveCluster
  holidayLabels?: Record<string, string>
  isActive?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

function formatDisplayDate(isoDate: string): string {
  // Convert YYYY-MM-DD to "Dec 24" style
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function OpportunityCard({ cluster, holidayLabels, isActive, onMouseEnter, onMouseLeave }: OpportunityCardProps) {
  const dateRange = `${formatDisplayDate(cluster.startDate)} – ${formatDisplayDate(cluster.endDate)}`

  return (
    <div
      className="relative group"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Hover glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container rounded-lg opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />

      <div className={`bg-surface-container-lowest p-6 rounded-lg shadow-[0_10px_20px_rgba(86,67,56,0.03)] flex flex-col gap-5 transition-all ${
        isActive ? 'ring-2 ring-primary/30' : 'border border-transparent hover:border-primary-container/20'
      }`}>
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-2xl flex-shrink-0">
            {cluster.emoji}
          </div>
          <span className="font-label text-[10px] font-black text-on-tertiary-fixed-variant bg-tertiary-fixed px-3 py-1 rounded-full uppercase tracking-tighter">
            Total Days Off: {cluster.totalDays}
          </span>
        </div>

        {/* Date info */}
        <div>
          <h4 className="font-headline text-lg font-bold text-on-surface">
            {cluster.emoji} Break
          </h4>
          <p className="text-sm text-on-surface-variant font-medium font-body">{dateRange}</p>
          {/* Holiday names in this cluster */}
          {(() => {
            if (!holidayLabels) return null
            const names = cluster.days
              .filter(d => !d.needToApply && holidayLabels[d.dateString])
              .map(d => holidayLabels[d.dateString])
            const unique = Array.from(new Set(names))
            if (unique.length === 0) return null
            return (
              <div className="flex flex-wrap gap-1 mt-1">
                {unique.map(name => (
                  <span key={name} className="font-label text-[9px] uppercase font-bold text-tertiary bg-tertiary-fixed/30 px-2 py-0.5 rounded-full">
                    {name}
                  </span>
                ))}
              </div>
            )
          })()}
        </div>

        {/* Leave requirement box */}
        {cluster.leaveDaysRequired > 0 ? (
          <div className="p-4 bg-primary-fixed/30 rounded-lg flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">event_note</span>
            <div>
              <p className="text-xs font-bold text-on-primary-fixed-variant uppercase tracking-wide font-label">
                Apply leave:
              </p>
              <p className="text-sm font-semibold text-primary font-body">
                {cluster.leaveDaysRequired} day{cluster.leaveDaysRequired !== 1 ? 's' : ''} needed
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-surface-container-low rounded-lg flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary">info</span>
            <div>
              <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-wide font-label">
                No Leave Required
              </p>
              <p className="text-sm font-semibold text-on-surface-variant font-body">Pure holiday cluster</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
