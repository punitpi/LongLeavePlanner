import type { LeaveDay, LeaveCluster, CalculateResponse } from './types'

const EMOJIS = ['🏖️', '⛰️', '🚲', '🌸', '🎄', '🎆', '🍂', '🌊']

export function formatDateString(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

function toISODateString(date: Date): string {
  // Use local year/month/day — NOT toISOString() which converts to UTC first
  // and will give the wrong date in UTC+ timezones (e.g. IST, CET at midnight)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
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

export function getHolidayWeekends(bankHolidays: string[]): string[] {
  const weekends = new Set<string>()
  bankHolidays.forEach(holiday => {
    const [day, month, year] = holiday.split('-')
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    const dow = date.getDay()

    // For Saturday holidays, go back a full week so we don't land on the holiday itself
    const daysBackToSat = dow === 0 ? 1 : dow === 6 ? 7 : dow + 1
    const previousSaturday = new Date(date)
    previousSaturday.setDate(date.getDate() - daysBackToSat)
    weekends.add(formatDateString(previousSaturday))

    const previousSunday = new Date(previousSaturday)
    previousSunday.setDate(previousSaturday.getDate() + 1)
    weekends.add(formatDateString(previousSunday))

    // For Saturday holidays, go forward a full week so we don't land on the holiday itself
    const daysToNextSat = dow === 6 ? 7 : 6 - dow
    const nextSaturday = new Date(date)
    nextSaturday.setDate(date.getDate() + daysToNextSat)
    weekends.add(formatDateString(nextSaturday))

    const nextSunday = new Date(nextSaturday)
    nextSunday.setDate(nextSaturday.getDate() + 1)
    weekends.add(formatDateString(nextSunday))
  })
  return Array.from(weekends)
}

function findLeaveRecommendations(dates: Date[], holidaySet: Set<string>): Array<Array<{ date: Date; needToApply: boolean }>> {
  if (dates.length === 0) return []
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
        // If this gap day is itself a public holiday, don't mark it as leave to apply
        const missingStr = formatDateString(missingDate)
        currentGroup.push({ date: missingDate, needToApply: !holidaySet.has(missingStr) })
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
  const holidayWeekends = getHolidayWeekends(bankHolidays)
  const allDatesSet = new Set<string>([...bankHolidays, ...holidayWeekends])
  const sorted = sortByDate(allDatesSet)
  const dates = sorted.map(dateStr => {
    const [day, month, year] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  })

  // holidaySet is separate from allDatesSet (which includes weekends) — needed so
  // gap-fill days that are themselves bank holidays stay needToApply: false
  const holidaySet = new Set(bankHolidays)
  const rawClusters = findLeaveRecommendations(dates, holidaySet)

  const clusters: LeaveCluster[] = rawClusters.map((rawDays, index) => {
    const leaveDays: LeaveDay[] = rawDays.map(rd => ({
      date: rd.date,
      dateString: toISODateString(rd.date),
      needToApply: rd.needToApply,
    }))
    return buildClusterMetadata(leaveDays, index)
  })

  const totalDaysOff = clusters.reduce((sum, c) => sum + c.totalDays, 0)
  const leaveDaysUsed = clusters.reduce((sum, c) => sum + c.leaveDaysRequired, 0)
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
