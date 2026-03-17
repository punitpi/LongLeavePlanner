function getDistinctYears (dates) {
  let distinctYears = new Set()
  dates.forEach(date => {
    year = date.split('-')[2]
    distinctYears.add(year)
  })
  return Array.from(distinctYears)
}

function getDistinctMonths (dates) {
  let distinctMonths = new Set()
  dates.forEach(date => {
    const [day, month, year] = date.split('-')
    distinctMonths.add(`${month}-${year}`)
  })
  return Array.from(distinctMonths)
}

function getDistinctDates (dates) {
  let distinctDates = new Set()
  dates.forEach(date => {
    const [day, month, year] = day.split('-')
    distinctDates.add(`${date}-${month}-${year}`)
  })
  return Array.from(distinctDates)
}

module.exports = { getDistinctYears, getDistinctMonths, getDistinctDates }
