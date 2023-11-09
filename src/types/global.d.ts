/**
 * This file must be an ambient module
 *
 * @see https://www.typescriptlang.org/docs/handbook/modules/reference.html#ambient-modules
 */

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

    removeFileFromCache(
      file: string
    ): void
  }

  export class DocSchemaValidator {
    validateFunctionArguments(
      ast: DocSchemaAst,
      args: any,
      throwOnError?: boolean
    ): boolean

    validateParams(
      name: 'param' | 'property',
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

    validateTypedef(
      ast: DocSchemaAst,
      value: any,
      throwOnError?: boolean
    ) : TypeError | Error
  }

  /**
   * @returns {DocSchema}
   * @throws {Error}
   */
  export function docSchema(): DocSchema

  export default docSchema
}
