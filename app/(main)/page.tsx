'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { YearSelector } from '@/components/planner/YearSelector'
import { CountrySelector } from '@/components/planner/CountrySelector'
import { HolidayInput } from '@/components/planner/HolidayInput'
import { HolidayPreview } from '@/components/planner/HolidayPreview'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Country, PreviewItem, CalculateResponse, Session } from '@/lib/types'
import { saveSession, generateSessionLabel, generateId } from '@/lib/sessions'

export default function PlannerPage() {
  const router = useRouter()
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [country, setCountry] = useState<Country | null>(null)
  const [inputMode, setInputMode] = useState<string>('auto')
  const [holidays, setHolidays] = useState<PreviewItem[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRemoveHoliday = (date: string) => {
    setHolidays((prev) => prev.filter((h) => h.date !== date))
  }

  const handleSubmit = async () => {
    if (holidays.length === 0) {
      setError('Please add at least one holiday before finding long leaves.')
      return
    }
    setError(null)
    setIsCalculating(true)
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankHolidays: holidays.map((h) => h.date) }),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Calculation failed')
      }
      const data: CalculateResponse = await res.json()
      // Build holiday name lookup: YYYY-MM-DD -> name
      const holidayLabels: Record<string, string> = {}
      holidays.forEach(h => {
        if (h.label) {
          // Convert DD-MM-YYYY to YYYY-MM-DD for lookup key
          const [d, m, y] = h.date.split('-')
          holidayLabels[`${y}-${m}-${d}`] = h.label
        }
      })

      const session: Session = {
        id: generateId(),
        label: generateSessionLabel(country, inputMode, year),
        year,
        clusters: data.clusters,
        summary: data.summary,
        holidayLabels,
        createdAt: Date.now(),
      }
      saveSession(session)
      // Store active session ID for results page
      localStorage.setItem('llp_active_session', session.id)
      router.push('/results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="min-h-screen pb-24 px-6">
      <div className="max-w-7xl mx-auto py-12">
        {/* Editorial Header */}
        <section className="mb-12">
          <p className="font-label text-sm font-bold text-primary uppercase tracking-[0.2em] mb-3">
            Plan Your Year
          </p>
          <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-on-surface leading-none tracking-tight">
            Smart{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
              Leaves.
            </span>
          </h1>
          <p className="mt-4 font-body text-on-surface-variant max-w-xl">
            Find the best days to take leave for maximum time off. Select your country&apos;s
            public holidays and we&apos;ll find every long-break opportunity.
          </p>
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Inputs */}
          <div className="lg:col-span-7 space-y-6">
            <Card elevation="lowest" className="p-6 space-y-6">
              <YearSelector value={year} onChange={setYear} />
              <CountrySelector value={country} onChange={setCountry} />
            </Card>

            <Card elevation="lowest" className="p-6">
              <HolidayInput
                year={year}
                country={country}
                onHolidaysChange={setHolidays}
                onModeChange={setInputMode}
              />
            </Card>

            {error && (
              <div className="px-4 py-3 bg-error-container rounded-lg">
                <p className="font-body text-sm text-on-error-container">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-4">
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isCalculating}
                className="w-full md:w-auto flex items-center justify-center gap-2"
              >
                {isCalculating ? (
                  <>
                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                    Finding…
                  </>
                ) : (
                  'Find Long Leaves'
                )}
              </Button>
              {holidays.length > 0 && (
                <span className="font-label text-sm text-on-surface-variant">
                  {holidays.length} holiday{holidays.length !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>
          </div>

          {/* Right: Preview */}
          <div className="lg:col-span-5">
            <Card elevation="lowest" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline font-bold text-on-surface text-lg">Selected Holidays</h2>
                {holidays.length > 0 && (
                  <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 rounded-full font-label text-xs font-bold">
                    {holidays.length}
                  </span>
                )}
              </div>
              <HolidayPreview holidays={holidays} onRemove={handleRemoveHoliday} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
