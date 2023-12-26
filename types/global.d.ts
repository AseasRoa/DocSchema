/**
 * This file must be an ambient module
 *
 * @see https://www.typescriptlang.org/docs/handbook/modules/reference.html#ambient-modules
 */

type DocSchemaAst = import('./app').Ast
type DocSchemaCheckResult = import('./app').CheckResult

declare module 'docschema' {
  export class ValidationError extends Error {
    expectedType: string
    filter: undefined | { name: '' | keyof Filters, value: boolean | number | string | RegExp }
    kind: 'type' | 'filter' | ''
    message: string
    pass: boolean
    tag: string
    value: any
    valuePath: PropertyKey[]
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

  export class DocSchema {
    approves(
      value: any
    ): boolean

    check(
      value: any
    ): DocSchemaCheckResult

    /**
     * @template T
     * @param {T} value Input value
     * @returns {T} The input value, if it's valid
     * @throws {ValidationError}
     */
    validate<T>(value: T): T
  }

  /**
   * @returns {DocSchema}
   * @throws {Error}
   */
  export function docSchema(): DocSchema

  export default docSchema
}
