import docSchemaParserSuites from './suites.DocSchemaParser.js'
import docSchemaValidatorSuites from './suites.DocSchemaValidator.js'
import simpleTypeParsersSuites from './suites.simpleTypeParsers.js'
import TypesParser from './suites.TypesParser.js'
import filtersValidatorsSuites from './suites.validateFilters.js'

const suites = [
  ...docSchemaValidatorSuites.suites,
  ...simpleTypeParsersSuites.suites,
  ...TypesParser.suites,
  ...docSchemaParserSuites.suites,
  ...filtersValidatorsSuites.suites
]

for (const suite of suites) {
  suite.run()
}
