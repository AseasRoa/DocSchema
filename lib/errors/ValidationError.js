export class ValidationError extends Error {
  expectedType = ''

  filter = undefined

  kind = ''

  /**
   * This being here sets the message after super(message), neutralizing it.
   * That's why it needs to be set explicitly in the constructor.
   *
   * @type {string}
   */
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

    this.message = message
    this.name = 'ValidationError'
  }
}
