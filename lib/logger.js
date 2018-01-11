const winston = require('winston')

module.exports = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      filename: 'autometer.log',
      level: 'debug',
      json: false,
      handleExceptions: true,
      humanReadableUnhandledException: true
    }),
    new (winston.transports.Console)({
      level: 'info',
      colorize: true,
      json: false,
      prettyPrint: true
    })
  ],
  exitOnError: false
})
