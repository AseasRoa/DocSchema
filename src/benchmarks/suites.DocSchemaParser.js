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
.add('@typedef', () => {
  parser.parseComments(`
/**
 * @typedef firstArg
 * @type {Object}
 * @property {array} array
 * @property {number} number
 * @property {string} string
 */`)
})
.add('@typedef with limits', () => {
  parser.parseComments(`
/**
 * @typedef firstArg
 * @type {Object}
 * @property {array} array {min: 1, max: 2}
 * @property {number} number {gte: 1, lte: 2}
 * @property {string} string {min: 1, max: 2, uuid: true, pattern: /[a-z]/}
 */`)
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
