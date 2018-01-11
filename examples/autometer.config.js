const config = {
  testName: 'test.jmx',
  master: {
    host: '127.0.0.1',
    resultsPort: 2199
  },
  slaves: [
        {host: '127.0.0.1', port: 1199, resultsPort: 2099}
  ]
}

module.exports = config
