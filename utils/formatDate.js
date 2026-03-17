function formatIndiaDate (date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

function formatUSDate (date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${month}-${day}-${year}`
}

function sortIndianDate (date) {
  return Array.from(date).sort((a, b) => {
    const [dayA, monthA, yearA] = a.split('-').map(Number)
    const [dayB, monthB, yearB] = b.split('-').map(Number)

    // Create Date objects for comparison
    const dateA = new Date(yearA, monthA - 1, dayA)
    const dateB = new Date(yearB, monthB - 1, dayB)

    return dateA - dateB // Sort in ascending order
  })
}

module.exports = { formatIndiaDate, formatUSDate, sortIndianDate }
