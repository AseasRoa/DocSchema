type Primitives =
  'string'|'number'|'bigint'|'boolean'|'undefined'|'symbol'|'null'

type AstScope = {
  private: boolean,
  protected: boolean,
  public: boolean
}

type AstTypeNames =
  Primitives|'any'|'array'|'object'|'objectLiteral'|'typedef'

type Limits = {
  // array, number, string
  min?: number,
  max?: number,
  length?: number,
  // number
  gte?: number,
  gt?: number,
  lte?: number,
  lt?: number,
  int?: boolean,
  step?: number,
  finite?: boolean,
  safeInt?: boolean,
  // string
  startsWith?: string,
  endsWith?: string,
  includes?: string,
  excludes?: string,
  email?: boolean,
  url?: boolean,
  ip?: boolean,
  ipv4?: boolean,
  ipv6?: boolean,
  uuid?: boolean,
  ulid?: boolean,
  cuid?: boolean,
  cuid2?: boolean,
  pattern?: RegExp
}

type ObjectLiteralPair = {
  key: string,
  valueTypes: ParsedType[],
  description: string,
  limits: Limits
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
  pairs?: ObjectLiteralPair[] // Used for Object literal types
}

type ParsedTag = {
  id: number,
  types: ParsedType[],
  typeExpression: string,
  name: string,
  description: string,
  limits: Limits,
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

type TypeParser = (
  typeExpression: string
) => ParsedType[]

type SimpleParserFunction = (
  typeExpression: string
) => ParsedType | false

type ComplexParserFunction = (
  typeExpression: string,
  typeParser: TypeParser
) => ParsedType | false

type ParserFunction = SimpleParserFunction | ComplexParserFunction

type TypesValidator = (
  types: ParsedType[],
  value: any,
  typedefs: Ast[],
  limits: Limits
) => boolean

type ValidatorFunction = (
  parsedType: ParsedType,
  value: any,
  typedefs: Ast[],
  limits: Limits,
  typesValidator: TypesValidator
) => boolean
