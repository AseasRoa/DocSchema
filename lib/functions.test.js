import {
  findClosingBracketPosition,
  findClosingQuotePosition,
  findEOL
} from './functions.js'

describe('functions', () => {
  test('findClosingQuotePosition', () => {
    const fn = findClosingQuotePosition
    expect(fn(``)).toBe(0)
    expect(fn(`'`)).toBe(0)
    expect(fn(`''`)).toBe(1)
    expect(fn(`'some-text'`)).toBe(10)
    expect(fn(`'some-text' something after`)).toBe(10)
    expect(fn(`previous-text 'some-text'`, 14)).toBe(10)
  })

  test('findClosingBracketPosition', () => {
    const fn = findClosingBracketPosition
    expect(fn(``)).toBe(0)
    expect(fn(`{`)).toBe(0)
    expect(fn(`{}`)).toBe(1)
    expect(fn(`{some-text}`)).toBe(10)
    expect(fn(`{some-text} something after`)).toBe(10)
    expect(fn(`previous-text {some-text}`, 14)).toBe(10)
    expect(fn(`previous-text {{}some-text{}}`, 14)).toBe(14)
  })

  test('findEOL', () => {
    const fn = findEOL
    expect(fn(``)).toBe(0)
    expect(fn(`\n`)).toBe(0)
    expect(fn(`some-text\n`)).toBe(9)
    expect(fn(`some-text\r\n`)).toBe(10)
    expect(fn(`some-text\nsome-text`)).toBe(9)
    expect(fn(`s`)).toBe(0)
  })
})
