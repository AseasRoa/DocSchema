import { DocSchema } from './DocSchema.js'
import { DocSchemaParser } from './DocSchemaParser.js'
import { DocSchemaValidator } from './DocSchemaValidator.js'
import { ValidationError } from './errors/ValidationError.js'

/**
 * Use this function just below a JsDoc comment.
 * The comment must contain either:
 * - A single \@enum tag.
 * - One or more \@param tags, each of them describing one property of an object.
 *
 * @returns {DocSchema}
 */
export function docSchema() {
  return new DocSchema()
}

export default docSchema

export { DocSchema, DocSchemaParser, DocSchemaValidator, ValidationError }
