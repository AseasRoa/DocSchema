/**
 * This file must be an ambient module
 *
 * @see https://www.typescriptlang.org/docs/handbook/modules/reference.html#ambient-modules
 */

type DocSchemaAst = import('./app').Ast

declare module 'docschema' {
  export class ValidationError extends Error {
  }

  export class DocSchema {
    check(
      value: any
    ): boolean

    /**
     * @throws {ValidationError}
     */
    validate(
      value: any
    ): boolean
  }

  export class DocSchemaParser {
    parseComments(
      code: string,
      file?: string
    ): Promise<Ast[]>

    parseFile(
      file: string
    ): Promise<Ast[]>

    removeFileFromCache(
      file: string
    ): void
  }

  export class DocSchemaValidator {
    validateFunctionArguments(
      ast: Ast,
      args: any,
      throwOnError?: boolean
    ): boolean

    validateParams(
      name: 'param' | 'property',
      ast: Ast,
      args: any,
      throwOnError?: boolean
    ): boolean

    validateTag(
      tagName: 'enum' | 'type' | 'returns' | 'yields',
      ast: Ast,
      value: any,
      throwOnError?: boolean
    ): Promise<Ast[]>

    validateTypedef(
      ast: Ast,
      value: any,
      throwOnError?: boolean
    ) : ValidationError | Error
  }

  /**
   * @returns {DocSchema}
   * @throws {Error}
   */
  export function docSchema(): DocSchema

  export default docSchema
}
