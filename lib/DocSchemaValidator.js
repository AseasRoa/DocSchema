import { ValidationError } from './ValidationError.js'
import { enquoteString } from './functions.js'
import { limitsValidators } from './limitsValidators.js'
import { validators } from './validators.js'

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
      const types = param.types
      const limits = param.limits
      const argId = param.id
      const arg   = (param.destructured)
        ? args[argId]?.[param.destructured[1]]
        : args[argId]

      // undefined value on optional parameter is allowed
      if (param.optional && arg === undefined) {
        continue
      }

      const result = typesValidator(types, arg, ast.typedefs, limits)

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

      // limitsValidator(types, param.limits, arg)
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

      const result = typesValidator(param.types, val, ast.typedefs, param.limits)

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

    const types = parsedTags.types
    const limits = parsedTags.limits
    const result = typesValidator(types, value, ast.typedefs, limits)

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

/**
 * @type {TypesValidator}
 * @throws {Error} If missing validator function (should never happen)
 */
function typesValidator(parsedTypes, value, typedefs, limits) {
  for (const parsedType of parsedTypes) {
    // @ts-ignore
    const validatorFunc = validators[parsedType.typeName]

    if (!(validatorFunc instanceof Function)) {
      throw new Error(`Wrong typeName ${parsedType.typeName}`)
    }

    const result = validatorFunc(parsedType, value, typedefs, limits, typesValidator)

    if (result) {
      // Limits validation
      if (parsedType.typeName in limitsValidators) {
        const limitsValidatorFunc = limitsValidators[parsedType.typeName]

        limitsValidatorFunc(limits, value)
      }

      return true
    }
  }

  return false
}

export { DocSchemaValidator }
