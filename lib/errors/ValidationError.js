/** @type {CheckResult} */
export const checkResult = {
  expectedType: '',
  filter: undefined,
  kind: '',
  message: '',
  pass: true,
  tag: '',
  value: undefined,
  valuePath: [],
}

export class ValidationError extends Error {
  constructor(message) {
    super(message)

    this.name = 'ValidationError'
  }

  expectedType = ''
  filter = undefined
  kind = ''
  // message = ''
  pass = true
  tag = ''
  value = undefined
  valuePath = []
}

/**
 * @returns {void}
 */
export function clearLastError() {
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
 * @returns {CheckResult}
 */
export function getCheckResultCloned() {
  /** @type {CheckResult} */
  const clonedError = {
    expectedType: "",
    filter: undefined,
    kind: "",
    message: "",
    pass: false,
    tag: "",
    value: undefined,
    valuePath: []
  }

  cloneErrorProperties(checkResult, clonedError)

  return clonedError
}

/**
 * @throws {ValidationError}
 */
export function throwLastError() {
  const error = new ValidationError(checkResult.message)

  error.stack = filterValidationErrorStack(error.stack ?? '')

  cloneErrorProperties(checkResult, error)

  clearLastError()

  throw error
}

/**
 * This function is an alternative to structuredClone(),
 * which is not supported by the older Node.Js
 *
 * @param {CheckResult} from From
 * @param {CheckResult | ValidationError} to To
 */
function cloneErrorProperties(from, to) {
  to.expectedType = from.expectedType
  to.kind = from.kind
  to.message = from.message
  to.pass = from.pass
  to.tag = from.tag
  to.value = from.value
  to.valuePath = []

  for (const value of from.valuePath) {
    to.valuePath.push(value)
  }

  if (!from.filter) {
    to.filter = undefined
  }
  else {
    // @ts-ignore
    to.filter = {}

    for (const key in from.filter) {
      // @ts-ignore
      to.filter[key] = from.filter[key]
    }
  }
}

/**
 * Most locations in the stack are targeted to inner files.
 * Remove this unnecessary stack information.
 *
 * @param {string} stack
 * @returns {string}
 */
function filterValidationErrorStack(stack) {
  const stackArr = stack.split('\n')

  if (stackArr.length >= 2) {
    return (stackArr[0] ?? '') + '\n' + (stackArr[stackArr.length-1] ?? '')
  }

  return stack
}
