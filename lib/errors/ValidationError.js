/** @type {CheckResult} */
export const lastError = {
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
  lastError.expectedType = ''
  lastError.filter = undefined
  lastError.kind = ''
  lastError.message = ''
  lastError.pass = true
  lastError.tag = ''
  lastError.value = undefined
  lastError.valuePath.length = 0
}

/**
 * @returns {CheckResult}
 */
export function getLastError() {
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

  cloneErrorProperties(lastError, clonedError)

  return clonedError
}

/**
 * @throws {ValidationError}
 */
export function throwLastError() {
  const error = new ValidationError(lastError.message)

  error.stack = filterValidationErrorStack(error.stack ?? '')

  cloneErrorProperties(lastError, error)

  clearLastError()

  throw error
}

/**
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

  // structuredClone() alternative, because structuredClone doesn't work for old Node.Js
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
