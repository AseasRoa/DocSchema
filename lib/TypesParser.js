import { splitTypeExpression } from './functions/utils.js'
import { parsers } from './parsers.js'
import { COMMON_MISTAKE_FIXES } from './constants.js'

class TypesParser {
  #parsers = [parsers.simple, parsers.complex]

  /** @type {string[]} */
  #splitSeparators = ['|', '&']

  #parseTypeBound = this.parseType.bind(this)

  /**
   * @param {string} typeExpression
   * @returns {ParsedType[]}
   */
  parseType(typeExpression) {
    const expression      = this.#fixCommonTypeMistakes(typeExpression)
    const expressionSplit = splitTypeExpression(expression, this.#splitSeparators)

    return (expressionSplit.length > 1)
      ? this.#parseMultipleTypes(expressionSplit)
      : this.#parseSingleType(expression)
  }

  /**
   * @param {string} type JsDoc type
   * @returns {string}
   */
  #fixCommonTypeMistakes(type) {
    const trimmedType   = type.trim()
    const lowerCaseType = trimmedType.toLowerCase()

    return COMMON_MISTAKE_FIXES[lowerCaseType] ?? trimmedType
  }

  /**
   * @param {string[]} split
   * @returns {ParsedType[]}
   */
  #parseMultipleTypes(split) {
    /** @type {ParsedType[]} */
    const output = []

    for (const member of split) {
      if (member) {
        const [ processedType ] = this.parseType(member)

        if (processedType) output.push(processedType)
      }
    }

    return output
  }

  /**
   * @param {string} typeExpression
   * @returns {ParsedType[]}
   */
  #parseSingleType(typeExpression) {
    for (const parsers of this.#parsers) {
      const parsedTypeOrFail = this.#tryToParseTypes(typeExpression, parsers)

      if (parsedTypeOrFail) {
        return [parsedTypeOrFail]
      }
    }

    return [{
      typeName       : 'any', // what this should be?
      typeExpression : typeExpression
    }]
  }

  /**
   * @param {string} typeExpression
   * @param {Object<string, ParserFunction>} typeParsers
   * @returns {ParsedType | false}
   */
  #tryToParseTypes(typeExpression, typeParsers) {
    for (const name in typeParsers) {
      const parser = typeParsers[name]

      if (!parser) {
        continue
      }

      const result = parser(typeExpression, this.#parseTypeBound)

      if (result) {
        return result
      }
    }

    return false
  }
}

export { TypesParser }
