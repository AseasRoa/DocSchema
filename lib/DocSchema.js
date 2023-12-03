import { DocSchemaParser } from './DocSchemaParser.js'
import { DocSchemaValidator } from './DocSchemaValidator.js'
import { stackTrace } from './functions/stackTrace.js'
import { ValidationError } from './errors/ValidationError.js'

const docSchemaParser    = new DocSchemaParser()
const docSchemaValidator = new DocSchemaValidator()

/**
 * Used to tell DocSchema to read the stack at another level.
 *
 * @type {number}
 */
let stackShift = 0

/**
 * @param {number} levels
 * @returns {void}
 */
function shiftStack(levels) {
  stackShift = levels
}

class DocSchema {
  /** @type {Ast | null} */
  #ast = null

  /** @type {string} */
  #fileName = ''

  /** @type {number} */
  #line = 0

  /** @type {number} */
  #column = 0

  constructor() {
    this.#create()
  }

  get lastError() {
    return docSchemaValidator.lastError
  }

  /**
   * Check and return either true or false
   *
   * @param {any} value
   * @returns {boolean}
   * @throws {Error} If the schema has not been created yet
   */
  approves(value) {
    return this.#validateOrCheck(value, false).pass
  }

  /**
   * Check and return an object with information about the check
   *
   * @param {any} value
   * @returns {CheckResult}
   * @throws {Error} If the schema has not been created yet
   */
  check(value) {
    return this.#validateOrCheck(value, false)
  }

  /**
   * Check and throw an error when the value is invalid
   *
   * @param {any} value
   * @returns {boolean}
   * @throws {ValidationError | Error}
   * If the schema has not been created yet, or if the validation is not successful
   */
  validate(value) {
    return this.#validateOrCheck(value, true).pass
  }

  /**
   * @returns {void}
   * @throws {SyntaxError | Error}
   */
  #create() {
    const caller = stackTrace(2 + stackShift)
    stackShift = 0 // reset

    if (!caller) {
      throw new Error(
        'Could not create schema, because the stack was not parsed successfully'
      )
    }

    this.#line     = (caller.lineNumber)
    this.#column   = (caller.columnNumber)
    this.#fileName = (caller.fileName).replace(/^file:[\/]+/u, '')
    const comments = docSchemaParser.parseFile(this.#fileName)

    /** @type {Ast | null} */
    let ast = null

    for (const comment of comments) {
      if (this.#line < comment.endLine) {
        break
      }

      if (this.#line === comment.endLine + 1) {
        ast = comment

        break
      }
    }

    if (!ast) {
      this.#throwSyntaxErrorAboutInvalidJsDoc()

      return
    }
    
    const elements = ast.elements

    if (
      !elements.enum
      && !elements.typedef
      && elements.param.length === 0
    ) {
      this.#throwSyntaxErrorAboutTags()

      return
    }

    this.#ast = ast
  }

  /**
   * @param {any} value
   * @param {boolean} throwOnError
   * @returns {CheckResult}
   * @throws {ValidationError | SyntaxError | Error}
   */
  #validateOrCheck(value, throwOnError) {
    if (!this.#ast) {
      throw new Error('The schema has not been created yet')
    }
    
    const elements = this.#ast.elements

    if (elements.enum) {
      return docSchemaValidator.validateTag(
        'enum', this.#ast, value, throwOnError
      )
    }

    if (elements.param.length > 0) {
      return docSchemaValidator.validateParams(
        'param', this.#ast, value, throwOnError
      )
    }

    if (elements.typedef) {
      return docSchemaValidator.validateTypedef(
        this.#ast, value, throwOnError
      )
    }

    this.#throwSyntaxErrorAboutTags()
    throw new Error('') // Only to prevent lint errors, this line is never reached
  }

  /**
   * @throws {SyntaxError}
   */
  #throwSyntaxErrorAboutInvalidJsDoc() {
    throw new SyntaxError(
      `Could not create schema at ${this.#fileName}:${this.#line}:${this.#column}.`
      + ` Make sure there is a valid JsDoc comment at the previous line`
    )
  }

  /**
   * @throws {SyntaxError}
   */
  #throwSyntaxErrorAboutTags() {
    throw new SyntaxError(
      `The schema at ${this.#fileName}:${this.#line}:${this.#column}`
      + ` must be defined with one @enum tag, one or more @param tags, or a @typedef`
    )
  }
}

export { shiftStack, DocSchema }
