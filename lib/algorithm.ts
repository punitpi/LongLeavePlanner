import type { LeaveDay, LeaveCluster, CalculateResponse } from './types'

const EMOJIS = ['🏖️', '⛰️', '🚲', '🌸', '🎄', '🎆', '🍂', '🌊']

// Internal helpers

function formatDateString(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

function sortByDate(dates: Set<string>): string[] {
  return Array.from(dates).sort((a, b) => {
    const [dayA, monthA, yearA] = a.split('-').map(Number)
    const [dayB, monthB, yearB] = b.split('-').map(Number)
    const dateA = new Date(yearA, monthA - 1, dayA)
    const dateB = new Date(yearB, monthB - 1, dayB)
    return dateA.getTime() - dateB.getTime()
  })
}

function getHolidayWeekends(bankHolidays: string[]): string[] {
  const weekends = new Set<string>()
  bankHolidays.forEach(holiday => {
    const [day, month, year] = holiday.split('-')
    const previousSaturday = new Date(Number(year), Number(month) - 1, Number(day))
    previousSaturday.setDate(
      previousSaturday.getDate() -
        (previousSaturday.getDay() === 0 ? 1 : previousSaturday.getDay() + 1)
    )
    weekends.add(formatDateString(previousSaturday))

    const previousSunday = new Date(previousSaturday)
    previousSunday.setDate(previousSaturday.getDate() + 1)
    weekends.add(formatDateString(previousSunday))

    const nextSaturday = new Date(Number(year), Number(month) - 1, Number(day))
    nextSaturday.setDate(nextSaturday.getDate() + (6 - nextSaturday.getDay()))
    weekends.add(formatDateString(nextSaturday))

    const nextSunday = new Date(nextSaturday)
    nextSunday.setDate(nextSaturday.getDate() + 1)
    weekends.add(formatDateString(nextSunday))
  })
  return Array.from(weekends)
}

function findLeaveRecommendations(dates: Date[]): Array<Array<{ date: Date; needToApply: boolean }>> {
  const combinedLeaves: Array<Array<{ date: Date; needToApply: boolean }>> = []
  let currentGroup: Array<{ date: Date; needToApply: boolean }> = [{ date: dates[0], needToApply: false }]

  for (let i = 1; i < dates.length; i++) {
    const currentDate = dates[i]
    const previousDate = dates[i - 1]
    const dayDifference = (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)

    if (dayDifference === 1) {
      currentGroup.push({ date: currentDate, needToApply: false })
    } else if (dayDifference === 2 || dayDifference === 3) {
      for (let gap = 1; gap < dayDifference; gap++) {
        const missingDate = new Date(previousDate)
        missingDate.setDate(missingDate.getDate() + gap)
        currentGroup.push({ date: missingDate, needToApply: true })
      }
      currentGroup.push({ date: currentDate, needToApply: false })
    } else {
      if (currentGroup.length >= 3) {
        combinedLeaves.push([...currentGroup])
      }
      currentGroup = [{ date: currentDate, needToApply: false }]
    }
  }

  if (currentGroup.length >= 3) {
    combinedLeaves.push([...currentGroup])
  }

  return combinedLeaves
}

export function buildClusterMetadata(rawDays: LeaveDay[], index: number): LeaveCluster {
  const startDate = toISODateString(rawDays[0].date)
  const endDate = toISODateString(rawDays[rawDays.length - 1].date)
  const totalDays = rawDays.length
  const leaveDaysRequired = rawDays.filter(d => d.needToApply).length
  const emoji = EMOJIS[index % EMOJIS.length]

  return {
    id: `cluster-${index}`,
    days: rawDays,
    startDate,
    endDate,
    totalDays,
    leaveDaysRequired,
    emoji,
  }
}

export function processHolidays(bankHolidays: string[]): CalculateResponse {
  // 1. Get weekends surrounding holidays
  const holidayWeekends = getHolidayWeekends(bankHolidays)

  // 2. Combine with original bank holidays in a Set (deduplicates)
  const allDatesSet = new Set<string>([...bankHolidays, ...holidayWeekends])

  // 3. Sort chronologically
  const sorted = sortByDate(allDatesSet)

  // 4. Convert sorted DD-MM-YYYY strings to Date objects
  const dates = sorted.map(dateStr => {
    const [day, month, year] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  })

  // 5. Find leave recommendations
  const rawClusters = findLeaveRecommendations(dates)

  // 6. Map raw clusters to LeaveCluster with metadata
  const clusters: LeaveCluster[] = rawClusters.map((rawDays, index) => {
    const leaveDays: LeaveDay[] = rawDays.map(rd => ({
      date: rd.date,
      dateString: toISODateString(rd.date),
      needToApply: rd.needToApply,
    }))
    return buildClusterMetadata(leaveDays, index)
  })

  // 7. Compute summary stats
  const totalDaysOff = clusters.reduce((sum, c) => sum + c.totalDays, 0)
  const leaveDaysUsed = clusters.reduce((sum, c) => sum + c.leaveDaysRequired, 0)

  // 8. Efficiency percent
  const efficiencyPercent = leaveDaysUsed === 0
    ? null
    : Math.round((totalDaysOff / leaveDaysUsed) * 100)

  return {
    clusters,
    summary: {
      totalDaysOff,
      leaveDaysUsed,
      efficiencyPercent,
      clustersFound: clusters.length,
    },
  }
}
