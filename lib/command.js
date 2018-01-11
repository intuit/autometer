const config = require('./config')
const jmeter = require('./tool/jmeter')
const logger = require('./logger')

module.exports = (function () {
  var configJs = null

  var init = function () {
    configJs = config.read()
    let errMsg = `invalid ${config.name()} file`
    if (!config.validate(configJs)) {
      process.exitCode = 1
      logger.error(errMsg)
      throw new Error(errMsg)
    }
    jmeter.init(configJs)
  }

  var start = function () {
    jmeter.clear()
    jmeter.start()
  }

  var stop = function () {
    jmeter.stop()
  }

  var logs = function () {
    jmeter.logs()
  }

  var clear = function () {
    jmeter.clear()
  }

  return {
    init: init,
    start: start,
    stop: stop,
    logs: logs,
    clear: clear
  }
})()
