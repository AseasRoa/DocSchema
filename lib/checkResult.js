import { ValidationError } from './errors/ValidationError.js'

/** @type {CheckResult} */
export let checkResult = newCheckResult()

/**
 * Clear all properties of the checkResult object,
 * but without losing its reference.
 * Use in object loops.
 *
 * @returns {void}
 */
export function resetCheckResult() {
  checkResult.expectedType = ''
  checkResult.filter = undefined
  checkResult.kind = ''
  checkResult.message = ''
  checkResult.pass = true
  checkResult.tag = ''
  checkResult.value = undefined
  checkResult.valuePath.length = 0
}

/**
 * Create a new reference of the checkResult object.
 * This function must be called every time a new
 * check (validation) is started.
 *
 * @returns {void}
 */
export function startCheckResult() {
  checkResult = newCheckResult()
}

/**
 * @throws {ValidationError}
 */
export function throwLastError() {
  const error = new ValidationError(checkResult.message)

  for (const key in checkResult) {
    error[key] = checkResult[key]
  }

  error.stack = filterValidationErrorStack(error)

  throw error
}

/**
 * Returns a new empty checkResult object
 *
 * @returns {CheckResult}
 */
function newCheckResult() {
  return {
    expectedType: '',
    filter: undefined,
    kind: '',
    message: '',
    pass: true,
    tag: '',
    value: undefined,
    valuePath: [],
  }
}

/**
 * Most locations in the stack are targeted to inner files.
 * Remove this unnecessary stack information.
 *
 * @param {Error} error
 * @returns {string}
 */
function filterValidationErrorStack(error) {
  if (!error.stack) return ''

  const stackArr = error.stack.split('\n')
  let filteredStack = ''

  if (stackArr.length >= 2) {
    filteredStack = stackArr[0] ?? ''

    for (let i = 6; i < stackArr.length; i++) {
      filteredStack += `\n${stackArr[i]}`
    }
  }

  error.stack = filteredStack

  return error.stack
}
