const formatDate = require('../utils/formatDate')
const getDistinctDate = require('../utils/getDistinctDate')
const store = require('../stores/daysStore')

class Leaves {
  constructor (date, needToApply) {
    this.date = date
    this.needToApply = needToApply
  }
}

function getHolidayWeekends (bankHolidays) {
  const weekends = new Set()
  bankHolidays.forEach(holiday => {
    // Calculate previous Saturday
    const [day, month, year] = holiday.split('-')
    let previousSaturday = new Date(year, month - 1, day)
    previousSaturday.setDate(
      previousSaturday.getDate() -
        (previousSaturday.getDay() === 0 ? 1 : previousSaturday.getDay() + 1)
    )
    weekends.add(formatDate.formatIndiaDate(previousSaturday))

    // Calculate previous Sunday
    let previousSunday = new Date(previousSaturday)
    previousSunday.setDate(previousSaturday.getDate() + 1)
    weekends.add(formatDate.formatIndiaDate(previousSunday))

    // Calculate next Saturday
    let nextSaturday = new Date(year, month - 1, day)
    nextSaturday.setDate(nextSaturday.getDate() + (6 - nextSaturday.getDay()))
    weekends.add(formatDate.formatIndiaDate(nextSaturday))

    // Calculate next Sunday
    let nextSunday = new Date(nextSaturday)
    nextSunday.setDate(nextSaturday.getDate() + 1)
    weekends.add(formatDate.formatIndiaDate(nextSunday))
  })

  return Array.from(weekends)
}

function findLeaveRecommendations (dates) {
  const combinedLeaves = []
  let currentGroup = [new Leaves(dates[0], false)]

  for (let i = 1; i < dates.length; i++) {
    const currentDate = dates[i]
    const previousDate = dates[i - 1]

    // Calculate the difference between consecutive dates in days
    const dayDifference = (currentDate - previousDate) / (1000 * 60 * 60 * 24)

    if (dayDifference === 1) {
      // Consecutive day, add to current group
      currentGroup.push(new Leaves(currentDate, false))
    } else if (dayDifference === 2 || dayDifference === 3) {
      // A gap of 1 or 2 days, consider adding the missing days to form a consecutive sequence
      for (let gap = 1; gap < dayDifference; gap++) {
        let missingDate = new Date(previousDate)
        missingDate.setDate(missingDate.getDate() + gap)
        currentGroup.push(new Leaves(missingDate, true))
      }
      currentGroup.push(new Leaves(currentDate, false))
    } else {
      // Non-consecutive with a gap of more than 2 days
      if (currentGroup.length >= 3) {
        combinedLeaves.push([...currentGroup])
      }
      currentGroup = [new Leaves(currentDate, false)]
    }
  }

  // Add the last group if it has 3 or more dates
  if (currentGroup.length >= 3) {
    combinedLeaves.push([...currentGroup])
  }

  return combinedLeaves
}

function ProcessDates (req, res) {
  const bankHolidays = req.body.bankHolidays
  const oppurtinityWeekends = getHolidayWeekends(bankHolidays)
  const combinedDates = new Set([...bankHolidays, ...oppurtinityWeekends])

  let formatedDates = formatDate.sortIndianDate(combinedDates)

  let datesList = []
  formatedDates.forEach(item => {
    const [day, month, year] = item.split('-')
    datesList.push(new Date(year, month - 1, day))
  })

  combinedLeaves = findLeaveRecommendations(datesList)
  return res.json(combinedLeaves)
}

module.exports = {
  ProcessDates
}
