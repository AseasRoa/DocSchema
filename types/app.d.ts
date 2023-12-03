type Primitives =
  'string'|'number'|'bigint'|'boolean'|'undefined'|'symbol'|'null'

type AstScope = {
  private: boolean,
  protected: boolean,
  public: boolean
}

type AstTypeNames =
  Primitives|'any'|'array'|'arrayLiteral'|'object'|'objectLiteral'|'typedef'

type Filters = {
  // array, number, string
  min?: number | [number, string],
  max?: number | [number, string],
  length?: number | [number, string],
  // number
  gte?: number | [number, string],
  gt?: number | [number, string],
  lte?: number | [number, string],
  lt?: number | [number, string],
  int?: boolean | [boolean, string],
  step?: number | [number, string],
  finite?: boolean | [boolean, string],
  safeInt?: boolean | [boolean, string],
  // string
  startsWith?: string | [string, string],
  endsWith?: string | [string, string],
  includes?: string | [string, string],
  excludes?: string | [string, string],
  email?: boolean | [boolean, string],
  url?: boolean | [boolean, string],
  ip?: boolean | [boolean, string],
  ipv4?: boolean | [boolean, string],
  ipv6?: boolean | [boolean, string],
  uuid?: boolean | [boolean, string],
  ulid?: boolean | [boolean, string],
  cuid?: boolean | [boolean, string],
  cuid2?: boolean | [boolean, string],
  pattern?: RegExp | [RegExp, string]
}

type TransformToTupleFilters<T> = {
  [P in keyof T]?: [T[P], string]
}

type TupleFilters = TransformToTupleFilters<Filters>

type ObjectLiteralPair = {
  key: string,
  valueTypes: ParsedType[],
  description: string,
  filters: TupleFilters
}

type ObjectPairs = Array<{
  keyTypes: ParsedType[],
  valueTypes: ParsedType[]
}>

type ParsedType = {
  typeName: AstTypeNames,
  typeExpression: string,
  value?: any, // If not defined, it means any value
  types?: ParsedType[], // Used for Array
  typePairs?: ObjectPairs, // Used for Object types
  pairs?: ObjectLiteralPair[] // Used for object literal and array literal types
}

type ParsedTag = {
  id: number,
  types: ParsedType[],
  typeExpression: string,
  name: string,
  description: string,
  filters: TupleFilters,
  optional: boolean,
  defaultValue: string | undefined,
  destructured: [string, string] | undefined // \[ Param name, Property name \] tuple
}

type AstElements = {
  description: string,
  scope: AstScope,
  returns: ParsedTag | null,
  param: ParsedTag[],
  enum: ParsedTag | null,
  type: ParsedTag | null,
  callback: ParsedTat | null,
  typedef: ParsedTag | null,
  yields: ParsedTag | null,
  property: ParsedTag[]
}

type Ast = {
  elements: AstElements,
  file: string,
  startLine: number,
  endLine: number,
  lineAfterComment: string, // The contents of the first non-empty line after the comment
  typedefs: Ast[] // Other parsed AST from the same file that are 'typedef'
}

type CurrentLocation = {
  file: string,
  startLine: number,
  endLine: number
}

type TypeParser = (
  typeExpression: string,
  currentLocation?: CurrentLocation
) => ParsedType[]

type ParserFunctionSimple = (
  typeExpression: string
) => ParsedType | false

type ParserFunctionComplex = (
  typeExpression: string,
  typeParser: TypeParser,
  currentLocation?: CurrentLocation
) => ParsedType | false

type ParserFunction = ParserFunctionSimple | ParserFunctionComplex

type TypesChecker = (
  types: ParsedType[],
  value: any,
  key: PropertyKey,
  typedefs: Ast[],
  filters: TupleFilters,
  validator: import('../lib/DocSchemaValidator').DocSchemaValidator
) => boolean

type CheckerFunctionSimple = (
    parsedType: ParsedType,
    value: any
) => boolean

type CheckerFunctionComplex = (
    parsedType: ParsedType,
    value: any,
    key: PropertyKey,
    typedefs: Ast[],
    filters: TupleFilters,
    validator: import('../lib/DocSchemaValidator').DocSchemaValidator,
    typesValidator: TypesChecker
) => boolean

type CheckResult = {
  expectedType: string,
  filter: undefined | { name: '' | keyof Filters, value: boolean | number | string | RegExp },
  kind: 'type' | 'filter' | ''
  message: string,
  pass: boolean,
  tag: string,
  value: any,
  valuePath: PropertyKey[],
}
