import { DocSchemaParser } from './DocSchemaParser.js'
import { DocSchemaValidator } from './DocSchemaValidator.js'
import { getStackTrace } from './functions.js'

const docSchemaParser    = new DocSchemaParser()
const docSchemaValidator = new DocSchemaValidator()

class DocSchema {
  /** @type {DocSchemaAst | null} */
  #ast = null

  constructor() {
    this.#create()
  }

  get lastError() {
    return docSchemaValidator.lastError
  }

  /**
   * @param {any} value
   * @returns {boolean}
   * @throws {Error | TypeError}
   * If the schema has not been created yet, or if the validation is not successful
   */
  validate(value) {
    return this.#validateOrCheck(value, true)
  }

  /**
   * @param {any} value
   * @returns {boolean}
   * @throws {Error} If the schema has not been created yet
   */
  check(value) {
    return this.#validateOrCheck(value, false)
  }

  /**
   * @returns {void}
   * @throws {Error}
   */
  #create() {
    const caller = getStackTrace(3)

    if (!caller) {
      throw new Error('Could not create schema')
    }

    let schemaLine     = (caller.lineNumber)
    const schemaColumn = (caller.columnNumber)
    const fileName     = (caller.fileName).replace(/^file:[\/]+/, '')
    const comments     = docSchemaParser.parseFile(fileName)

    /** @type {DocSchemaAst | null} */
    let ast = null

    for (const comment of comments) {
      if (schemaLine === comment.endLine + 1) {
        ast = comment

        break
      }
    }

    if (!ast) {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      throw new Error(`Could not create schema. Make sure there is a valid JsDoc comment just above.\n> ${fileName}:${schemaLine}:${schemaColumn}`)
    }

    if (
      !ast.elements.enum
      && !ast.elements.typedef
      && ast.elements.param.length === 0
    ) {
      throw new Error(`The schema at "${fileName}:${schemaLine}:${schemaColumn}" must be defined with one @enum tag, one or more @param tags, or a @typedef.`)
    }

    this.#ast = ast
  }

  /**
   * @param {any} value
   * @param {boolean} throwOnError
   * @returns {boolean}
   * @throws {Error | TypeError}
   */
  #validateOrCheck(value, throwOnError) {
    if (!this.#ast) {
      throw new Error('The schema has not been created yet')
    }

    if (this.#ast.elements.enum) {
      return docSchemaValidator.validateTag('enum', this.#ast, value, throwOnError)
    }

    if (this.#ast.elements.param.length > 0) {
      return docSchemaValidator.validateParams('param', this.#ast, value, throwOnError)
    }

    if (this.#ast.elements.typedef) {
      return docSchemaValidator.validateTypedef(this.#ast, value, throwOnError)
    }

    throw new Error('The schema must be defined with one @enum tag, one or more @param tags, or a @typedef')
  }
}

export { DocSchema }
