import Benchmark from 'benchmark'
import { DocSchemaParser } from '../DocSchemaParser.js'
import { cycleCallback } from './functions.js'

const parser = new DocSchemaParser()

const parserSuite = new Benchmark.Suite('DocSchemaParser')

parserSuite
.add('@type {string}', () => {
  parser.parseComments(`/** @type {string} */`)
})
.add('@type {bool}', () => {
  parser.parseComments(`/** @type {bool} */`)
})
.add('@type {Date}', () => {
  parser.parseComments(`/** @type {Date} */`)
})
.add('destructured', () => {
  parser.parseComments(`
/**
 * @param {string} firstArg
 * @param {object} input
 * @param {string} input.arg1
 * @param {boolean} [input.arg2]
 * @param {number=} input.arg3
 * @param {string} lastArg
 */`)
})
.on('cycle',cycleCallback)

export default { suites: [ parserSuite ] }
