import {
  checkResult,
  clearLastError,
  getCheckResultCloned,
  throwLastError,
  ValidationError
} from './errors/ValidationError.js'
import { enquoteString } from './functions/utils.js'
import { check } from './parse-check-types/check.js'

class DocSchemaValidator {
  get lastError() {
    return getCheckResultCloned()
  }

  /**
   * @param {Ast} ast
   * @param {any[]} args
   * @param {boolean} [throwOnError]
   * @returns {CheckResult}
   * @throws {ValidationError}
   * Throws ValidationError if the validation is not successful
   */
  validateFunctionArguments(ast, args, throwOnError = true) {
    const parsedTags = ast.elements.param

    for (const parsedTag of parsedTags) {
      clearLastError()
      const { id } = parsedTag
      const arg = (parsedTag.destructured)
        ? args[id]?.[parsedTag.destructured[1]]
        : args[id]

      // undefined value on optional parameter is allowed
      if (parsedTag.optional && arg === undefined) {
        continue
      }

      this.#validate('argument', parsedTag, arg, id, ast.typedefs, throwOnError)
    }

    return getCheckResultCloned()
  }

  /**
   * @param {'param' | 'property'} name
   * @param {Ast} ast
   * @param {any} value
   * @param {boolean} [throwOnError]
   * @returns {CheckResult}
   * @throws {ValidationError | Error}
   * Throws ValidationError if the validation is not successful.
   * Throws Error if the input AST is not valid.
   */
  validateParams(name, ast, value, throwOnError = true) {
    const parsedTags = ast.elements[name]

    for (const parsedTag of parsedTags) {
      clearLastError()
      const key = parsedTag.name
      const val = (parsedTag.destructured)
        ? value[parsedTag.destructured[0]]?.[parsedTag.destructured[1]]
        : value[parsedTag.name]

      // undefined value on optional parameter is allowed
      if (parsedTag.optional && val === undefined) {
        continue
      }

      this.#validate('param', parsedTag, val, key, ast.typedefs, throwOnError)
    }

    return getCheckResultCloned()
  }

  /**
   * @param {'enum' | 'type' | 'returns' | 'yields'} tagName
   * @param {Ast} ast
   * @param {any} value
   * @param {boolean} [throwOnError]
   * @returns {CheckResult}
   * @throws {ValidationError | Error}
   * Throws ValidationError if the validation is not successful.
   * Throws Error if the input AST is not valid.
   */
  validateTag(tagName, ast, value, throwOnError = true) {
    clearLastError()
    const parsedTag = ast.elements[tagName]

    if (parsedTag === undefined) {
      throw new Error('The AST you are trying to use is not valid')
    }

    if (parsedTag === null) {
      checkResult.pass = (value === undefined)

      return getCheckResultCloned()
    }

    this.#validate(tagName, parsedTag, value, '', ast.typedefs, throwOnError)

    return getCheckResultCloned()
  }

  /**
   * @param {Ast} ast
   * @param {any} value
   * @param {boolean} [throwOnError]
   * @returns {CheckResult}
   * @throws {ValidationError | Error}
   * Throws ValidationError if the validation is not successful.
   * Throws Error if the input AST is not valid.
   */
  validateTypedef(ast, value, throwOnError = true) {
    clearLastError()
    const parsedTags = ast.elements?.typedef

    if (parsedTags === undefined) {
      throw new Error('The AST you are trying to use is not valid')
    }

    return this.validateParams('property', ast, value, throwOnError)
  }

  /**
   * @param {'argument' | string} tagName
   * @param {ParsedTag} parsedTag
   * @param {any} value
   * @param {PropertyKey} key
   * @param {Ast[]} typedefs
   * @param {boolean} throwOnError
   * @returns {boolean} true on success, false on failure
   * @throws {ValidationError}
   */
  #validate(tagName, parsedTag, value, key, typedefs, throwOnError) {
    const result = check(parsedTag.types, value, key, typedefs, parsedTag.filters)

    checkResult.tag = (tagName === 'argument') ? 'param' : tagName

    if (!result) {
      if (!checkResult.message) {
        const expectedTypeExpression = parsedTag.types[0]?.typeExpression ?? ''

        checkResult.message = this.#errorMessage(
          tagName, expectedTypeExpression, value, key
        )
      }

      if (throwOnError) throwLastError()
    }

    return result
  }

  /**
   * @param {string} tagName
   * @param {string} type
   * @param {any} value
   * @param {PropertyKey} key
   * @returns {string}
   */
  #errorMessage(tagName, type, value, key) {
    let what = ''
    if (tagName === 'argument') what = tagName // 'argument'
    else if (tagName === 'param') what = enquoteString(key)
    else what = 'value'

    let message = `Expected ${what} to be of type ${type}, but the actual `

    if (value === undefined || value === null) {
      message += `value is ${value}`
    }
    else {
      let constructorName = value?.constructor?.name

      if (
        constructorName === 'Array'
        || constructorName === 'Boolean'
        || constructorName === 'Number'
        || constructorName === 'Object'
        || constructorName === 'String'
      ) {
        constructorName = ''
      }

      if (constructorName) {
        message += `value is an instance of ${constructorName}`
      }
      else {
        message += `type is ${typeof(value)}`
      }
    }

    return message
  }
}

export { DocSchemaValidator }
