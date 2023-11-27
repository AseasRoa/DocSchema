import {
  findClosingQuotePosition,
  isolateEndDescription,
  isolateFrontDescription,
  removeWrappingBraces,
  splitTypeExpression
} from '../functions/utils.js'
import { parse } from '../parse-check-filters/parse.js'

/**
 * Primitive types
 *
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Primitive
 * @see https://github.com/jsdoc/jsdoc/issues/1066
 * @type {Primitives[]}
 */
const primitiveTypes = [
  'string', 'number', 'bigint', 'boolean', 'undefined', 'symbol', 'null'
]

const quotes = ['\'', '"', '`']

/**
 * An object of functions that can parse simple and complex JsDoc type expressions
 * - these are expressions that does not contain other expressions in them.
 *
 * It's important for the regexes to NOT have the 'm' flag
 *
 * @type {{
 *   simple: {
 *     any          : ParserFunctionSimple,
 *     boolean      : ParserFunctionSimple,
 *     number       : ParserFunctionSimple,
 *     string       : ParserFunctionSimple,
 *     tryPrimitive : ParserFunctionSimple,
 *   },
 *   complex: {
 *     array         : ParserFunctionComplex,
 *     array2        : ParserFunctionComplex,
 *     object        : ParserFunctionComplex,
 *     objectLiteral : ParserFunctionComplex,
 *     typedef       : ParserFunctionComplex
 *   }
 * }}
 */
