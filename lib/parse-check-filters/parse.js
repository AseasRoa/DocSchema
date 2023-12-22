import { findClosingBracketPosition } from '../functions/utils.js'
import { parsers } from './parsers.js'

/**
 * @typedef {keyof parsers} ParserNames
 */

/**
 * @type {string}
 */
const validParserNames = Object.keys(parsers).map((value) => `"${value}"`).join(', ')

/**
 * @type {Record<ParserNames, string>}
 */
const validFilterNames = {
  array: Object.keys(parsers.array).map((value) => `"${value}"`).join(', '),
  number: Object.keys(parsers.number).map((value) => `"${value}"`).join(', '),
  string: Object.keys(parsers.string).map((value) => `"${value}"`).join(', ')
}

/**
 * @param {CurrentLocation} [currentLocation]
 * @returns {string}
 */
function buildCurrentLocationString(currentLocation) {
  return ((currentLocation)
    ? ` at ${currentLocation?.file}:${currentLocation?.startLine}`
    : ''
  )
}

/**
 * @param {string} invalidKey
 * @param {keyof parsers} validKey
 * @param {CurrentLocation} [currentLocation]
 * @throws {SyntaxError}
 */
function throwSyntaxErrorAboutInvalidFilter(
  invalidKey, validKey, currentLocation
) {
  throw new SyntaxError(
    `"${invalidKey}" is not a valid filter for type "${validKey}"`
    + buildCurrentLocationString(currentLocation)
    + `. Use any of these filters: ${validFilterNames[validKey]}`
  )
}

/**
 * @param {ParserNames} typeName
 * @param {Filters} filters
 * @param {CurrentLocation} [currentLocation]
 * @throws {SyntaxError}
 */
function validateParser(typeName, filters, currentLocation) {
  if (!(typeName in parsers)) {
    throw new SyntaxError(
      /*
       * Note: Do not enquote typeName, because it doesn't
       * look good when the type is array or similar
       */
      `Filters are not compatible with ${typeName} type`
      + buildCurrentLocationString(currentLocation)
      + `. Use filters only with types: ${validParserNames}`
    )
  }

  for (const key in filters) {
    if (!(key in parsers[typeName])) {
      throwSyntaxErrorAboutInvalidFilter(key, typeName, currentLocation)

      continue
    }

    const shouldBe = parsers[typeName][key]
    let filterValue = filters[key]

    if (shouldBe !== Array && filterValue instanceof Array) {
      if (filterValue.length === 0) {
        throw new SyntaxError(
          `Filter "${key}" (used for ${typeName} type) is an empty Array`
          + buildCurrentLocationString(currentLocation)
          + '. When the filter is an Array, it should be a tuple with the filter'
          + ' value at index 0 and a custom error message at index 1.'
          + ` In ${JSON.stringify(filters)}`
        )
      }

      filterValue = filterValue[0]
    }

    const typeActual = typeof filterValue

    if (typeof shouldBe === 'string') {
      const typeShouldBe = shouldBe

      if (typeActual !== typeShouldBe) {
        throw new SyntaxError(
          `Filter "${key}" (used for ${typeName} type) has a value with wrong type`
          + buildCurrentLocationString(currentLocation)
          + `. The type for filter "${key}" should be "${typeShouldBe}", but it is`
          + ` "${typeActual}" instead, in ${JSON.stringify(filters)}`
        )
      }
    }
    else {
      if (!(filterValue instanceof shouldBe)) {
        throw new SyntaxError(
          `Filter "${key}" (used for ${typeName} type) has a value with wrong type`
          + buildCurrentLocationString(currentLocation)
          + `. The type for filter "${key}" should be "${shouldBe.name}", but it is`
          + ` "${typeActual}" instead, in ${JSON.stringify(filters)}`
        )
      }
    }
  }
}

/**
 * @param {string} description
 * @returns {string}
 */
function flattenDescription(description) {
  let flatten = description

  // Remove the '-' and empty chars from the beginning
  flatten = flatten.replace(/^ *-? */u, '')

  // Remove all new rows
  flatten = flatten
    .replaceAll('\r', '')
    .replaceAll('\n', ' ')

  return flatten
}

/**
 * @param {Filters} filters
 * @returns {TupleFilters}
 */
function transformFiltersIntoTuples(filters) {
  const tupleFilters = {}

  for (const filterName in filters) {
    tupleFilters[filterName] = (filters[filterName] instanceof Array)
      ? filters[filterName]
      : [filters[filterName], '']
  }

  return tupleFilters
}

/**
 * @param {string} inputDescription
 * @param {ParsedType[]} types
 * @param {CurrentLocation} [currentLocation]
 * @returns {{
 *   description: string,
 *   filters: TupleFilters
 * }}
 * @throws {SyntaxError | Error}
 */
function parse(inputDescription, types, currentLocation) {
  const output = { description: '', filters: {} }

  if (!inputDescription) {
    return output
  }

  const description = flattenDescription(inputDescription)
  const openBracketPos = description.indexOf('{')

  // No filters found
  if (openBracketPos === -1) {
    output.description = description
  }
  // Filters found
  else {
    const closeBracketPos = findClosingBracketPosition(
      description, openBracketPos
    )

    if (closeBracketPos > 0) {
      const filtersStr = description.substring(
        openBracketPos,
        openBracketPos + closeBracketPos + 1
      )

      output.description = (
        description.substring(0, openBracketPos).trim()
        + description.substring(openBracketPos + closeBracketPos + 1)
      ).trim()

      const filters = Function(`return ${filtersStr}`)()

      for (const type of types) {
        // @ts-ignore
        validateParser(type.typeName, filters, currentLocation)
      }

      const filtersAsTuples = transformFiltersIntoTuples(filters)

      output.filters = filtersAsTuples
    }
  }

  return output
}

export { parse }
