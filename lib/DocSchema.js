import { DocSchemaParser } from './DocSchemaParser.js'
import { DocSchemaValidator } from './DocSchemaValidator.js'
import {
  errorAboutInvalidAst,
  syntaxErrorAboutInvalidJsDoc,
  syntaxErrorAboutTags
} from './errors/errors.js'
import { ValidationError } from './errors/ValidationError.js'
import { stackTrace } from './functions/stackTrace.js'

const docSchemaParser = new DocSchemaParser()
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
export function shiftStack(levels) {
  stackShift = levels
}

/**
 * @template T
 */
export class DocSchema {
  /** @type {Ast | null} */
  #ast = null

  /** @type {string} */
  #fileName = ''

  /** @type {number} */
  #line = 0

  /** @type {number} */
  #column = 0

  /**
   * DocSchema
   *
   * @param {T} [typeCarrier]
   */
  constructor(typeCarrier) {
    this.#create()
  }

  /**
   * @returns {CheckResult}
   */
  get lastError() {
    return docSchemaValidator.lastError
  }

  /**
   * @returns {Ast | null}
   */
  get ast() {
    return this.#ast
  }

  /**
   * Check and return either true or false
   *
   * @param {any} value
   * @returns {boolean}
   * @throws {Error} If the schema has not been created yet
   */
  approves(value) {
    if (!this.#ast) throw errorAboutInvalidAst()

    return docSchemaValidator.check(this.#ast, value).pass
  }

  /**
   * Check and return an object with information about the check
   *
   * @param {any} value
   * @returns {CheckResult}
   * @throws {Error} If the schema has not been created yet
   */
  check(value) {
    if (!this.#ast) throw errorAboutInvalidAst()

    return docSchemaValidator.check(this.#ast, value)
  }

  /**
   * Check and throw an error when the value is invalid
   *
   * @template T
   * @param {any} value
   * @returns {T}
   * @throws {ValidationError | Error}
   * If the schema has not been created yet, or if the
   * validation is not successful
   */
  validate(value) {
    if (!this.#ast) throw errorAboutInvalidAst()

    docSchemaValidator.validate(this.#ast, value)

    return value
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

    this.#line = (caller.lineNumber)
    this.#column = (caller.columnNumber)
    this.#fileName = (caller.fileName).replace(/^file:[\/]+/u, '')
    const comments = docSchemaParser.parseFile(this.#fileName)

    /** @type {Ast | null} */
    let ast = null

    for (const comment of comments) {
      if (this.#line < comment.endLine) {
        break
      }

      if (
        this.#line === comment.endLine + 1
        || (this.#line === comment.startLine && comment.elements.type)
      ) {
        ast = comment

        // Do not break, so if there are 2 comments - one above and one inline,
        // the inline one would be the chosen one
        // break
      }
    }

    if (!ast) {
      throw syntaxErrorAboutInvalidJsDoc(
        this.#fileName, this.#line, this.#column
      )
    }

    const { elements } = ast

    if (
      !elements.type
      && !elements.enum
      && !elements.typedef
      && elements.param.length === 0
    ) {
      throw syntaxErrorAboutTags(
        this.#fileName, this.#line, this.#column
      )
    }

    this.#ast = ast
  }
}
