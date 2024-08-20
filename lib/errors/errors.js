/**
 * @returns {Error}
 */
export function errorAboutInvalidAst() {
  return new Error('The schema has not been created yet')
}

/**
 * @param {string} fileName
 * @param {number} line
 * @param {number} column
 * @throws {SyntaxError}
 */
export function syntaxErrorAboutInvalidJsDoc(fileName, line, column) {
  return new SyntaxError(
    'Could not create schema at'
    + ` ${fileName}:${line}:${column}.`
    + ' Make sure there is a valid JsDoc comment at the previous line'
  )
}

/**
 * @param {string} fileName
 * @param {number} line
 * @param {number} column
 * @throws {SyntaxError}
 */
export function syntaxErrorAboutTags(fileName, line, column) {
  return new SyntaxError(
    'The schema at'
    + ` ${fileName}:${line}:${column}`
    + ' must be defined with one @enum tag, one or more'
    + ' @param tags, or a @typedef'
  )
}
