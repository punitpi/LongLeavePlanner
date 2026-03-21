'use client'

import { useState, useEffect, useCallback } from 'react'
import { Toggle } from '@/components/ui/Toggle'
import type { Country, PreviewItem } from '@/lib/types'
import { cacheGet, cacheSet, TTL_HOLIDAYS } from '@/lib/clientCache'
import { formatDateString } from '@/lib/algorithm'

type AddMode = 'manual' | 'csv'

interface HolidayInputProps {
  year: number
  country: Country | null
  onHolidaysChange: (holidays: PreviewItem[]) => void
  onModeChange?: (mode: string) => void
}

const TOGGLE_OPTIONS = [
  { value: 'manual', label: 'Pick dates' },
  { value: 'csv', label: 'CSV' },
]

const DATE_REGEX = /^\d{2}-\d{2}-\d{4}$/

function parseCsvDates(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && line !== 'date' && DATE_REGEX.test(line))
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

function MiniCalendar({ year, autoHolidayDates, extraDates, onToggle }: {
  year: number
  autoHolidayDates: Set<string>   // from country API — shown in green, not togglable
  extraDates: Set<string>          // user-added manual dates — shown in primary blue
  onToggle: (date: string) => void
}) {
  const [month, setMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(year)

  const days = getDaysInMonth(calYear, month)
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
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 rounded-full hover:bg-surface-container">
          <span className="material-symbols-outlined text-lg text-on-surface-variant">chevron_left</span>
        </button>
        <span className="font-headline font-bold text-on-surface">{MONTH_NAMES[month]} {calYear}</span>
        <button onClick={nextMonth} className="p-1 rounded-full hover:bg-surface-container">
          <span className="material-symbols-outlined text-lg text-on-surface-variant">chevron_right</span>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center font-label text-xs text-on-surface-variant/60 font-bold uppercase py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array(firstDayOfWeek).fill(null).map((_, i) => <div key={`e${i}`} />)}
        {days.map(day => {
          const dateStr = formatDateString(day)
          const isAuto = autoHolidayDates.has(dateStr)
          const isExtra = extraDates.has(dateStr)

          let cls = 'h-9 w-full rounded-lg font-headline text-sm font-bold transition-all '
          if (isAuto && isExtra) {
            // manually added on top of an auto holiday — show both signals
            cls += 'bg-tertiary-fixed text-on-tertiary-fixed ring-2 ring-primary'
          } else if (isAuto) {
            // auto holiday — green, not clickable to remove (use preview list)
            cls += 'bg-tertiary-fixed text-on-tertiary-fixed cursor-default'
          } else if (isExtra) {
            cls += 'bg-primary text-white'
          } else {
            cls += 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
          }

          return (
            <button
              key={dateStr}
              onClick={() => !isAuto && onToggle(dateStr)}
              className={cls}
              title={isAuto ? 'Public holiday (edit in list)' : undefined}
            >
              {day.getDate()}
            </button>
          )
        })}
      </div>
      {autoHolidayDates.size > 0 && (
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-outline-variant/10">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-tertiary-fixed" />
            <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-wide">Public holiday</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-wide">Added by you</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function HolidayInput({ year, country, onHolidaysChange, onModeChange }: HolidayInputProps) {
  const [addMode, setAddMode] = useState<AddMode>('manual')
  const [loading, setLoading] = useState(false)
  const [autoHolidays, setAutoHolidays] = useState<PreviewItem[]>([])
  const [manualDates, setManualDates] = useState<Set<string>>(new Set())
  const [csvDates, setCsvDates] = useState<Set<string>>(new Set())
  const [dragging, setDragging] = useState(false)

  // Derive the merged list whenever any source changes
  useEffect(() => {
    const autoSet = new Map(autoHolidays.map(h => [h.date, h]))
    const extras: PreviewItem[] = []
    for (const date of Array.from(manualDates)) {
      if (!autoSet.has(date)) extras.push({ date })
    }
    for (const date of Array.from(csvDates)) {
      if (!autoSet.has(date) && !manualDates.has(date)) extras.push({ date })
    }
    onHolidaysChange([...autoHolidays, ...extras])
  }, [autoHolidays, manualDates, csvDates]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-fetch when country or year changes
  useEffect(() => {
    if (!country) {
      setAutoHolidays([])
      return
    }
    const cacheKey = `holidays:${country.countryCode}:${year}`
    const cached = cacheGet<PreviewItem[]>(cacheKey)
    if (cached) {
      setAutoHolidays(cached)
      return
    }
    setLoading(true)
    fetch(`/api/holidays?country=${country.countryCode}&year=${year}`)
      .then(r => r.json())
      .then((data: { date: string; name: string }[] | string[]) => {
        const items: PreviewItem[] = Array.isArray(data)
          ? data.map(item =>
              typeof item === 'string'
                ? { date: item }
                : { date: item.date, label: item.name }
            )
          : []
        cacheSet(cacheKey, items, TTL_HOLIDAYS)
        setAutoHolidays(items)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [country, year]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleModeChange = (newMode: string) => {
    setAddMode(newMode as AddMode)
    onModeChange?.(newMode)
  }

  const handleCsvFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const dates = parseCsvDates(text)
      setCsvDates(prev => new Set([...Array.from(prev), ...dates]))
    }
    reader.readAsText(file)
  }, [])

  const toggleManualDate = (date: string) => {
    setManualDates(prev => {
      const next = new Set(prev)
      if (next.has(date)) next.delete(date)
      else next.add(date)
      return next
    })
  }

  const autoHolidayDateSet = new Set(autoHolidays.map(h => h.date))
  const extraCount = manualDates.size + csvDates.size

  return (
    <div className="space-y-4">
      {/* Auto-loaded holidays status */}
      <div>
        {!country ? (
          <p className="text-sm text-on-surface-variant font-body bg-surface-container-low rounded-lg p-4">
            Select a country above to auto-load public holidays, or pick dates manually below.
          </p>
        ) : loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 rounded-lg bg-surface-container-low animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3 bg-surface-container-low rounded-lg">
            <span className="material-symbols-outlined text-tertiary-fixed text-lg">event_available</span>
            <p className="text-sm text-on-surface-variant font-body flex-1">
              <span className="font-semibold text-on-surface">{autoHolidays.length}</span> public holidays loaded for {country.name} {year}
              {extraCount > 0 && (
                <span className="ml-1">+ <span className="font-semibold text-primary">{extraCount}</span> added by you</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Add extra dates */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            Add more dates
          </label>
          <Toggle options={TOGGLE_OPTIONS} value={addMode} onChange={handleModeChange} />
        </div>

        {addMode === 'manual' && (
          <MiniCalendar
            year={year}
            autoHolidayDates={autoHolidayDateSet}
            extraDates={manualDates}
            onToggle={toggleManualDate}
          />
        )}

        {addMode === 'csv' && (
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
                Dates are added on top of any already loaded
              </p>
              {csvDates.size > 0 && (
                <p className="mt-2 font-label text-xs text-primary font-bold">
                  {csvDates.size} dates added from CSV
                </p>
              )}
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
    </div>
  )
}
