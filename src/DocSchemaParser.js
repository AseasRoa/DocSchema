import { TAG_REPLACEMENTS } from './constants.js'
import {
  binarySearchFirstGTE,
  findClosingBracketPosition,
  importFileSystem,
  isBrowserEnvironment,
  trimArrayElements
} from './functions.js'
import { TypesParser } from './TypesParser.js'
import { separateDescriptionAndLimits } from './limits.js'

/**
 * @typedef ExtractedCommentInfo
 * @type {object}
 * @property {string} comment
 * @property {number} index
 * @property {number} startLine
 * @property {number} endLine
 * @property {string} lineAfterComment
 */

/** @type {import('fs') | null} */
const fs = await importFileSystem()

/** @type {Map<string, DocSchemaAst[]>} */
const astCacheForFiles = new Map()

/** @type {Map<string, RegExp>} */
const tagPatterns = new Map()

class DocSchemaParser {
  /** @type {TypesParser} */
  typesParser = new TypesParser()

  /**
   * @param {string} file
   * @returns {DocSchemaAst[]}
   * @throws {Error} If the input file has not been parsed yet
   */
  getParsedAst(file) {
    const parsedAst = astCacheForFiles.get(file)

    if (!parsedAst) {
      throw new Error(`There is no parsed AST for file ${file}`)
    }

    return parsedAst
  }

  /**
   * @param {string} code Input code (string), containing one or more JsDoc comments
   * @param {string} [file]
   * @returns {DocSchemaAst[]}
   */
  parseComments(code, file = '') {
    const commentsInfo = this.#extractCommentsInfo(code)

    /** @type {DocSchemaAst[]} */
    const parsedComments = []

    /** @type {DocSchemaAst[]} */
    const typedefs = []

    for (const info of commentsInfo) {
      let {comment} = info

      comment = this.#fixTagSynonymsFromComment(comment)
      comment = this.#removeStarsFromComment(comment)

      const chopped = this.#chopComment(comment)

      trimArrayElements(chopped)

      /** @type {DocSchemaAst} */
      const ast     = {
        elements         : this.#parseChoppedComment(chopped),
        file             : file,
        startLine        : info.startLine,
        endLine          : info.endLine,
        lineAfterComment : info.lineAfterComment,
        typedefs         : typedefs
      }

      parsedComments.push(ast)
    }

    // Add typedefs
    for (const parsedComment of parsedComments) {
      if (parsedComment.elements.typedef) {
        typedefs.push(parsedComment)
      }
    }

    return parsedComments
  }

  /**
   * @param {string} file
   * @returns {DocSchemaAst[]}
   */
  parseFile(file) {
    if (!astCacheForFiles.has(file)) {
      const contents       = this.#readFile(file)
      const parsedComments = this.parseComments(contents, file)

      astCacheForFiles.set(file, parsedComments)
    }

    return astCacheForFiles.get(file) ?? []
  }

  /**
   * @param {string} file
   */
  removeFileFromCache(file) {
    astCacheForFiles.delete(file)
  }

