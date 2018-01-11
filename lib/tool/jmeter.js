const fs = require('fs')
const shell = require('shelljs')

const autometer = require('../autometer')
const logger = require('../logger')

module.exports = (function () {
  var config = {}
  const reportDir = 'report-dashboad'
  let homeDir = process.cwd()

  var init = function (testConfig) {
    config = testConfig
  }

  var start = function () {
    logger.debug('jmeter start command')
    const slaveStarters = config.slaves.map(function (slave) {
      let cName = `${config.testName.toLowerCase()}_${Date.now()}`
      let command = `docker ${autometer.tcpHost(slave.host)} run -d --name ${cName} \
                -p ${slave.port}:1099 -p ${slave.resultsPort}:${slave.resultsPort} \
                -e "JVM_ARGS=-Djava.rmi.server.hostname=${slave.host}" \
                autometer/jmeter-base -s -Jserver.rmi.localport=${slave.resultsPort}`
      logger.debug(`start container promise called for master with command: ${command.replace(/\s\s+/g, ' ')}`)
      return autometer.startContainer(slave, command)
    })
    Promise.all(slaveStarters).then((slaves) => {
      config.slaves = slaves
      const hostList = config.slaves.map((slave) => `${slave.host}:${slave.port}`).join(',')
      const master = config.master
      let cName = `${config.testName.toLowerCase()}_${Date.now()}`
      let command = `docker ${autometer.tcpHost(master.host)} run -d --name ${cName} \
                -p ${master.resultsPort}:${master.resultsPort} -v ${homeDir}:${homeDir} \
                -e "JVM_ARGS=-Djava.rmi.server.hostname=${master.host}" \
                autometer/jmeter-base -n -X -Jclient.rmi.localport=${master.resultsPort} \
                -j ${homeDir}/jmeter.log -R ${hostList} -G${homeDir}/global.properties \
                -l ${homeDir}/${config.testName}.jtl -t ${homeDir}/${config.testName} \
                -e -o ${homeDir}/${reportDir}`
      logger.debug(`start container promise called for slave with command: ${command.replace(/\s\s+/g, ' ')}`)
      autometer.startContainer(master, command).then((master) => {
        config.master = master
        autometer.saveStatus(config).then((fileName) => {
          console.log('')
          logger.info('use the below command to tail server logs')
          let tailLogs = `docker ${autometer.tcpHost(master.host)} logs -f ${master.id}`
          autometer.logCmdOutput(tailLogs)
        })
      })
    })
  }

  var stop = function () {
    logger.debug('jmeter stop command')
    if (fs.existsSync(`${homeDir}/${autometer.statusFile()}`)) {
      autometer.removeContainer()
    } else {
      autometer.removeContainerByName(config)
    }
  }

  var clear = function () {
    let command = `rm -rf *.log ${reportDir} ${autometer.statusFile()} ${config.testName}.jtl`
    logger.debug(`jmeter clear command: ${command}`)
    shell.exec(command)
  }

  var logs = function () {
    if (!fs.existsSync(`${homeDir}/${autometer.statusFile()}`)) {
      process.exitCode = 1
      logger.error(`no tests are running, start test and tail the logs`)
    } else {
      logger.info('tailing the master for the logs')
      const status = require(`${homeDir}/${autometer.statusFile()}`)
      let master = status.master
      let command = `docker ${autometer.tcpHost(master.host)} logs -f ${master.id}`
      logger.debug(`jmeter tail log command: ${command}`)
      shell.exec(command)
    }
  }

  return {
    init: init,
    start: start,
    stop: stop,
    clear: clear,
    logs: logs
  }
})()
