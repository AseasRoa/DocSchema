import { check as checkFilters } from '../parse-check-filters/check.js'
import { checkers } from './checkers.js'

/**
 * @type {TypesChecker}
 * @throws {Error} If missing checker function (should never happen)
 */
function check(parsedTypes, value, typedefs, filters) {
  for (const parsedType of parsedTypes) {
    const {typeName} = parsedType
    const checkerFunc = checkers.simple[typeName] ?? checkers.complex[typeName]

    if (!(checkerFunc instanceof Function)) {
      throw new Error(`Wrong typeName ${typeName}`)
    }

    const result = checkerFunc(parsedType, value, typedefs, filters, check)

    if (result) {
      return checkFilters(filters, value)
    }
  }

  return false
}

export { check }
