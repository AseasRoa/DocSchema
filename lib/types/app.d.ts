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
  ast: Ast,
  filters: TupleFilters,
  validator: import('../DocSchemaValidator').DocSchemaValidator
) => boolean

type CheckerFunctionSimple = (
  parsedType: ParsedType,
  value: any
) => boolean

type CheckerFunctionComplex = (
  parsedType: ParsedType,
  value: any,
  key: PropertyKey,
  ast: Ast,
  filters: TupleFilters,
  validator: import('../DocSchemaValidator').DocSchemaValidator,
  typesValidator: TypesChecker
) => boolean
