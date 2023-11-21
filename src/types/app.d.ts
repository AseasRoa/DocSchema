type DocSchemaPrimitives = 'string'|'number'|'bigint'|'boolean'|'undefined'|'symbol'|'null'

type DocSchemaAstScope = {
  private: boolean,
  protected: boolean,
  public: boolean
}

type DocSchemaAstTypeNames = DocSchemaPrimitives|'any'|'array'|'object'|'objectLiteral'|'typedef'

type DocSchemaLimits = {
  min?: number,
  max?: number,
  length?: number,
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
  pattern?: RegExp,
  gte?: number,
  gt?: number,
  lte?: number,
  lt?: number,
  int?: boolean,
  step?: number,
  finite?: boolean,
  safeInt?: boolean
}

type DocSchemaObjectLiteralPair = {
  key: string,
  valueTypes: DocSchemaParsedType[],
  description: string,
  limits: DocSchemaLimits
}

type DocSchemaObjectPairs = Array<{
  keyTypes: DocSchemaParsedType[],
  valueTypes: DocSchemaParsedType[]
}>

type DocSchemaParsedType = {
  typeName: DocSchemaAstTypeNames,
  typeExpression: string,
  value?: any, // If not defined, it means any value
  types?: DocSchemaParsedType[], // Used for Array
  typePairs?: DocSchemaObjectPairs, // Used for Object types
  pairs?: DocSchemaObjectLiteralPair[] // Used for Object literal types
}

type DocSchemaParsedTag = {
  id: number,
  types: DocSchemaParsedType[],
  typeExpression: string,
  name: string,
  description: string,
  limits: DocSchemaLimits,
  optional: boolean,
  defaultValue: string | undefined,
  destructured: [string, string] | undefined // \[ Param name, Property name \] tuple
}

type DocSchemaAstElements = {
  description: string,
  scope: DocSchemaAstScope,
  returns: DocSchemaParsedTag | null,
  param: DocSchemaParsedTag[],
  enum: DocSchemaParsedTag | null,
  type: DocSchemaParsedTag | null,
  typedef: DocSchemaParsedTag | null,
  yields: DocSchemaParsedTag | null,
  property: DocSchemaParsedTag[]
}

type DocSchemaAst = {
  elements: DocSchemaAstElements,
  file: string,
  startLine: number,
  endLine: number,
  lineAfterComment: string, // The contents of the first non-empty line after the comment
  typedefs: DocSchemaAst[] // Other parsed AST from the same file that are 'typedef'
}

type DocSchemaTypeParser = (
  typeExpression: string
) => DocSchemaParsedType[]

type DocSchemaSimpleParserFunction = (
  typeExpression: string
) => DocSchemaParsedType | false

type DocSchemaComplexParserFunction = (
  typeExpression: string,
  typeParser: DocSchemaTypeParser
) => DocSchemaParsedType | false

type DocSchemaParserFunction = DocSchemaSimpleParserFunction | DocSchemaComplexParserFunction

type DocTypesValidator = (
  types: DocSchemaParsedType[],
  value: any,
  typedefs: DocSchemaAst[],
  limits: DocSchemaLimits
) => boolean

type DocCheckerFunction = (
  parsedType: DocSchemaParsedType,
  value: any,
  typedefs: DocSchemaAst[],
  limits: DocSchemaLimits,
  typesValidator: DocTypesValidator
) => boolean
