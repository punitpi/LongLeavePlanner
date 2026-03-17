var cache = require('memory-cache')

async function getData (req) {
  const params = {
    param1: req.data,
    param2: 'param2'
  }
  cache.get('houdini')
}

async function addHoliday (req) {
  req.month = req.req.forEach(item => {
    cache.put(req.month)
  })
}

module.exports = {
  getData,
  addHoliday
}
