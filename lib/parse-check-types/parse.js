import { splitTypeExpression } from '../functions/utils.js'
import { parsers } from './parsers.js'

/**
 * List of From => To values.
 * All From keys must be lowercase.
 *
 * Note: The star seems to be official "any" in JsDoc
 *
 * @type {Object<string, string>}
 */
export const COMMON_MISTAKE_FIXES = Object.freeze({
  '': '*',
  'any': '*',
  '[]': '*[]',
  'array': '*[]',
  '{}': 'Object<*,*>',
  'object': 'Object<*,*>'
})

/** @type {string[]} */
const splitSeparators = ['|', '&']

const allParsers = [parsers.simple, parsers.complex]

/**
 * @param {string} type JsDoc type
 * @returns {string}
 */
function fixCommonTypeMistakes(type) {
  const trimmedType = type.trim()
  const lowerCaseType = trimmedType.toLowerCase()

  return COMMON_MISTAKE_FIXES[lowerCaseType] ?? trimmedType
}

/**
 * @param {string} typeExpression
 * @param {Object<string, ParserFunction>} typeParsers
 * @param {CurrentLocation} [currentLocation]
 * @returns {ParsedType | false}
 */
function tryToParseTypes(typeExpression, typeParsers, currentLocation) {
  for (const name in typeParsers) {
    const parser = typeParsers[name]

    if (parser) {
      const result = parser(typeExpression, parse, currentLocation)

      if (result) {
        return result
      }
    }
  }

  return false
}

/**
 * @param {string[]} split
 * @param {CurrentLocation} [currentLocation]
 * @returns {ParsedType[]}
 */
function parseMultipleTypes(split, currentLocation) {
  /** @type {ParsedType[]} */
  const output = []

  for (const member of split) {
    if (member) {
      const [ processedType ] = parse(member, currentLocation)

      if (processedType) output.push(processedType)
    }
  }

  return output
}

/**
 * @param {string} typeExpression
 * @param {CurrentLocation} [currentLocation]
 * @returns {ParsedType[]}
 */
function parseSingleType(typeExpression, currentLocation) {
  for (const parsers of allParsers) {
    const parsedTypeOrFail = tryToParseTypes(
      typeExpression, parsers, currentLocation
    )

    if (parsedTypeOrFail) {
      return [parsedTypeOrFail]
    }
  }

  return [{
    typeName: 'any', // what this should be?
    typeExpression: typeExpression
  }]
}

/**
 * @param {string} typeExpression
 * @param {CurrentLocation} [currentLocation]
 * @returns {ParsedType[]}
 */
function parse(typeExpression, currentLocation) {
  const expression = fixCommonTypeMistakes(typeExpression)
  const expressionSplit = splitTypeExpression(expression, splitSeparators)

  return expressionSplit.length > 1
    ? parseMultipleTypes(expressionSplit, currentLocation)
    : parseSingleType(expression, currentLocation)
}

export { parse }
