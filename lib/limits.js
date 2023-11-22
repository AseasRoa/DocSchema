import { findClosingBracketPosition } from './functions.js'
import { limitsParsers } from './limitsParsers.js'

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
 *   limits: Limits
 * }}
 */
function separateDescriptionAndLimits(inputDescription, types) {
  const output = { description: '', limits: {}}

  if (!inputDescription) {
    return output
  }

  const description = flattenDescription(inputDescription)
  const openBracketPos = description.indexOf('{')

  // No limits found
  if (openBracketPos === -1) {
    output.description = description
  }
  // Limits found
  else {
    const closeBracketPos = findClosingBracketPosition(description, openBracketPos)

    if (closeBracketPos > 0) {
      const limitsStr = description.substring(
        openBracketPos,
        openBracketPos + closeBracketPos + 1
      )

      output.description = (
        description.substring(0, openBracketPos).trim()
        + description.substring(openBracketPos + closeBracketPos + 1)
      ).trim()

      const limits = Function(`return ${limitsStr}`)()

      for (const type of types) {
        limitsParsers(type.typeName, limits)
      }

      output.limits = limits
    }
  }

  return output
}

export { separateDescriptionAndLimits }
