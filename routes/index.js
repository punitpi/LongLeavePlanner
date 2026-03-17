const express = require('express')
const router = express.Router()
const path = require('path')

/* GET home page. */
router.get('/test', (req, res, next) => {
  res.send({ title: 'Express' })
})

router.get('/download-template', (req, res, next) => {
  const file = path.join(__dirname, '../public/template.csv')
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="Bank_Holiday_Template.csv"'
  )
  res.sendFile(file, err => {
    if (err) {
      console.error('File download error:', err)
      res.status(500).send('Could not download file.')
    }
  })
})

module.exports = router
