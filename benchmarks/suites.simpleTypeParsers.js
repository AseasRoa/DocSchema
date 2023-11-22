import Benchmark from 'benchmark'
import { simpleTypeParsers } from '../lib/parsers.js'
import { cycleCallback } from './functions.js'

const simpleTypeParsersSuite = new Benchmark.Suite('simpleTypeParsers')

simpleTypeParsersSuite
  .add('any', () => {
    simpleTypeParsers.any('any')
  })
  .add('bool', () => {
    simpleTypeParsers.boolean('true')
  })
  .add('number', () => {
    simpleTypeParsers.number('123.456')
  })
  .add('primitive', () => {
    simpleTypeParsers.tryPrimitiveType('number')
  })
  .add('string', () => {
    simpleTypeParsers.string(`'some-text'`)
  })
  .on('cycle', cycleCallback)

export default { suites: [ simpleTypeParsersSuite ] }
