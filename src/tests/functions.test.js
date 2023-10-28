import {
  findClosingBracketPosition,
  findClosingQuotePosition,
  findEOL
} from '../functions.js'

describe('functions', function() {
  test('findClosingQuotePosition', function() {
    expect(findClosingQuotePosition(``)).toBe(0)
    expect(findClosingQuotePosition(`'`)).toBe(0)
    expect(findClosingQuotePosition(`''`)).toBe(1)
    expect(findClosingQuotePosition(`'some-text'`)).toBe(10)
    expect(findClosingQuotePosition(`'some-text' something after`)).toBe(10)
    expect(findClosingQuotePosition(`previous-text 'some-text'`, 14)).toBe(10)
  })

  test('findClosingBracketPosition', function() {
    expect(findClosingBracketPosition(``)).toBe(0)
    expect(findClosingBracketPosition(`{`)).toBe(0)
    expect(findClosingBracketPosition(`{}`)).toBe(1)
    expect(findClosingBracketPosition(`{some-text}`)).toBe(10)
    expect(findClosingBracketPosition(`{some-text} something after`)).toBe(10)
    expect(findClosingBracketPosition(`previous-text {some-text}`, 14)).toBe(10)
    expect(findClosingBracketPosition(`previous-text {{}some-text{}}`, 14)).toBe(14)
  })

  test('findEOL', function() {
    expect(findEOL(``)).toBe(0)
    expect(findEOL(`\n`)).toBe(0)
    expect(findEOL(`some-text\n`)).toBe(9)
    expect(findEOL(`some-text\r\n`)).toBe(10)
    expect(findEOL(`some-text\nsome-text`)).toBe(9)
    expect(findEOL(`s`)).toBe(0)
  })
})
