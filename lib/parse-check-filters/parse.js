import { findClosingBracketPosition } from '../functions/utils.js'
import { parsers } from './parsers.js'

/**
 * @param {string} typeName
 * @param {Filters} filters
 * @throws {Error}
 */
function validateParser(typeName, filters) {
  if (!(typeName in parsers)) {
    throw new Error(
      `Type ${typeName} doesn't work when filters are used.`
      + ` Filters only work on array, number or string types.`)
  }

  for (const key in filters) {
    if (!(key in parsers[typeName])) {
      continue
    }

    const value = filters[key]
    const shouldBe = parsers[typeName][key]

    if (typeof shouldBe === 'string') {
      const typeActual = typeof value
      const typeShouldBe = shouldBe

      if (typeActual !== typeShouldBe) {
        throw new Error(
          `The value of "${key}" has wrong type.`
          + ` The type is ${typeActual}, but it must be ${typeShouldBe}.`
          + ` In ${JSON.stringify(filters)}`
        )
      }
    }
    else {
      if (!(value instanceof shouldBe)) {
        throw new Error(`The value of "${key}" has wrong type.`
          + ` It must be an instance of ${shouldBe.name}.`
          + ` In ${JSON.stringify(filters)}`)
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
  flatten = flatten.replace(/^ *-? */um, '')

  // Remove all new rows
  flatten = flatten
    .replaceAll('\r', '')
    .replaceAll('\n', ' ')

  return flatten
}

/**
 * @param {string} inputDescription
 * @param {ParsedType[]} types
 * @returns {{
 *   description: string,
 *   filters: Filters
 * }}
 */
function parse(inputDescription, types) {
  const output = { description: '', filters: {}}

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
    const closeBracketPos = findClosingBracketPosition(description, openBracketPos)

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
        validateParser(type.typeName, filters)
      }

      output.filters = filters
    }
  }

  return output
}

export { parse }
