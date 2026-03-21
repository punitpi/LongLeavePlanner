import { describe, it, expect } from 'vitest'
import { processHolidays, getHolidayWeekends } from '../algorithm'

// Helper: get a specific day entry from results by YYYY-MM-DD dateString
function dayEntry(result: ReturnType<typeof processHolidays>, dateString: string) {
  for (const cluster of result.clusters) {
    const d = cluster.days.find(d => d.dateString === dateString)
    if (d) return d
  }
  return undefined
}

describe('processHolidays — empty / trivial input', () => {
  it('returns zeroed response for empty input', () => {
    const result = processHolidays([])
    expect(result.clusters).toHaveLength(0)
    expect(result.summary.totalDaysOff).toBe(0)
    expect(result.summary.leaveDaysUsed).toBe(0)
    expect(result.summary.efficiencyPercent).toBeNull()
    expect(result.summary.clustersFound).toBe(0)
  })

  it('deduplicates identical input dates', () => {
    const once = processHolidays(['25-12-2024'])
    const triple = processHolidays(['25-12-2024', '25-12-2024', '25-12-2024'])
    expect(once.clusters.length).toBe(triple.clusters.length)
    if (once.clusters.length > 0) {
      expect(once.clusters[0].totalDays).toBe(triple.clusters[0].totalDays)
    }
  })
})

describe('processHolidays — needToApply correctness (the critical invariant)', () => {
  it('does NOT mark a bank holiday as needToApply even when it sits in a gap', () => {
    // This is the bug that was in production: Ascension Day (Thu) between two
    // free days was marked needToApply because the gap-fill logic didn't check
    // the bank holiday set. Replicate with Mon/Wed/Fri pattern.
    //
    // Mon 12-05-2025, Wed 14-05-2025 (bank holiday), Fri 16-05-2025 (bank holiday)
    // Weekends: Sat 10, Sun 11, Sat 17, Sun 18
    // Sorted: 10(Sat),11(Sun),12(Mon),13(gap→apply?),14(holiday→NOT apply),15(gap→apply?),16(Fri-holiday),17(Sat),18(Sun)
    // Wed 14 must be needToApply: false (it IS a bank holiday)
    const result = processHolidays(['12-05-2025', '14-05-2025', '16-05-2025'])
    const wed14 = dayEntry(result, '2025-05-14')
    expect(wed14).toBeDefined()
    expect(wed14!.needToApply).toBe(false)
  })

  it('marks actual gap weekdays as needToApply', () => {
    // Jan 6 (Mon) and Jan 9 (Thu) 2025 — Jan 7 (Tue) and Jan 8 (Wed) are genuine gaps
    const result = processHolidays(['06-01-2025', '09-01-2025'])
    const tue7 = dayEntry(result, '2025-01-07')
    const wed8 = dayEntry(result, '2025-01-08')
    expect(tue7).toBeDefined()
    expect(tue7!.needToApply).toBe(true)
    expect(wed8).toBeDefined()
    expect(wed8!.needToApply).toBe(true)
  })

  it('marks holiday days as needToApply: false', () => {
    // Christmas (Wed Dec 25) itself must never be needToApply
    const result = processHolidays(['25-12-2024'])
    const christmas = dayEntry(result, '2024-12-25')
    expect(christmas).toBeDefined()
    expect(christmas!.needToApply).toBe(false)
  })

  it('weekend days added by the algorithm are needToApply: false', () => {
    // For Christmas 2024 (Wed), the algorithm adds Sat Dec 21 and Sun Dec 22
    const result = processHolidays(['25-12-2024'])
    const sat = dayEntry(result, '2024-12-21')
    const sun = dayEntry(result, '2024-12-22')
    expect(sat).toBeDefined()
    expect(sat!.needToApply).toBe(false)
    expect(sun).toBeDefined()
    expect(sun!.needToApply).toBe(false)
  })
})

