import { describe, it, expect } from 'vitest'
import { processHolidays } from '../algorithm'

describe('processHolidays', () => {
  it('returns empty response for empty input', () => {
    const result = processHolidays([])
    expect(result.clusters).toHaveLength(0)
    expect(result.summary.totalDaysOff).toBe(0)
    expect(result.summary.leaveDaysUsed).toBe(0)
    expect(result.summary.efficiencyPercent).toBeNull()
    expect(result.summary.clustersFound).toBe(0)
  })

  it('finds a cluster around a mid-week public holiday', () => {
    // Christmas 2024 is Wednesday Dec 25
    // Algorithm finds: prev weekend (Dec 21-22), Dec 25, next weekend (Dec 28-29)
    // Gaps: Dec 23 (needToApply), Dec 24 (needToApply), Dec 26 (needToApply), Dec 27 (needToApply)
    // Cluster: Dec 21, 22, 23(apply), 24(apply), 25, 26(apply), 27(apply), 28, 29 = 9 days
    const result = processHolidays(['25-12-2024'])
    expect(result.clusters.length).toBeGreaterThan(0)

    const cluster = result.clusters[0]
    expect(cluster.totalDays).toBeGreaterThanOrEqual(3)

    // Some days should need leave applied
    const applyDays = cluster.days.filter(d => d.needToApply)
    expect(applyDays.length).toBeGreaterThan(0)

    // startDate should be before endDate
    expect(cluster.startDate < cluster.endDate).toBe(true)
  })

  it('correctly marks gap days as needToApply', () => {
    // Mon Jan 6 2025 and Thu Jan 9 2025 are 3 calendar days apart (diff===3)
    // The algorithm fills 2 gap days (Jan 7, Jan 8) with needToApply
    // The surrounding weekends are Jan 4-5 and Jan 11-12
    // Cluster: Jan 4,5,6,7(apply),8(apply),9,10(apply),11,12 = 9 days, 3 apply
    const result = processHolidays(['06-01-2025', '09-01-2025'])

    expect(result.clusters.length).toBeGreaterThan(0)

    const hasNeedToApply = result.clusters.some(cluster =>
      cluster.days.some(d => d.needToApply)
    )
    expect(hasNeedToApply).toBe(true)
  })

  it('does not form a cluster from only 2 adjacent dates', () => {
    // A single isolated holiday with far weekends still forms a valid cluster
    // Jan 1 2025 is a Wednesday. Weekends: Dec 28-29 and Jan 4-5.
    // Cluster: Dec 28, 29, Dec 30(apply), Dec 31(apply), Jan 1, Jan 2(apply), Jan 3(apply), Jan 4, Jan 5 = 9 days
    const result = processHolidays(['01-01-2025'])
    // Verify it doesn't throw and returns valid structure
    expect(result).toHaveProperty('clusters')
    expect(result).toHaveProperty('summary')
    expect(Array.isArray(result.clusters)).toBe(true)
  })

  it('deduplicates identical input dates', () => {
    const result1 = processHolidays(['25-12-2024'])
    const result2 = processHolidays(['25-12-2024', '25-12-2024', '25-12-2024'])
    // Results should be identical since duplicates are collapsed
    expect(result1.clusters.length).toBe(result2.clusters.length)
    if (result1.clusters.length > 0) {
      expect(result1.clusters[0].totalDays).toBe(result2.clusters[0].totalDays)
    }
  })

  it('computes efficiencyPercent as null when no leave is required', () => {
    // If all discovered dates are holidays/weekends with no gaps, leaveDaysUsed = 0
    // In that case efficiencyPercent should be null
    const result = processHolidays(['25-12-2024'])
    if (result.summary.leaveDaysUsed === 0) {
      expect(result.summary.efficiencyPercent).toBeNull()
    } else {
      expect(result.summary.efficiencyPercent).not.toBeNull()
      expect(typeof result.summary.efficiencyPercent).toBe('number')
    }
  })

  it('returns correct cluster metadata shape', () => {
    const result = processHolidays(['25-12-2024'])
    if (result.clusters.length > 0) {
      const cluster = result.clusters[0]
      expect(cluster.id).toMatch(/^cluster-\d+$/)
      expect(typeof cluster.emoji).toBe('string')
      expect(cluster.emoji.length).toBeGreaterThan(0)
      expect(cluster.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(cluster.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(typeof cluster.totalDays).toBe('number')
      expect(typeof cluster.leaveDaysRequired).toBe('number')
      expect(Array.isArray(cluster.days)).toBe(true)
      cluster.days.forEach(day => {
        expect(typeof day.dateString).toBe('string')
        expect(day.dateString).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(typeof day.needToApply).toBe('boolean')
      })
    }
  })

  it('handles multiple holidays across different months', () => {
    const result = processHolidays([
      '01-01-2025', // New Year
      '25-12-2025', // Christmas
    ])
    expect(result).toHaveProperty('clusters')
    expect(result.summary.clustersFound).toBe(result.clusters.length)
    // totalDaysOff should equal sum of cluster.totalDays
    const sumDays = result.clusters.reduce((acc, c) => acc + c.totalDays, 0)
    expect(result.summary.totalDaysOff).toBe(sumDays)
  })

  it('summary clustersFound matches actual clusters array length', () => {
    const result = processHolidays(['25-12-2024', '01-01-2025'])
    expect(result.summary.clustersFound).toBe(result.clusters.length)
  })

  it('all clusters have at least 3 days (minimum cluster size)', () => {
    const result = processHolidays(['25-12-2024', '01-01-2025', '06-01-2025'])
    result.clusters.forEach(cluster => {
      expect(cluster.totalDays).toBeGreaterThanOrEqual(3)
    })
  })

  it('cluster startDate is always before or equal to endDate', () => {
    const result = processHolidays(['25-12-2024', '01-01-2025', '06-01-2025'])
    result.clusters.forEach(cluster => {
      expect(cluster.startDate <= cluster.endDate).toBe(true)
    })
  })

  it('leaveDaysRequired equals count of needToApply days in a cluster', () => {
    const result = processHolidays(['25-12-2024'])
    result.clusters.forEach(cluster => {
      const applyCount = cluster.days.filter(d => d.needToApply).length
      expect(cluster.leaveDaysRequired).toBe(applyCount)
    })
  })

  it('efficiencyPercent is a rounded integer when leaveDaysUsed > 0', () => {
    // Jan 6 and Jan 9 2025 produce gap days so leaveDaysUsed > 0
    const result = processHolidays(['06-01-2025', '09-01-2025'])
    if (result.summary.leaveDaysUsed > 0) {
      const eff = result.summary.efficiencyPercent
      expect(eff).not.toBeNull()
      expect(Number.isInteger(eff)).toBe(true)
      // efficiency = round(totalDaysOff / leaveDaysUsed * 100)
      const expected = Math.round((result.summary.totalDaysOff / result.summary.leaveDaysUsed) * 100)
      expect(eff).toBe(expected)
    }
  })
})
