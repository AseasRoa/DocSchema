import { DocSchemaParser } from '../DocSchemaParser.js'
import { DocSchemaValidator } from '../DocSchemaValidator.js'

describe('DocSchemaValidator', function() {
  const parser    = new DocSchemaParser()
  const validator = new DocSchemaValidator()

  /** @type {DocSchemaAst[]} */
  let astCommentPrimitives         = []
  /** @type {DocSchemaAst[]} */
  let astCommentUnions             = []
  /** @type {DocSchemaAst[]} */
  let astCommentOptionalParameters = []
  /** @type {DocSchemaAst[]} */
  let astCommentDestructured       = []

  beforeAll(function() {
    const commentPrimitives = `
    /**
     * @param arg1
     * @param {string} arg2
     * @param {number} arg3
     * @param {bigint} arg4
     * @param {boolean} arg5
     * @param {undefined} arg6
     * @param {symbol} arg7
     * @param {null} arg8
     * @returns {string}
     */
     function check(arg1) {}
     `

    const commentUnions = `
    /**
     * @param {string |number} arg1
     * @param {bigint| boolean} arg2
     * @param {undefined | symbol} arg3
     * @param { null | Date } arg4
     * @returns {string |number}
     */
     function check(arg1) {}
    `

    const commentOptionalParameters = `
    /**
     * @param {string} arg1
     * @param {boolean} [arg2]
     * @param {number=} arg3
     * @param {{a: string, b?:number}} arg4
     * @param {{
     *   adesc: string, // a-desc
     *   bdesc?:number // b-desc
     * }} arg5
     */
     function check(arg1, arg2, arg3, arg4, arg5) {}
    `

    const commentDestructured = `
    /**
     * @param {string} firstArg
     * @param {object} input
     * @param {string} input.arg1
     * @param {boolean} [input.arg2]
     * @param {number=} input.arg3
     * @param {string} lastArg
     */
     function check({ arg1, arg2, arg3 }) {}
    `

    astCommentPrimitives         = parser.parseComments(commentPrimitives.trim())
    astCommentUnions             = parser.parseComments(commentUnions.trim())
    astCommentOptionalParameters = parser.parseComments(
      commentOptionalParameters.trim()
    )
    astCommentDestructured       = parser.parseComments(
      commentDestructured.trim()
    )
  })

  test('comment with primitives: all types correct', function() {
    const ast = astCommentPrimitives?.[0]

    if (!ast) {
      expect(true).toBe(false)

      return
    }

    expect(
      validator.validateFunctionArguments(
        ast,
        [
          'anything',
          'string',
          123,
          BigInt(123),
          true,
          undefined,
          Symbol('symbol'),
          null
        ]
      ))
    .toBe(
      true
    )
  })

  test('comment with primitives: error on incorrect type', function() {
    const ast = astCommentPrimitives?.[0]

    expect(() => {
      if (ast) {
        validator.validateFunctionArguments(
          ast,
          [
            'anything',
            'string',
            123,
            BigInt(123),
            true,
            undefined,
            Symbol('symbol'),
            'null' // this is the one with wrong type
          ]
        )
      }
    }).toThrowError(TypeError)
  })

  test('comment with union types: all types correct', function() {
    const ast = astCommentUnions?.[0]

    if (!ast) {
      expect(true).toBe(false)

      return
    }

    expect(
      validator.validateFunctionArguments(
        ast,
        [
          'string',
          BigInt(123),
          undefined,
          null
        ]
      ))
    .toBe(
      true
    )

    expect(
      validator.validateFunctionArguments(
        ast,
        [
          123,
          true,
          Symbol('symbol'),
          new Date() // not exactly primitive, but anyway
        ]
      ))
    .toBe(
      true
    )
  })

  test('comment with union types: error on incorrect type', function() {
    const ast = astCommentUnions?.[0]

    expect(() => {
      if (ast) {
        validator.validateFunctionArguments(
          ast,
          [
            'string',
            BigInt(123),
            undefined,
            'null' // this is the one with wrong type
          ]
        )
      }
    }).toThrowError(TypeError)
  })

  test('comment with optional parameters: all types correct', function() {
    const ast = astCommentOptionalParameters?.[0]

    if (!ast) {
      expect(true).toBe(false)

      return
    }

    expect(
      validator.validateFunctionArguments(
        ast,
        ['string', true, 123, { a : '', b : 1 }, { adesc : '', bdesc : 1 }]
      ))
    .toBe(
      true
    )

    expect(
      validator.validateFunctionArguments(
        ast,
        ['string', undefined, undefined, { a : '' }, { adesc : '' }]
      ))
    .toBe(
      true
    )
  })

  test('comment with destructured object', function() {
    const ast = astCommentDestructured?.[0]

    if (!ast) {
      expect(true).toBe(false)

      return
    }

    expect(
      validator.validateFunctionArguments(
        ast,
        [
          'firstArg',
          { arg1 : 'string', arg2 : true, arg3 : 123 },
          'lastArg'
        ]
      ))
    .toBe(
      true
    )

    expect(
      validator.validateFunctionArguments(
        ast,
        [
          'firstArg',
          { arg1 : 'string' },
          'lastArg'
        ]
      ))
    .toBe(
      true
    )
  })

  test('comment: returns type correct', function() {
    const ast       = astCommentPrimitives?.[0]
    const astUnions = astCommentUnions?.[0]

    if (!ast || !astUnions) {
      expect(true).toBe(false)

      return
    }

    expect(validator.validateTag('returns', ast, 'string')).toBe(true)
    expect(validator.validateTag('returns', astUnions, 'string')).toBe(true)
    expect(validator.validateTag('returns', astUnions, 123)).toBe(true)
  })

  test('comment: error on returns', function() {
    const ast       = astCommentPrimitives?.[0]
    const astUnions = astCommentUnions?.[0]

    if (!ast || !astUnions) {
      expect(true).toBe(false)

      return
    }

    expect(() => {
      validator.validateTag('returns', ast, 123)
    }).toThrowError(TypeError)

    expect(() => {
      validator.validateTag('returns', astUnions, true)
    }).toThrowError(TypeError)
  })

  test('check throwing error when unspecified arguments', function() {
    const ast = astCommentPrimitives?.[0]

    expect(() => {
      if (ast) {
        validator.validateFunctionArguments(ast, [''])
      }
    }).toThrowError(TypeError)
  })
})
