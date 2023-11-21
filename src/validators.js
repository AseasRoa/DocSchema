/**
 * A validator function should:
 * - Return true when the value matches the type.
 * - Return false when the type name doesn't match, basically skip the validation
 * - Return an error when the value doesn't match the type
 *
 * @type {{
 *   array         : ValidatorFunction,
 *   object        : ValidatorFunction,
 *   objectLiteral : ValidatorFunction,
 *   any           : ValidatorFunction,
 *   null          : ValidatorFunction,
 *   undefined     : ValidatorFunction,
 *   string        : ValidatorFunction,
 *   number        : ValidatorFunction,
 *   bigint        : ValidatorFunction,
 *   boolean       : ValidatorFunction,
 *   symbol        : ValidatorFunction,
 *   typedef       : ValidatorFunction
 * }}
 */
const validators = {
  array : (parsedType, value, typedefs, limits, typesValidator) => {
    if (!(Array.isArray(value))) {
      return false
    }

    for (const arrayValue of value) {
      const result = typesValidator(
        parsedType?.types ?? [],
        arrayValue,
        typedefs,
        {}
      )

      if (!result) return false
    }

    return true
  },

  object : (parsedType, value, typedefs, limits, typesValidator) => {
    if (!(value instanceof Object)) {
      return false
    }

    const pairs = parsedType.typePairs ?? []

    for (const pair of pairs) {
      for (const key in value) {
        let result = typesValidator(pair.keyTypes, key, typedefs, limits)

        if (!result) return false

        result = typesValidator(pair.valueTypes, value[key], typedefs, limits)

        if (!result) return false
      }
    }

    return true
  },

  objectLiteral : (parsedType, value, typedefs, limits, typesValidator) => {
    if (!(value instanceof Object)) {
      return false
    }

    const pairs = parsedType.pairs ?? []

    for (const pair of pairs) {
      /**
       * I disabled the check below, because it's possible to set the type to be
       * undefined, which means that it's possible to Not have the key at all.
       *
       * if (!(pair.key in value)) {
       *  return new ValidationError(`Missing key '${pair.key}'`)
       * }
       */

      const result = typesValidator(pair.valueTypes, value[pair.key], typedefs, pair.limits)

      if (!result) return false
    }

    return true
  },

  any : () => true,

  null : (parsedType, value) => (value === null),

  undefined : (parsedType, value) => (value === undefined),

  string : (parsedType, value) => tryPrimitiveType(parsedType, value),

  number : (parsedType, value) => tryPrimitiveType(parsedType, value),

  bigint : (parsedType, value) => tryPrimitiveType(parsedType, value),

  boolean : (parsedType, value) => tryPrimitiveType(parsedType, value),

  symbol : (parsedType, value) => tryPrimitiveType(parsedType, value),

  typedef : (parsedType, value, typedefs, limits, typesValidator) => {
    // 1) Try typedefs

    for (const typedef of typedefs) {
      if (typedef.elements.typedef?.description !== parsedType.typeExpression) {
        continue
      }

      const result = typesValidator(
        typedef.elements.typedef?.types ?? [],
        value,
        typedefs,
        typedef.elements.typedef?.limits
      )

      return result
    }

    // 2) Try constructor

    const constructorName = value?.constructor?.name

    return Boolean(
      typeof constructorName === 'string'
      && constructorName
      && parsedType.typeExpression === constructorName
    )
  }
}

/**
 * @param {ParsedType} parsedType
 * @param {any} value
 * @returns {boolean}
 */
function tryPrimitiveType(parsedType, value) {
  if (typeof value === parsedType.typeName) {
    // Not having a 'value' means that any value is accepted
    if (!('value' in parsedType)) return true

    // Is the value exactly the same?
    return (value === parsedType.value)
  }

  return false
}

export { validators }
