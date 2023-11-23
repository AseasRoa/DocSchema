import { isObjectEmpty } from '../functions/utils.js'
import { validators } from './validators.js'

/**
 * @type {Record<keyof validators, string>}
 */
const validValidations = {
  array: Object.keys(validators.array).map((value) => `"${value}"`).join(', '),
  number: Object.keys(validators.number).map((value) => `"${value}"`).join(', '),
  string: Object.keys(validators.string).map((value) => `"${value}"`).join(', ')
}

/**
 * @type {{
 *   array: function(Filters, Array<any>): boolean,
 *   number: function(Filters, number): boolean,
 *   string: function(Filters, string): boolean,
 * }}
 */
const validatorsWrappers = {
  array: (filters, value) => {
    for (const key in filters) {
      if (!(key in validators.array)) {
        throw new Error(
          `"${key}" is not a valid validation for arrays.`
          + ` Use any of these: ${validValidations.array}.`
        )
      }

      validators.array[key](value, filters[key])
    }

    return true
  },
  number: (filters, value) => {
    for (const key in filters) {
      if (!(key in validators.number)) {
        throw new Error(
          `"${key}" is not a valid validation for numbers.`
          + ` Use any of these: ${validValidations.number}.`
        )
      }

      validators.number[key](value, filters[key])
    }

    return true
  },
  string: (filters, value) => {
    for (const key in filters) {
      if (!(key in validators.string)) {
        throw new Error(
          `"${key}" is not a valid validation for strings.`
          + ` Use any of these: ${validValidations.string}.`
        )
      }

      validators.string[key](value, filters[key])
    }

    return true
  },
}

/**
 * @param {Filters} filters
 * @param {Array<any> | number | string} value
 * @returns {boolean}
 * @throws {ValidationError | Error}
 */
function validate(filters, value) {
  if (isObjectEmpty(filters)) {
    return true
  }

  if (value instanceof Array) {
    return validatorsWrappers.array(filters, value)
  }
  else if (typeof value === 'number') {
    return validatorsWrappers.number(filters, value)
  }
  else if (typeof value === 'string') {
    return validatorsWrappers.string(filters, value)
  }

  const expectedTypes = Object.keys(validatorsWrappers).map((value) => `"${value}"`).join(', ')

  throw new Error(`Expected "${value}" to be any of these ${expectedTypes}`)
}

export { validate }
