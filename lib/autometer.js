const fs = require('fs')
const shell = require('shelljs')

const logger = require('./logger')

module.exports = (function () {
  const statusJson = 'autometer.status.json'

  var statusFile = function () {
    return statusJson
  }

  var logCmdOutput = function (cmdOutput) {
    if (cmdOutput.match(/error/i) || cmdOutput.match(/daemon running/i)) {
      logger.error(cmdOutput)
      process.exitCode = 1
      throw new Error(cmdOutput)
    } else {
      logger.info(cmdOutput)
      console.log('')
    }
  }

  var tcpHost = function (host) {
    let dockerPort = (process.env['DOCKER_PORT']) ? process.env['DOCKER_PORT'] : '2375'
    let hostUrl = `-H tcp://${host}:${dockerPort}`
    logger.debug(`forming remote tcp host url ${hostUrl}`)
    return hostUrl
  }

  var startContainer = function (host, command) {
    return new Promise((resolve, reject) => {
      shell.exec(command, {silent: true}, (code, output) => {
        const cmdOutput = output.trim()
        logger.info(`starting container on ${host.host}`)
        logCmdOutput(cmdOutput)
        host.id = cmdOutput.split('\n')[0]
        resolve(host)
      })
    })
  }

  var stopContainer = function (container) {
    return new Promise((resolve, reject) => {
      logger.info(`stopping container on ${container.host}`)
      let command = `docker ${tcpHost(container.host)} stop ${container.id}`
      let cmdOutput = shell.exec(command, {silent: true}).output
      logger.debug(`stop container promise called with command: ${command}`)
      logCmdOutput(cmdOutput)
      logger.info(`removing container on ${container.host}`)
      command = `docker ${tcpHost(container.host)} rm ${container.id}`
      cmdOutput = shell.exec(command, {silent: true}).output
      logger.debug(`remove container promise called with command: ${command}`)
      logCmdOutput(cmdOutput)
      resolve()
    })
  }

  var stopContainerByName = function (config, container) {
    return new Promise((resolve, reject) => {
      let command = `docker ${tcpHost(container.host)} ps -a -q --filter="name=${config.testName.toLowerCase()}"`
      logger.debug(`stop container by name filter called with command: ${command}`)
      let cmdOutput = shell.exec(command, {silent: true}).output
      if (cmdOutput !== undefined && cmdOutput.replace(/\s\s+/g, '') !== '') {
        logger.info(`stopping container on ${container.host}`)
        command = `docker ${tcpHost(container.host)} stop $(${command})`
        logger.debug(`stop container by name promise called with command: ${command}`)
        cmdOutput = shell.exec(command, {silent: true}).output
        logCmdOutput(cmdOutput)
        logger.info(`removing container on ${container.host}`)
        command = `docker ${tcpHost(container.host)} rm $(${command})`
        logger.debug(`stop container by name promise called with command ${command}`)
        cmdOutput = shell.exec(command, {silent: true}).output
        logCmdOutput(cmdOutput)
      } else {
        logger.warn(`no containers exist to remove on ${container.host}`)
      }
      resolve()
    })
  }

  var saveStatus = function (updatedConfig) {
    return new Promise((resolve, reject) => {
      const statusFile = `${process.cwd()}/${statusJson}`
      logger.debug(`container status ${statusJson}`)
      fs.writeFile(statusFile, JSON.stringify(updatedConfig), () => {
        logger.info('status saved to file')
        logger.info(statusFile)
        resolve(statusFile)
      })
    })
  }

  var removeContainer = function () {
    const statusFile = `${process.cwd()}/${statusJson}`
    const status = fs.existsSync(statusFile) ? require(statusFile) : null
    logger.debug('remove all containers called for containers')
    if (!status) {
      logger.debug(`container status files ${statusFile} does not exists`)
      logger.error(`${statusJson} does not exist, nothing to stop`)
      return
    }
    stopContainer(status.master).then(() => {
      const slaveStoppers = status.slaves.map(stopContainer)
      Promise.all(slaveStoppers).then(() => {
        logger.warn('slave containers removed, removing the status file')
        shell.rm(statusJson)
      })
    })
  }

  var removeContainerByName = function (config) {
    logger.debug('remove all containers by name called for containers')
    stopContainerByName(config, config.master).then(() => {
      var slaves = config.slaves
      var slaveStoppers = []
      for (var i = 0; i < slaves.length; i++) {
        var slave = slaves[i]
        slaveStoppers.push(stopContainerByName(config, slave))
      }
      Promise.all(slaveStoppers).then(() => {})
    })
  }

  return {
    statusFile: statusFile,
    tcpHost: tcpHost,
    startContainer: startContainer,
    stopContainer: stopContainer,
    stopContainerByName: stopContainerByName,
    saveStatus: saveStatus,
    removeContainer: removeContainer,
    removeContainerByName: removeContainerByName,
    logCmdOutput: logCmdOutput
  }
})()
