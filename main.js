#!/usr/bin/env node

'use strict'

const args = require('yargs')

const logger = require('./lib/logger')
const command = require('./lib/command')

let options = args
    .usage('\nUsage: $0 <command>')
    .option('startTest', {describe: 'Start the test'})
    .option('stopTest', {describe: 'Stop the running test'})
    .option('logs', {describe: 'Display the running test logs'})
    .option('clear', {describe: 'Clear the test output files'})
    .help('?')
    .alias('?', 'help')
    .example('$0 --startTest', 'Start the test')
    .example('$0 --stopTest', 'Stop the running test')
    .example('$0 --logs', 'Tail the running test logs')
    .example('$0 --clear', 'Remove the generated reports and logs')
    .example('export DOCKER_PORT=port', 'To set docker port, default port 2376')
    .example('DOCKER_PORT=port $0 --startTest', 'To set docker port and start the test')

command.init()

switch (true) {
  case options.argv.startTest:
    logger.debug('start test command issued')
    command.start()
    break

  case options.argv.stopTest:
    logger.debug('stop test command issued')
    command.stop()
    break

  case options.argv.logs:
    logger.debug('tail logs command issued')
    command.logs()
    break

  case options.argv.clear:
    logger.debug('clear files command issued')
    command.clear()
    break

  default:
    // In case of CLI tools, it is important to set exit code properly
    process.exitCode = 1
    logger.error('Invalid option, please refer the help')
    options.showHelp()
}