  /**
   * Split the rows of the comment into an array.
   *
   * @param {string} comment
   * @returns {string[]}
   */
  #chopComment(comment) {
    return (comment.replaceAll('\r', '').split('\n'))
  }

  /**
   * Extract the JsDoc comments from the input code in one array,
   * and the rows after each comment in another array with the same length.
   *
   * Rules:
   * - Both, multiline and inline comments are captured.
   * - The opening tag could contain spaces after it at the same row
   * - The final closing tag could contain more than one star or different spaces.
   * - A single line after the comment is matched, if it exists.
   *
   * Rules for multiline comments:
   * - At least one empty space is required on the left side
   * of each middle arrow.
   * - Each middle line must start with an arrow.
   * - Empty lines are allowed.
   *
   * @param {string} code
   * @returns {ExtractedCommentInfo[]}
   */
  #extractCommentsInfo(code) {
    const linesInfo  = this.#extractLinesInfo(code)

    /** @type {ExtractedCommentInfo[]} */
    const output  = []
    const pattern = /(\/\*\*[\t ]*\n(?:[ \t]* \*.*\n)+[ \t*]*\*\/|\/\*\*.*\*\/)(?:\s*\n)*(\s*[^\s\/].*)?/ug

    while (true) {
      const match = pattern.exec(code)

      if (!match) {
        break
      }

      const comment          = match[1] ?? ''
      const lineAfterComment = match[2] ?? ''
      const index            = match.index ?? 0
      const startLine        = binarySearchFirstGTE(linesInfo, index)
      const endLine          = binarySearchFirstGTE(linesInfo, index + comment.length)

      output.push({
        comment,
        index,
        startLine,
        endLine,
        lineAfterComment
      })
    }

    return output
  }

  /**
   * @param {string} code
   * @returns {number[]}
   * An array, in which the keys are the column numbers
   * and the values are the indexes where the column starts,
   * Element 0 is not a row.
   */
  #extractLinesInfo(code) {
    /**
     * Element 0 is useless, but set it to -1 to not interfere with binary search
     * Element 1 is the first row, which always stars at index 0
     *
     * @type {number[]}
     */
    const output = [-1, 0]
    const pattern = /\n/ug

    while (true) {
      const match = pattern.exec(code)

      if (!match) break

      output[output.length] = (match.index ?? 0) + 1 // push()
    }

    return output
  }

  /**
   * Extract only these rows that contain definitions for the given tag name.
   * Descriptions from the following rows (after the row that is found) are
   * appended until any other tag name is found.
   *
   * @param {string[]} choppedComment
   * @param {string} tagName
   * @returns {string[]}
   */
  #extractLinesWhereTagIsUsed(choppedComment, tagName) {
    /** @type {string[]} */
    const output = []

    if (!tagPatterns.has(tagName)) {
      tagPatterns.set(tagName, new RegExp(`^@${tagName}[^\w\d]`, 'u'))
    }

    const tagPattern = tagPatterns.get(tagName)

    let isParsing = false
    let wholeData = ''

    for (let row of choppedComment) {
      row = row.trim()

      if (tagPattern?.test(row)) {
        isParsing = true

        if (wholeData) output.push(wholeData) // Push intermediate data

        wholeData = '' // Reset
      }
      else if (row.startsWith('@')) {
        isParsing = false

        continue
      }

      if (isParsing) {
        wholeData += (wholeData) ? `\n${row}` : row
      }
    }

    if (wholeData) output.push(wholeData) // Push the final data

    return output
  }

  /**
   * Extracts the data from the input tag line - type expression, name, description...
   *
   * @param {string} tagContents
   * @param {boolean} [hasType] This tag is expected to have a type?
   * @param {boolean} [hasName] This tag is expected to have a name?
   * @param {boolean} [hasDescription] This tag is expected to have a description?
   * @returns {DocSchemaParsedTag}
   */
  #extractTagComponents(
    tagContents,
    hasType        = true,
    hasName        = true,
    hasDescription = true
  ) {
    let withoutTagName  = tagContents.replace(/^ *@[a-z]+ */um, '')

    /** @type {DocSchemaParsedTag} */
    const parsedTag = {
      id             : 0,
      typeExpression : '',
      types          : [],
      name           : '',
      description    : '',
      limits         : {},
      optional       : false,
      defaultValue   : undefined,
      /**
       * When we have a destructured parameter, its name and its properties are defined
       * using @prop tags.
       *
       * @see https://jsdoc.app/tags-param.html#parameters-with-properties
       * @example
       * '/**
       * ' * @param {Object} obj // this is the parameter
       * ' * @param {string} obj.propOne // this is the first property of the parameter
       * ' * @param {string} obj.propTwo // this is the second property of the parameter
       * ' *-/
       */
      destructured   : undefined,
    }

    // 1) Search for type expression
    if (hasType) {
      if (withoutTagName.startsWith('{')) {
        const closingBracketPosition = findClosingBracketPosition(withoutTagName)

        if (closingBracketPosition > 0) {
          parsedTag.typeExpression = withoutTagName.slice(1, closingBracketPosition)
          /*
           * Cut off the type from the string,
           * leaving the name and the description
           */
          withoutTagName = withoutTagName.slice(closingBracketPosition + 1)
        }
      }

      parsedTag.typeExpression = parsedTag.typeExpression.trim()
    }

    // 2) Search for name
    if (hasName) {
      withoutTagName = withoutTagName.trim()
      let chars  = 0

      for (const char of withoutTagName) {
        chars += 1

        if (char === ' ' || char === '\r' || char === '\n' || char === '\t') {
          break
        }
        else {
          parsedTag.name += char
        }
      }

      // Cut off the name from the string, leaving only the description
      withoutTagName = withoutTagName.slice(chars)
    }

    // 3) Is it optional
    this.#processOptionalValue(parsedTag)

    // 4) Parse the type expression to get the parsed type
    parsedTag.types = this.typesParser.parseType(parsedTag.typeExpression)

    // 5) Search for description and limits
    if (hasDescription && withoutTagName) {
      const result = separateDescriptionAndLimits(withoutTagName, parsedTag.types)

      parsedTag.description = result.description
      parsedTag.limits = result.limits
    }

    // 6) Is destructured
    if (parsedTag.name.includes('.')) {
      const nameSplit = parsedTag.name.split('.')

      parsedTag.destructured = [nameSplit[0] ?? '', nameSplit[1] ?? '']
    }

    return parsedTag
  }

  /**
   * @param {string[]} choppedComment
   * Each line of the chopped comment must be trimmed
   * @returns {Set<string>}
   */
  #extractUsedTags(choppedComment) {
    const pattern = /^[ \t]*@([a-zA-Z]+)(?: .*)?$/um
    /** @type {Set<string>} */
    const usedTags = new Set()

    for (const line of choppedComment) {
      const match   = pattern.exec(line)
      const tagName = match?.[1]

      if (tagName) {
        usedTags.add(tagName)
      }
    }

    return usedTags
  }

  /**
   * Replace all tag name synonyms with the official tag names
   *
   * @param {string} comment
   * @returns {string}
   */
  #fixTagSynonymsFromComment(comment) {
    return comment.replaceAll(
      /@[a-z]+/ug,
      (tag) => TAG_REPLACEMENTS[tag] ?? tag
    )
  }

  /**
   * @param {string[]} choppedComment
   * @returns {DocSchemaAstElements}
   */
  #parseChoppedComment(choppedComment) {
    const usedTags = this.#extractUsedTags(choppedComment)

    return {
      description : this.#parseDescription(choppedComment),
      scope       : this.#parseScope(choppedComment),
      returns     : (usedTags.has('returns'))
        ? this.#parseSingleLineTag(choppedComment, 'returns')
        : null,
      param : (usedTags.has('param'))
        ? this.#parseMultiLineTag(choppedComment, 'param')
        : [],
      enum : (usedTags.has('enum'))
        ? this.#parseSingleLineTag(choppedComment, 'enum')
        : null,
      type : (usedTags.has('type'))
        ? this.#parseSingleLineTag(choppedComment, 'type')
        : null,
      typedef : (usedTags.has('typedef'))
        ? this.#parseSingleLineTag(choppedComment, 'typedef')
        : null,
      yields : (usedTags.has('yields'))
        ? this.#parseSingleLineTag(choppedComment, 'yields')
        : null,
      property : (usedTags.has('property'))
        ? this.#parseMultiLineTag(choppedComment, 'property')
        : [],
    }
  }

  /**
   * Description is everything above all tags + everything after @description tags.
   * When the description is in multiple rows, they are stitched together with a space.
   * When @description tag is found, it is stitched with \n.
   *
   * @param {string[]} choppedComment
   * @returns {string}
   */
  #parseDescription(choppedComment) {
    let collecting = true
    let description = ''

    for (const line of choppedComment) {
      if (line.startsWith('@description')) {
        const trimmedRow = line.substring(13).trim()

        if (!description.endsWith('\n')) {
          description += '\n'
        }

        description += trimmedRow

        collecting = true

        continue
      }

      if (line.startsWith('@')) {
        collecting = false

        continue
      }

      if (collecting) {
        const trimmedRow = line.trim()

        if (trimmedRow === '') {
          // Empty rows turn into \n
          description += '\n'
        }
        else {
          if (!description.endsWith('\n')) {
            description += ' '
          }

          description += trimmedRow
        }
      }
    }

    description = description.trim()

    return description
  }

  /**
   * @param {string[]} choppedComment
   * @param {'param' | 'property' | string} tagName
   * @returns {DocSchemaParsedTag[]}
   */
  #parseMultiLineTag(choppedComment, tagName) {
    /** @type {DocSchemaParsedTag[]} */
    const parsedTags = []
    const tagLines   = this.#extractLinesWhereTagIsUsed(choppedComment, tagName)

    for (const line of tagLines) {
      const parsed = this.#extractTagComponents(
        line,
        true,
        true,
        true
      )

      if (parsed.name) {
        parsedTags.push(parsed)
      }
    }

    // Destructured params: Remove the "object" param
    let nameToDelete = ''

    for (let i = parsedTags.length - 1; i >= 0; i--) {
      const parsedTag = parsedTags[i]
      const paramName = parsedTag?.destructured?.[0]

      if (paramName) {
        nameToDelete = paramName
      }
      else if (nameToDelete && parsedTag?.name === nameToDelete) {
        parsedTags.splice(i, 1) // Remove the current element from the array
        nameToDelete = '' // Reset
      }
    }

    // Fill argument ids
    let id                         = -1
    let lastDestructuredObjectName = ''

    for (const parsedTag of parsedTags) {
      if (parsedTag?.destructured?.[0] && lastDestructuredObjectName) {
        // do not increment
      }
      else {
        id += 1
      }

      lastDestructuredObjectName = parsedTag?.destructured?.[0] ?? ''

      parsedTag.id = id
    }

    return parsedTags
  }

  /**
   * For tags like '@returns'
   *
   * @param {string[]} choppedComment
   * @param {'returns' | 'type' | 'enum' | 'typedef' | string} tagName
   * @returns {DocSchemaParsedTag | null}
   */
  #parseSingleLineTag(choppedComment, tagName) {
    let tagLines = this.#extractLinesWhereTagIsUsed(choppedComment, tagName)

    // In case of multiple @returns, only the last one is important
    tagLines = tagLines.slice(-1)

    /** @type {DocSchemaParsedTag[]} */
    const parsedTags = []

    for (const line of tagLines) {
      const parsed = this.#extractTagComponents(
        line,
        true,
        false,
        true
      )

      if (true || parsed.typeExpression) {
        parsedTags.push(parsed)
      }
    }

    return parsedTags[0] ?? null
  }

  /**
   * Extract the scope - private, public, protected
   *
   * @param {string[]} choppedComment
   * @returns {DocSchemaAstScope}
   */
  #parseScope(choppedComment) {
    const scope = { private : false, protected : false, public : true }

    for (const line of choppedComment) {
      if (line.startsWith('@private')) {
        scope.private = true
      }
      else if (line.startsWith('@protected')) {
        scope.protected = true
      }
      else if (line.startsWith('@public')) {
        scope.public = true
      }
    }

    if (scope.private || scope.protected) {
      scope.public = false
    }

    return scope
  }

  /**
   * Find whether type expression is defined like this: {Type=}
   *
   * @param {DocSchemaParsedTag} parsedTag
   * @returns {void} Return by reference
   */
  #processOptionalValue(parsedTag) {
    /*
     * (Scenario 1) Optional parameter defined in the name, like this: [name=123]
     */
    if (parsedTag.name) {
      const pattern = /^\[(?<name>[^\]=]+)(?:=(?<defaultValue>[^=]+))?\]$/um
      const match   = pattern.exec(parsedTag.name)

      if (match) {
        parsedTag.optional     = true
        parsedTag.defaultValue = match.groups?.['defaultValue'] ?? undefined

        // Remove the definition for optional value from the name
        parsedTag.name = match.groups?.['name'] ?? parsedTag.name
      }
    }

    /*
     * (Scenario 2) Optional parameter defined in the type expression,
     * like this: {TypeName=}
     */
    if (parsedTag.typeExpression) {
      const match = /(?<typeExpression>.+)= *$/um.exec(parsedTag.typeExpression)

      if (match) {
        parsedTag.optional = true

        // Remove the definition for optional value from the type expression
        parsedTag.typeExpression = match.groups?.['typeExpression']
          ?? parsedTag.typeExpression
      }
    }
  }

  /**
   * @param {string} filePath
   * @returns {string}
   * @throws {Error}
   */
  #readFile(filePath) {
    try {
      let result = ''

      if (isBrowserEnvironment()) {
        const xhr = new XMLHttpRequest()

        xhr.open('GET', filePath, false)

        xhr.onload = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              result = xhr.responseText
            }
            else {
              throw new Error(xhr.statusText)
            }
          }
        }

        xhr.onerror = () => {
          throw new Error(xhr.statusText)
        }

        xhr.send(null)
      }
      else {
        if (!fs) {
          throw new Error(`Could not read file ${filePath}, because FileSystem (fs) is not imported correctly`)
        }

        result = fs.readFileSync(filePath).toString()
      }

      return result
    }
    catch (error) {
      throw new Error(`Could not read file ${filePath}`)
    }
  }

  /**
   * Removes /**, each * in a multiline comment, and the ending.
   *
   * @param {string} comment
   * @returns {string}
   */
  #removeStarsFromComment(comment) {
    const pattern = /\n?[ \t]*\*\/$|^[ \t]*(?:\/\*\* *\r?\n?| \* *)/ugm

    return comment.trim().replace(pattern, '')
  }
}

export { DocSchemaParser }
