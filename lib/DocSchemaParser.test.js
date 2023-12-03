import { DocSchemaParser } from './DocSchemaParser.js'

const parser = new DocSchemaParser()

describe('DocSchemaParser', () => {
  describe('Comments Discovery', () => {
    const asts = parser.parseComments(`
      /** @type {string} */
      Code, code, code...
  
      /**
       * Main Description 1
       *
       * Main
       * Description
       *     2
       *
       * @param name1
       * @param {number} name2 - description two
       * @param {string} name3 description three
       * @param {boolean} name4 - this is
       * multiline
       * description
       * @description Second
       * Description
       * @returns {Date} Returns
       * description
       * @description Third
       * Description
       */
       More code, code, code...
  
       /** @type {number} */
       /** @type {number} */
       `)

    test('correct number of comments', () => {
      expect(asts.length).toBe(4)
    })

    test('correct lines of comments', () => {
      const linesMap = asts.map((comment) => {
        return {
          startLine: comment.startLine,
          endLine: comment.endLine
        }
      })

      expect(linesMap).toStrictEqual([
        { startLine: 2, endLine: 2 },
        { startLine: 5, endLine: 24 },
        { startLine: 27, endLine: 27 },
        { startLine: 28, endLine: 28 }
      ])
    })

    test('correct rows after comments', () => {
      expect(asts[0]?.lineAfterComment.trim())
        .toBe('Code, code, code...')

      expect(asts[1]?.lineAfterComment.trim())
        .toBe('More code, code, code...')

      expect(asts[2]?.lineAfterComment.trim())
        .toBe('')

      expect(asts[3]?.lineAfterComment.trim())
        .toBe('')
    })

    test('detect correct main description', () => {
      const description = asts[1]?.elements.description

      expect(description).toBe(
        'Main Description 1\n'
        + 'Main Description 2\n'
        + 'Second Description\n'
        + 'Third Description'
      )
    })

    test('detect correct param descriptions', () => {
      const params = asts[1]?.elements.param

      expect(params?.[0]?.description).toBe('')
      expect(params?.[1]?.description).toBe('description two')
      expect(params?.[2]?.description).toBe('description three')
      expect(params?.[3]?.description).toBe('this is multiline description')
    })

    test('detect typedefs', () => {
      const [ ast ] = parser.parseComments(`
        /**
         * @typedef {string} StringTypedef
         */
  
        /**
         * @typedef {{ a:string, b: number }} ObjTypedefOne
         */
  
        /**
         * @typedef ObjTypedefTwo
         * @type {Object}
         * @property {string} a
         * @property {number} b
         */
      `)

      if (!ast) throw new Error('Missing AST')

      const typedefs = ast?.typedefs

      expect(typedefs[0]).toMatchObject({
        startLine: 2,
        endLine: 4,
        elements: { typedef: { description: 'StringTypedef' }}
      })

      expect(typedefs[1]).toMatchObject({
        startLine: 6,
        endLine: 8,
        elements: { typedef: { description: 'ObjTypedefOne' }}
      })

      expect(typedefs[2]).toMatchObject({
        startLine: 10,
        endLine: 15,
        elements: { typedef: { description: 'ObjTypedefTwo' }}
      })
    })
    
    test('detect callbacks', () => {
      const [ ast ] = parser.parseComments(`
        /**
         * @callback CallbackFn
         * @param {string} a
         * @param {number} b
         */
      `)
      
      if (!ast) throw new Error('Missing AST')
      
      const typedefs = ast?.typedefs
      
      expect(typedefs[0]).toMatchObject({
        startLine: 2,
        endLine: 6,
        elements: { callback: { description: 'CallbackFn' }}
      })
    })
  })
  
  describe('Filters', () => {
    describe('detect correct param filters', () => {
      test('variant 1', () => {
        const [ ast ] = parser.parseComments(`
          /**
           * @param {string} paramOne {min: 1,max: 3} Hello World
           */
        `)

        if (!ast) throw new Error('Missing AST')

        const params = ast?.elements.param

        expect(params[0]).toMatchObject({
          description : 'Hello World',
          filters     : { min: [1, ''], max: [3, ''] }
        })
      })

      test('variant 2', () => {
        const [ ast ] = parser.parseComments(`
           /**
           * @param {string} paramTwo
           * {
           *   min: 1,
           *   max: 3
           * }
           * Hello World
           */
        `)

        if (!ast) throw new Error('Missing AST')

        const params = ast.elements.param

        expect(params[0]).toMatchObject({
          description : 'Hello World',
          filters     : { min: [1, ''], max: [3, ''] }
        })
      })

      test('variant 3', () => {
        const [ ast ] = parser.parseComments(`
          /**
           * @param {string} paramThree - Hello
           * {min: 1,max: 3}
           * World
           */
        `)

        if (!ast) throw new Error('Missing AST')

        const params = ast.elements.param

        expect(params[0]).toMatchObject({
          description : 'Hello World',
          filters     : { min: [1, ''], max: [3, ''] }
        })
      })

      test('variant 4', () => {
        const [ ast ] = parser.parseComments(`
          /**
           * @param {number} paramFour - Hello World
           * {
           *    min: [1, 'Min 1'],
           *    max: [3, 'Max 3']
           * }
           */
        `)

        if (!ast) throw new Error('Missing AST')

        const params = ast.elements.param

        expect(params[0]).toMatchObject({
          description : 'Hello World',
          filters     : { min: [1, 'Min 1'], max: [3, 'Max 3'] }
        })
      })
    })
  })

  describe('Parameter Scopes', () => {
    test('detect correct scopes', () => {
      const asts = parser.parseComments(`
        /**
         * Public
         *
         * @param name
         */
         
         /**
         * Public
         *
         * @param name
         * @public
         */
         
         /**
         * Private
         *
         * @param name
         * @private
         */
         
         /**
         * Protected
         *
         * @param name
         * @protected
         */
         
         /**
         * Mixed
         *
         * @param name
         * @public
         * @private
         * @protected
         */
      `)

      /** @type {AstScope | undefined} */
      let scope = undefined

      // Public scope
      scope = asts[0]?.elements.scope

      expect(scope?.private).toBe(false)
      expect(scope?.protected).toBe(false)
      expect(scope?.public).toBe(true)

      // Public scope
      scope = asts[1]?.elements.scope

      expect(scope?.private).toBe(false)
      expect(scope?.protected).toBe(false)
      expect(scope?.public).toBe(true)

      // Private scope
      scope = asts[2]?.elements.scope

      expect(scope?.private).toBe(true)
      expect(scope?.protected).toBe(false)
      expect(scope?.public).toBe(false)

      // Protected scope
      scope = asts[3]?.elements.scope

      expect(scope?.private).toBe(false)
      expect(scope?.protected).toBe(true)
      expect(scope?.public).toBe(false)

      // Mixed scope
      scope = asts[4]?.elements.scope

      expect(scope?.private).toBe(true)
      expect(scope?.protected).toBe(true)
      expect(scope?.public).toBe(false)
    })
  })
})
