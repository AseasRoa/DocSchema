import { DocSchemaParser, DocSchemaValidator, ValidationError } from '#docschema'

describe('DocSchemaValidator', () => {
  const parser    = new DocSchemaParser()
  const validator = new DocSchemaValidator()

  /** @type {DocSchemaAst[]} */
  const astCommentPrimitives         = []
  /** @type {DocSchemaAst[]} */
  const astCommentUnions             = []
  /** @type {DocSchemaAst[]} */
  const astCommentOptionalParameters = []
  /** @type {DocSchemaAst[]} */
  const astCommentDestructured       = []

  beforeAll(() => {
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

    astCommentPrimitives.push(
      ...parser.parseComments(commentPrimitives.trim())
    )
    astCommentUnions.push(
      ...parser.parseComments(commentUnions.trim())
    )
    astCommentOptionalParameters.push(
      ...parser.parseComments(commentOptionalParameters.trim())
    )
    astCommentDestructured.push(
      ...parser.parseComments(commentDestructured.trim())
    )
  })

  test('comment with primitives: all types correct', () => {
    const [ ast ] = astCommentPrimitives

    expect(
      validator.validateFunctionArguments(
        // @ts-ignore
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

  test('comment with primitives: error on incorrect type', () => {
    const [ ast ] = astCommentPrimitives

    expect(() => {
      validator.validateFunctionArguments(
        // @ts-ignore
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
    }).toThrow(ValidationError)
  })

  test('comment with union types: all types correct', () => {
    const [ ast ] = astCommentUnions

    expect(
      validator.validateFunctionArguments(
        // @ts-ignore
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
        // @ts-ignore
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

  test('comment with union types: error on incorrect type', () => {
    const [ ast ] = astCommentUnions

    expect(() => {
      validator.validateFunctionArguments(
        // @ts-ignore
        ast,
        [
          'string',
          BigInt(123),
          undefined,
          'null' // this is the one with wrong type
        ]
      )
    }).toThrow(ValidationError)
  })

  test('comment with optional parameters: all types correct', () => {
    const [ ast ] = astCommentOptionalParameters

    expect(
      validator.validateFunctionArguments(
        // @ts-ignore
        ast,
        ['string', true, 123, { a : '', b : 1 }, { adesc : '', bdesc : 1 }]
      ))
    .toBe(
      true
    )

    expect(
      validator.validateFunctionArguments(
        // @ts-ignore
        ast,
        ['string', undefined, undefined, { a : '' }, { adesc : '' }]
      ))
    .toBe(
      true
    )
  })

  test('comment with destructured object', () => {
    const [ ast ] = astCommentDestructured

    expect(
      validator.validateFunctionArguments(
        // @ts-ignore
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
        // @ts-ignore
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

  test('comment: returns type correct', () => {
    const [ ast ]       = astCommentPrimitives
    const [ astUnions ] = astCommentUnions

    // @ts-ignore
    expect(validator.validateTag('returns', ast, 'string')).toBe(true)
    // @ts-ignore
    expect(validator.validateTag('returns', astUnions, 'string')).toBe(true)
    // @ts-ignore
    expect(validator.validateTag('returns', astUnions, 123)).toBe(true)
  })

  test('comment: error on returns', () => {
    const [ ast ]       = astCommentPrimitives
    const [ astUnions ] = astCommentUnions

    expect(() => {
      // @ts-ignore
      validator.validateTag('returns', ast, 123)
    }).toThrow(ValidationError)

    expect(() => {
      // @ts-ignore
      validator.validateTag('returns', astUnions, true)
    }).toThrow(ValidationError)
  })

  test('check throwing error when unspecified arguments', () => {
    const [ ast ] = astCommentPrimitives

    expect(() => {
      // @ts-ignore
      validator.validateFunctionArguments(ast, [''])
    }).toThrow(ValidationError)
  })
})

describe('DocSchemaValidator limits', () => {
  const parser    = new DocSchemaParser()
  const validator = new DocSchemaValidator()

  /** @type {DocSchemaAst[]} */
  const astCommentWithLimitsArray = []
  /** @type {DocSchemaAst[]} */
  const astCommentWithLimitsString = []
  /** @type {DocSchemaAst[]} */
  const astCommentWithLimitsObjectLiteral = []

  beforeAll(() => {
    const commentWithLimitsArray = `
    /**
     * @type {number[]} {min: 3}
     */
    `

    const commentWithLimitsString = `
    /**
     * @param {string} minVal {min: 3}
     * @param {string} maxVal {max: 3}
     * @param {string} lengthVal {length: 3}
     */
    `

    const commentWithLimitsObjectLiteral = `
    /**
     * @type {{
     *   minKey: string, // {min: 3}
     * }} minVal
     */
    `

    astCommentWithLimitsArray.push(
      ...parser.parseComments(commentWithLimitsArray.trim())
    )
    astCommentWithLimitsString.push(
      ...parser.parseComments(commentWithLimitsString.trim())
    )
    astCommentWithLimitsObjectLiteral.push(
      ...parser.parseComments(commentWithLimitsObjectLiteral.trim())
    )
  })

  test('validate limits for array', () => {
    const [ ast ] = astCommentWithLimitsArray

    expect(() => {
      // @ts-ignore
      validator.validateTag('type', ast, [1, 2])
    }).toThrow(ValidationError)
  })

  test('validate limits', () => {
    const [ ast ] = astCommentWithLimitsString

    expect(() => {
      // @ts-ignore
      validator.validateFunctionArguments(ast, ['1', '2', '3'])
    }).toThrow(ValidationError)
  })

  test('validate limits in object literal', () => {
    const [ ast ] = astCommentWithLimitsObjectLiteral

    expect(() => {
      // @ts-ignore
      validator.validateTag('type', ast, {minKey: '12'})
    }).toThrow(ValidationError)
  })
})