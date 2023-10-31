/**
 *
 * @returns {Promise<import('fs') | null>}
 */
export async function importFileSystem() {
  let fs = null

  if (!isBrowserEnvironment()) {
    // Use a variable in import() to prevent the module name from being overwritten
    const moduleName = 'fs'
    fs = await import(moduleName)
  }

  return fs
}

/**
 * @param {number} level
 * @returns {{
 *   fileName: string,
 *   lineNumber: number
 *   columnNumber: number
 * }}
 * @throws {Error}
 */
export function getStackTrace(level) {
  const stackTrace = (isBrowserEnvironment())
    ? getStackTraceBrowser(level)
    : getStackTraceV8(level + 2)

  if (!stackTrace) {
    throw new Error(`Could not get stack trace at level ${level}`)
  }

  return stackTrace
}

/**
 * This function works in V8 and Firefox
 *
 * @param {number} level
 * @returns {{
 *   fileName: string,
 *   lineNumber: number
 *   columnNumber: number
 * } | null}
 * @throws {Error}
 */
function getStackTraceBrowser(level = 1) {
  /**
   * @type {string[]}
   */
  let stack = []

  try {
    throw new Error('')
  }
  catch (error) {
    if (error instanceof Error) {
      stack = (error.stack ?? '')
      .replaceAll('\r', '')
      .split('\n')
      .map((line) => line.trim())

      stack = stack.splice(stack[0] === 'Error' ? 2 : 1)
    }
  }

  if (!stack[level]) {
    return null
  }

  const pattern = /((?:http[s]?:\/\/).*):(\d+):(\d+)/
  const match = pattern.exec(stack[level])

  if (!match) {
    return null
  }

  return {
    fileName: match[1],
    lineNumber: parseInt(match[2]),
    columnNumber: parseInt(match[3])
  }
}

/**
 * This function works only on V8
 *
 * @see https://www.tabnine.com/code/javascript/functions/builtins/Error/prepareStackTrace
 * @see https://www.npmjs.com/package/caller-callsite
 * @see https://www.npmjs.com/package/callsites
 * @param {number} [level]
 * @returns {{
 *   fileName: string,
 *   lineNumber: number
 *   columnNumber: number
 * } | null}
 * @throws {Error}
 */
function getStackTraceV8(level = 3) {
  /** @type {NodeJS.CallSite[]} */
  let stack = []

  const prepareStackTraceOriginal = Error.prepareStackTrace

  Error.prepareStackTrace = (error, stackTraces) => stackTraces

  // @ts-ignore
  stack = new Error().stack ?? []

  Error.prepareStackTrace = prepareStackTraceOriginal

  if (level >= stack.length) {
    return null
  }

  /** @type {NodeJS.CallSite | undefined} */
  const site = stack.at(level)

  if (!site) {
    return null
  }

  const fileName = site.getFileName() ?? ''
  // I don't know why the line number (and the column number) is wrong in Node.js
  const lineNumber = (site.getLineNumber() ?? 0) - 1
  const columnNumber = (site.getColumnNumber() ?? 0)

  return { fileName, lineNumber, columnNumber }
}

/**
 * @see https://stackoverflow.com/questions/17575790/environment-detection-node-js-or-browser
 * @returns {boolean}
 */
export function isBrowserEnvironment() {
  if (isBrowserEnvironment.isIt === undefined) {
    const isBrowser = new Function('try {return this===window;}catch(e){ return false;}')

    isBrowserEnvironment.isIt = isBrowser()
  }

  return isBrowserEnvironment.isIt ?? false
}

/**
 * The environment doesn't change over time, so it's enough
 * to determine it once. This variable is used to store the
 * environment, it's a cache.
 *
 * @type {undefined | boolean}
 */
isBrowserEnvironment.isIt = undefined

/**
 * Using binary search, find first element that is greater or equal to the given target.
 *
 * @param {number[]} arr Sorted array
 * @param {number} target
 * @returns {number}
 */
