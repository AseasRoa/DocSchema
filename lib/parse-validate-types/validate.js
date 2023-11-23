import { validate as validateFilters } from '../parse-validate-filters/validate.js'
import { validators } from './validators.js'

/**
 * @type {TypesValidator}
 * @throws {Error} If missing validator function (should never happen)
 */
function validate(parsedTypes, value, typedefs, filters) {
  for (const parsedType of parsedTypes) {
    const {typeName} = parsedType
    const validatorFunc =
      validators.simple[typeName] ?? validators.complex[typeName]

    if (!(validatorFunc instanceof Function)) {
      throw new Error(`Wrong typeName ${typeName}`)
    }

    const result = validatorFunc(parsedType, value, typedefs, filters, validate)

    if (result) {
      validateFilters(filters, value)

      return true
    }
  }

  return false
}

export { validate }
