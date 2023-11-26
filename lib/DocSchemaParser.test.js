import { DocSchemaParser } from './DocSchemaParser.js'

describe('DocSchemaParser', () => {
  const parser = new DocSchemaParser()

  /** @type {Ast[]} */
  const astComments           = []
  /** @type {Ast[]} */
  const astCommentsWithScopes = []
  /** @type {Ast[]} */
  const astCommentsWithFilters = []

  beforeAll(() => {
    const comments = `
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
       * @description Secondary
       * Description
       * @returns {Date} Returns
       * description
       * @description Third
       * Description
       */
       More code, code, code...
  
       /** @type {number} */
       /** @type {number} */
       `

    const commentsWithScopes = `
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
      `

    const commentsWithFilters = `
      /**
       * @param {string} paramOne {min: 1,max: 3} Description one
       * @param {string} paramTwo
       * {
       *   min: 1,
       *   max: 3
       * }
       * Description two
       * @param {string} paramThree - Description
       * {min: 1,max: 3}
       * three
       * @param {number} paramFour - Description four
       * {
       *    min: [1, 'Min 1'],
       *    max: [3, 'Max 3']
       * }
       * 
       */
      `

    astComments.push(
      ...parser.parseComments(comments.trim())
    )
    astCommentsWithScopes.push(
      ...parser.parseComments(commentsWithScopes.trim())
    )
    astCommentsWithFilters.push(
      ...parser.parseComments(commentsWithFilters.trim())
    )
  })

  describe('Multiple comments', () => {
    test('correct number of comments', () => {
      expect(astComments.length).toBe(4)
    })

    test('correct lines of comments', () => {
      const linesMap = astComments.map((comment) => {
        return {
          startLine: comment.startLine,
          endLine: comment.endLine
        }
      })

      expect(linesMap).toStrictEqual([
        { startLine: 1, endLine: 1 },
        { startLine: 4, endLine: 23 },
        { startLine: 26, endLine: 26 },
        { startLine: 27, endLine: 27 }
      ])
    })
  })

  describe('Rows after comments', () => {
    test('correct rows after comments', () => {
      expect(astComments[0]?.lineAfterComment.trim())
        .toBe('Code, code, code...')

      expect(astComments[1]?.lineAfterComment.trim())
        .toBe('More code, code, code...')

      expect(astComments[2]?.lineAfterComment.trim())
        .toBe('')

      expect(astComments[3]?.lineAfterComment.trim())
        .toBe('')
    })
  })

  describe('Descriptions', () => {
    test('detect correct main description', () => {
      const description = astComments[1]?.elements.description

      expect(description).toBe(
        'Main Description 1\n'
          + 'Main Description 2\n'
          + 'Secondary Description\n'
          + 'Third Description'
      )
    })

    test('detect correct param descriptions', () => {
      const params = astComments[1]?.elements.param

      expect(params?.[0]?.description).toBe('')
      expect(params?.[1]?.description).toBe('description two')
      expect(params?.[2]?.description).toBe('description three')
      expect(params?.[3]?.description).toBe('this is multiline description')
    })
  })

  describe('Filters', () => {
    test('detect correct param filters', () => {
      const params = astCommentsWithFilters[0]?.elements.param

      expect(params?.[0]?.description).toBe('Description one')
      expect(params?.[0]?.filters).toStrictEqual(
        { min: [1, ''], max: [3, ''] }
      )

      expect(params?.[1]?.description).toBe('Description two')
      expect(params?.[1]?.filters).toStrictEqual(
        { min: [1, ''], max: [3, ''] }
      )

      expect(params?.[2]?.description).toBe('Description three')
      expect(params?.[2]?.filters).toStrictEqual(
        { min: [1, ''], max: [3, ''] }
      )

      expect(params?.[3]?.description).toBe('Description four')
      expect(params?.[3]?.filters).toStrictEqual(
        {min: [1, 'Min 1'], max: [3, 'Max 3']}
      )
    })
  })

  describe('Parameter scopes', () => {
    test('detect correct scopes', () => {
      /** @type {AstScope | undefined} */
      let scope = undefined

      // Public scope
      scope = astCommentsWithScopes[0]?.elements.scope

      expect(scope?.private).toBe(false)
      expect(scope?.protected).toBe(false)
      expect(scope?.public).toBe(true)

      // Public scope
      scope = astCommentsWithScopes[1]?.elements.scope

      expect(scope?.private).toBe(false)
      expect(scope?.protected).toBe(false)
      expect(scope?.public).toBe(true)

      // Private scope
      scope = astCommentsWithScopes[2]?.elements.scope

      expect(scope?.private).toBe(true)
      expect(scope?.protected).toBe(false)
      expect(scope?.public).toBe(false)

      // Protected scope
      scope = astCommentsWithScopes[3]?.elements.scope

      expect(scope?.private).toBe(false)
      expect(scope?.protected).toBe(true)
      expect(scope?.public).toBe(false)

      // Mixed scope
      scope = astCommentsWithScopes[4]?.elements.scope

      expect(scope?.private).toBe(true)
      expect(scope?.protected).toBe(true)
      expect(scope?.public).toBe(false)
    })
  })
})
