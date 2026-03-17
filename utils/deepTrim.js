module.exports = function deepTrim (event) {
  const type = typeof event

  if (type === 'object') {
    for (let key in event) {
      const item = event[key]
      event[key] = deepTrim(item)
    }
  } else if (type === 'string') {
    event = event.trim()
  } else if (type === 'array') {
    event = event.map(deepTrim)
  }

  return event
}