const parsers = {
  simple: {
    // any or *
    any : (typeExpression) => {
      const typeExpressionClean = removeWrappingBraces(typeExpression.trim())

      if (
        typeExpressionClean !== ''
        && typeExpressionClean !== '*'
        && typeExpressionClean !== 'any'
      ) {
        return false
      }

      return {
        typeName       : 'any',
        typeExpression : typeExpression
      }
    },

    // true or false
    boolean : (typeExpression) => {
      const typeExpressionClean = removeWrappingBraces(typeExpression.trim())

      if (typeExpressionClean !== 'true' && typeExpressionClean !== 'false') {
        return false
      }

      return {
        typeName       : 'boolean',
        typeExpression : typeExpression,
        value          : (typeExpressionClean === 'true')
      }
    },

    // Something like: 12345
    number : (typeExpression) => {
      const typeExpressionClean = removeWrappingBraces(typeExpression.trim())

      if (/^-?\d+\.?\d*$/u.exec(typeExpressionClean) === null) {
        return false
      }

      return {
        typeName       : 'number',
        typeExpression : typeExpression,
        value          : parseFloat(typeExpressionClean)
      }
    },

    // Something like: 'some-text'
    string : (typeExpression) => {
      const typeExpressionClean = removeWrappingBraces(typeExpression.trim())
      const quote               = typeExpressionClean[0] ?? ''

      if (!quotes.includes(quote)) return false

      /**
       * Check whether the input type is a string value (having quotes).
       * For example, including the quotes:
       * 'text'
       * 'I\'m cool'
       */
      const closingQuotePosition = findClosingQuotePosition(typeExpressionClean)

      if (closingQuotePosition !== typeExpressionClean.length - 1) {
        return false
      }

      return {
        typeName       : 'string',
        typeExpression : typeExpression,
        value          : typeExpressionClean.slice(1, -1)
      }
    },

    // Something like: "number"
    tryPrimitive : (typeExpression) => {
      const typeExpressionClean = removeWrappingBraces(typeExpression.trim())

      /** @type {Primitives} */
      // @ts-ignore
      const typeName = typeExpressionClean.toLowerCase()

      if (!primitiveTypes.includes(typeName)) {
        return false
      }

      return { typeName, typeExpression }
    }
  },
  complex: {
    /*
     * Something like: Array.<number>
     */
    array : (typeExpression, typeParser, currentLocation) => {
      const typeExpressionClean = removeWrappingBraces(typeExpression.trim())
      const match = /^array\.?<(.+)>$/ui.exec(typeExpressionClean)

      if (match === null) return false

      const arrayValueTypes = match[1] ?? '*'

      return {
        typeName       : 'array',
        typeExpression : typeExpression,
        types          : typeParser(arrayValueTypes, currentLocation)
      }
    },

    /*
     * Something like: string[]
     */
    array2 : (typeExpression, typeParser, currentLocation) => {
      const typeExpressionClean = removeWrappingBraces(typeExpression.trim())

      /*
       * The pattern matches two situations:
       * 1: typeName[]
       * 2: (typeName)[]
       */
      const pattern = /^((?=[^(]).+(?<=[^)]))\[\]$|^\((.*)\)\[\]$/ui
      const match   = pattern.exec(typeExpressionClean)

      if (match === null) return false

      const arrayValueTypes = match[1] ?? match[2] ?? ''

      return {
        typeName       : 'array',
        typeExpression : typeExpression,
        types          : typeParser(arrayValueTypes, currentLocation)
      }
    },

    /*
     * Something like: Object.<string, string>
     */
    object : (typeExpression, typeParser, currentLocation) => {
      const typeExpressionClean = removeWrappingBraces(typeExpression.trim())
      const match = /^(?:object|record)\.?<(.+)>$/ui.exec(typeExpressionClean)

      if (match === null) return false

      const pairExpression = (match?.[1] ?? '').trim()
      const pair           = splitTypeExpression(pairExpression, [','])

      return {
        typeName       : 'object',
        typeExpression : typeExpression,
        typePairs      : [{
          keyTypes   : typeParser(pair[0] ?? '*', currentLocation),
          valueTypes : typeParser(pair[1] ?? '*', currentLocation)
        }]
      }
    },

    /*
     * Something like: {a:number, b:string}
     * Also, multiline object literal, with or without comments as descriptions
     */
    objectLiteral : (typeExpression, typeParser, currentLocation) => {
      const typeExpressionClean = removeWrappingBraces(typeExpression.trim())
      const match = /^\{(.*)\}$/usi.exec(typeExpressionClean)

      if (match === null) return false

      /*
       * When separating by comma, the first expression will likely be fine.
       * But it would be expected to have single-line descriptions after the type
       * definition. In this case, the description for a given expression will be
       * placed in front of the next expression, because it follows the comma.
       * This means that the description needs to be separated.
       */
      const pairExpressions = splitTypeExpression((match?.[1] ?? '').trim(), [','])

      /** @type {ObjectLiteralPair[]} */
      const pairs = []

      for (const pairExpression of pairExpressions) {
        const frontDescriptionTuple = isolateFrontDescription(pairExpression)
        const pairsLength       = pairs.length

        if (pairsLength > 0) {
          const { description, filters } = parse(
            frontDescriptionTuple[0],
            // @ts-ignore
            pairs[pairsLength-1].valueTypes,
            currentLocation
          )

          // @ts-ignore
          pairs[pairsLength-1].description = description
          // @ts-ignore
          pairs[pairsLength-1].filters = filters
        }

        // Only comment found => it's the comment of the last pair
        if (frontDescriptionTuple[1] === '') {
          continue
        }

        const nameTypePair = splitTypeExpression(frontDescriptionTuple[1], [':'])
        const endDescriptionTuple = isolateEndDescription(nameTypePair[1] ?? '')

        let key = (nameTypePair[0] ?? '').replaceAll(' ', '')
        const types = (endDescriptionTuple[0]).replaceAll(' ', '')

        let valueTypes = typeParser(types, currentLocation)

        /*
         * Deal with optional parameters like {key?:string}
         * by removing the ? and adding undefined as one more possible type
         */
        if (key.endsWith('?')) {
          key = key.substring(0, key.length - 1)

          valueTypes = valueTypes.concat(
            typeParser('undefined', currentLocation)
          )
        }

        const { description, filters } = parse(
          endDescriptionTuple[1],
          valueTypes,
          currentLocation
        )

        /** @type {ObjectLiteralPair} */
        const pair = { key, valueTypes, description, filters }

        pairs.push(pair)
      }

      return {
        typeName       : 'objectLiteral',
        typeExpression : typeExpression,
        pairs          : pairs
      }
    },

    /*
     * Something like: MyTypeName
     */
    typedef : (typeExpression) => {
      const typeExpressionClean = removeWrappingBraces(typeExpression.trim())
      const match = /^\w+$/u.exec(typeExpressionClean)

      if (match === null) return false

      return {
        typeName       : 'typedef',
        typeExpression : typeExpression
      }
    }
  }
}

export { parsers }
