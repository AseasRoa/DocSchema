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
 * @param {string} typeExpression
 * @returns {string}
 */
function cleanTypeExpression(typeExpression) {
  return removeWrappingBraces(typeExpression.trim())
}

/**
 * An object of functions that can parse simple and complex
 * JsDoc type expressions
 * - these are expressions that does not contain
 *   other expressions in them.
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
 *     array    : ParserFunctionComplex,
 *     array2   : ParserFunctionComplex,
 *     literal  : ParserFunctionComplex,
 *     object   : ParserFunctionComplex,
 *     typedef  : ParserFunctionComplex
 *   }
 * }}
 */
const parsers = {
  simple: {
    /*
     * any or *
     */
    any: (typeExpression) => {
      const typeExpressionClean = cleanTypeExpression(typeExpression)

      if (
        typeExpressionClean !== ''
        && typeExpressionClean !== '*'
        && typeExpressionClean !== 'any'
      ) {
        return false
      }

      return {
        typeName: 'any',
        typeExpression: typeExpression
      }
    },

    /*
     * true or false
     */
    boolean: (typeExpression) => {
      const typeExpressionClean = cleanTypeExpression(typeExpression)

      if (typeExpressionClean !== 'true' && typeExpressionClean !== 'false') {
        return false
      }

      return {
        typeName: 'boolean',
        typeExpression: typeExpression,
        value: (typeExpressionClean === 'true')
      }
    },

    /*
     * Something like: 12345
     */
    number: (typeExpression) => {
      const typeExpressionClean = cleanTypeExpression(typeExpression)

      if (/^-?\d+\.?\d*$/u.exec(typeExpressionClean) === null) {
        return false
      }

      return {
        typeName: 'number',
        typeExpression: typeExpression,
        value: parseFloat(typeExpressionClean)
      }
    },

    /*
     * Something like: 'some-text'
     */
    string: (typeExpression) => {
      const typeExpressionClean = cleanTypeExpression(typeExpression)
      const quote = typeExpressionClean[0] ?? ''

      if (!quotes.includes(quote)) return false

      /**
       * Check whether the input type is a string
       * value (having quotes).
       * For example, including the quotes:
       * 'text'
       * 'I\'m cool'
       */
      const closingQuotePosition = findClosingQuotePosition(typeExpressionClean)

      if (closingQuotePosition !== typeExpressionClean.length - 1) {
        return false
      }

      return {
        typeName: 'string',
        typeExpression: typeExpression,
        value: typeExpressionClean.slice(1, -1)
      }
    },

    /*
     * Something like: "number"
     */
    tryPrimitive: (typeExpression) => {
      const typeExpressionClean = cleanTypeExpression(typeExpression)

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
    array: (typeExpression, typeParser, currentLocation) => {
      const typeExpressionClean = cleanTypeExpression(typeExpression)
      const match = /^array\.?<(.+)>$/ui.exec(typeExpressionClean)

      if (match === null) return false

      const arrayValueTypes = match[1] ?? '*'

      return {
        typeName: 'array',
        typeExpression: typeExpression,
        types: typeParser(arrayValueTypes, currentLocation)
      }
    },

    /*
     * Something like: string[]
     */
    array2: (typeExpression, typeParser, currentLocation) => {
      const typeExpressionClean = cleanTypeExpression(typeExpression)

      /*
       * The pattern matches two situations:
       * 1: typeName[]
       * 2: (typeName)[]
       */
      const pattern = /^((?=[^(]).+(?<=[^)]))\[\]$|^\((.*)\)\[\]$/ui
      const match = pattern.exec(typeExpressionClean)

      if (match === null) return false

      const arrayValueTypes = match[1] ?? match[2] ?? ''

      return {
        typeName: 'array',
        typeExpression: typeExpression,
        types: typeParser(arrayValueTypes, currentLocation)
      }
    },

    /*
     * Covers arrayLiteral and objectLiteral types
     *
     * Array literal is like: [number, string]
     * Object literal is like: {a:number, b:string}
     *
     * Also, it supports multiline object literal,
     * with or without comments as descriptions
     */
    literal: (typeExpression, typeParser, currentLocation) => {
      const typeExpressionClean = cleanTypeExpression(typeExpression)
      const openingBracket = typeExpressionClean[0] ?? ''

      let pattern = null
      let isArray = false

      if (openingBracket === '{') {
        pattern = /^\{(.*)\}$/usi
        isArray = false
      }
      else if (openingBracket === '[') {
        pattern = /^\[(.*)\]$/usi
        isArray = true
      }
      else {
        return false
      }

      const match = pattern.exec(typeExpressionClean)

      if (match === null) return false

      const literalBody = (match?.[1] ?? '').trim()

      /*
       * When separating by comma, the first expression will
       * likely be fine. But it would be expected to have
       * single-line descriptions after the type definition.
       * In this case, the description for a given expression
       * will be placed in front of the next expression, because
       * it follows the comma. This means that the description
       * needs to be separated.
       */
      const pairExpressions = splitTypeExpression(literalBody, [','])

      /** @type {ObjectLiteralPair[]} */
      const pairs = []
      let index = 0

      for (const pairExpression of pairExpressions) {
        const frontDescriptionTuple = isolateFrontDescription(pairExpression)
        const pairsLength = pairs.length
        const pairsLastIndex = pairsLength - 1

        if (pairsLength > 0) {
          const { description, filters } = parse(
            frontDescriptionTuple[0],
            // @ts-ignore
            pairs[pairsLastIndex].valueTypes,
            currentLocation
          )

          // @ts-ignore
          pairs[pairsLastIndex].description = description
          // @ts-ignore
          pairs[pairsLastIndex].filters = filters
        }

        /*
         * Only comment found => it's the comment of
         * the last pair
         */
        if (frontDescriptionTuple[1] === '') {
          continue
        }

        let type = ''
        let key = ''

        if (isArray) {
          type = frontDescriptionTuple[1] ?? ''
          key = index.toString()
          index += 1
        }
        else {
          const nameTypePair = splitTypeExpression(
            frontDescriptionTuple[1],
            [':']
          )
          const name = nameTypePair[0] ?? ''

          type = nameTypePair[1] ?? ''
          key = name.replaceAll(' ', '')
        }

        const endDescriptionTuple = isolateEndDescription(type)
        const types = (endDescriptionTuple[0]).replace(/\s/ug, '')

        let valueTypes = typeParser(types, currentLocation)

        if (!isArray) {
          /*
           * Deal with optional parameters like {key?:string}
           * by removing the ? and adding undefined as one
           * more possible type
           */
          if (key.endsWith('?')) {
            key = key.substring(0, key.length - 1)

            valueTypes = valueTypes.concat(
              typeParser('undefined', currentLocation)
            )
          }
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
        typeName: (isArray) ? 'arrayLiteral' : 'objectLiteral',
        typeExpression: typeExpression,
        pairs: pairs
      }
    },

    /*
     * Something like: Object.<string, string>
     */
    object: (typeExpression, typeParser, currentLocation) => {
      const typeExpressionClean = cleanTypeExpression(typeExpression)
      const match = /^(?:object|record)\.?<(.+)>$/ui.exec(typeExpressionClean)

      if (match === null) return false

      const pairExpression = (match?.[1] ?? '').trim()
      const pair = splitTypeExpression(pairExpression, [','])

      return {
        typeName: 'object',
        typeExpression: typeExpression,
        typePairs: [{
          keyTypes: typeParser(pair[0] ?? '*', currentLocation),
          valueTypes: typeParser(pair[1] ?? '*', currentLocation)
        }]
      }
    },

    /*
     * Something like: MyTypeName
     */
    typedef: (typeExpression) => {
      const typeExpressionClean = cleanTypeExpression(typeExpression)
      const match = /^\w+$/u.exec(typeExpressionClean)

      if (match === null) return false

      return {
        typeName: 'typedef',
        typeExpression: typeExpression
      }
    }
  }
}

export { parsers }
