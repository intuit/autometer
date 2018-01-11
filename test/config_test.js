/* global describe it */
const expect = require('chai').expect
require('chai').should()

const config = require('../lib/config')

describe('Autometer configuration tests', () => {
  it('check config.name returns autometer.config.js', done => {
    expect('autometer.config.js').to.equal(config.name())
    done()
  })

  it('autometer config file not found', done => {
    done(console.log('not implemented'))
  })
  it('invalid autometer config file', done => {
    done(console.log('not implemented'))
  })

  it('test name specified in autometer config does not exist', done => {
    done(console.log('not implemented'))
  })

  it('validate autometer config file', done => {
    done(console.log('not implemented'))
  })
})
