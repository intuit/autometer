const fs = require('fs')

const logger = require('./logger')

module.exports = (function () {
  const configJs = 'autometer.config.js'
  let pwd = process.cwd()

  var name = function () {
    return configJs
  }

  var read = function () {
    let errMsg = 'failed to read the config file'
    if (fs.existsSync(`${pwd}/${configJs}`)) {
      logger.debug('reading the config file')
      return require(`${pwd}/${configJs}`)
    }
    process.exitCode = 1
    logger.error(errMsg)
    throw new Error(errMsg)
  }

  var validate = function (config) {
    let valid = true
    logger.debug('validating the config file')
    if (config.testName === undefined || config.master.host === undefined ||
              config.master.resultsPort === undefined ||
              config.slaves === undefined) {
      valid = false
    }
    if (config.slaves) {
      for (let key in config.slaves) {
        let slave = config.slaves[key]
        if (slave.host === undefined || slave.port === undefined ||
                      slave.resultsPort === undefined) {
          valid = false
        }
      }
    }
    if (config.testName) {
      if (!fs.existsSync(config.testName)) {
        valid = false
      }
    }
    logger.debug(`config file validation status is ${valid}`)
    return valid
  }

  return {
    name: name,
    read: read,
    validate: validate
  }
})()
