import { DocSchema } from '#docschema'

/**
 * @param {Date} key
 * @preserve
 */
const schema = new DocSchema()
const result = schema.check({key: 3445})

console.log(result)
