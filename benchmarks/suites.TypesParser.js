import Benchmark from 'benchmark'
import { parse } from '../lib/parse-validate-types/parse.js'
import { cycleCallback } from './functions.js'

const simpleTypesParserSuite = new Benchmark.Suite('TypeParsers (simple)')

simpleTypesParserSuite
  .add('any', () => {
    parse('any')
  })
  .add('bool', () => {
    parse('true')
  })
  .add('number', () => {
    parse('123.456')
  })
  .add('primitive', () => {
    parse('number')
  })
  .add('string', () => {
    parse(`'some-text'`)
  })
  .on('cycle', cycleCallback)

const complexTypesParserSuite = new Benchmark.Suite('TypeParsers (complex)')

complexTypesParserSuite
  .add('string[]', () => {
    parse('string[]')
  })
  .add('Array.<number>', () => {
    parse('Array.<number>')
  })
  .add('Array<number | string>', () => {
    parse('Array<number | string>')
  })
  .add('Object.<string, number>', () => {
    parse('Object.<string, number>')
  })
  .add('{keys: string, values: number}', () => {
    parse(`{keys: string, values: number}`)
  })
  .add('keys: ( string & NUMBER ) , values: ( NUMBER | MyType )', () => {
    parse(`keys: ( string & NUMBER ) , values: ( NUMBER | MyType )`)
  })
  .on('cycle', cycleCallback)

export default { suites: [ simpleTypesParserSuite, complexTypesParserSuite ] }
