/** @type {LastError} */
const lastError = { message: '', code: '' }

export class ValidationError extends Error {
  code = ''
}

/**
 * @returns {LastError}
 */
export function getLastError() {
  return lastError
}

export function clearLastError() {
  lastError.message = ''
  lastError.code = ''
}

/**
 * Sets the necessary data for an error, but it doesn't create Error instance
 *
 * @param {string} message
 * @param {string} code
 */
export function setLastError(message, code) {
  lastError.message = message
  lastError.code = code
}

/**
 * @throws {ValidationError}
 */
export function throwLastError() {
  const error = new ValidationError(lastError.message)

  error.code = lastError.code

  lastError.message = ''
  lastError.code = ''

  throw error
}
