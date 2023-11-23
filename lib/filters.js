import { findClosingBracketPosition } from './functions/utils.js'
import { filtersParsers } from './filtersParsers.js'

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
function separateDescriptionAndFilters(inputDescription, types) {
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
        filtersParsers(type.typeName, filters)
      }

      output.filters = filters
    }
  }

  return output
}

export { separateDescriptionAndFilters }
