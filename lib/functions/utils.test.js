import { describe, expect, test } from 'vitest'
import {
  dirname,
  extractSimpleImports,
  findClosingBracketPosition,
  findClosingQuotePosition,
  findEOL,
  isolateEndDescription,
  isolateFrontDescription, joinPath
} from './utils.js'

describe('functions', () => {
  test('dirname', () => {
    const fn = dirname
    expect(fn('')).toBe('')
    expect(fn('./fileOne.js')).toBe('.')
    expect(fn('path/to/file/file.ext')).toBe('path/to/file')
    expect(fn('path\\to\\file\\file.ext')).toBe('path\\to\\file')
  })

  test('extractSimpleImports', () => {
    const fn = extractSimpleImports
    expect(fn('')).toMatchObject([])
    expect(fn(
      'import\'./fileOne.js\';import"./fileTwo.js";'
    )).toMatchObject(['./fileOne.js', './fileTwo.js'])
    expect(fn(
      'import \'./fileOne.js\'\nimport "./fileTwo.js"'
    )).toMatchObject(['./fileOne.js', './fileTwo.js'])
  })

  test('findClosingQuotePosition', () => {
    const fn = findClosingQuotePosition
    expect(fn('')).toBe(0)
    expect(fn('\'')).toBe(0)
    expect(fn('\'\'')).toBe(1)
    expect(fn('\'some-text\'')).toBe(10)
    expect(fn('\'some-text\' something after')).toBe(10)
    expect(fn('previous-text \'some-text\'', 14)).toBe(10)
  })

  test('findClosingBracketPosition', () => {
    const fn = findClosingBracketPosition
    expect(fn('')).toBe(0)
    expect(fn('{')).toBe(0)
    expect(fn('{}')).toBe(1)
    expect(fn('{some-text}')).toBe(10)
    expect(fn('{some-text} something after')).toBe(10)
    expect(fn('previous-text {some-text}', 14)).toBe(10)
    expect(fn('previous-text {{}some-text{}}', 14)).toBe(14)
  })

  test('findEOL', () => {
    const fn = findEOL
    expect(fn('')).toBe(0)
    expect(fn('\n')).toBe(0)
    expect(fn('some-text\n')).toBe(9)
    expect(fn('some-text\r\n')).toBe(10)
    expect(fn('some-text\nsome-text')).toBe(9)
    expect(fn('s')).toBe(0)
  })

  test('isolateFrontDescription', () => {
    const fn = isolateFrontDescription
    expect(
      fn(' // c1\n// c2\nkey: number // c3 ')
    ).toStrictEqual(
      ['c1 c2', 'key: number // c3']
    )
  })

  test('isolateEndDescription', () => {
    const fn = isolateEndDescription
    expect(fn('number // description')).toStrictEqual(['number', 'description'])
    expect(
      fn('number // c1\n// c2')
    ).toStrictEqual(['number', 'c1 c2'])
    expect(
      fn('{a: number} // c1\n// c2')
    ).toStrictEqual(['{a: number}', 'c1 c2'])
  })

  test('joinPath', () => {
    const fn = joinPath
    expect(fn('one', 'two')).toBe('one/two')
    expect(fn('one/two', 'three')).toBe('one/two/three')
    expect(fn('one/two', './three')).toBe('one/two/three')
    expect(fn('one/two', '../three')).toBe('one/three')
    expect(fn('one/two', '../../three')).toBe('three')
    expect(fn('one/two', './../../three')).toBe('three')
    expect(fn('one/two', '../../../three')).toBe('three')
  })
})