export function binarySearchFirstGTE(arr, target) {
  let start  = 0
  let end    = arr.length - 1
  let result = -1

  while (true) {
    const mid = Math.floor((start + end) / 2)

    // Discard left side
    if (target >= (arr[mid] ?? 0)) {
      start = mid + 1
    }
    // Discard right side
    else {
      end = mid - 1
    }

    result = end

    if (start > end) {
      break
    }
  }

  return result
}

/**
 * @param {string} inputString
 * The 'start' symbol of the input string should be the opening bracket. The closing
 * bracket is automatically determined.
 *
 * For example:
 * ``
 * {textInside{}} textOutside
 * ``
 * The output value for this example would be 13.
 * @param {number} [start]
 * The position where the opening quote is.
 * @returns {number} The position of the found bracket, or 0 if not found
 */
export function findClosingBracketPosition(inputString, start = 0) {
  const openingBracket = inputString[start] ?? ''
  const closingBracket = closingBracketOf(openingBracket)

  if (!closingBracket) return 0

  let bracketsCounter = 0
  let position        = start
  let found           = false

  for (position = start; position < inputString.length; position++) {
    const char = inputString[position]

    if (char === openingBracket) {
      bracketsCounter += 1
    }
    else if (char === closingBracket) {
      bracketsCounter -= 1

      if (bracketsCounter === 0) {
        found = true

        break
      }
    }
  }

  return (found) ? position - start : 0
}

/**
 * @param {string} inputString
 * The 'start' symbol of the input string should be the opening quote.
 * @param {number} [start]
 * The position where the opening quote is.
 * @returns {number}
 * The position of the closing quote after 'start',
 * or 0 if the string doesn't start with a quote,
 * or 0 if no closing quote found.
 */
export function findClosingQuotePosition(inputString, start = 0) {
  const quote = inputString[start] ?? ''

  if (!quote || !findClosingQuotePosition.quotes.includes(quote)) {
    return 0
  }

  /**
   * Note: Searching for the next occurrence of a symbol with indexOf
   * is faster than looping through each symbol
   */

  let pos = start + 1

  while (true) {
    const end = inputString.indexOf(quote, pos)

    if (end === -1) {
      pos = 0

      break
    }

    if (end > 0 && inputString[end - 1] !== '\\') {
      pos = end - start

      break
    }
  }

  return pos
}

findClosingQuotePosition.quotes = ['\'', '"', '`']

/**
 * Find the position of the first EOL symbol (\n). If not found, return the
 * position of the end.
 *
 * @param {string} inputString
 * @param {number} [start]
 * @returns {number}
 * The position of the next \n after 'start', or -1 if not found
 */
export function findEOL(inputString, start = 0) {
  let position = inputString.indexOf('\n', start)

  if (position < 0) {
    position = inputString.length - 1

    if (position < 0) position = 0 // in case of empty string
  }

  return position - start
}

/**
 * Remove // in the beginning or in the middle of the string
 *
 * @param {string} description
 * @returns {string}
 */
export function flattenMultilineDescription(description) {
  return description.replace(/^\s*\/\/\s*|\n\s*\/\/\s*/g, ' ').trim()
}

/**
 * @param {string} openingBracket (, [, < or {
 * @returns {string}
 */
export function closingBracketOf(openingBracket) {
  switch (openingBracket) {
    case '(': return ')'
    case '[': return ']'
    case '<': return '>'
    case '{': return '}'
    default: return ''
  }
}

const openingBrackets = Object.freeze(['(', '[', '<', '{'])
const quotes          = Object.freeze(['\'', '"', '`'])

/**
 * Splits the type expression using custom separator.
 * The split is aware of chunks of code (brackets, quotes, comments)
 * and treats them as whole entities.
 *
 * @param {string} typeExpression
 * @param {string[]} [separators] One or more separators
 * @returns {string[]} An array with minimum 1 element.
 */
