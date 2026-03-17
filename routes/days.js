const express = require('express')
const router = express.Router()
const daysController = require('./../controllers/daysController')

/* GET home page. */
router.post('/getYearWeekends', daysController.ProcessDates)

module.exports = router
