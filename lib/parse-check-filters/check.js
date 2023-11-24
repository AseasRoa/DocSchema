import { isObjectEmpty } from '../functions/utils.js'
import { checkers } from './checkers.js'

/**
 * @type {Record<keyof checkers, string>}
 */
const validFilterNames = {
  array: Object.keys(checkers.array).map((value) => `"${value}"`).join(', '),
  number: Object.keys(checkers.number).map((value) => `"${value}"`).join(', '),
  string: Object.keys(checkers.string).map((value) => `"${value}"`).join(', ')
}

/**
 * @type {{
 *   array: function(Filters, Array<any>): boolean,
 *   number: function(Filters, number): boolean,
 *   string: function(Filters, string): boolean,
 * }}
 */
const checkersWrappers = {
  array: (filters, value) => {
    for (const key in filters) {
      if (!(key in checkers.array)) {
        throw new Error(
          `"${key}" is not a valid filter for arrays.`
          + ` Use any of these: ${validFilterNames.array}.`
        )
      }

      const result = checkers.array[key](value, filters[key])

      if (result === false) {
        return false
      }
    }

    return true
  },
  number: (filters, value) => {
    for (const key in filters) {
      if (!(key in checkers.number)) {
        throw new Error(
          `"${key}" is not a valid filter for numbers.`
          + ` Use any of these: ${validFilterNames.number}.`
        )
      }

      const result = checkers.number[key](value, filters[key])

      if (result === false) {
        return false
      }
    }

    return true
  },
  string: (filters, value) => {
    for (const key in filters) {
      if (!(key in checkers.string)) {
        throw new Error(
          `"${key}" is not a valid filter for strings.`
          + ` Use any of these: ${validFilterNames.string}.`
        )
      }

      const result = checkers.string[key](value, filters[key])

      if (result === false) {
        return false
      }
    }

    return true
  },
}

/**
 * @param {Filters} filters
 * @param {Array<any> | number | string} value
 * @returns {boolean}
 * @throws {Error}
 */
function check(filters, value) {
  if (isObjectEmpty(filters)) {
    return true
  }

  if (value instanceof Array) {
    return checkersWrappers.array(filters, value)
  }
  else if (typeof value === 'number') {
    return checkersWrappers.number(filters, value)
  }
  else if (typeof value === 'string') {
    return checkersWrappers.string(filters, value)
  }

  const expectedTypes = Object.keys(checkersWrappers).map((value) => `"${value}"`).join(', ')

  throw new Error(`Expected "${value}" to be any of these ${expectedTypes}`)
}

export { check }