describe('getHolidayWeekends — weekend detection', () => {
  // These tests call getHolidayWeekends directly so we can verify which weekend
  // dates are added without needing the dates to survive cluster-size filtering.

  it('Wednesday holiday: adds the surrounding Sat+Sun on both sides', () => {
    // Christmas 2024 = Wednesday Dec 25 (dow=3)
    // Previous Sat: Dec 21 (3+1=4 days back), Previous Sun: Dec 22
    // Next Sat: Dec 28 (6-3=3 days forward), Next Sun: Dec 29
    const weekends = getHolidayWeekends(['25-12-2024'])
    expect(weekends).toContain('21-12-2024')
    expect(weekends).toContain('22-12-2024')
    expect(weekends).toContain('28-12-2024')
    expect(weekends).toContain('29-12-2024')
  })

  it('Monday holiday: adds previous Sat/Sun and following Sat/Sun', () => {
    // Jan 6 2025 = Monday (dow=1)
    // Previous Sat: Jan 4 (1+1=2 days back), Previous Sun: Jan 5
    // Next Sat: Jan 11 (6-1=5 days forward), Next Sun: Jan 12
    const weekends = getHolidayWeekends(['06-01-2025'])
    expect(weekends).toContain('04-01-2025')
    expect(weekends).toContain('05-01-2025')
    expect(weekends).toContain('11-01-2025')
    expect(weekends).toContain('12-01-2025')
  })

  it('Friday holiday: previous Sat is 6 days back, next Sat is 1 day forward', () => {
    // May 1 2026 = Friday (dow=5)
    // Previous Sat: Apr 25 (5+1=6 days back), Previous Sun: Apr 26
    // Next Sat: May 2 (6-5=1 day forward), Next Sun: May 3
    const weekends = getHolidayWeekends(['01-05-2026'])
    expect(weekends).toContain('25-04-2026')
    expect(weekends).toContain('26-04-2026')
    expect(weekends).toContain('02-05-2026')
    expect(weekends).toContain('03-05-2026')
  })

  it('Saturday holiday: previous Sat is 7 days back (not the holiday itself), next Sat is 7 days forward', () => {
    // Dec 27 2025 = Saturday (dow=6)
    // Previous Sat: Dec 20 (7 days back — NOT Dec 27 again), Previous Sun: Dec 21
    // Next Sat: Jan 3 2026 (7 days forward), Next Sun: Jan 4 2026
    const weekends = getHolidayWeekends(['27-12-2025'])
    expect(weekends).toContain('20-12-2025')  // previous Sat
    expect(weekends).toContain('21-12-2025')  // previous Sun
    expect(weekends).toContain('03-01-2026')  // next Sat
    expect(weekends).toContain('04-01-2026')  // next Sun
    // Must NOT add the holiday itself as a "previous weekend" entry
    // (it would appear once from the bank holiday set, not twice from weekends)
    const satCount = weekends.filter(d => d === '27-12-2025').length
    expect(satCount).toBe(0)  // not added by getHolidayWeekends (holiday set handles it)
  })

  it('Sunday holiday: previous Sat is 1 day back, next Sat is 6 days forward', () => {
    // Dec 28 2025 = Sunday (dow=0)
    // Previous Sat: Dec 27 (1 day back), Previous Sun: Dec 28 (== holiday, added to set anyway)
    // Next Sat: Jan 3 2026 (6 days forward), Next Sun: Jan 4 2026
    const weekends = getHolidayWeekends(['28-12-2025'])
    expect(weekends).toContain('27-12-2025')  // previous Sat
    expect(weekends).toContain('28-12-2025')  // previous Sun (same as holiday — deduplicated in processHolidays)
    expect(weekends).toContain('03-01-2026')  // next Sat
    expect(weekends).toContain('04-01-2026')  // next Sun
  })
})

