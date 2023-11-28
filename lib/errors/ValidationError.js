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
 * @throws {ValidationError}
 */
export function throwLastError() {
  const error = new ValidationError(lastError.message)

  error.name = 'ValidationError'

  error.expectedType = lastError.expectedType
  error.kind = lastError.kind
  // @ts-ignore
  error.filter = lastError.filter
  error.pass = lastError.pass
  error.tag = lastError.tag
  error.value = lastError.value
  error.valuePath = []

  // structuredClone() alternative, because structuredClone doesn't work for old Node.Js
  for (const value of lastError.valuePath) {
    error.valuePath.push(value)
  }

  clearLastError()

  throw error
}
