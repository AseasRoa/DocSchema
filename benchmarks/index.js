import { suiteDocSchemaParser } from './suites.DocSchemaParser.js'
import { suiteDocSchemaValidator } from './suites.DocSchemaValidator.js'
import { suiteFiltersValidate } from './suites.FiltersValidate.js'
import { suitesLowLevelTypeParsersSimple } from './suites.LowLevelTypeParsersSimple.js'
import { suiteTypesParserComplex, suiteTypesParserSimple } from './suites.TypesParser.js'

const suites = [
  suiteFiltersValidate,
  suiteDocSchemaValidator,
  suitesLowLevelTypeParsersSimple,
  suiteTypesParserSimple,
  suiteTypesParserComplex,
  suiteDocSchemaParser,
]

for (const suite of suites) {
  suite.run()
}