describe('processHolidays — cluster formation', () => {
  it('does not form a cluster when total span is less than 3 days', () => {
    // Two adjacent holidays on a Saturday+Sunday with nothing else nearby
    // would only produce 2 dates — below the minimum cluster size
    // Use a very isolated Saturday to verify no phantom 1-2 day clusters
    const result = processHolidays(['05-04-2025']) // Saturday Apr 5 2025
    result.clusters.forEach(cluster => {
      expect(cluster.totalDays).toBeGreaterThanOrEqual(3)
    })
  })

  it('does not merge clusters separated by 4+ days', () => {
    // Jan 1 (Wed) and Jan 13 (Mon) 2025 are 12 days apart — must be separate clusters
    const result = processHolidays(['01-01-2025', '13-01-2025'])
    // They should produce 2 distinct clusters, not 1 merged one
    expect(result.clusters.length).toBe(2)
  })

  it('merges correctly when gap is exactly 2 days (1 apply day)', () => {
    // Jan 6 (Mon) and Jan 8 (Wed) 2025 — gap of exactly 2, fills Jan 7 (Tue) as apply
    const result = processHolidays(['06-01-2025', '08-01-2025'])
    const tue7 = dayEntry(result, '2025-01-07')
    expect(tue7).toBeDefined()
    expect(tue7!.needToApply).toBe(true)
    // Jan 6 and Jan 8 must be in same cluster (not split)
    const clusterWith6 = result.clusters.find(c => c.days.some(d => d.dateString === '2025-01-06'))
    const clusterWith8 = result.clusters.find(c => c.days.some(d => d.dateString === '2025-01-08'))
    expect(clusterWith6).toBeDefined()
    expect(clusterWith6).toBe(clusterWith8)
  })

  it('merges correctly when gap is exactly 3 days (2 apply days)', () => {
    // Jan 6 (Mon) and Jan 9 (Thu) 2025 — gap of 3, fills Jan 7+8 as apply
    const result = processHolidays(['06-01-2025', '09-01-2025'])
    const clusterWith6 = result.clusters.find(c => c.days.some(d => d.dateString === '2025-01-06'))
    const clusterWith9 = result.clusters.find(c => c.days.some(d => d.dateString === '2025-01-09'))
    expect(clusterWith6).toBeDefined()
    expect(clusterWith6).toBe(clusterWith9)
  })

  it('does NOT merge when gap is exactly 4 days (boundary: splits into separate clusters)', () => {
    // Jan 6 (Mon) and Jan 10 (Fri) 2025 — gap of 4 calendar days
    const result = processHolidays(['06-01-2025', '10-01-2025'])
    const clusterWith6 = result.clusters.find(c => c.days.some(d => d.dateString === '2025-01-06'))
    const clusterWith10 = result.clusters.find(c => c.days.some(d => d.dateString === '2025-01-10'))
    // Must be separate clusters (or one/both may not form if span is < 3 alone)
    if (clusterWith6 && clusterWith10) {
      expect(clusterWith6).not.toBe(clusterWith10)
    }
  })
})

describe('processHolidays — summary stats', () => {
  it('summary.clustersFound matches clusters array length', () => {
    const result = processHolidays(['25-12-2024', '01-01-2025'])
    expect(result.summary.clustersFound).toBe(result.clusters.length)
  })

  it('summary.totalDaysOff equals sum of cluster.totalDays', () => {
    const result = processHolidays(['25-12-2024', '01-01-2025', '06-01-2025'])
    const sum = result.clusters.reduce((acc, c) => acc + c.totalDays, 0)
    expect(result.summary.totalDaysOff).toBe(sum)
  })

  it('summary.leaveDaysUsed equals sum of cluster.leaveDaysRequired', () => {
    const result = processHolidays(['06-01-2025', '09-01-2025'])
    const sum = result.clusters.reduce((acc, c) => acc + c.leaveDaysRequired, 0)
    expect(result.summary.leaveDaysUsed).toBe(sum)
  })

  it('leaveDaysRequired equals exact count of needToApply days per cluster', () => {
    const result = processHolidays(['25-12-2024', '06-01-2025', '09-01-2025'])
    result.clusters.forEach(cluster => {
      const applyCount = cluster.days.filter(d => d.needToApply).length
      expect(cluster.leaveDaysRequired).toBe(applyCount)
    })
  })

  it('efficiencyPercent is null when leaveDaysUsed is 0', () => {
    // Purely contiguous holidays/weekends with no gaps → leaveDaysUsed = 0
    const result = processHolidays([])
    expect(result.summary.efficiencyPercent).toBeNull()
  })

  it('efficiencyPercent is a rounded integer when leaveDaysUsed > 0', () => {
    const result = processHolidays(['06-01-2025', '09-01-2025'])
    if (result.summary.leaveDaysUsed > 0) {
      const eff = result.summary.efficiencyPercent
      expect(eff).not.toBeNull()
      expect(Number.isInteger(eff)).toBe(true)
      const expected = Math.round((result.summary.totalDaysOff / result.summary.leaveDaysUsed) * 100)
      expect(eff).toBe(expected)
    }
  })
})

describe('processHolidays — cluster metadata shape', () => {
  it('all clusters have correct shape', () => {
    const result = processHolidays(['25-12-2024'])
    result.clusters.forEach((cluster, i) => {
      expect(cluster.id).toBe(`cluster-${i}`)
      expect(typeof cluster.emoji).toBe('string')
      expect(cluster.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(cluster.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(cluster.startDate <= cluster.endDate).toBe(true)
      expect(cluster.totalDays).toBeGreaterThanOrEqual(3)
      cluster.days.forEach(day => {
        expect(day.dateString).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(typeof day.needToApply).toBe('boolean')
      })
    })
  })

  it('cluster startDate and endDate match first and last day dateStrings', () => {
    const result = processHolidays(['25-12-2024'])
    result.clusters.forEach(cluster => {
      expect(cluster.startDate).toBe(cluster.days[0].dateString)
      expect(cluster.endDate).toBe(cluster.days[cluster.days.length - 1].dateString)
    })
  })
})
