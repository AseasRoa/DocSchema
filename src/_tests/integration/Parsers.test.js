import { simpleTypeParsers } from '../../parsers.js'
import { TypesParser } from '../../TypesParser.js'

describe('Parsers', () => {
  describe('Simple types', () => {
    test('should parse any types - * or any', () => {
      const parser = simpleTypeParsers.tryAnyType

      expect(parser('any'))
      .toStrictEqual({ typeName : 'any', typeExpression : 'any' })
      expect(parser('*'))
      .toStrictEqual({ typeName : 'any', typeExpression : '*' })
      expect(parser(''))
      .toStrictEqual({ typeName : 'any', typeExpression : '' })
      expect(parser('something'))
      .toBe(false)
    })

    test('should parse boolean values - true or false', () => {
      const parser = simpleTypeParsers.tryBooleanType

      expect(parser('true'))
      .toStrictEqual({
        typeName : 'boolean',
        typeExpression : 'true',
        value : true
      })

      expect(parser('false'))
      .toStrictEqual({
        typeName : 'boolean',
        typeExpression : 'false',
        value : false
      })

      expect(parser(' ( true ) '))
      .toStrictEqual({
        typeName : 'boolean',
        typeExpression : ' ( true ) ',
        value : true
      })

      expect(parser('')).toBe(false)
      expect(parser('something')).toBe(false)
    })

    test('should parse numeric values - integer or float', () => {
      const parser = simpleTypeParsers.tryNumberType

      expect(parser('123'))
      .toStrictEqual({
        typeName : 'number',
        typeExpression : '123',
        value : 123
      })

      expect(parser('123.4'))
      .toStrictEqual({
        typeName : 'number',
        typeExpression : '123.4',
        value : 123.4
      })

      expect(parser(' ( 123.4 ) '))
      .toStrictEqual({
        typeName : 'number',
        typeExpression : ' ( 123.4 ) ',
        value : 123.4
      })

      expect(parser('')).toBe(false)
      expect(parser('something')).toBe(false)
    })

    test('should parse primitive types - string, number, boolean...', () => {
      const parser     = simpleTypeParsers.tryPrimitiveType
      const primitives = [
        'string',
        'number',
        'bigint',
        'boolean',
        'undefined',
        'symbol',
        'null'
      ]

      primitives.forEach((primitive) => {
        expect(parser(primitive))
        .toStrictEqual({
          typeName       : primitive,
          typeExpression : primitive
        })
      })

      // Upper case
      primitives.forEach((primitive) => {
        const upperCasePrimitive = primitive.toUpperCase()

        expect(parser(upperCasePrimitive))
        .toStrictEqual({
          typeName       : primitive,
          typeExpression : upperCasePrimitive
        })
      })

      // With added ( and )
      primitives.forEach((primitive) => {
        const wrappedPrimitive = ` ( ${primitive.toUpperCase()} ) `

        expect(parser(wrappedPrimitive))
        .toStrictEqual({
          typeName       : primitive,
          typeExpression : wrappedPrimitive
        })
      })

      expect(parser('')).toBe(false)
      expect(parser('something')).toBe(false)
    })

    test('should parse string values', () => {
      const parser = simpleTypeParsers.tryStringType

      // ''
      expect(parser(`'a string'`))
      .toStrictEqual({
        typeName : 'string',
        typeExpression : `'a string'`,
        value : 'a string'
      })

      // ""
      expect(parser(`"a string"`))
      .toStrictEqual({
        typeName : 'string',
        typeExpression : `"a string"`,
        value : 'a string'
      })

      // ``
      expect(parser('`a string`'))
      .toStrictEqual({
        typeName : 'string',
        typeExpression : '`a string`',
        value : 'a string'
      })

      // Wrapped with ( and )
      expect(parser(` ( 'a string' ) `))
      .toStrictEqual({
        typeName : 'string',
        typeExpression : ` ( 'a string' ) `,
        value : 'a string'
      })

      // Doesn't have both quotes
      expect(parser(`'a string`)).toBe(false)
      expect(parser(`a string"`)).toBe(false)
      // Misplaced quotes
      expect(parser(`'a strin'g`)).toBe(false)
      expect(parser(`a' string`)).toBe(false)

      expect(parser('')).toBe(false)
      expect(parser('something')).toBe(false)
    })
  })

  describe('Complex types', () => {
    const typesParser = new TypesParser()

    test('should parse Array complex types', () => {
      /*
       * With dot
       */
      expect(typesParser.parseType('Array.<number>')[0])
      .toStrictEqual(
        {
          typeName       : 'array',
          typeExpression : 'Array.<number>',
          types          : [{ typeExpression : 'number', typeName : 'number' }]
        }
      )

      /*
       * Without the dot
       */
      expect(typesParser.parseType('Array<number>')[0])
      .toStrictEqual(
        {
          typeName       : 'array',
          typeExpression : 'Array<number>',
          types          : [{ typeExpression : 'number', typeName : 'number' }]
        }
      )

      /*
       * Upper case
       */
      expect(typesParser.parseType('ARRAY.<NUMBER>')[0])
      .toStrictEqual(
        {
          typeName       : 'array',
          typeExpression : 'ARRAY.<NUMBER>',
          types          : [{ typeExpression : 'NUMBER', typeName : 'number' }]
        }
      )

      /*
       * Custom type
       */
      expect(typesParser.parseType('Array.<MyType>')[0])
      .toStrictEqual(
        {
          typeName       : 'array',
          typeExpression : 'Array.<MyType>',
          types          : [{ typeExpression : 'MyType', typeName : 'typedef' }]
        }
      )

      /*
       * Multiple types with OR
       */
      expect(typesParser.parseType('Array<number | string>')[0])
      .toStrictEqual(
        {
          typeName       : 'array',
          typeExpression : 'Array<number | string>',
          types          : [{
            typeExpression : 'number',
            typeName       : 'number'
          }, {
            typeExpression : 'string',
            typeName       : 'string'
          }]
        }
      )

      /*
       * Kinda wrong type.
       * It seems that JsDoc doesn't support & union, so it should be parsed as | union.
       */
      expect(typesParser.parseType('Array<number & string>')[0])
      .toStrictEqual(
        {
          typeName       : 'array',
          typeExpression : 'Array<number & string>',
          types          : [{
            typeExpression : 'number',
            typeName       : 'number'
          }, {
            typeExpression : 'string',
            typeName       : 'string'
          }]
        }
      )

      /*
       * Kinda wrong type
       */
      expect(typesParser.parseType('Array<number, string>')[0])
      .toStrictEqual(
        {
          typeName       : 'array',
          typeExpression : 'Array<number, string>',
          types          : [{
            typeExpression : 'number, string',
            typeName       : 'any'
          }]
        }
      )
    })

    test('should parse array literal types', () => {
      /*
       * Lower case type
       */
      expect(typesParser.parseType('string[]')[0])
      .toStrictEqual(
        {
          typeName       : 'array',
          typeExpression : 'string[]',
          types          : [{ typeExpression : 'string', typeName : 'string' }]
        }
      )

      /*
       * Upper case type
       */
      expect(typesParser.parseType('NUMBER[]')[0])
      .toStrictEqual(
        {
          typeName       : 'array',
          typeExpression : 'NUMBER[]',
          types          : [{ typeExpression : 'NUMBER', typeName : 'number' }]
        }
      )

      /*
       * Custom type
       */
      expect(typesParser.parseType('MyType[]')[0])
      .toStrictEqual(
        {
          typeName       : 'array',
          typeExpression : 'MyType[]',
          types          : [{ typeExpression : 'MyType', typeName : 'typedef' }]
        }
      )

      /*
       * Union types, mixed case.
       * The & union is not in JsDoc, but it should work as | here
       */
      expect(typesParser.parseType('(MyType | Boolean & Number)[]')[0])
      .toStrictEqual(
        {
          typeName       : 'array',
          typeExpression : '(MyType | Boolean & Number)[]',
          types          : [
            { typeExpression : 'MyType', typeName : 'typedef' },
            { typeExpression : 'Boolean', typeName : 'boolean' },
            { typeExpression : 'Number', typeName : 'number' }
          ]
        }
      )

      /*
       * Object type
       */
      expect(typesParser.parseType('(MyType | Boolean & Number)[]')[0])
      .toStrictEqual(
        {
          typeName       : 'array',
          typeExpression : '(MyType | Boolean & Number)[]',
          types          : [
            { typeExpression : 'MyType', typeName : 'typedef' },
            { typeExpression : 'Boolean', typeName : 'boolean' },
            { typeExpression : 'Number', typeName : 'number' }
          ]
        }
      )
    })

    test('should parse Object type', () => {
      /*
       * With dot
       */
      expect(typesParser.parseType('Object.<string, number>')[0])
      .toStrictEqual(
        {
          typeName       : 'object',
          typeExpression : 'Object.<string, number>',
          typePairs      : [{
            keyTypes   : [{ typeExpression : 'string', typeName : 'string' }],
            valueTypes : [{ typeExpression : 'number', typeName : 'number' }]
          }]
        }
      )

      /*
       * Without the dot
       */
      expect(typesParser.parseType('Object<string, number>')[0])
      .toStrictEqual(
        {
          typeName       : 'object',
          typeExpression : 'Object<string, number>',
          typePairs      : [{
            keyTypes   : [{ typeExpression : 'string', typeName : 'string' }],
            valueTypes : [{ typeExpression : 'number', typeName : 'number' }]
          }]
        }
      )

      /*
       * As Record (used in TypeScript)
       */
      expect(typesParser.parseType('Record<string, number>')[0])
      .toStrictEqual(
        {
          typeName       : 'object',
          typeExpression : 'Record<string, number>',
          typePairs      : [{
            keyTypes   : [{ typeExpression : 'string', typeName : 'string' }],
            valueTypes : [{ typeExpression : 'number', typeName : 'number' }]
          }]
        }
      )

      /*
       * Upper case
       */
      expect(typesParser.parseType('OBJECT.<STRING, NUMBER>')[0])
      .toStrictEqual(
        {
          typeName       : 'object',
          typeExpression : 'OBJECT.<STRING, NUMBER>',
          typePairs      : [{
            keyTypes   : [{ typeExpression : 'STRING', typeName : 'string' }],
            valueTypes : [{ typeExpression : 'NUMBER', typeName : 'number' }]
          }]
        }
      )

      /*
       * Missed type for values
       */
      expect(typesParser.parseType('Object.<number>')[0])
      .toStrictEqual(
        {
          typeName       : 'object',
          typeExpression : 'Object.<number>',
          typePairs      : [{
            keyTypes   : [{ typeExpression : 'number', typeName : 'number' }],
            valueTypes : [{ typeExpression : '*', typeName : 'any' }]
          }]
        }
      )

      /*
       * Unions
       */
      expect(typesParser.parseType('Object.<string | number, (number | MyType)>')[0])
      .toStrictEqual(
        {
          typeName       : 'object',
          typeExpression : 'Object.<string | number, (number | MyType)>',
          typePairs      : [{
            keyTypes : [
              { typeExpression : 'string', typeName : 'string' },
              { typeExpression : 'number', typeName : 'number' }
            ],

            valueTypes : [
              { typeExpression : 'number', typeName : 'number' },
              { typeExpression : 'MyType', typeName : 'typedef' }
            ]
          }]
        }
      )
    })

    test('should parse object literal types', () => {
      let expression = ''

      expression = ' {keys: string, values: number} '

      expect(typesParser.parseType(expression)[0])
      .toStrictEqual(
        {
          typeName       : 'objectLiteral',
          typeExpression : expression.trim(),
          pairs          : [
            {
              key         : 'keys',
              valueTypes  : [{ typeExpression : 'string', typeName : 'string' }],
              description : ''
            },
            {
              key         : 'values',
              valueTypes  : [{ typeExpression : 'number', typeName : 'number' }],
              description : ''
            }
          ]
        }
      )

      expression = ' {keys: ( string & NUMBER ) , values: ( NUMBER | MyType ) } '

      expect(typesParser.parseType(expression)[0])
      .toStrictEqual(
        {
          typeName       : 'objectLiteral',
          typeExpression : expression.trim(),
          pairs          : [
            {
              key        : 'keys',
              valueTypes : [
                { typeExpression : 'string', typeName : 'string' },
                { typeExpression : 'NUMBER', typeName : 'number' }
              ],
              description : ''
            },
            {
              key        : 'values',
              valueTypes : [
                { typeExpression : 'NUMBER', typeName : 'number' },
                { typeExpression : 'MyType', typeName : 'typedef' }
              ],
              description : ''
            }
          ]
        }
      )

      expression = ' {key?: string} '

      expect(typesParser.parseType(expression)[0])
      .toStrictEqual(
        {
          typeName       : 'objectLiteral',
          typeExpression : expression.trim(),
          pairs          : [
            {
              key        : 'key',
              valueTypes : [
                { typeExpression : 'string', typeName : 'string' },
                { typeExpression : 'undefined', typeName : 'undefined' }
              ],
              description : ''
            }
          ]
        }
      )

      expression = `{
        // reject-this-comment
        keys: string, // keys-desc
        values: number, // array-like ['', "", \`\`, (123), /regex/] // more comment
        limits: number, // { min: 1, max: 2 }
        append: string, // part 1
        // part 2
        // part 3
      } `

      expect(typesParser.parseType(expression)[0])
      .toStrictEqual(
        {
          typeName       : 'objectLiteral',
          typeExpression : expression.trim(),
          pairs          : [
            {
              key         : 'keys',
              valueTypes  : [{ typeExpression : 'string', typeName : 'string' }],
              description : 'keys-desc'
            },
            {
              key         : 'values',
              valueTypes  : [{ typeExpression : 'number', typeName : 'number' }],
              description : `array-like ['', "", \`\`, (123), /regex/] // more comment`
            },
            {
              key         : 'limits',
              valueTypes  : [{ typeExpression : 'number', typeName : 'number' }],
              description : '{ min: 1, max: 2 }'
            },
            {
              key         : 'append',
              valueTypes  : [{ typeExpression : 'string', typeName : 'string' }],
              description : 'part 1 part 2 part 3'
            }
          ]
        }
      )
    })
  })
})
