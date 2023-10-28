import { enquoteString } from './functions.js'
import { validators } from './validators.js'

class DocSchemaValidator {
  /** @type {TypeError | null} */
  lastError = null

  /**
   * @param {DocSchemaAst} ast
   * @param {any[]} args
   * @param {boolean} [throwOnError]
   * @returns {boolean}
   * Returns true if the validation is successful
   * @throws {TypeError}
   * Throws an error if the validation is not successful
   */
  validateFunctionArguments(ast, args, throwOnError = true) {
    this.lastError = null
    const params   = ast.elements.param

    for (const param of params) {
      const types = param.types
      const argId = param.id
      const arg   = (param.destructured)
        ? args[argId]?.[param.destructured[1]]
        : args[argId]

      // undefined value on optional parameter is allowed
      if (arg === undefined && param.optional) {
        continue
      }

      const result = typesValidator(types, arg, ast.typedefs)

      if (!result) {
        const error = new TypeError(`Expected type ${enquoteString(types[0]?.typeName)}, got ${enquoteString(arg)}.`)

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
   * @param {DocSchemaAst} ast
   * @param {any} value
   * @param {boolean} [throwOnError]
   * @returns {boolean}
   * Returns true if the validation is successful, or false if there is no tag
   * @throws {TypeError | Error}
   * Throws TypeError if the validation is not successful
   * and is selected to throw on error.
   * Throws Error if the input AST is not right.
   */
  validateParams(name, ast, value, throwOnError = true) {
    const params = ast.elements[name]

    for (let param of params) {
      const key    = param.name
      const val    = value[key]
      const result = typesValidator(param.types, val, ast.typedefs)

      if (!result) {
        const error = new TypeError(`Expected ${enquoteString(key)} of the object to be of type ${enquoteString(param.types[0]?.typeName)}, but the value is ${enquoteString(val)}.`)

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
   * @param {DocSchemaAst} ast
   * @param {any} value
   * @param {boolean} [throwOnError]
   * @returns {boolean}
   * Returns true if the validation is successful, or false if there is no tag
   * @throws {TypeError | Error}
   * Throws TypeError if the validation is not successful
   * and is selected to throw on error.
   * Throws Error if the input AST is not right.
   */
  validateTag(tagName, ast, value, throwOnError = true) {
    this.lastError   = null
    const parsedTags = ast.elements?.[tagName]

    if (parsedTags === undefined) {
      throw new Error('The AST you are trying to use is not valid')
    }

    if (parsedTags === null) {
      return (value === undefined)
    }

    const types = parsedTags.types
    const result = typesValidator(types, value, ast.typedefs)

    if (!result) {
      const error = new TypeError(`Expected value ${enquoteString(value)} to be of type ${enquoteString(types[0]?.typeName)}.`)

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
   * @param {DocSchemaAst} ast
   * @param {any} value
   * @param {boolean} [throwOnError]
   * @returns {boolean}
   * Returns true if the validation is successful, or false if there is no tag
   * @throws {TypeError | Error}
   * Throws TypeError if the validation is not successful
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

/**
 * @type {JsDocTypesChecker}
 * @throws {Error} If missing validator function (should never happen)
 */
function typesValidator(parsedTypes, value, typedefs) {
  for (const parsedType of parsedTypes) {
    // @ts-ignore
    const func = validators[parsedType.typeName]

    if (!(func instanceof Function)) {
      throw new Error(`Wrong typeName ${parsedType.typeName}`)
    }

    const result = func(
      parsedType, value, typedefs, typesValidator
    )

    if (result) {
      return true
    }
  }

  return false
}

export { DocSchemaValidator }
