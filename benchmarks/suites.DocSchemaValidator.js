import Benchmark from 'benchmark'
import { DocSchemaParser, DocSchemaValidator } from '#docschema'
import { cycleCallback } from './functions.js'

const parser = new DocSchemaParser()
const validator = new DocSchemaValidator()

const ast1 = parser.parseComments(`
  /**
   * @type {string}
   */
  `)

const ast2 = parser.parseComments(`
  /**
   * @param {string} firstArg
   * @param {object} input
   * @param {string} input.arg1
   * @param {boolean} [input.arg2]
   * @param {number=} input.arg3
   * @param {string} lastArg
   */
   function check({ arg1, arg2, arg3 }) {}
  `)

const suiteDocSchemaValidator = new Benchmark.Suite('DocSchemaValidator')

suiteDocSchemaValidator
  .add('@type {string}', () => {
    if (!ast1[0]) throw new Error('Missing AST')

    validator.validateTag('type', ast1[0], 'hello')
  })
  .add('destructured', () => {
    if (!ast2[0]) throw new Error('Missing AST')

    validator.validateFunctionArguments(
      ast2[0],
      [
        'firstArg',
        { arg1 : 'string', arg2 : true, arg3 : 123 },
        'lastArg'
      ]
    )
  })
  .on('cycle',cycleCallback)

export { suiteDocSchemaValidator }
