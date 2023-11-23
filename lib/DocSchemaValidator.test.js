import { DocSchemaParser, DocSchemaValidator, ValidationError } from '#docschema'

describe('DocSchemaValidator', () => {
  const parser    = new DocSchemaParser()
  const validator = new DocSchemaValidator()

  /** @type {Ast[]} */
  const astCommentPrimitives = []
  /** @type {Ast[]} */
  const astCommentUnions = []
  /** @type {Ast[]} */
  const astCommentOptionalParameters = []
  /** @type {Ast[]} */
  const astCommentDestructured = []

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
      )
    ).toBe(true)
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
      )
    ).toBe(true)

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
      )
    ).toBe(true)
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
      )
    ).toBe(true)

    expect(
      validator.validateFunctionArguments(
        // @ts-ignore
        ast,
        ['string', undefined, undefined, { a : '' }, { adesc : '' }]
      )
    ).toBe(true)
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
      )
    ).toBe(true)

    expect(
      validator.validateFunctionArguments(
        // @ts-ignore
        ast,
        [
          'firstArg',
          { arg1 : 'string' },
          'lastArg'
        ]
      )
    ).toBe(true)
  })

  test('comment: returns type correct', () => {
    const [ ast ]       = astCommentPrimitives
    const [ astUnions ] = astCommentUnions

    expect(
      // @ts-ignore
      validator.validateTag('returns', ast, 'string')
    ).toBe(true)

    expect(
      // @ts-ignore
      validator.validateTag('returns', astUnions, 'string')
    ).toBe(true)

    expect(
      // @ts-ignore
      validator.validateTag('returns', astUnions, 123)
    ).toBe(true)
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

describe('DocSchemaValidator - Filters', () => {
  const parser    = new DocSchemaParser()
  const validator = new DocSchemaValidator()

  describe('in @type tag', () => {
    test('array', () => {
      const [ ast ] = parser.parseComments(`
        /** @type {number[]} {min: 2} */
        `)

      if (!ast) throw new Error('Missing AST')

      // correct
      expect(
        validator.validateTag('type', ast, [1, 2])
      ).toBe(true)

      // wrong
      expect(() => {
        validator.validateTag('type', ast, [1])
      }).toThrow(ValidationError)
    })

    test('number', () => {
      const [ ast ] = parser.parseComments(`
        /** @type {number} {min: 2} */
        `)

      if (!ast) throw new Error('Missing AST')

      // correct
      expect(
        validator.validateTag('type', ast, 2)
      ).toBe(true)

      // wrong
      expect(() => {
        validator.validateTag('type', ast, 1)
      }).toThrow(ValidationError)
    })

    test('string', () => {
      const [ ast ] = parser.parseComments(`
        /** @type {string} {length: 2} */
        `)

      if (!ast) throw new Error('Missing AST')

      // correct
      expect(
        validator.validateTag('type', ast, '12')
      ).toBe(true)

      // wrong
      expect(() => {
        validator.validateTag('type', ast, '1')
      }).toThrow(ValidationError)
    })
  })

  describe('in function arguments', () => {
    test('array, number, string', () => {
      const [ ast ] = parser.parseComments(`
        /**
         * @param {number[]} arrayArg {min: 2}
         * @param {number} numberArg {min: 2}
         * @param {string} stringArg {min: 2}
         */
         function validate(arrayArg, numberArg, stringArg) {}
        `)

      if (!ast) throw new Error('Missing AST')

      // correct
      expect(
        validator.validateFunctionArguments(ast, [[1, 2], 2, '12'])
      ).toBe(true)

      // wrong array
      expect(() => {
        validator.validateFunctionArguments(ast, [[1], 2, '12'])
      }).toThrow(ValidationError)

      // wrong number
      expect(() => {
        validator.validateFunctionArguments(ast, [[1, 2], 1, '12'])
      }).toThrow(ValidationError)

      // wrong string
      expect(() => {
        validator.validateFunctionArguments(ast, [[1, 2], 2, '1'])
      }).toThrow(ValidationError)
    })
  })

  describe('in @typedef', () => {
    test('array, number, string', () => {
      const [ ast ] = parser.parseComments(`
        /**
         * @typedef {
         *   @property {number[]} array {min: 2}
         *   @property {number} number {min: 2}
         *   @property {string} string {min: 2}
         * } Type
         */
        `)

      if (!ast) throw new Error('Missing AST')

      // correct
      expect(
        validator.validateTypedef(ast, {array: [1, 2], number: 2, string: '12'})
      ).toBe(true)

      // wrong array
      expect(() => {
        validator.validateTypedef(ast, {array: [1], number: 2, string: '12'})
      }).toThrow(ValidationError)

      // wrong number
      expect(() => {
        validator.validateTypedef(ast, {array: [1, 2], number: 1, string: '12'})
      }).toThrow(ValidationError)

      // wrong string
      expect(() => {
        validator.validateTypedef(ast, {array: [1, 2], number: 2, string: '1'})
      }).toThrow(ValidationError)
    })
  })

  describe('in @typedef (variant 2)', () => {
    test('array, number, string', () => {
      const [ ast ] = parser.parseComments(`
        /**
         * @typedef Type
         * @type {object}
         * @property {number[]} array {min: 2}
         * @property {number} number {min: 2}
         * @property {string} string {min: 2}
         */
        `)

      if (!ast) throw new Error('Missing AST')

      // correct
      expect(
        validator.validateTypedef(ast, {array: [1, 2], number: 2, string: '12'})
      ).toBe(true)

      // wrong array
      expect(() => {
        validator.validateTypedef(ast, {array: [1], number: 2, string: '12'})
      }).toThrow(ValidationError)

      // wrong number
      expect(() => {
        validator.validateTypedef(ast, {array: [1, 2], number: 1, string: '12'})
      }).toThrow(ValidationError)

      // wrong string
      expect(() => {
        validator.validateTypedef(ast, {array: [1, 2], number: 2, string: '1'})
      }).toThrow(ValidationError)
    })
  })

  describe('in destructured object', () => {
    test('array, number, string', () => {
      const [ ast ] = parser.parseComments(`
        /**
         * @param {Object} input
         * @param {number[]} [input.array] {min: 2}
         * @param {number} input.number {min: 2}
         * @param {string} input.string {min: 2}
         */
        `)

      if (!ast) throw new Error('Missing AST')

      // correct
      expect(
        validator.validateParams(
          'param', ast, {input: {array: [1, 2], number: 2, string: '12'}}
        )
      ).toBe(true)

      // wrong array
      expect(() => {
        validator.validateParams(
          'param', ast, {input: {array: [1], number: 2, string: '12'}}
        )
      }).toThrow(ValidationError)

      // wrong number
      expect(() => {
        validator.validateParams(
          'param', ast, {input: {array: [1, 2], number: 1, string: '12'}}
        )
      }).toThrow(ValidationError)

      // wrong string
      expect(() => {
        validator.validateParams(
          'param', ast, {input: {array: [1, 2], number: 2, string: '1'}}
        )
      }).toThrow(ValidationError)
    })
  })

  describe('in object literal', () => {
    test('array, number, string', () => {
      const [ ast ] = parser.parseComments(`
        /**
         * @type {{
         *   array: number[], // {min: 2}
         *   number: number, // {min: 2}
         *   string: string, // {min: 2}
         * }}
         */
        `)

      if (!ast) throw new Error('Missing AST')

      // correct
      expect(
        validator.validateTag(
          'type', ast, {array: [1, 2], number: 2, string: '12'}
        )
      ).toBe(true)

      // wrong array
      expect(() => {
        validator.validateTag(
          'type', ast, {array: [1], number: 2, string: '12'}
        )
      }).toThrow(ValidationError)

      // wrong number
      expect(() => {
        validator.validateTag(
          'type', ast, {array: [1, 2], number: 1, string: '12'}
        )
      }).toThrow(ValidationError)

      // wrong string
      expect(() => {
        validator.validateTag(
          'type', ast, {array: [1, 2], number: 2, string: '1'}
        )
      }).toThrow(ValidationError)
    })
  })
})
