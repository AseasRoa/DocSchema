import { DocSchema } from '../lib/index.js'

/**
 * @enum {string}
 */
const schema = new DocSchema()
const result = schema.check('hello')

console.log(result)
