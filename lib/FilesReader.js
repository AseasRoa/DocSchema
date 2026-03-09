import { readFile } from './functions/readFile.js'

/**
 * @typedef {object} FileData
 * @property {string} contents
 * @property {number[]} linesInfo
 */

export class FilesReader {
  /** @type {Map<string, FileData>} */
  #cache = new Map()

  /**
   * @param {string} file
   * @returns {FileData}
   */
  readFile(file) {
    let data = this.#cache.get(file)

    if (data) {
      return data
    }

    const contents = readFile(file)
    const linesInfo = this.extractLinesInfo(contents)

    data = { contents, linesInfo }

    this.#cache.set(file, data)

    return data
  }

  /**
   * @param {string} contents
   * @returns {number[]}
   * An array, in which the keys are the column numbers
   * and the values are the indexes where the column starts,
   * Element 0 is not a row.
   */
  extractLinesInfo(contents) {
    /**
     * Element 0 is useless, but set it to -1 to not interfere
     * with binary search
     * Element 1 is the first row, which always stars at index 0
     *
     * @type {number[]}
     */
    const output = [-1, 0]
    const pattern = /\r?\n/ug

    while (true) {
      const match = pattern.exec(contents)

      if (!match) break

      output[output.length] = (match.index ?? 0) + 1 // push()
    }

    return output
  }
}
