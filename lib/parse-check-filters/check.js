import { checkResult } from '../checkResult.js'
import { isObjectEmpty } from '../functions/utils.js'
import { checkers } from './checkers.js'

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
 *   array: function(TupleFilters, Array<any>): boolean,
 *   number: function(TupleFilters, number): boolean,
 *   string: function(TupleFilters, string): boolean,
 * }}
 */
const checkersWrappers = {
  array: (filters, value) => {
    for (const key in filters) {
      /*
       * Not necessary, because these problems should
       * be caught at parse time
       */
      if (!(key in checkers.array) || !(filters[key] instanceof Array)) {
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
      /*
       * Not necessary, because these problems should
       * be caught at parse time
       */
      if (!(key in checkers.number) || !(filters[key] instanceof Array)) {
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
      /*
       * Not necessary, because these problems should
       * be caught at parse time
       */
      if (!(key in checkers.string) || !(filters[key] instanceof Array)) {
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
 * @param {TupleFilters} filters
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

  checkResult.kind = 'filter'
  checkResult.message = `Expected "${value}" to be any of these types ${expectedTypes}`

  return false
}

export { check }
