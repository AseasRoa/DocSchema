export class DocSchema<T> {
  ast: Ast

  approves(
    value: any
  ): boolean

  check(
    value: any
  ): CheckResult

  /**
   * @template T
   * @param {any} value Input value
   * @returns {T} The input value, if it's valid
   * @throws {ValidationError}
   */
  validate(value: any): T
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
  check(
    ast: Ast,
    value: any,
    forceStrict?: boolean
  ): CheckResult

  validate(
    ast: Ast,
    value: any,
    forceStrict?: boolean
  ): CheckResult

  checkFunctionArguments(
    ast: Ast,
    args: any[],
    forceStrict?: boolean
  ): CheckResult

  validateFunctionArguments(
    ast: Ast,
    args: any[],
    forceStrict?: boolean
  ): CheckResult

  checkReturns(
    ast: Ast,
    value: any,
    forceStrict?: boolean
  ): CheckResult

  validateReturns(
    ast: Ast,
    value: any,
    forceStrict?: boolean
  ): CheckResult
}

export class ValidationError extends Error {
  expectedType: string
  filter: undefined | {
    name: '' | keyof Filters,
    value: boolean | number | string | RegExp
  }
  kind: 'type' | 'filter' | 'strict' | ''
  message: string
  pass: boolean
  tag: string
  value: any
  valuePath: PropertyKey[]
}

/**
 * @template T
 * @param {T} [typeCarrier]
 * @returns {DocSchema<T>}
 * @throws {Error}
 */
export function docSchema<T>(typeCarrier: T): DocSchema<T>
