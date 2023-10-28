type DocSchemaAst = import('./app').DocSchemaAst

declare module 'docschema' {
  //export { DocSchemaParser, DocSchemaValidator } from 'src/index'
  // type DocSchema = typeof import('src/DocSchema')
  export class DocSchema {
    check(
      value: any
    ): boolean

    /**
     * @throws {TypeError}
     */
    validate(
      value: any
    ): boolean
  }

  export class DocSchemaParser {
    parseComments(
      code: string,
      file?: string
    ): Promise<DocSchemaAst[]>

    parseFile(
      file: string
    ): Promise<DocSchemaAst[]>
  }

  export class DocSchemaValidator {
    validateParams(
      ast: DocSchemaAst,
      args: any,
      throwOnError?: boolean
    ): boolean

    validateTag(
      tagName: 'enum' | 'type' | 'returns' | 'yields',
      ast: DocSchemaAst,
      value: any,
      throwOnError?: boolean
    ): Promise<DocSchemaAst[]>
  }

  /**
   * @returns {DocSchema}
   * @throws {Error}
   */
  export function docSchema(): DocSchema

  export default docSchema
}
