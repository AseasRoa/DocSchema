import { isBrowserEnvironment, } from './utils.js'

/** @type {import('fs') | null} */
const fs = await importFileSystem()

/**
 * @returns {Promise<import('fs') | null>}
 */
async function importFileSystem() {
  let fs = null

  if (!isBrowserEnvironment()) {
    /*
     * Use a variable in import() to prevent the module name
     * from being overwritten by the bundler
     */
    const moduleName = 'fs'
    fs = await import(moduleName)
  }

  return fs
}

/**
 * @param {string} filePath
 * @returns {string}
 * @throws {Error}
 */
function readFileNodeJs(filePath) {
  const decodedFilePath = decodeURI(filePath)

  if (!fs) {
    throw new Error(
      `Could not read file ${decodedFilePath}, because`
      + `FileSystem (fs) is not imported correctly`
    )
  }

  return  fs.readFileSync(decodedFilePath, 'utf-8')
}

/**
 * @param {string} filePath
 * @param {boolean} async
 * @param {(data: string) => void} callback
 */
function readFileXhr(filePath, async, callback) {
  const xhr = new XMLHttpRequest()

  xhr.open('GET', encodeURI(filePath), async)

  xhr.onload = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        if (callback instanceof Function) callback(xhr.responseText)
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

/**
 * @param {string} filePath
 * @returns {string}
 * @throws {Error}
 */
function readFile(filePath) {
  let result = ''

  if (isBrowserEnvironment()) {
    readFileXhr(filePath, false, (data) => {
      result = data
    })
  }
  else {
    result = readFileNodeJs(filePath)
  }

  return result
}

export { readFile }
