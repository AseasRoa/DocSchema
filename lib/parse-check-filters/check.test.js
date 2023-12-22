import { check } from './check.js'

describe('Validate Filters', () => {
  describe('array', () => {
    test('unsupported validation', () => {
      expect(() => check(
        { gte: [2, ''] }, [1, 2]
      )).toThrow(Error)
    })

    test('min', () => {
      // min
      expect(check({ min: [2, ''] }, [1, 2])).toBe(true)

      // min wrong
      expect(check({ min: [2, ''] }, [1])).toBe(false)
    })

    test('max', () => {
      // max
      expect(check({ max: [2, ''] }, [1, 2])).toBe(true)

      // max wrong
      expect(check({ max: [2, ''] }, [1, 2, 3])).toBe(false)
    })

    test('length', () => {
      // length
      expect(check({ length: [2, ''] }, [1, 2])).toBe(true)

      // length wrong
      expect(check({ length: [2, ''] }, [1])).toBe(false)
    })
  })

  describe('number', () => {
    test('unsupported validation', () => {
      expect(() => check(
        { startsWith: ['1', ''] }, 123
      )).toThrow(Error)
    })

    test('min', () => {
      // min
      expect(check({ min: [2, ''] }, 2)).toBe(true)

      // min wrong
      expect(check({ min: [2, ''] }, 1.99)).toBe(false)
    })

    test('max', () => {
      // min
      expect(check({ max: [2, ''] }, 2)).toBe(true)

      // min wrong
      expect(check({ max: [2, ''] }, 2.01)).toBe(false)
    })

    test('gte', () => {
      // min
      expect(check({ gte: [2, ''] }, 2)).toBe(true)

      // min wrong
      expect(check({ gte: [2, ''] }, 1.99)).toBe(false)
    })

    test('lte', () => {
      // min
      expect(check({ lte: [2, ''] }, 2)).toBe(true)

      // min wrong
      expect(check({ lte: [2, ''] }, 2.01)).toBe(false)
    })

    test('gt', () => {
      // gt
      expect(check({ gt: [2, ''] }, 2.01)).toBe(true)

      // gt wrong
      expect(check({ gt: [2, ''] }, 2)).toBe(false)
    })

    test('lt', () => {
      // lt
      expect(check({ lt: [2, ''] }, 1.99)).toBe(true)

      // lt wrong
      expect(check({ lt: [2, ''] }, 2)).toBe(false)
    })

    test('step', () => {
      // step
      expect(check({ step: [5, ''] }, 25)).toBe(true)

      // step wrong
      expect(check({ step: [5, ''] }, 25.01)).toBe(false)
    })

    test('int', () => {
      // int
      expect(check({ int: [true, ''] }, 3)).toBe(true)
      expect(check({ int: [false, ''] }, 3.01)).toBe(true)

      // int wrong
      expect(check({ int: [true, ''] }, 3.01)).toBe(false)
      expect(check({ int: [false, ''] }, 3)).toBe(false)
    })

    test('finite', () => {
      // finite
      expect(check({ finite: [true, ''] }, 3)).toBe(true)
      expect(check({ finite: [false, ''] }, Infinity)).toBe(true)

      // finite wrong
      expect(check({ finite: [true, ''] }, Infinity)).toBe(false)
      expect(check({ finite: [false, ''] }, 3)).toBe(false)
    })

    test('safeInt', () => {
      // safe
      expect(check(
        { safeInt: [true, ''] }, Number.MIN_SAFE_INTEGER
      )).toBe(true)
      expect(check(
        { safeInt: [true, ''] }, Number.MAX_SAFE_INTEGER
      )).toBe(true)

      expect(check(
        { safeInt: [false, ''] }, Number.MIN_SAFE_INTEGER - 1
      )).toBe(true)
      expect(check(
        { safeInt: [false, ''] }, Number.MAX_SAFE_INTEGER + 1
      )).toBe(true)

      // safe wrong
      expect(check(
        { safeInt: [true, ''] }, Number.MIN_SAFE_INTEGER - 1
      )).toBe(false)
      expect(check(
        { safeInt: [false, ''] }, 3
      )).toBe(false)
      expect(check(
        { safeInt: [false, ''] }, 0.1
      )).toBe(false)
    })
  })

  describe('string', () => {
    test('unsupported validation', () => {
      expect(() => check(
        { finite: [true, ''] }, 'text'
      )).toThrow(Error)
    })

    test('min', () => {
      // min
      expect(check({ min: [2, ''] }, '12')).toBe(true)

      // min wrong
      expect(check({ min: [2, ''] }, '1')).toBe(false)
    })

    test('max', () => {
      // max
      expect(check({ max: [2, ''] }, '12')).toBe(true)

      // max wrong
      expect(check({ max: [2, ''] }, '123')).toBe(false)
    })

    test('length', () => {
      // length
      expect(check({ length: [2, ''] }, '12')).toBe(true)

      // length wrong
      expect(check({ length: [2, ''] }, '1')).toBe(false)
    })

    test('startsWith', () => {
      // startsWith
      expect(check({ startsWith: ['he', ''] }, 'hello')).toBe(true)

      // startsWith wrong
      expect(check({ startsWith: ['he', ''] }, 'bello')).toBe(false)
    })

    test('endsWith', () => {
      // endsWith
      expect(check({ endsWith: ['lo', ''] }, 'hello')).toBe(true)

      // endsWith wrong
      expect(check({ endsWith: ['lo', ''] }, 'hells')).toBe(false)
    })

    test('includes', () => {
      // includes
      expect(check({ includes: ['lo', ''] }, 'hello')).toBe(true)

      // includes wrong
      expect(check({ includes: ['lo', ''] }, 'hi')).toBe(false)
    })

    test('excludes', () => {
      // excludes
      expect(check({ excludes: ['lo', ''] }, 'hi')).toBe(true)

      // excludes wrong
      expect(check({ excludes: ['lo', ''] }, 'hello')).toBe(false)
    })

    test('url', () => {
      // url
      expect(check(
        { url: [true, ''] }, 'https://github.com'
      )).toBe(true)
      expect(check(
        { url: [false, ''] }, '1234'
      )).toBe(true)

      // url wrong
      expect(check(
        { url: [true, ''] }, '1234'
      )).toBe(false)
      expect(check(
        { url: [false, ''] }, 'https://github.com'
      )).toBe(false)
    })

    test('pattern', () => {
      // pattern
      expect(check({ pattern: [/[a-z]/u, ''] }, 'text')).toBe(true)

      // pattern wrong
      expect(check({ pattern: [/[a-z]/u, ''] }, '1')).toThrow(Error)
    })

    test('ip', () => {
      // ip
      expect(check({ ip: [true, ''] }, '192.168.0.1')).toBe(true)
      expect(check({ ip: [true, ''] }, '2001:db8::ff00:42:8329')).toBe(true)
      expect(check({ ip: [false, ''] }, '1234')).toBe(true)

      // ip wrong
      expect(check({ ip: [true, ''] }, '1234')).toBe(false)
      expect(check({ ip: [true, ''] }, '1234')).toBe(false)
      expect(check({ ip: [false, ''] }, '192.168.0.1')).toBe(false)
      expect(check({ ip: [false, ''] }, '2001:db8::ff00:42:8329')).toBe(false)
    })

    test('ipv4', () => {
      // ipv4
      expect(check({ ipv4: [true, ''] }, '192.168.0.1')).toBe(true)
      expect(check({ ipv4: [false, ''] }, '1234')).toBe(true)

      // ipv4 wrong
      expect(check({ ipv4: [true, ''] }, '1234')).toBe(false)
      expect(check({ ipv4: [false, ''] }, '192.168.0.1')).toBe(false)
    })

    test('ipv6', () => {
      // ipv6
      expect(check(
        { ipv6: [true, ''] }, '2001:db8::ff00:42:8329'
      )).toBe(true)
      expect(check(
        { ipv6: [false, ''] }, '1234'
      )).toBe(true)

      // ipv6 wrong
      expect(check(
        { ipv6: [true, ''] }, '1234'
      )).toBe(false)
      expect(check(
        { ipv6: [false, ''] }, '2001:db8::ff00:42:8329'
      )).toBe(false)
    })

    test('email', () => {
      // email
      expect(check({ email: [true, ''] }, 'name@email.com')).toBe(true)
      expect(check({ email: [false, ''] }, 'name')).toBe(true)

      // email wrong
      expect(check({ email: [true, ''] }, 'name')).toBe(false)
      expect(check({ email: [false, ''] }, 'name@email.com')).toBe(false)
    })

    test('cuid', () => {
      // cuid
      expect(check(
        { cuid: [true, ''] }, 'ch72gsb320000udocl363eofy'
      )).toBe(true)
      expect(check(
        { cuid: [false, ''] }, 'something'
      )).toBe(true)

      // cuid wrong
      expect(check(
        { cuid: [true, ''] }, 'something'
      )).toBe(false)
      expect(check(
        { cuid: [false, ''] }, 'ch72gsb320000udocl363eofy'
      )).toBe(false)
    })

    test('cuid2', () => {
      // cuid2
      expect(check({ cuid2: [true, ''] }, 'itp2u4ozr4')).toBe(true)
      expect(check({ cuid2: [false, ''] }, '1234')).toBe(true)

      // cuid2 wrong
      expect(check({ cuid2: [true, ''] }, '1234')).toBe(false)
      expect(check({ cuid2: [false, ''] }, 'itp2u4ozr4')).toBe(false)
    })

    test('ulid', () => {
      // ulid
      expect(check({ ulid: [true, ''] }, '01F8MECHZX3TBDSZ7XR8H8JHAF')).toBe(true)
      expect(check({ ulid: [false, ''] }, 'something')).toBe(true)

      // ulid wrong
      expect(check({ ulid: [true, ''] }, 'something')).toBe(false)
      expect(check({ ulid: [false, ''] }, '01F8MECHZX3TBDSZ7XR8H8JHAF')).toBe(false)
    })

    test('uuid', () => {
      // uuid
      expect(check(
        { uuid: [true, ''] }, '123e4567-e89b-12d3-a456-426614174000'
      )).toBe(true)
      expect(check(
        { uuid: [false, ''] }, 'something'
      )).toBe(true)

      // uuid wrong
      expect(check(
        { uuid: [true, ''] }, 'something'
      )).toBe(false)
      expect(check(
        { uuid: [false, ''] }, '123e4567-e89b-12d3-a456-426614174000'
      )).toBe(false)
    })
  })
})
