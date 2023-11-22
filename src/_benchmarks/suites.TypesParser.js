import Benchmark from 'benchmark'
import { TypesParser } from '../TypesParser.js'
import { cycleCallback } from './functions.js'

const typesParser = new TypesParser()

const simpleTypesParserSuite = new Benchmark.Suite('TypeParsers (simple)')

simpleTypesParserSuite
.add('any', () => {
  typesParser.parseType('any')
})
.add('bool', () => {
  typesParser.parseType('true')
})
.add('number', () => {
  typesParser.parseType('123.456')
})
.add('primitive', () => {
  typesParser.parseType('number')
})
.add('string', () => {
  typesParser.parseType(`'some-text'`)
})
.on('cycle', cycleCallback)

const complexTypesParserSuite = new Benchmark.Suite('TypeParsers (complex)')

complexTypesParserSuite
.add('string[]', () => {
  typesParser.parseType('string[]')
})
.add('Array.<number>', () => {
  typesParser.parseType('Array.<number>')
})
.add('Array<number | string>', () => {
  typesParser.parseType('Array<number | string>')
})
.add('Object.<string, number>', () => {
  typesParser.parseType('Object.<string, number>')
})
.add('{keys: string, values: number}', () => {
  typesParser.parseType(`{keys: string, values: number}`)
})
.add('keys: ( string & NUMBER ) , values: ( NUMBER | MyType )', () => {
  typesParser.parseType(`keys: ( string & NUMBER ) , values: ( NUMBER | MyType )`)
})
.on('cycle', cycleCallback)

export default { suites: [ simpleTypesParserSuite, complexTypesParserSuite ] }
