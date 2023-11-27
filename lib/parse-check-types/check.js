import { lastError } from '../errors/ValidationError.js'
import { check as checkFilters } from '../parse-check-filters/check.js'
import { checkers } from './checkers.js'

/**
 * @type {TypesChecker}
 * @throws {SyntaxError} If missing checker function (should never happen)
 */
function check(parsedTypes, value, key, typedefs, filters) {
  for (const parsedType of parsedTypes) {
    const { typeName } = parsedType
    const checkerFunc = checkers.simple[typeName] ?? checkers.complex[typeName]

    if (!(checkerFunc instanceof Function)) {
      // Just in case, we should not end up here
      throw new SyntaxError(`Wrong typeName ${typeName}`)
    }

    if (key !== '') {
      if (
        typeName === 'object'
        || typeName === 'array'
        || typeName === 'objectLiteral'
      ) {
        lastError.valuePath.push(key.toString())
      }
      else if (lastError.valuePath.length > 0) {
        lastError.valuePath.push(key.toString())
      }
    }

    lastError.kind = 'type'
    lastError.expectedType = parsedType.typeExpression
    lastError.value = value

    const result = checkerFunc(parsedType, value, key, typedefs, filters, check)

    if (result) {
      const resultFilters = checkFilters(filters, value)

      if (resultFilters) {
        lastError.expectedType = ''
        lastError.kind = ''
        lastError.value = undefined
        // No error for the last part of the path => delete it
        lastError.valuePath.pop()

        return true
      }
    }
  }

  lastError.pass = false
  lastError.kind = lastError.kind || ''

  return false
}

export { check }
