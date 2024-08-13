import {
  checkResult,
  resetCheckResult,
  startCheckResult,
  throwLastError,
  ValidationError
} from './errors/ValidationError.js'
import { enquoteString, objectStringify } from './functions/utils.js'
import { check } from './parse-check-types/check.js'

class DocSchemaValidator {
  /**
   * @returns {CheckResult}
   */
  get lastError() {
    return checkResult
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
    /*
     * Maybe @type pointing to a @callback is used,
     * like this: @type {MyCallback}
     */
    if (ast.elements.type && ast.elements.param.length === 0) {
      return this.validateTag('type', ast, args, throwOnError)
    }

    startCheckResult()
    const parsedTags = ast.elements.param

    if (ast.strict) {
      const result = this.#validateStrictArguments(
        parsedTags,
        args,
        throwOnError
      )

      if (!result) {
        checkResult.pass = false

        return checkResult
      }
    }

    for (const parsedTag of parsedTags) {
      resetCheckResult()
      const { id } = parsedTag
      const arg = (parsedTag.destructured)
        ? args[id]?.[parsedTag.destructured[1]]
        : args[id]

      // undefined value on optional parameter is allowed
      if (parsedTag.optional && arg === undefined) {
        continue
      }

      const result = this.#validate(
        'argument', parsedTag, arg, id, ast, throwOnError
      )

      if (!throwOnError && !result) break
    }

    return checkResult
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
    startCheckResult()
    const parsedTags = ast.elements[name]

    if (ast.strict) {
      const result = this.#validateStrictProperties(
        name,
        parsedTags,
        value,
        throwOnError
      )

      if (!result) {
        checkResult.pass = false

        return checkResult
      }
    }

    for (const parsedTag of parsedTags) {
      resetCheckResult()
      const key = parsedTag.name
      const val = (parsedTag.destructured)
        ? value[parsedTag.destructured[0]]?.[parsedTag.destructured[1]]
        : value[parsedTag.name]

      // undefined value on optional parameter is allowed
      if (parsedTag.optional && val === undefined) {
        continue
      }

      const result = this.#validate(
        name, parsedTag, val, key, ast, throwOnError
      )

      if (!throwOnError && !result) break
    }

    return checkResult
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
    startCheckResult()
    const parsedTag = ast.elements[tagName]

    if (parsedTag === undefined) {
      throw new Error('The AST you are trying to use is not valid')
    }

    if (parsedTag === null) {
      checkResult.pass = (value === undefined)

      return checkResult
    }

    this.#validate(tagName, parsedTag, value, '', ast, throwOnError)

    return checkResult
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
    startCheckResult()
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
   * @param {Ast} ast
   * @param {boolean} throwOnError
   * @returns {boolean} true on success, false on failure
   * @throws {ValidationError}
   */
  #validate(tagName, parsedTag, value, key, ast, throwOnError) {
    const result = check(
      parsedTag.types,
      value,
      key,
      ast,
      parsedTag.filters,
      this,
      throwOnError
    )

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
   * @param {'argument' | string} tagName
   * @param {ParsedTag[]} parsedTags
   * @param {any} value
   * @param {boolean} throwOnError
   * @returns {boolean} true on success, false on failure
   * @throws {ValidationError}
   */
  #validateStrictProperties(tagName, parsedTags, value, throwOnError = false) {
    const valueKeys = Object.keys(value)
    const parsedTagKeys = new Array(parsedTags.length)

    for (let i = 0; i < parsedTags.length; i++) {
      parsedTagKeys[i] = parsedTags[i]?.name ?? ''
    }

    for (const key of valueKeys) {
      if (!parsedTagKeys.includes(key)) {
        checkResult.kind = 'strict'
        checkResult.tag = (tagName === 'argument') ? 'param' : tagName
        checkResult.message = `Property ${key} is not defined in the schema`
        checkResult.pass = false

        if (throwOnError) throwLastError()

        return false
      }
    }

    return true
  }

  /**
   * @param {ParsedTag[]} parsedTags
   * @param {any} args
   * @param {boolean} throwOnError
   * @returns {boolean} true on success, false on failure
   * @throws {ValidationError}
   */
  #validateStrictArguments(parsedTags, args, throwOnError) {
    const result = (args.length <= parsedTags.length)

    if (!result) {
      checkResult.kind = 'strict'
      checkResult.tag = 'param'
      checkResult.message = 'Arguments count is higher than expected'
      checkResult.pass = false

      if (throwOnError) throwLastError()

      return false
    }

    return true
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
    else if (tagName === 'param' || tagName === 'property') what = enquoteString(key)
    else what = 'value'

    let message = `Expected ${what} to be of type ${type}, but the actual `

    if (value === undefined || value === null) {
      message += `value is ${value}`
    }
    else {
      let constructorName = value?.constructor?.name

      if (
        constructorName === 'Boolean'
        || constructorName === 'Number'
        || constructorName === 'String'
        || constructorName === 'Array'
        || constructorName === 'Object'
      ) {
        constructorName = ''
      }

      if (constructorName) {
        message += `value is an instance of ${constructorName}`
      }
      else {
        message += `type is ${typeof value}`
        message += (value instanceof Object)
          ? `, and the value is ${objectStringify(value, 300)}`
          : ''
      }
    }

    return message
  }
}

export { DocSchemaValidator }
