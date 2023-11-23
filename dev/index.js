import { DocSchema } from '#docschema'

/**
 * @enum {string}
 */
const schema = new DocSchema()
const result = schema.check('hello')

console.log(result)
