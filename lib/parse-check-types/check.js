import { checkResult } from '../errors/ValidationError.js'
import { check as checkFilters } from '../parse-check-filters/check.js'
import { checkers } from './checkers.js'

/**
 * @type {TypesChecker}
 * @throws {SyntaxError} If missing checker function (should never happen)
 */
function check(parsedTypes, value, key, typedefs, filters, validator) {
  for (const parsedType of parsedTypes) {
    const { typeName } = parsedType
    const checkerFunc = checkers.simple[typeName] ?? checkers.complex[typeName]
    
    if (!(checkerFunc instanceof Function)) {
      // Just in case, we should not end up here
      throw new SyntaxError(`Wrong typeName ${typeName}`)
    }

    if (
      typeName.startsWith('object')
      || typeName.startsWith('array')
    ) {
      if (key !== '') checkResult.valuePath.push(key.toString())
    }
    else if (key !== '') {
      checkResult.valuePath.push(key.toString())
    }

    checkResult.kind = 'type'
    checkResult.expectedType = parsedType.typeExpression
    checkResult.value = value

    const result = checkerFunc(
      parsedType, value, key, typedefs, filters, validator, check
    )

    if (result) {
      const resultFilters = checkFilters(filters, value)

      if (resultFilters) {
        checkResult.expectedType = ''
        checkResult.kind = ''
        checkResult.value = undefined
        // No error for the last part of the path => delete it
        checkResult.valuePath.pop()

        return true
      }
    }
  }

  checkResult.pass = false
  checkResult.kind = checkResult.kind || ''

  return false
}

export { check }
