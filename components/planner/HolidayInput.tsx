'use client'

import { useState, useEffect, useCallback } from 'react'
import { Toggle } from '@/components/ui/Toggle'
import type { Country, PreviewItem } from '@/lib/types'

type InputMode = 'auto' | 'manual' | 'csv'

interface HolidayInputProps {
  year: number
  country: Country | null
  onHolidaysChange: (holidays: PreviewItem[]) => void
  onModeChange?: (mode: string) => void
}

const TOGGLE_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'manual', label: 'Manual' },
  { value: 'csv', label: 'CSV' },
]

const DATE_REGEX = /^\d{2}-\d{2}-\d{4}$/

function parseCsvDates(text: string): PreviewItem[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && line !== 'date' && DATE_REGEX.test(line))
    .map((date) => ({ date }))
}

function formatDDMMYYYY(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()
  return `${d}-${m}-${y}`
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const date = new Date(year, month, 1)
  while (date.getMonth() === month) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  return days
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Mini calendar for manual mode
function MiniCalendar({ year, selectedDates, onToggle }: {
  year: number
  selectedDates: Set<string>
  onToggle: (date: string) => void
}) {
  const [month, setMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(year)

  const days = getDaysInMonth(calYear, month)
  // Monday-start offset
  const firstDayOfWeek = (days[0].getDay() + 6) % 7

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setCalYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setCalYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  return (
    <div className="bg-surface-container-low rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1 rounded-full hover:bg-surface-container">
          <span className="material-symbols-outlined text-lg text-on-surface-variant">chevron_left</span>
        </button>
        <span className="font-headline font-bold text-on-surface">{MONTH_NAMES[month]} {calYear}</span>
        <button onClick={nextMonth} className="p-1 rounded-full hover:bg-surface-container">
          <span className="material-symbols-outlined text-lg text-on-surface-variant">chevron_right</span>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center font-label text-xs text-on-surface-variant/60 font-bold uppercase py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array(firstDayOfWeek).fill(null).map((_, i) => <div key={`e${i}`} />)}
        {days.map(day => {
          const dateStr = formatDDMMYYYY(day)
          const selected = selectedDates.has(dateStr)
          return (
            <button
              key={dateStr}
              onClick={() => onToggle(dateStr)}
              className={`h-9 w-full rounded-lg font-headline text-sm font-bold transition-all ${
                selected
                  ? 'bg-primary text-white'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
              }`}
            >
              {day.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function HolidayInput({ year, country, onHolidaysChange, onModeChange }: HolidayInputProps) {
  const [mode, setMode] = useState<InputMode>('auto')
  const [loading, setLoading] = useState(false)
  const [autoHolidays, setAutoHolidays] = useState<PreviewItem[]>([])
  const [manualDates, setManualDates] = useState<Set<string>>(new Set())
  const [dragging, setDragging] = useState(false)

  // Auto-fetch when country or year changes in auto mode
  useEffect(() => {
    if (mode !== 'auto' || !country) return
    setLoading(true)
    fetch(`/api/holidays?country=${country.countryCode}&year=${year}`)
      .then(r => r.json())
      .then((data: { date: string; name: string }[] | string[]) => {
        // Handle both old string[] format and new {date, name}[] format
        const items: PreviewItem[] = Array.isArray(data)
          ? data.map(item =>
              typeof item === 'string'
                ? { date: item }
                : { date: item.date, label: item.name }
            )
          : []
        setAutoHolidays(items)
        onHolidaysChange(items)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [country, year, mode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Manual: sync to parent when manualDates changes
  useEffect(() => {
    if (mode !== 'manual') return
    const items: PreviewItem[] = Array.from(manualDates).map(date => ({ date }))
    onHolidaysChange(items)
  }, [manualDates, mode]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleModeChange = (newMode: string) => {
    setMode(newMode as InputMode)
    onModeChange?.(newMode)
    if (newMode === 'auto' && country) {
      onHolidaysChange(autoHolidays)
    } else if (newMode === 'manual') {
      const items: PreviewItem[] = Array.from(manualDates).map(date => ({ date }))
      onHolidaysChange(items)
    } else if (newMode === 'csv') {
      onHolidaysChange([])
    }
  }

  const handleCsvFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const items = parseCsvDates(text)
      onHolidaysChange(items)
    }
    reader.readAsText(file)
  }, [onHolidaysChange])

  const toggleManualDate = (date: string) => {
    setManualDates(prev => {
      const next = new Set(prev)
      if (next.has(date)) next.delete(date)
      else next.add(date)
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
          Input Method
        </label>
        <Toggle options={TOGGLE_OPTIONS} value={mode} onChange={handleModeChange} />
      </div>

      {mode === 'auto' && (
        <div>
          {!country ? (
            <p className="text-sm text-on-surface-variant font-body bg-surface-container-low rounded-lg p-4">
              Select a country above to auto-load public holidays.
            </p>
          ) : loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => (
                <div key={i} className="h-10 rounded-lg bg-surface-container-low animate-pulse" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant font-body bg-surface-container-low rounded-lg p-4">
              {autoHolidays.length} public holidays loaded for {country.name} {year}.
              Remove any you don&apos;t want from the preview list.
            </p>
          )}
        </div>
      )}

      {mode === 'manual' && (
        <MiniCalendar
          year={year}
          selectedDates={manualDates}
          onToggle={toggleManualDate}
        />
      )}

      {mode === 'csv' && (
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              const file = e.dataTransfer.files[0]
              if (file) handleCsvFile(file)
            }}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragging ? 'border-primary bg-primary/5' : 'border-outline-variant/30 bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 block mb-2">upload_file</span>
            <p className="font-body text-sm text-on-surface-variant mb-2">
              Drag & drop a CSV file, or{' '}
              <label className="text-primary font-semibold cursor-pointer hover:underline">
                browse
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleCsvFile(file)
                  }}
                />
              </label>
            </p>
            <p className="font-label text-xs text-on-surface-variant/50 uppercase tracking-wide">
              CSV with date column, DD-MM-YYYY format
            </p>
          </div>
          <div className="mt-3 text-center">
            <a
              href="/template.csv"
              download
              className="font-label text-xs text-secondary font-bold hover:underline uppercase tracking-wide"
            >
              Download CSV Template
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
