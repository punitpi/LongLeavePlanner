'use client'

import { useMemo } from 'react'
import type { LeaveCluster } from '@/lib/types'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface LeaveCalendarProps {
  year: number
  month: number  // 0-indexed
  clusters: LeaveCluster[]
  activeClusterId?: string | null
  onMonthChange: (month: number) => void
}

export function LeaveCalendar({ year, month, clusters, activeClusterId, onMonthChange }: LeaveCalendarProps) {
  // Build a map of dateString (YYYY-MM-DD) -> 'holiday' | 'apply'
  const dateMap = useMemo(() => {
    const map = new Map<string, 'holiday' | 'apply'>()
    for (const cluster of clusters) {
      for (const day of cluster.days) {
        map.set(day.dateString, day.needToApply ? 'apply' : 'holiday')
      }
    }
    return map
  }, [clusters])

  // Build the calendar grid
  const { cells, totalCells } = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    // Convert Sunday=0 to Monday-start offset
    const offset = (firstDay.getDay() + 6) % 7
    const total = 42 // always 6 rows
    return { cells: { offset, daysInMonth }, totalCells: total }
  }, [year, month])

  const today = new Date()
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  const getDateString = (day: number) => {
    const m = String(month + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${year}-${m}-${d}`
  }

  // Find active cluster's date range for highlighting
  const activeCluster = activeClusterId ? clusters.find(c => c.id === activeClusterId) : null
  const activeDates = useMemo(() => {
    if (!activeCluster) return new Set<string>()
    return new Set(activeCluster.days.map(d => d.dateString))
  }, [activeCluster])

  const renderCell = (day: number) => {
    const dateStr = getDateString(day)
    const type = dateMap.get(dateStr)
    const isTodayDate = isToday(day)
    const isActive = activeDates.has(dateStr)

    let cellClass = 'h-20 rounded-2xl flex flex-col items-center justify-center relative transition-all '
    let numClass = 'font-headline font-bold text-lg '
    let label: string | null = null

    if (type === 'holiday') {
      cellClass += 'bg-tertiary-fixed hover:scale-105 cursor-default '
      numClass += 'text-on-tertiary-fixed '
    } else if (type === 'apply') {
      cellClass += 'bg-primary-container/20 border-2 border-dashed border-primary cursor-default '
      numClass += 'text-primary '
      label = 'APPLY LEAVE'
    } else {
      cellClass += 'bg-surface-container-low '
      numClass += 'text-on-surface '
    }

    if (isTodayDate) {
      cellClass += 'ring-2 ring-primary ring-offset-1 '
    }

    if (isActive && !type) {
      cellClass += 'ring-2 ring-secondary '
    }

    return (
      <div key={dateStr} className={cellClass}>
        <span className={numClass}>{day}</span>
        {label && (
          <span className="text-[8px] uppercase font-black text-primary tracking-tighter leading-none mt-0.5">
            {label}
          </span>
        )}
      </div>
    )
  }

  const prevMonth = () => {
    if (month === 0) onMonthChange(11)
    else onMonthChange(month - 1)
  }
  const nextMonth = () => {
    if (month === 11) onMonthChange(0)
    else onMonthChange(month + 1)
  }

  return (
    <div>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-headline text-2xl font-bold text-on-surface">
          {MONTH_NAMES[month]} {year}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-surface-container transition-colors"
            aria-label="Previous month"
          >
            <span className="material-symbols-outlined text-on-surface-variant">chevron_left</span>
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-surface-container transition-colors"
            aria-label="Next month"
          >
            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Day Name Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center font-label text-xs text-on-surface-variant/60 font-bold uppercase py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells before day 1 */}
        {Array(cells.offset).fill(null).map((_, i) => (
          <div key={`empty-${i}`} className="h-20" />
        ))}
        {/* Day cells */}
        {Array(cells.daysInMonth).fill(null).map((_, i) => renderCell(i + 1))}
        {/* Fill remaining cells to complete 6 rows */}
        {Array(Math.max(0, totalCells - cells.offset - cells.daysInMonth)).fill(null).map((_, i) => (
          <div key={`end-${i}`} className="h-20" />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-outline-variant/10 flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-tertiary-container" />
          <span className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Public Holiday / Weekend
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-primary-container" />
          <span className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Recommended Leave
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-surface-container-highest" />
          <span className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Standard Working Day
          </span>
        </div>
      </div>
    </div>
  )
}
