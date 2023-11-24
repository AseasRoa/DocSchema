/**
 * A checker function should:
 * - Return true when the value matches the type.
 * - Return false when the type name doesn't match, basically skip the check
 * - Return false when the value doesn't match the type
 *
 * @type {{
 *   simple: {
 *     any       : CheckerFunctionSimple,
 *     boolean   : CheckerFunctionSimple,
 *     number    : CheckerFunctionSimple,
 *     string    : CheckerFunctionSimple,
 *     null      : CheckerFunctionSimple,
 *     undefined : CheckerFunctionSimple,
 *     bigint    : CheckerFunctionSimple,
 *     symbol    : CheckerFunctionSimple
 *   },
 *   complex: {
 *     array         : CheckerFunctionComplex,
 *     object        : CheckerFunctionComplex,
 *     objectLiteral : CheckerFunctionComplex,
 *     typedef       : CheckerFunctionComplex
 *   }
 * }}
 */
const checkers = {
  simple: {
    any : () => true,
    boolean : (parsedType, value) => tryPrimitiveType(parsedType, value),
    number : (parsedType, value) => tryPrimitiveType(parsedType, value),
    string : (parsedType, value) => tryPrimitiveType(parsedType, value),
    null : (parsedType, value) => (value === null),
    undefined : (parsedType, value) => (value === undefined),
    bigint : (parsedType, value) => tryPrimitiveType(parsedType, value),
    symbol : (parsedType, value) => tryPrimitiveType(parsedType, value),
  },
  complex: {
    array : (parsedType, value, typedefs, filters, check) => {
      if (!(Array.isArray(value))) {
        return false
      }

      for (const arrayValue of value) {
        const result = check(
          parsedType?.types ?? [],
          arrayValue,
          typedefs,
          {}
        )

        if (!result) return false
      }

      return true
    },

    object : (parsedType, value, typedefs, filters, check) => {
      if (!(value instanceof Object)) {
        return false
      }

      const pairs = parsedType.typePairs ?? []

      for (const pair of pairs) {
        for (const key in value) {
          let result = check(pair.keyTypes, key, typedefs, filters)

          if (!result) return false

          result = check(pair.valueTypes, value[key], typedefs, filters)

          if (!result) return false
        }
      }

      return true
    },

    objectLiteral : (parsedType, value, typedefs, filters, check) => {
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
         *  return false
         * }
         */

        const result = check(
          pair.valueTypes,
          value[pair.key],
          typedefs,
          pair.filters
        )

        if (!result) return false
      }

      return true
    },

    typedef : (parsedType, value, typedefs, filters, check) => {
      // 1) Try typedefs

      for (const typedef of typedefs) {
        if (typedef.elements.typedef?.description !== parsedType.typeExpression) {
          continue
        }

        const result = check(
          typedef.elements.typedef?.types ?? [],
          value,
          typedefs,
          typedef.elements.typedef?.filters
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

export { checkers }
