import { docSchema, DocSchema, ValidationError } from '#docschema'

describe('DocSchema', () => {
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
       * This JsDoc comment has an empty space below, which makes it invalid
       *
       * @enum {string}
       */

      const schema = docSchema()
    }).toThrow(SyntaxError)

    expect(() => {
      /* eslint-disable-next-line jsdoc/no-bad-blocks */
      /*
       * This JsDoc comment is wrong, because it doesn't start with two stars
       *
       * @enum {string}
       */
      const schema = docSchema()
    }).toThrow(SyntaxError)
  })

  test('correct validation', () => {
    /**
     * @enum {{
     *   key1: string,
     *   key2: number
     * }}
     */
    const schema = docSchema()

    expect(schema.validate({ key1: '1', key2: 2})).toBe(true)
    expect(schema.approves({ key1: '1', key2: 2})).toBe(true)
  })

  test('correct invalidation', () => {
    /**
     * @enum {{
     *   key1: string,
     *   key2: number
     * }}
     */
    const schema = docSchema()

    expect(() => schema.validate({ key1: 1, key2: '2'})).toThrow(ValidationError)
    expect(schema.approves({ key1: 1, key2: '2'})).toBe(false)
  })

  test('correct validation with typedef', () => {
    /**
     * @typedef {string} StringTypedef
     */

    /**
     * @typedef {{ a:string, b: number }} ObjTypedef
     */

    /**
     * @enum {{
     *   key1: StringTypedef,
     *   key2: ObjTypedef
     * }}
     */
    const schema = docSchema()

    expect(schema.validate({ key1: '1', key2: { a: '', b: 0 }})).toBe(true)
    expect(schema.approves({ key1: '1', key2: { a: '', b: 0 }})).toBe(true)
  })

  test('correct invalidation with filters', () => {
    /**
     * @enum {{
     *   key1: number, // {min: 3}
     * }}
     */
    const schema = docSchema()

    expect(() => schema.validate({ key1: 1})).toThrow(ValidationError)
    expect(schema.approves({ key1: 1})).toBe(false)
  })

  describe('check() function', () => {
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

    test('object', () => {
      /**
       * Have an extra object before the one that is
       * tested here. This tests the path better.
       *
       * @enum {{
       *   objOne: Object<string, Object<string, Object<string, number>>>,
       *   objTwo: Object<string, Object<string, Object<string, number>>>,
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

    test('object literal', () => {
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
  })
})
