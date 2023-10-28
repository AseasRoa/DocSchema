/* eslint-disable max-len */

import { docSchema } from '../index.js'

describe('Schema', function() {
  describe('Schema', function() {
    test('try to create schema, but no JsDoc comment above', function() {
      expect(async () => {
        // No JsDoc comment at all

        const schema = docSchema()
      }).rejects.toThrowError(Error)

      expect(async () => {
        /**
         * This JsDoc comment has an empty space below, which makes it invalid
         *
         * @enum {string}
         */

        const schema = docSchema()
      }).rejects.toThrowError(Error)

      expect(async () => {
        /*
         * This JsDoc comment is wrong, because it doesn't start with two stars
         *
         * @enum {string}
         */
        const schema = docSchema()
      }).rejects.toThrowError(Error)
    })

    test('correct validation', function() {
      /**
       * @enum {{
       *   key1: string,
       *   key2: number
       * }}
       */
      const schema = docSchema()


      expect(schema.validate({ key1: '1', key2: 2})).toBe(true)
      expect(schema.check({ key1: '1', key2: 2})).toBe(true)
    })

    test('correct invalidation', function() {
      /**
       * @enum {{
       *   key1: string,
       *   key2: number
       * }}
       */
      const schema = docSchema()

      expect(() => schema.validate({ key1: 1, key2: '2'})).toThrowError(TypeError)
      expect(schema.check({ key1: 1, key2: '2'})).toBe(false)
    })

    test('correct validation with typedef', function() {
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
      expect(schema.check({ key1: '1', key2: { a: '', b: 0 }})).toBe(true)
    })
  })
})
