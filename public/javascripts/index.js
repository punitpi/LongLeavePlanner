// Initialize Flatpickr on the calendar input
document.addEventListener('DOMContentLoaded', function () {
  flatpickr('#calendar', {
    mode: 'multiple', // Allow multiple date selections
    dateFormat: 'd-m-Y', // Display in DD-MM-YYYY format

    // Function to add a "Today" button
    onReady: function (selectedDates, dateStr, instance) {
      // Create the "Today" button
      const todayButton = document.createElement('button')
      todayButton.textContent = 'Today'
      todayButton.classList.add('btn', 'btn-secondary', 'btn-sm', 'mt-2')

      // Event listener to jump to today's date and month
      todayButton.addEventListener('click', function () {
        const today = new Date()
        instance.jumpToDate(today) // Jump to today's month and year
      })

      // Append the button to the calendar container
      instance.calendarContainer.appendChild(todayButton)
    }
  })

  const calendarEl = document.getElementById('fullCalendar')
  const calendar = new FullCalendar.Calendar(calendarEl, {
    plugins: [FullCalendar.DayGrid], // Enable the dayGrid view
    initialView: 'dayGridMonth', // Set initial view to month grid
    events: [] // Placeholder for events, will be populated below
  })

  const submitButton = document.getElementById('submitButton')
  if (submitButton) {
    submitButton.addEventListener('click', submitDates)
  }
})

// Format date as DD-MM-YYYY
function formatDate (date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

// Handle file upload and parse CSV content
function handleFileUpload (event) {
  const file = event.target.files[0]
  const reader = new FileReader()

  reader.onload = e => {
    const csvContent = e.target.result
    const dates = csvContent
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line)
    displayDates(dates)
  }

  if (file) {
    reader.readAsText(file)
  }
}

// Display dates in the preview table
function displayDates (dates) {
  const tbody = document.getElementById('datesTable').querySelector('tbody')
  tbody.innerHTML = '' // Clear previous entries

  dates.forEach(date => {
    const row = document.createElement('tr')
    const cell = document.createElement('td')
    cell.textContent = date
    row.appendChild(cell)
    tbody.appendChild(row)
  })
}

// Submit dates to the backend
function submitDates () {
  console.log('Submit button clicked!')
  const selectedDates =
    document.getElementById('calendar')._flatpickr.selectedDates
  const formattedDates = selectedDates.map(formatDate) // Format selected dates

  const fileDates = Array.from(
    document.querySelectorAll('#datesTable tbody tr')
  ).map(row => row.cells[0].textContent)

  // Combine dates from file and calendar
  const allDates = [...new Set([...fileDates, ...formattedDates])] // Remove duplicates
  //Send all dates to the backend
  fetch('/days/getYearWeekends', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bankHolidays: allDates })
  })
    .then(response => {
      if (response.ok) {
        return response.json() // Parse the JSON response
      } else {
        throw new Error('Error uploading dates.')
      }
    })
    .then(data => {
      const events = []
      data.forEach(dateBlock => {
        dateBlock.forEach(day => {
          const date = new Date(day.date).toISOString().split('T')[0] // Format to YYYY-MM-DD

          // Define color based on needToApply status
          const backgroundColor = day.needToApply ? 'yellow' : 'green'

          // Add each day as an event
          events.push({
            title: day.needToApply ? 'Apply Leave' : 'Holiday',
            start: date,
            backgroundColor: backgroundColor,
            borderColor: backgroundColor,
            textColor: 'black' // For better contrast
          })
        })
      })
      calendar.addEventSource(events)
      calendar.render()
      // Do something with the `combinedLeaves` data
    })
    .catch(error => console.error('Error:', error))
}
