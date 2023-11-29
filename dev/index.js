import { DocSchema } from '#docschema'

/**
 * @enum {string}
 * @preserve
 */
const schema = new DocSchema()
const result = schema.check('hello')

console.log(result)
