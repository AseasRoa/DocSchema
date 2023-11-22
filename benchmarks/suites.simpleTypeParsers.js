import Benchmark from 'benchmark'
import { simpleTypeParsers } from '../lib/parsers.js'
import { cycleCallback } from './functions.js'

const simpleTypeParsersSuite = new Benchmark.Suite('simpleTypeParsers')

simpleTypeParsersSuite
.add('any', () => {
  simpleTypeParsers.tryAnyType('any')
})
.add('bool', () => {
  simpleTypeParsers.tryBooleanType('true')
})
.add('number', () => {
  simpleTypeParsers.tryNumberType('123.456')
})
.add('primitive', () => {
  simpleTypeParsers.tryPrimitiveType('number')
})
.add('string', () => {
  simpleTypeParsers.tryStringType(`'some-text'`)
})
.on('cycle', cycleCallback)

export default { suites: [ simpleTypeParsersSuite ] }
