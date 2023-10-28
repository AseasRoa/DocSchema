type DocSchemaPrimitives = 'string'|'number'|'bigint'|'boolean'|'undefined'|'symbol'|'null'

type DocSchemaAstScope = {
  private: boolean,
  protected: boolean,
  public: boolean
}

type DocSchemaAstTypeNames = DocSchemaPrimitives|'any'|'array'|'object'|'objectLiteral'|'typedef'

type DocSchemaObjectLiteralPairs = Array<{
  key: string,
  valueTypes: DocSchemaParsedType[],
  description: string
}>

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
  pairs?: DocSchemaObjectLiteralPairs // Used for Object literal types
}

type DocSchemaParsedTag = {
  id: number,
  types: DocSchemaParsedType[],
  typeExpression: string,
  name: string,
  description: string,
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

type DocSchemaTypeParser = (typeExpression: string) => DocSchemaParsedType[]

type DocSchemaSimpleParserFunction = (typeExpression: string) => DocSchemaParsedType | false

type DocSchemaComplexParserFunction = (typeExpression: string, typeParser: DocSchemaTypeParser) => DocSchemaParsedType | false

type DocSchemaParserFunction = DocSchemaSimpleParserFunction | DocSchemaComplexParserFunction

type JsDocTypesChecker = (types: DocSchemaParsedType[], value: any, typedefs: DocSchemaAst[]) => boolean

type JsDocCheckerFunction = (parsedType: DocSchemaParsedType, value: any, typedefs: DocSchemaAst[], typesChecker: JsDocTypesChecker) => boolean
