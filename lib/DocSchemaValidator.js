import {
  clearLastError,
  lastError,
  throwLastError,
  ValidationError
} from './errors/ValidationError.js'
import { enquoteString } from './functions/utils.js'
import { check } from './parse-check-types/check.js'

class DocSchemaValidator {
  get lastError() {
    return lastError
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
    const params = ast.elements.param

    for (const param of params) {
      clearLastError()
      const { id, types, filters } = param
      const arg = (param.destructured)
        ? args[id]?.[param.destructured[1]]
        : args[id]

      // undefined value on optional parameter is allowed
      if (param.optional && arg === undefined) {
        continue
      }

      const result = check(types, arg, id, ast.typedefs, filters)

      lastError.tag = 'param'

      if (!result) {
        if (!lastError.message) {
          const errorMessage = `Expected type ${enquoteString(types[0]?.typeName)},`
            + ` got ${enquoteString(arg)}`

          lastError.message = errorMessage
        }

        if (throwOnError) {
          throwLastError()
        }
        else {
          return lastError
        }
      }
    }

    return lastError
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
    const params = ast.elements[name]

    for (const param of params) {
      clearLastError()
      const key = param.name
      const val = (param.destructured)
        ? value[param.destructured[0]]?.[param.destructured[1]]
        : value[param.name]

      // undefined value on optional parameter is allowed
      if (param.optional && val === undefined) {
        continue
      }

      const result = check(param.types, val, key, ast.typedefs, param.filters)

      lastError.tag = 'param'

      if (!result) {
        if (!lastError.message) {
          const errorMessage =
            `Expected ${enquoteString(key)} of the object to be of type`
            + ` ${enquoteString(param.types[0]?.typeName)},`
            + ` but the value is ${enquoteString(val)}`

          lastError.message = errorMessage
        }

        if (throwOnError) {
          throwLastError()
        }
        else {
          return lastError
        }
      }
    }

    return lastError
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
    const parsedTags = ast.elements[tagName]

    if (parsedTags === undefined) {
      throw new Error('The AST you are trying to use is not valid')
    }

    if (parsedTags === null) {
      lastError.pass = (value === undefined)

      return lastError
    }

    const { types, filters } = parsedTags
    const result = check(types, value, '', ast.typedefs, filters)

    lastError.tag = tagName

    if (!result) {
      if (!lastError.message) {
        const errorMessage = `Expected value ${enquoteString(value)} to be of type`
          + ` ${enquoteString(types[0]?.typeExpression)}`

        lastError.message = errorMessage
      }

      if (throwOnError) {
        throwLastError()
      }
      else {
        return lastError
      }
    }

    return lastError
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
}

export { DocSchemaValidator }
