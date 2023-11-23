import { validate } from './validate.js'

describe('Validate Filters', () => {
  describe('array', () => {
    test('unsupported validation', () => {
      expect(() => validate(
        {gte: 2}, [1, 2]
      )).toThrow(Error)
    })

    test('min', () => {
      // min
      expect(validate(
        {min: 2}, [1, 2]
      )).toBe(true)

      // min wrong
      expect(() => validate(
        {min: 2}, [1]
      )).toThrow(Error)
    })

    test('max', () => {
      // max
      expect(validate(
        {max: 2}, [1, 2]
      )).toBe(true)

      // max wrong
      expect(() => validate(
        {max: 2}, [1, 2, 3]
      )).toThrow(Error)
    })

    test('length', () => {
      // length
      expect(validate(
        {length: 2}, [1, 2]
      )).toBe(true)

      // length wrong
      expect(() => validate(
        {length: 2}, [1]
      )).toThrow(Error)
    })
  })

  describe('number', () => {
    test('unsupported validation', () => {
      expect(() => validate(
        {startsWith: '1'}, 123
      )).toThrow(Error)
    })

    test('min', () => {
      // min
      expect(validate(
        {min: 2}, 2
      )).toBe(true)

      // min wrong
      expect(() => validate(
        {min: 2}, 1.99
      )).toThrow(Error)
    })

    test('max', () => {
      // min
      expect(validate(
        {max: 2}, 2
      )).toBe(true)

      // min wrong
      expect(() => validate(
        {max: 2}, 2.01
      )).toThrow(Error)
    })

    test('gte', () => {
      // min
      expect(validate(
        {gte: 2}, 2
      )).toBe(true)

      // min wrong
      expect(() => validate(
        {gte: 2}, 1.99
      )).toThrow(Error)
    })

    test('lte', () => {
      // min
      expect(validate(
        {lte: 2}, 2
      )).toBe(true)

      // min wrong
      expect(() => validate(
        {lte: 2}, 2.01
      )).toThrow(Error)
    })

    test('gt', () => {
      // gt
      expect(validate(
        {gt: 2}, 2.01
      )).toBe(true)

      // gt wrong
      expect(() => validate(
        {gt: 2}, 2
      )).toThrow(Error)
    })

    test('lt', () => {
      // lt
      expect(validate(
        {lt: 2}, 1.99
      )).toBe(true)

      // lt wrong
      expect(() => validate(
        {lt: 2}, 2
      )).toThrow(Error)
    })

    test('step', () => {
      // step
      expect(validate(
        {step: 5}, 25
      )).toBe(true)

      // step wrong
      expect(() => validate(
        {step: 5}, 25.01
      )).toThrow(Error)
    })

    test('int', () => {
      // int
      expect(validate(
        {int: true}, 3
      )).toBe(true)

      expect(validate(
        {int: false}, 3.01
      )).toBe(true)

      // int wrong
      expect(() => validate(
        {int: true}, 3.01
      )).toThrow(Error)
      expect(() => validate(
        {int: false}, 3
      )).toThrow(Error)
    })

    test('finite', () => {
      // finite
      expect(validate(
        {finite: true}, 3
      )).toBe(true)

      expect(validate(
        {finite: false}, Infinity
      )).toBe(true)

      // finite wrong
      expect(() => validate(
        {finite: true}, Infinity
      )).toThrow(Error)
      expect(() => validate(
        {finite: false}, 3
      )).toThrow(Error)
    })

    test('safeInt', () => {
      // safe
      expect(validate(
        {safeInt: true}, Number.MIN_SAFE_INTEGER
      )).toBe(true)
      expect(validate(
        {safeInt: true}, Number.MAX_SAFE_INTEGER
      )).toBe(true)

      expect(validate(
        {safeInt: false}, Number.MIN_SAFE_INTEGER - 1
      )).toBe(true)
      expect(validate(
        {safeInt: false}, Number.MAX_SAFE_INTEGER + 1
      )).toBe(true)

      // safe wrong
      expect(() => validate(
        {safeInt: true}, Number.MIN_SAFE_INTEGER - 1
      )).toThrow(Error)
      expect(() => validate(
        {safeInt: false}, 3
      )).toThrow(Error)
      expect(() => validate(
        {safeInt: false}, 0.1
      )).toThrow(Error)
    })
  })

  describe('string', () => {
    test('unsupported validation', () => {
      expect(() => validate(
        {finite: true}, 'text'
      )).toThrow(Error)
    })

    test('min', () => {
      // min
      expect(validate(
        {min: 2}, '12'
      )).toBe(true)

      // min wrong
      expect(() => validate(
        {min: 2}, '1'
      )).toThrow(Error)
    })

    test('max', () => {
      // max
      expect(validate(
        {max: 2}, '12'
      )).toBe(true)

      // max wrong
      expect(() => validate(
        {max: 2}, '123'
      )).toThrow(Error)
    })

    test('length', () => {
      // length
      expect(validate(
        {length: 2}, '12'
      )).toBe(true)

      // length wrong
      expect(() => validate(
        {length: 2}, '1'
      )).toThrow(Error)
    })

    test('startsWith', () => {
      // startsWith
      expect(validate(
        {startsWith: 'he'}, 'hello'
      )).toBe(true)

      // startsWith wrong
      expect(() => validate(
        {startsWith: 'he'}, 'bello'
      )).toThrow(Error)
    })

    test('endsWith', () => {
      // endsWith
      expect(validate(
        {endsWith: 'lo'}, 'hello'
      )).toBe(true)

      // endsWith wrong
      expect(() => validate(
        {endsWith: 'lo'}, 'hells'
      )).toThrow(Error)
    })

    test('includes', () => {
      // includes
      expect(validate(
        {includes: 'lo'}, 'hello'
      )).toBe(true)

      // includes wrong
      expect(() => validate(
        {includes: 'lo'}, 'hi'
      )).toThrow(Error)
    })

    test('excludes', () => {
      // excludes
      expect(validate(
        {excludes: 'lo'}, 'hi'
      )).toBe(true)

      // excludes wrong
      expect(() => validate(
        {excludes: 'lo'}, 'hello'
      )).toThrow(Error)
    })

    test('url', () => {
      // url
      expect(validate(
        {url: true}, 'https://github.com'
      )).toBe(true)
      expect(validate(
        {url: false}, '1234'
      )).toBe(true)

      // url wrong
      expect(() => validate(
        {url: true}, '1234'
      )).toThrow(Error)
      expect(() => validate(
        {url: false}, 'https://github.com'
      )).toThrow(Error)
    })

    test('pattern', () => {
      // pattern
      expect(validate(
        {pattern: /[a-z]/u}, 'text'
      )).toBe(true)

      // pattern wrong
      expect(() => validate(
        {pattern: /[a-z]/u}, '1'
      )).toThrow(Error)
    })

    test('ip', () => {
      // ip
      expect(validate(
        {ip: true}, '192.168.0.1'
      )).toBe(true)
      expect(validate(
        {ip: true}, '2001:db8::ff00:42:8329'
      )).toBe(true)
      expect(validate(
        {ip: false}, '1234'
      )).toBe(true)

      // ip wrong
      expect(() => validate(
        {ip: true}, '1234'
      )).toThrow(Error)
      expect(() => validate(
        {ip: true}, '1234'
      )).toThrow(Error)
      expect(() => validate(
        {ip: false}, '192.168.0.1'
      )).toThrow(Error)
      expect(() => validate(
        {ip: false}, '2001:db8::ff00:42:8329'
      )).toThrow(Error)
    })

    test('ipv4', () => {
      // ipv4
      expect(validate(
        {ipv4: true}, '192.168.0.1'
      )).toBe(true)
      expect(validate(
        {ipv4: false}, '1234'
      )).toBe(true)

      // ipv4 wrong
      expect(() => validate(
        {ipv4: true}, '1234'
      )).toThrow(Error)
      expect(() => validate(
        {ipv4: false}, '192.168.0.1'
      )).toThrow(Error)
    })

    test('ipv6', () => {
      // ipv6
      expect(validate(
        {ipv6: true}, '2001:db8::ff00:42:8329'
      )).toBe(true)
      expect(validate(
        {ipv6: false}, '1234'
      )).toBe(true)

      // ipv6 wrong
      expect(() => validate(
        {ipv6: true}, '1234'
      )).toThrow(Error)
      expect(() => validate(
        {ipv6: false}, '2001:db8::ff00:42:8329'
      )).toThrow(Error)
    })

    test('email', () => {
      // email
      expect(validate(
        {email: true}, 'name@email.com'
      )).toBe(true)
      expect(validate(
        {email: false}, 'name'
      )).toBe(true)

      // email wrong
      expect(() => validate(
        {email: true}, 'name'
      )).toThrow(Error)
      expect(() => validate(
        {email: false}, 'name@email.com'
      )).toThrow(Error)
    })

    test('cuid', () => {
      // cuid
      expect(validate(
        {cuid: true}, 'ch72gsb320000udocl363eofy'
      )).toBe(true)
      expect(validate(
        {cuid: false}, 'something'
      )).toBe(true)

      // cuid wrong
      expect(() => validate(
        {cuid: true}, 'something'
      )).toThrow(Error)
      expect(() => validate(
        {cuid: false}, 'ch72gsb320000udocl363eofy'
      )).toThrow(Error)
    })

    test('cuid2', () => {
      // cuid2
      expect(validate(
        {cuid2: true}, 'itp2u4ozr4'
      )).toBe(true)
      expect(validate(
        {cuid2: false}, '1234'
      )).toBe(true)

      // cuid2 wrong
      expect(() => validate(
        {cuid2: true}, '1234'
      )).toThrow(Error)
      expect(() => validate(
        {cuid2: false}, 'itp2u4ozr4'
      )).toThrow(Error)
    })

    test('ulid', () => {
      // ulid
      expect(validate(
        {ulid: true}, '01F8MECHZX3TBDSZ7XR8H8JHAF'
      )).toBe(true)
      expect(validate(
        {ulid: false}, 'something'
      )).toBe(true)

      // ulid wrong
      expect(() => validate(
        {ulid: true}, 'something'
      )).toThrow(Error)
      expect(() => validate(
        {ulid: false}, '01F8MECHZX3TBDSZ7XR8H8JHAF'
      )).toThrow(Error)
    })

    test('uuid', () => {
      // uuid
      expect(validate(
        {uuid: true}, '123e4567-e89b-12d3-a456-426614174000'
      )).toBe(true)
      expect(validate(
        {uuid: false}, 'something'
      )).toBe(true)

      // uuid wrong
      expect(() => validate(
        {uuid: true}, 'something'
      )).toThrow(Error)
      expect(() => validate(
        {uuid: false}, '123e4567-e89b-12d3-a456-426614174000'
      )).toThrow(Error)
    })
  })
})
