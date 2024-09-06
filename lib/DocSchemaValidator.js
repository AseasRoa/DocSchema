import {
  checkResult,
  resetCheckResult,
  startCheckResult,
  throwLastError
} from './checkResult.js'
import { syntaxErrorAboutTags } from './errors/errors.js'
import { ValidationError } from './errors/ValidationError.js'
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
   * @param {any} value
   * @param {boolean} [forceStrict] Force strict recursively
   * @returns {CheckResult}
   */
  check(ast, value, forceStrict = false) {
    return this.#validateOrCheckHelper(ast, value, false, forceStrict)
  }

  /**
   * @param {Ast} ast
   * @param {any} value
   * @param {boolean} [forceStrict] Force strict recursively
   * @returns {CheckResult}
   */
  validate(ast, value, forceStrict = false) {
    return this.#validateOrCheckHelper(ast, value, true, forceStrict)
  }

  /**
   * @param {Ast} ast
   * @param {any[]} args
   * @param {boolean} [forceStrict] Force strict recursively
   * @returns {CheckResult}
   */
  checkFunctionArguments(
    ast, args, forceStrict = false
  ) {
    return this.#validateOrCheckFunctionArgumentsHelper(
      ast, args, false, forceStrict
    )
  }

  /**
   * @param {Ast} ast
   * @param {any[]} args
   * @param {boolean} [forceStrict] Force strict recursively
   * @returns {CheckResult}
   * @throws {ValidationError}
   * Throws ValidationError if the validation is not successful
   */
  validateFunctionArguments(
    ast, args, forceStrict = false
  ) {
    return this.#validateOrCheckFunctionArgumentsHelper(
      ast, args, true, forceStrict
    )
  }

  /**
   * @param {Ast} ast
   * @param {any} value
   * @param {boolean} [forceStrict] Force strict recursively
   * @returns {CheckResult}
   */
  checkReturns(ast, value, forceStrict = false) {
    return this.#validateOrCheckTag('returns', ast, value, false, forceStrict)
  }

  /**
   * @param {Ast} ast
   * @param {any} value
   * @param {boolean} [forceStrict] Force strict recursively
   * @returns {CheckResult}
   * @throws {ValidationError | Error}
   * Throws ValidationError if the validation is not successful.
   * Throws Error if the input AST is not valid.
   */
  validateReturns(ast, value, forceStrict = false) {
    return this.#validateOrCheckTag('returns', ast, value, true, forceStrict)
  }

  /**
   * @param {Ast} ast
   * @param {any} value
   * @param {boolean} throwOnError
   * @param {boolean} [forceStrict] Force strict recursively
   * @returns {CheckResult}
   * @throws {ValidationError | SyntaxError | Error}
   */
  #validateOrCheckHelper(ast, value, throwOnError, forceStrict) {
    const { elements } = ast
    const useStrict = forceStrict || ast.strict

    if (elements.param.length > 0) {
      return this.#validateOrCheckParams(
        'param', ast, value, throwOnError, useStrict
      )
    }

    if (elements.typedef) {
      return this.#validateOrCheckTypedef(
        ast, value, throwOnError, useStrict
      )
    }

    if (elements.enum) {
      return this.#validateOrCheckTag(
        'enum', ast, value, throwOnError, useStrict
      )
    }

    if (elements.type) {
      return this.#validateOrCheckTag(
        'type', ast, value, throwOnError, useStrict
      )
    }

    throw syntaxErrorAboutTags(ast.file, ast.endLine + 1, 0)
  }

  /**
   * @param {Ast} ast
   * @param {any[]} args
   * @param {boolean} [throwOnError]
   * @param {boolean} [forceStrict] Force strict recursively
   * @returns {CheckResult}
   * @throws {ValidationError}
   * Throws ValidationError if the validation is not successful
   */
  #validateOrCheckFunctionArgumentsHelper(
    ast, args, throwOnError = true, forceStrict = false
  ) {
    /*
     * Maybe @type pointing to a @callback is used,
     * like this: @type {MyCallback}
     */
    if (ast.elements.type && ast.elements.param.length === 0) {
      return this.#validateOrCheckTag(
        'type', ast, args, throwOnError, forceStrict
      )
    }

    startCheckResult()
    const parsedTags = ast.elements.param

    if (ast.strict || forceStrict) {
      const result = this.#validateStrictArguments(
        ast, parsedTags, args, throwOnError
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

      const result = this.#validateOrCheck(
        'argument', parsedTag, arg, id, ast, throwOnError, forceStrict
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
   * @param {boolean} [forceStrict] Force strict recursively
   * @returns {CheckResult}
   * @throws {ValidationError | Error}
   * Throws ValidationError if the validation is not successful.
   * Throws Error if the input AST is not valid.
   */
  #validateOrCheckParams(
    name, ast, value, throwOnError = true, forceStrict = false
  ) {
    startCheckResult()
    const parsedTags = ast.elements[name]

    if (ast.strict || forceStrict) {
      const result = this.#validateStrictProperties(
        name, ast, parsedTags, value, throwOnError
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

      const result = this.#validateOrCheck(
        name, parsedTag, val, key, ast, throwOnError, forceStrict
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
   * @param {boolean} [forceStrict] Force strict recursively
   * @returns {CheckResult}
   * @throws {ValidationError | Error}
   * Throws ValidationError if the validation is not successful.
   * Throws Error if the input AST is not valid.
   */
  #validateOrCheckTag(
    tagName, ast, value, throwOnError = true, forceStrict = false
  ) {
    startCheckResult()
    const parsedTag = ast.elements[tagName]

    if (parsedTag === undefined) {
      throw new Error('The AST you are trying to use is not valid')
    }

    if (parsedTag === null) {
      checkResult.pass = (value === undefined)

      return checkResult
    }

    this.#validateOrCheck(
      tagName, parsedTag, value, '', ast, throwOnError, forceStrict
    )

    return checkResult
  }

  /**
   * @param {Ast} ast
   * @param {any} value
   * @param {boolean} [throwOnError]
   * @param {boolean} [forceStrict] Force strict recursively
   * @returns {CheckResult}
   * @throws {ValidationError | Error}
   * Throws ValidationError if the validation is not successful.
   * Throws Error if the input AST is not valid.
   */
  #validateOrCheckTypedef(
    ast, value, throwOnError = true, forceStrict = false
  ) {
    startCheckResult()
    const parsedTags = ast.elements?.typedef

    if (parsedTags === undefined) {
      throw new Error('The AST you are trying to use is not valid')
    }

    return this.#validateOrCheckParams(
      'property', ast, value, throwOnError, forceStrict
    )
  }

  /**
   * @param {'argument' | string} tagName
   * @param {ParsedTag} parsedTag
   * @param {any} value
   * @param {PropertyKey} key
   * @param {Ast} ast
   * @param {boolean} throwOnError
   * @param {boolean} forceStrict
   * @returns {boolean} true on success, false on failure
   * @throws {ValidationError}
   */
  #validateOrCheck(
    tagName,
    parsedTag,
    value,
    key,
    ast,
    throwOnError,
    forceStrict
  ) {
    const result = check(
      parsedTag.types,
      value,
      key,
      ast,
      parsedTag.filters,
      this,
      throwOnError,
      forceStrict
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
   * @param {Ast} ast
   * @param {ParsedTag[]} parsedTags
   * @param {any} value
   * @param {boolean} throwOnError
   * @returns {boolean} true on success, false on failure
   * @throws {ValidationError}
   */
  #validateStrictProperties(tagName, ast, parsedTags, value, throwOnError) {
    const valueKeys = Object.keys(value)
    const parsedTagKeys = new Array(parsedTags.length)

    for (let i = 0; i < parsedTags.length; i++) {
      parsedTagKeys[i] = parsedTags[i]?.name ?? ''
    }

    for (const key of valueKeys) {
      if (!parsedTagKeys.includes(key)) {
        checkResult.kind = 'strict'
        checkResult.tag = (tagName === 'argument') ? 'param' : tagName
        checkResult.message = `Strict validation failed. Property "${key}" is missing in the schema at file://${ast.file}:${ast.startLine}`
        checkResult.pass = false

        if (throwOnError) throwLastError()

        return false
      }
    }

    return true
  }

  /**
   * @param {Ast} ast
   * @param {ParsedTag[]} parsedTags
   * @param {any} args
   * @param {boolean} throwOnError
   * @returns {boolean} true on success, false on failure
   * @throws {ValidationError}
   */
  #validateStrictArguments(ast, parsedTags, args, throwOnError) {
    const result = (args.length <= parsedTags.length)

    if (!result) {
      checkResult.kind = 'strict'
      checkResult.tag = 'param'
      checkResult.message = `Arguments count is higher than expected in the schema at file://${ast.file}:${ast.startLine}`
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

    if (tagName === 'argument') {
      what = tagName // 'argument'
    }
    else if (tagName === 'param' || tagName === 'property') {
      what = enquoteString(key)
    }
    else if (tagName === 'returns') {
      what = 'the returned value'
    }
    else {
      what = 'value'
    }

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
