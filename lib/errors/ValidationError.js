export class ValidationError extends Error {
  expectedType = ''

  filter = undefined

  kind = ''

  message = ''

  pass = true

  tag = ''

  value = undefined

  valuePath = []

  /**
   * @param {string} message
   */
  constructor(message) {
    super(message)

    this.name = 'ValidationError'
  }
}
