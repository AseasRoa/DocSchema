import {
  docSchema,
  DocSchema,
  DocSchemaParser,
  DocSchemaValidator,
  ValidationError
} from '#docschema'
import './assets/ambientTypedefs.js'
import './assets/ambientTypedefs2.js'

const parser = new DocSchemaParser()
const validator = new DocSchemaValidator()

describe('DocSchema', () => {
  describe('Schema Creation', () => {
    test('docSchema() and new DocSchema() are identical', () => {
      /** @enum {string} */
      const schema1 = docSchema()

      /** @enum {string} */
      const schema2 = new DocSchema()

      expect(schema1).toStrictEqual(schema2)
    })

    test('try to create schema, but without JsDoc comment above', () => {
      expect(() => {
        // No JsDoc comment at all

        const schema = docSchema()
      }).toThrow(SyntaxError)

      expect(() => {
        /**
         * This JsDoc comment has an empty space below,
         * which makes it invalid
         *
         * @enum {string}
         */

        const schema = docSchema()
      }).toThrow(SyntaxError)

      expect(() => {
        /* eslint-disable-next-line jsdoc/no-bad-blocks */
        /*
         * This JsDoc comment is wrong, because it doesn't
         * start with two stars
         *
         * @enum {string}
         */
        const schema = docSchema()
      }).toThrow(SyntaxError)
    })
  })

  describe('approves(), validate()', () => {
    test('correct validation', () => {
      /**
       * @enum {{
       *   key1: string,
       *   key2: number
       * }}
       */
      const schema = docSchema()

      const validValue = { key1: '1', key2: 2 }
      expect(schema.validate(validValue)).toStrictEqual(validValue)
      expect(schema.approves(validValue)).toBe(true)
    })

    test('correct invalidation', () => {
      /**
       * @enum {{
       *   key1: string,
       *   key2: number
       * }}
       */
      const schema = docSchema()

      expect(
        () => schema.validate({ key1: 1, key2: '2' })
      ).toThrow(ValidationError)
      expect(schema.approves({ key1: 1, key2: '2' })).toBe(false)
    })

    test('correct validation and invalidation with typedef', () => {
      /*
       * This is mostly to test whether it fails on the first
       * wrong property in typedef
       */

      /**
       * @typedef NodeMake
       * @type {object}
       * @property {string} key1
       * @property {number} key2
       */

      /**
       * @enum {NodeMake}
       */
      const schema = docSchema()

      // validate
      schema.validate({ key1: '', key2: 0 })

      // invalidate
      expect(
        () => schema.validate({ key1: 0, key2: 0 })
      ).toThrow(ValidationError)
      expect(
        () => schema.validate({ key1: '', key2: '' })
      ).toThrow(ValidationError)
    })

    test('correct validation and invalidation with local typedefs', () => {
      /**
       * @typedef {string} StringTypedef
       */

      /**
       * @typedef {{ a:string, b: number }} ObjTypedefOne
       */

      /**
       * @typedef {Object} ObjTypedefTwo
       * @type {Object}
       * @property {string} a
       * @property {number} b
       */

      /**
       * @enum {{
       *   key1: StringTypedef,
       *   key2: ObjTypedefOne,
       *   key3: ObjTypedefTwo
       * }}
       */
      const schema = docSchema()

      // validate
      const validValue = {
        key1: '',
        key2: { a: '', b: 0 },
        key3: { a: '', b: 0 }
      }
      expect(schema.validate(validValue)).toStrictEqual(validValue)
      expect(schema.approves(validValue)).toBe(true)

      // invalidate
      expect(() => schema.validate(
        { key1: 1, key2: { a: '', b: 0 }, key3: { a: '', b: 0 } }
      )).toThrow(ValidationError)
      expect(() => schema.validate(
        { key1: '', key2: { a: '', b: '' }, key3: { a: '', b: 0 } }
      )).toThrow(ValidationError)
      expect(() => schema.validate(
        { key1: '', key2: { a: '', b: 0 }, key3: { a: '', b: '' } }
      )).toThrow(ValidationError)
    })

    test('correct validation and invalidation with ambient typedefs', () => {
      /**
       * @enum {{
       *   key1: AmbientString,
       *   key2: AmbientObjOne,
       *   key3: AmbientObjTwo
       * }}
       */
      const schema = docSchema()

      // validate
      const validValue = {
        key1: '',
        key2: { a: '', b: 0 },
        key3: { a: '', b: 0 }
      }
      expect(schema.validate(validValue)).toStrictEqual(validValue)
      expect(schema.approves(validValue)).toBe(true)

      // invalidate
      expect(() => schema.validate(
        { key1: 1, key2: { a: '', b: 0 }, key3: { a: '', b: 0 } }
      )).toThrow(ValidationError)
      expect(() => schema.validate(
        { key1: '', key2: { a: '', b: '' }, key3: { a: '', b: 0 } }
      )).toThrow(ValidationError)
      expect(() => schema.validate(
        { key1: '', key2: { a: '', b: 0 }, key3: { a: '', b: '' } }
      )).toThrow(ValidationError)
      expect(() => schema.validate(
        { key1: '', key2: { a: '', b: 0 }, key3: { a: '', b: '' } }
      )).toThrow(ValidationError)
    })

    test(
      'correct validation and invalidation with ambient typedefs (remote)',
      () => {
        /**
         * @enum {{
         *   key1: AmbientObjThree
         * }}
         */
        const schema = docSchema()

        // validate
        const validValue = {
          key1: { a: '' }
        }
        expect(schema.validate(validValue)).toStrictEqual(validValue)
        expect(schema.approves(validValue)).toBe(true)

        // invalidate
        expect(() => schema.validate(
          { key1: 1 }
        )).toThrow(ValidationError)
      }
    )

    test('correct invalidation with filters', () => {
      /**
       * @enum {{
       *   key1: number, // {min: 3}
       * }}
       */
      const schema = docSchema()

      expect(() => schema.validate({ key1: 1 })).toThrow(ValidationError)
      expect(schema.approves({ key1: 1 })).toBe(false)
    })

    test('correct invalidation with filters and custom error messages', () => {
      /**
       * @enum {{
       *   key1: number, // { min: [ 3, 'Minimum is 3'], max: 5 }
       * }}
       */
      const schema = docSchema()

      expect(() => schema.validate({ key1: 1 })).toThrow('Minimum is 3')
      expect(schema.check({ key1: 1 })).toMatchObject({
        message: 'Minimum is 3'
      })
    })

    test('correct validation and invalidation with strict typedef', () => {
      /**
       * @typedef TypedefValidateStrict
       * @type {object}
       * @property {string} key1
       * @property {number} key2
       * @strict
       */

      /**
       * @enum {TypedefValidateStrict}
       */
      const schema = docSchema()

      // validate
      schema.validate({ key1: '', key2: 0 })

      // invalidate
      expect(
        () => schema.validate({ key1: '', key2: 0, key3: 1 })
      ).toThrow(ValidationError)
    })
  })

  describe('check()', () => {
    test('simple value', () => {
      /**
       * @enum {number} num { min: 5 }
       */
      const schema = docSchema()

      // pass
      let result = schema.check(123)

      expect(result).toMatchObject({
        pass: true,
        kind: '',
        tag: 'enum',
        expectedType: '',
        filter: undefined,
        value: undefined,
        valuePath: []
      })

      // wrong type
      result = schema.check('wrong')

      expect(result).toMatchObject({
        pass: false,
        kind: 'type',
        tag: 'enum',
        expectedType: 'number',
        filter: undefined,
        value: 'wrong',
        valuePath: []
      })

      // wrong filter
      result = schema.check(3)

      expect(result).toMatchObject({
        pass: false,
        kind: 'filter',
        tag: 'enum',
        expectedType: 'number',
        filter: { name: 'min', value: 5 },
        value: 3,
        valuePath: []
      })
    })

    test('flat object literal', () => {
      /**
       * @enum {{
       *   key1: string,
       *   key2: number
       * }}
       */
      const schema = docSchema()

      const result = schema.check({ key1: '', key2: '' })

      expect(result).toMatchObject({
        pass: false,
        kind: 'type',
        tag: 'enum',
        expectedType: 'number',
        filter:  undefined,
        value: '',
        valuePath: ['key2']
      })
    })

    test('deep object', () => {
      /**
       * Have an extra object before the one that is
       * tested here. This tests the path better.
       *
       * @enum {{
       * objOne: Object<string,
       *   Object<string, Object<string, number>>
       * >,
       * objTwo: Object<string,
       *   Object<string, Object<string, number>>
       * >
       * }} obj
       */
      const schema = docSchema()

      // pass
      let result = schema.check({
        objOne: { a: { b: { c: 123 } } },
        objTwo: { a: { b: { c: 456 } } }
      })

      expect(result).toMatchObject({
        pass: true,
        kind: '',
        tag: 'enum',
        expectedType: '',
        filter: undefined,
        value: undefined,
        valuePath: []
      })

      // wrong type
      result = schema.check({
        objOne: { a: { b: { c: 123 } } },
        objTwo: { a: { b: { c: 'wrong' } } }
      })

      expect(result).toMatchObject({
        pass: false,
        kind: 'type',
        tag: 'enum',
        expectedType: 'number',
        filter: undefined,
        value: 'wrong',
        valuePath: ['objTwo', 'a', 'b', 'c']
      })
    })

    test('deep object literal', () => {
      /**
       * Have an extra object before the one that is
       * tested here. This tests the path better.
       *
       * @enum {{
       *   objOne: { a: { b: { c: number } } },
       *   objTwo: {
       *     a: {
       *       b: {
       *         c: number // { min: 5 }
       *       }
       *     }
       *   }
       * }} obj
       */
      const schema = docSchema()

      // pass
      let result = schema.check({
        objOne: { a: { b: { c: 123 } } },
        objTwo: { a: { b: { c: 456 } } }
      })

      expect(result).toMatchObject({
        pass: true,
        kind: '',
        tag: 'enum',
        expectedType: '',
        filter: undefined,
        value: undefined,
        valuePath: []
      })

      // wrong type
      result = schema.check({
        objOne: { a: { b: { c: 123 } } },
        objTwo: { a: { b: { c: 'wrong' } } }
      })

      expect(result).toMatchObject({
        pass: false,
        kind: 'type',
        tag: 'enum',
        expectedType: 'number',
        filter: undefined,
        value: 'wrong',
        valuePath: ['objTwo', 'a', 'b', 'c']
      })

      // wrong filter
      result = schema.check({
        objOne: { a: { b: { c: 123 } } },
        objTwo: { a: { b: { c: 3 } } }
      })

      expect(result).toMatchObject({
        pass: false,
        kind: 'filter',
        tag: 'enum',
        expectedType: 'number',
        filter:  { name: 'min', value: 5 },
        value: 3,
        valuePath: ['objTwo', 'a', 'b', 'c']
      })
    })

    test('array', () => {
      /**
       * Have an extra array before the one that is
       * tested here. This tests the path better.
       *
       * @enum {{
       *   arrOne: string[],
       *   arrTwo: number[]
       * }} arr
       */
      const schema = docSchema()

      // pass
      let result = schema.check({
        arrOne: [ '' ],
        arrTwo: [ 456 ]
      })

      expect(result).toMatchObject({
        pass: true,
        kind: '',
        tag: 'enum',
        expectedType: '',
        filter: undefined,
        value: undefined,
        valuePath: []
      })

      // wrong
      result = schema.check({
        arrOne: [ '', '', '' ],
        arrTwo: [ 123, 456, 'wrong', 789 ]
      })

      expect(result).toMatchObject({
        pass: false,
        kind: 'type',
        tag: 'enum',
        expectedType: 'number',
        filter: undefined,
        value: 'wrong',
        valuePath: ['arrTwo', '2']
      })
    })

    /**
     * This checks whether we can have 2 different results.
     * The issue that is tested here is the fact that while
     * checking, the check result is collected in a variable
     * that is passed by reference. At the end, when the check
     * result is returned, the returned value must be a clone
     * of the variable.
     */
    test('correct check result when multiple checks', () => {
      /**
       * @enum {{
       *   key1: string,
       *   key2: number
       * }}
       */
      const schema = docSchema()

      const result1 = schema.check({ key1: '', key2: '' })
      const result2 = schema.check({ key1: 1, key2: 2 })

      expect(result1).not.toStrictEqual(result2)
    })

    test('correct check result when strict typedef', () => {
      /**
       * @typedef TypedefCheckStrict
       * @type {object}
       * @property {string} key1
       * @property {number} key2
       */

      /**
       * @enum {TypedefCheckStrict}
       * @strict
       */
      const schema = docSchema()

      // validate
      expect(schema.check({ key1: '', key2: 0 }).pass).toBe(true)

      // invalidate
      const result = schema.check({ key1: '', key2: 0, key3: 1 })

      expect(result).toMatchObject({
        pass: false,
        kind: 'strict',
        tag: 'enum',
        expectedType: '',
        filter: undefined,
        value: undefined,
        valuePath: []
      })
    })

    test('correct check result when strict params', () => {
      /**
       * @param {string} key1
       * @param {number} key2
       * @strict
       */
      const schema = docSchema()

      // validate
      expect(schema.check({ key1: '', key2: 0 }).pass).toBe(true)

      // invalidate
      const result = schema.check({ key1: '', key2: 0, key3: 1 })

      expect(result).toMatchObject({
        pass: false,
        kind: 'strict',
        tag: 'param',
        expectedType: '',
        filter: undefined,
        value: undefined,
        valuePath: []
      })
    })

    test('correct check result when strict function params', () => {
      const [ ast ] = parser.parseComments(`
        /**
         * @param {number} numberArg
         * @strict
         */
         function validate(numberArg) {}
        `)

      if (!ast) throw new Error('Missing AST')

      // correct
      expect(
        validator.validateFunctionArguments(ast, [1])
      ).toMatchObject({ pass: true })

      // wrong
      expect(() => {
        validator.validateFunctionArguments(ast, [1, 2])
      }).toThrow(ValidationError)
    })
  })
})
