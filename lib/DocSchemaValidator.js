import { ValidationError } from './errors/ValidationError.js'
import { enquoteString } from './functions/utils.js'
import { validate } from './parse-validate-types/validate.js'

class DocSchemaValidator {
  /** @type {ValidationError | null} */
  lastError = null

  /**
   * @param {Ast} ast
   * @param {any[]} args
   * @param {boolean} [throwOnError]
   * @returns {boolean}
   * Returns true if the validation is successful
   * @throws {ValidationError}
   * Throws an error if the validation is not successful
   */
  validateFunctionArguments(ast, args, throwOnError = true) {
    this.lastError = null
    const params   = ast.elements.param

    for (const param of params) {
      const { id, types, filters } = param
      const arg = (param.destructured)
        ? args[id]?.[param.destructured[1]]
        : args[id]

      // undefined value on optional parameter is allowed
      if (param.optional && arg === undefined) {
        continue
      }

      const result = validate(types, arg, ast.typedefs, filters)

      if (!result) {
        const error = new ValidationError(
          `Expected type ${enquoteString(types[0]?.typeName)},`
          + ` got ${enquoteString(arg)}.`
        )

        this.lastError = error

        if (throwOnError) {
          throw error
        }
        else {
          return false
        }
      }
    }

    return true
  }

  /**
   * @param {'param' | 'property'} name
   * @param {Ast} ast
   * @param {any} value
   * @param {boolean} [throwOnError]
   * @returns {boolean}
   * Returns true if the validation is successful, or false if there is no tag
   * @throws {ValidationError | Error}
   * Throws ValidationError if the validation is not successful
   * and is selected to throw on error.
   * Throws Error if the input AST is not right.
   */
  validateParams(name, ast, value, throwOnError = true) {
    const params = ast.elements[name]

    for (const param of params) {
      const key = param.name
      const val = (param.destructured)
        ? value[param.destructured[0]]?.[param.destructured[1]]
        : value[param.name]

      // undefined value on optional parameter is allowed
      if (param.optional && val === undefined) {
        continue
      }

      const result = validate(param.types, val, ast.typedefs, param.filters)

      if (!result) {
        const error = new ValidationError(
          `Expected ${enquoteString(key)} of the object to be of type`
          + ` ${enquoteString(param.types[0]?.typeName)},`
          + ` but the value is ${enquoteString(val)}.`
        )

        this.lastError = error

        if (throwOnError) {
          throw error
        }
        else {
          return false
        }
      }
    }

    return true
  }

  /**
   * @param {'enum' | 'type' | 'returns' | 'yields'} tagName
   * @param {Ast} ast
   * @param {any} value
   * @param {boolean} [throwOnError]
   * @returns {boolean}
   * Returns true if the validation is successful, or false if there is no tag
   * @throws {ValidationError | Error}
   * Throws ValidationError if the validation is not successful
   * and is selected to throw on error.
   * Throws Error if the input AST is not right.
   */
  validateTag(tagName, ast, value, throwOnError = true) {
    this.lastError   = null
    const parsedTags = ast.elements[tagName]

    if (parsedTags === undefined) {
      throw new Error('The AST you are trying to use is not valid')
    }

    if (parsedTags === null) {
      return (value === undefined)
    }

    const { types, filters } = parsedTags
    const result = validate(types, value, ast.typedefs, filters)

    if (!result) {
      const error = new ValidationError(
        `Expected value ${enquoteString(value)} to be of type`
        + ` ${enquoteString(types[0]?.typeExpression)}.`)

      this.lastError = error

      if (throwOnError) {
        throw error
      }
      else {
        return false
      }
    }

    return true
  }

  /**
   * @param {Ast} ast
   * @param {any} value
   * @param {boolean} [throwOnError]
   * @returns {boolean}
   * Returns true if the validation is successful, or false if there is no tag
   * @throws {ValidationError | Error}
   * Throws ValidationError if the validation is not successful
   * and is selected to throw on error.
   * Throws Error if the input AST is not right.
   */
  validateTypedef(ast, value, throwOnError = true) {
    this.lastError   = null
    const parsedTags = ast.elements?.typedef

    if (parsedTags === undefined) {
      throw new Error('The AST you are trying to use is not valid')
    }

    return this.validateParams('property', ast, value, throwOnError)
  }
}

export { DocSchemaValidator }
