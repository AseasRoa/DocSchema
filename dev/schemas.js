import { docSchema } from '#docschema'

/**
 * @preserve
 * @enum {{ name: string, age: number }}
 */
const PersonSchema = docSchema()

export { PersonSchema }
