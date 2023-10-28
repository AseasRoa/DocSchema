import { DocSchema } from '../src/index.js'

/**
 * @enum {string}
 */
const schema = new DocSchema()
const result = schema.check('hello')

console.log(result)
