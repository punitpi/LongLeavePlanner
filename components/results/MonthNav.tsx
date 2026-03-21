'use client'

import type { LeaveCluster } from '@/lib/types'

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface MonthNavProps {
  currentMonth: number  // 0-indexed
  year: number
  clusters: LeaveCluster[]
  onMonthSelect: (month: number) => void
}

export function MonthNav({ currentMonth, year, clusters, onMonthSelect }: MonthNavProps) {
  // Find which months have clusters
  const monthsWithClusters = new Set<number>()
  for (const cluster of clusters) {
    // startDate is YYYY-MM-DD
    const month = parseInt(cluster.startDate.split('-')[1], 10) - 1
    monthsWithClusters.add(month)
    // Also check endDate
    const endMonth = parseInt(cluster.endDate.split('-')[1], 10) - 1
    monthsWithClusters.add(endMonth)
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mt-6">
      {MONTH_ABBR.map((abbr, i) => {
        const isActive = i === currentMonth
        const hasClusters = monthsWithClusters.has(i)
        return (
          <button
            key={abbr}
            onClick={() => onMonthSelect(i)}
            className={`flex-shrink-0 relative px-5 py-3 rounded-lg font-label font-bold text-sm transition-all ${
              isActive
                ? 'bg-surface-container-highest text-on-surface'
                : 'bg-surface-container-low text-on-surface-variant/60 hover:text-on-surface-variant'
            }`}
          >
            {abbr}
            {hasClusters && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-tertiary" />
            )}
          </button>
        )
      })}
    </div>
  )
}
