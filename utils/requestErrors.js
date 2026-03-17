const genericLog = require('./../common/genericLog')

function badRequest (req, res, issues) {
  return res.contentType('application/problem+json').status(400).json({
    title: 'Bad Request',
    status: 400,
    detail: 'The request is invalid.',
    issues: issues
  })
}

function forbidden (req, res) {
  return res.contentType('application/problem+json').status(403).json({
    title: 'Forbidden',
    status: 403
  })
}

exports.notFound = (req, res) => {
  return res.contentType('application/problem+json').status(404).json({
    title: 'Not Found',
    status: 404,
    detail: 'The requested resource cannot be located.'
  })
}

exports.unauthorized = (req, res) => {
  return res.contentType('application/problem+json').status(401).send({
    title: 'Unauthorized',
    status: 401
  })
}

exports.tooManyRequests = (req, res) => {
  return res
    .contentType('application/problem+json')
    .status(429)

    .send({
      title: 'Too Many Requests',
      status: 429,
      detail:
        'The request could not be completed due to the client exceeding the request limit.'
    })
}

exports.resourceGone = (req, res) => {
  return res.contentType('application/problem+json').status(410).send({
    title: 'Gone',
    status: 410,
    detail:
      'Access to the target resource is no longer available at the origin server'
  })
}

exports.internalServer = (req, res, err) => {
  err.customMessage = 'internalServerException'
  genericLog.errorLog(err.customMessage, process.env.ENV)
  return res
    .contentType('application/problem+json')
    .status(500)
    .send(
      err.type
        ? err
        : {
            type: 'https://oneadvanced.com/problem/500',
            title: 'An internal error occurred.',
            status: 500,
            detail: err.message ? err.message : err
          }
    )
}

exports.serviceError = (req, res, err) => {
  genericLog.errorLog(err, process.env.ENV)

  let requestLogData = []
  try {
    let error
    if (err.message) {
      error = err.message
    } else {
      error = JSON.stringify(err)
    }
    requestLogData = {
      url: req.url,
      xAdvRequestId: req.headers['x-adv-requestid'],
      error: error
    }
    genericLog.TraceLog('serviceError', requestLogData, process.env.ENV)
  } catch (err) {
    // ignore here
  }

  let status = 500
  let detail = err.detail ? err.detail : 'Invalid provider request'

  if (err.response && err.response.data && err.response.data.issues) {
    detail = err.response.data.issues
  }
  if (err.response && err.response.status) {
    status = err.response.status
  } else {
    if (err.status) {
      status = err.status
    }
  }
  switch (status) {
    case 400:
      this.badRequest(req, res, detail)
      break
    case 404:
      this.notFound(req, res, err)
      break
    case 429:
      let retryAfter = err?.detail?.retryAfter
        ? err.detail.retryAfter
        : err.response.headers['Retry-After']
        ? err.response.headers['Retry-After']
        : 30
      res.header('Retry-After', retryAfter)
      this.tooManyRequests(req, res)
      break
    case 410:
      this.resourceGone(req, res, err)
      break
    default:
      this.internalServer(req, res, err)
      break
  }
}
