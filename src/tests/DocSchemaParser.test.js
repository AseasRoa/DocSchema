import { DocSchemaParser } from '../DocSchemaParser.js'

describe('DocSchemaParser', function() {
  const parser = new DocSchemaParser()

  /** @type {DocSchemaAst[]} */
  let astComments           = []
  /** @type {DocSchemaAst[]} */
  let astCommentsWithScopes = []

  beforeAll(function() {
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

    astComments           = parser.parseComments(comments.trim())
    astCommentsWithScopes = parser.parseComments(commentsWithScopes.trim())
  })

  describe('Multiple comments', function() {
    test('correct number of comments', function() {
      expect(astComments.length).toBe(4)
    })
  })

  describe('Rows after comments', function() {
    test('correct rows after comments', function() {
      expect(
        astComments?.[0]?.lineAfterComment.trim())
      .toBe(
        'Code, code, code...'
      )
      expect(
        astComments?.[1]?.lineAfterComment.trim())
      .toBe(
        'More code, code, code...'
      )
      expect(
        astComments?.[2]?.lineAfterComment.trim())
      .toBe(
        ''
      )
      expect(
        astComments?.[3]?.lineAfterComment.trim())
      .toBe(
        ''
      )
    })
  })

  describe('Descriptions', function() {
    test('detect correct main description', function() {
      const description = astComments[1]?.elements.description

      expect(description).toBe(`Main Description 1\nMain Description 2\nSecondary Description\nThird Description`)
    })

    test('detect correct param descriptions', function() {
      const params = astComments?.[1]?.elements.param

      expect(params?.[0]?.description).toBe('')
      expect(params?.[1]?.description).toBe('description two')
      expect(params?.[2]?.description).toBe('description three')
      expect(params?.[3]?.description).toBe('this is multiline description')
    })
  })

  describe('Parameter scopes', function() {
    test('detect correct scopes', function() {
      /** @type {DocSchemaAstScope} */
      let scope = {
        private   : false,
        protected : false,
        public    : false
      }

      // Public scope
      scope = astCommentsWithScopes?.[0]?.elements.scope ?? scope

      expect(scope.private).toBe(false)
      expect(scope.protected).toBe(false)
      expect(scope.public).toBe(true)

      // Public scope
      scope = astCommentsWithScopes?.[1]?.elements.scope ?? scope

      expect(scope.private).toBe(false)
      expect(scope.protected).toBe(false)
      expect(scope.public).toBe(true)

      // Private scope
      scope = astCommentsWithScopes?.[2]?.elements.scope ?? scope

      expect(scope.private).toBe(true)
      expect(scope.protected).toBe(false)
      expect(scope.public).toBe(false)

      // Protected scope
      scope = astCommentsWithScopes?.[3]?.elements.scope ?? scope

      expect(scope.private).toBe(false)
      expect(scope.protected).toBe(true)
      expect(scope.public).toBe(false)

      // Mixed scope
      scope = astCommentsWithScopes?.[4]?.elements.scope ?? scope

      expect(scope.private).toBe(true)
      expect(scope.protected).toBe(true)
      expect(scope.public).toBe(false)
    })
  })
})
