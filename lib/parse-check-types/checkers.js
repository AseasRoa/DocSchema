/**
 * A checker function should:
 * - Return true when the value matches the type.
 * - Return false when the type name doesn't match, basically
 *   skip the check.
 * - Return false when the value doesn't match the type.
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
    any: () => true,
    boolean: (parsedType, value) => tryPrimitiveType(parsedType, value),
    number: (parsedType, value) => tryPrimitiveType(parsedType, value),
    string: (parsedType, value) => tryPrimitiveType(parsedType, value),
    null: (parsedType, value) => (value === null),
    undefined: (parsedType, value) => (value === undefined),
    bigint: (parsedType, value) => tryPrimitiveType(parsedType, value),
    symbol: (parsedType, value) => tryPrimitiveType(parsedType, value),
  },
  complex: {
    array: (parsedType, value, key, ast, filters, validator, check) => {
      if (!(Array.isArray(value))) {
        return false
      }

      for (let i = 0; i < value.length; i++) {
        const types = parsedType?.types ?? []
        const result = check(types, value[i], i, ast, {}, validator)

        if (!result) return false
      }

      return true
    },

    object: (parsedType, value, key, ast, filters, validator, check) => {
      if (!(value instanceof Object)) {
        return false
      }

      const pairs = parsedType.typePairs ?? []

      for (const pair of pairs) {
        for (const valueKey in value) {
          let result = check(
            pair.keyTypes, valueKey, valueKey, ast, filters, validator
          )

          if (!result) return false

          result = check(
            pair.valueTypes,
            value[valueKey],
            valueKey,
            ast,
            filters,
            validator
          )

          if (!result) return false
        }
      }

      return true
    },

    objectLiteral: (
      parsedType, value, key, ast, filters, validator, check
    ) => {
      if (!(value instanceof Object)) {
        return false
      }

      const pairs = parsedType.pairs ?? []

      for (const pair of pairs) {
        /**
         * I disabled the check below, because it's possible to
         * set the type to be undefined, which means that it's
         * possible to Not have the key at all.
         *
         * if (!(pair.key in value)) {
         *  return false
         * }
         */

        const result = check(
          pair.valueTypes,
          value[pair.key],
          pair.key,
          ast,
          pair.filters,
          validator
        )

        if (!result) return false
      }

      return true
    },

    typedef: (parsedType, value, key, ast, filters, validator, check) => {
      // 1) Try typedefs (@typedef or @callback)

      for (let i = 0; i < 2; i++) {
        const typedefs = (i === 0) ? ast.localTypedefs : ast.ambientTypedefs

        for (const typedef of typedefs) {
          const element = typedef.elements.typedef ?? typedef.elements.callback

          if (element?.description !== parsedType.typeExpression) {
            continue
          }

          /** @type {'property' | 'param'} */
          const propertyTagName = typedef.elements.callback ? 'param' : 'property'
          const propertyTags = typedef.elements[propertyTagName]

          if (
            propertyTags
            && propertyTags.length > 0
            /*
             * && (
             *   // no type definition, for example:
             *   // @typedef TypeName
             *   !typeName
             *   // has type definition, but it's object,
             *   // for example: @typedef {Object} TypeName
             *   || typeName === 'object'
             *   || typeName === 'any'
             * )
             */
          ) {
            if (!(value instanceof Object)) {
              return false
            }

            let checkResult = null

            if (typedef.elements.callback) {
              checkResult = validator.validateFunctionArguments(
                typedef, value, false
              )
            }
            else {
              checkResult = validator.validateParams(
                propertyTagName, typedef, value, false
              )
            }

            return checkResult.pass
          }

          const parsedTypes = element?.types ?? []

          const result = check(
            parsedTypes,
            value,
            key,
            ast,
            element?.filters,
            validator
          )

          return result
        }
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
