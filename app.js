const express = require('express')
const compression = require('compression')
const createError = require('http-errors')
const path = require('path')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const cors = require('cors')
const logger = require('morgan')
require('dotenv').config()

const indexRouter = require('./routes/index')
const daysRouter = require('./routes/days')

const app = express()

app.use(compression())
app.use(logger('dev'))
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", // Allows scripts from the same domain
        'https://code.jquery.com', // jQuery CDN
        'https://stackpath.bootstrapcdn.com', // Bootstrap CDN
        'https://cdn.jsdelivr.net' // Flatpickr and other libraries
      ],
      styleSrc: [
        "'self'",
        'https://stackpath.bootstrapcdn.com', // Bootstrap CSS CDN
        'https://cdn.jsdelivr.net' // Flatpickr CSS
      ]
    }
  })
)
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/days', daysRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  let statusCode =
    res.statusCode !== 200
      ? res.statusCode || err.status || err.statusCode
      : 500
  if (statusCode < 400) statusCode = 500
  res.status(statusCode)

  if (statusCode >= 500) {
    console.error(err.stack)
    res.json(err)
    return
  }

  res.json({
    message: err.message,
    stack: process.env.ENVIRONMENT === 'dev' ? err.stack : 'Error'
  })
})

module.exports = app
