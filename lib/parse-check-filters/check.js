import { isObjectEmpty } from '../functions/utils.js'
import { checkers } from './checkers.js'
import { setLastError } from '../errors/ValidationError.js'

/**
 * @param {string} invalidKey
 * @param {keyof checkers} validKey
 * @throws {SyntaxError}
 */
function throwErrorAboutInvalidFilter(invalidKey, validKey) {
  throw new SyntaxError(
    `"${invalidKey}" is not a valid filter for ${validKey}s`
  )
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
        // Not necessary, because this problem should be caught at parse time
        throwErrorAboutInvalidFilter(key, 'array')
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
        // Not necessary, because this problem should be caught at parse time
        throwErrorAboutInvalidFilter(key, 'number')
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
        // Not necessary, because this problem should be caught at parse time
        throwErrorAboutInvalidFilter(key, 'string')
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
 * @throws {SyntaxError}
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

  const expectedTypes = Object.keys(checkersWrappers)
    .map((value) => `"${value}"`)
    .join(', ')

  setLastError(
    `Expected "${value}" to be any of these types ${expectedTypes}`,
    '',
  )

  return false
}

export { check }