export function splitTypeExpression(typeExpression, separators = ['|']) {
  const union = []
  /*
   * First, cleanup the type expression by trimming it and removing wrapping braces
   */
  const expression = removeWrappingBraces(typeExpression.trim())
  /*
   * + 1 is given to the length, so in case the type definition ends with bracket
   * or quote, (which makes a jump in the loop beyond the closing bracket or quote),
   * there is one extra iteration available to push the final member
   */
  const length = expression.length + 1

  let start = 0 // The start position of each member of the union
  let prevChar = ''

  for (let i = 0; i < length; i++) {
    const char = expression[i] ?? ''

    if (separators.includes(char) || i === length - 1) {
      const end    = (i === length - 1) ? i + 1 : i
      const member = expression.substring(start, end).trim()

      union.push(member)

      start = i + 1 // Set the 'start' for the following type
    }
    else if (openingBrackets.includes(char)) {
      const end = findClosingBracketPosition(expression, i)

      if (end > 0) i += end // Jump after the closing bracket
    }
    else if (quotes.includes(char)) {
      const end = findClosingQuotePosition(expression, i)

      if (end > 0) i += end // Jump after the closing quote
    }
    else if (char === '/' && prevChar === '/') {
      const end = findEOL(expression, i)

      if (end > 0) i += end // Jump after EOL
    }

    prevChar = char
  }

  return union
}

/**
 * @param {string} expression
 * @returns {[string, string]}
 * @throws {SyntaxError}
 */
export function isolateFrontComment(expression) {
  /** @type {[string, string]} */
  const tuple = ['', '']
  const length = expression.length + 1
  /** @type {string} */
  let prevChar = ''

  for (let i = 0; i < length; i++) {
    const char = expression[i] ?? ''

    prevChar = (i > 0)
      ? expression[i - 1] ?? ''
      : ' ' // tried using empty string, but space works better

    if (char === ' ' || char === '\r' || char === '\n') {
      continue // skip
    }
    else if (char === '/') {
      if (prevChar === '/') {
        const end = findEOL(expression, i)

        if (end > 0) i += end // Jump after EOL
      }
      else {
        if (prevChar === ' ') {
          /**
           * We end up here in the beginning of a comment, or on the empty space
           * before // when // is on a new row.
           */

          continue
        }
        else {
          /**
           * Single / detected, it's a problem
           */

          throw new SyntaxError(`Unexpected single slash in expression "${expression}"`)
        }
      }
    }
    else {
      tuple[0] = expression.substring(0, i).trim()
      tuple[0] = flattenMultilineDescription(tuple[0])
      tuple[1] = expression.substring(i).trim()

      break
    }
  }

  return tuple
}

/**
 * @param {string} expression
 * An expression, containing type and (optionally) a description
 * @returns {[string, string]}
 * For example, if the expression is "number // description",
 * the output will be ['number', 'description']
 */
export function isolateEndComment(expression) {
  /** @type {[string, string]} */
  const tuple = ['', '']

  const commentPos = expression.indexOf('//')

  if (commentPos > -1) {
    tuple[0] = expression.substring(0, commentPos).trim()
    tuple[1] = expression.substring(commentPos + 2).trim()
    tuple[1] = flattenMultilineDescription(tuple[1])
  }
  else {
    tuple[0] = expression.trim()
  }

  return tuple
}

/**
 * If the input value is a string, wrap it into "" quotes,
 * otherwise return the input value
 *
 * @param {*} value
 * @param {string} quote
 * @returns {string}
 */
export function enquoteString(value, quote = '"') {
  return (typeof value === 'string')
    ? `${quote}${value}${quote}`
    : (value ?? '').toString() // Remember, don't use toString() on undefined or null
}

/**
 * Removes ( and ) braces, if they are the first and the last symbols of the trimmed
 * input string
 *
 * @param {string} str
 * @returns {string}
 */
export function removeWrappingBraces(str) {
  return str.replace(/^\s*\((.*)\)\s*$/m, '$1').trim()
}

/**
 * Trim each value of the chopped commend (array)
 *
 * @param {string[]} array
 */
export function trimArrayElements(array) {
  for (let index = 0; index < array.length; index++) {
    array[index] = array[index].trim()
  }
}
