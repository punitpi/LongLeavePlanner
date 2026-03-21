'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LeaveCalendar } from '@/components/results/LeaveCalendar'
import { MonthNav } from '@/components/results/MonthNav'
import { OpportunityCard } from '@/components/results/OpportunityCard'
import { SummaryCard } from '@/components/results/SummaryCard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { CalculateResponse } from '@/lib/types'

interface StoredResults extends CalculateResponse {
  year: number
}

export default function ResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<StoredResults | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [activeClusterId, setActiveClusterId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('llp_results')
      if (!raw) { router.replace('/'); return }
      const parsed = JSON.parse(raw) as StoredResults
      if (!parsed.clusters || !parsed.summary) { router.replace('/'); return }
      setResults(parsed)

      // Navigate to the month of the first cluster (if any)
      if (parsed.clusters.length > 0) {
        const firstClusterMonth = parseInt(parsed.clusters[0].startDate.split('-')[1], 10) - 1
        setCurrentMonth(firstClusterMonth)
      }
    } catch {
      router.replace('/')
    }
  }, [router])

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  const { clusters, summary, year } = results

  return (
    <div className="min-h-screen pb-24 px-6">
      <div className="max-w-7xl mx-auto py-12">
        {/* Editorial Header */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="font-label text-sm font-bold text-primary uppercase tracking-[0.2em] mb-2">
                Your {year} Strategy
              </p>
              <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-on-surface leading-none tracking-tight">
                Optimized{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                  Time.
                </span>
              </h1>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => router.push('/')} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">tune</span>
                Adjust Holidays
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Calendar */}
          <div className="lg:col-span-8 space-y-4">
            <Card elevation="lowest" className="p-8">
              <LeaveCalendar
                year={year}
                month={currentMonth}
                clusters={clusters}
                activeClusterId={activeClusterId}
                onMonthChange={setCurrentMonth}
              />
            </Card>
            <MonthNav
              currentMonth={currentMonth}
              year={year}
              clusters={clusters}
              onMonthSelect={setCurrentMonth}
            />
          </div>

          {/* Right: Cards */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-xl font-bold text-on-surface">Holiday Clusters</h3>
              {clusters.length > 0 && (
                <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 rounded-full font-label text-[10px] font-black uppercase">
                  {clusters.length} Found
                </span>
              )}
            </div>

            {clusters.length === 0 ? (
              <Card elevation="lowest" className="p-8 text-center">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 block mb-4">
                  search_off
                </span>
                <p className="font-body text-sm text-on-surface-variant">
                  No long leave opportunities found. Try adding more holidays.
                </p>
                <Button variant="tertiary" onClick={() => router.push('/')} className="mt-4">
                  Add more holidays
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {clusters.map((cluster) => (
                  <OpportunityCard
                    key={cluster.id}
                    cluster={cluster}
                    isActive={activeClusterId === cluster.id}
                    onMouseEnter={() => {
                      setActiveClusterId(cluster.id)
                      const month = parseInt(cluster.startDate.split('-')[1], 10) - 1
                      setCurrentMonth(month)
                    }}
                    onMouseLeave={() => setActiveClusterId(null)}
                  />
                ))}
              </div>
            )}

            <SummaryCard
              totalDaysOff={summary.totalDaysOff}
              leaveDaysUsed={summary.leaveDaysUsed}
              efficiencyPercent={summary.efficiencyPercent}
              clustersFound={summary.clustersFound}
            />
          </aside>
        </div>
      </div>
    </div>
  )
}
