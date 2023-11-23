import Benchmark from 'benchmark'
import { parsers } from '../lib/parse-validate-types/parsers.js'
import { cycleCallback } from './functions.js'

const simpleTypeParsersSuite = new Benchmark.Suite('simpleTypeParsers')

simpleTypeParsersSuite
  .add('any', () => {
    parsers.simple.any('any')
  })
  .add('bool', () => {
    parsers.simple.boolean('true')
  })
  .add('number', () => {
    parsers.simple.number('123.456')
  })
  .add('primitive', () => {
    parsers.simple.tryPrimitive('number')
  })
  .add('string', () => {
    parsers.simple.string(`'some-text'`)
  })
  .on('cycle', cycleCallback)

export default { suites: [ simpleTypeParsersSuite ] }
