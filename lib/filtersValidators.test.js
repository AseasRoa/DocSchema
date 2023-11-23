import { filtersValidators } from './filtersValidators.js'

describe('filtersValidators', () => {
  describe('array', () => {
    test('unsupported validation', () => {
      expect(() => filtersValidators.array(
        {gte: 2}, [1, 2]
      )).toThrow(Error)
    })

    test('min', () => {
      // min
      expect(filtersValidators.array(
        {min: 2}, [1, 2]
      )).toBe(true)

      // min wrong
      expect(() => filtersValidators.array(
        {min: 2}, [1]
      )).toThrow(Error)
    })

    test('max', () => {
      // max
      expect(filtersValidators.array(
        {max: 2}, [1, 2]
      )).toBe(true)

      // max wrong
      expect(() => filtersValidators.array(
        {max: 2}, [1, 2, 3]
      )).toThrow(Error)
    })

    test('length', () => {
      // length
      expect(filtersValidators.array(
        {length: 2}, [1, 2]
      )).toBe(true)

      // length wrong
      expect(() => filtersValidators.array(
        {length: 2}, [1]
      )).toThrow(Error)
    })
  })

  describe('number', () => {
    test('unsupported validation', () => {
      expect(() => filtersValidators.number(
        {startsWith: '1'}, 123
      )).toThrow(Error)
    })

    test('min', () => {
      // min
      expect(filtersValidators.number(
        {min: 2}, 2
      )).toBe(true)

      // min wrong
      expect(() => filtersValidators.number(
        {min: 2}, 1.99
      )).toThrow(Error)
    })

    test('max', () => {
      // min
      expect(filtersValidators.number(
        {max: 2}, 2
      )).toBe(true)

      // min wrong
      expect(() => filtersValidators.number(
        {max: 2}, 2.01
      )).toThrow(Error)
    })

    test('gte', () => {
      // min
      expect(filtersValidators.number(
        {gte: 2}, 2
      )).toBe(true)

      // min wrong
      expect(() => filtersValidators.number(
        {gte: 2}, 1.99
      )).toThrow(Error)
    })

    test('lte', () => {
      // min
      expect(filtersValidators.number(
        {lte: 2}, 2
      )).toBe(true)

      // min wrong
      expect(() => filtersValidators.number(
        {lte: 2}, 2.01
      )).toThrow(Error)
    })

    test('gt', () => {
      // gt
      expect(filtersValidators.number(
        {gt: 2}, 2.01
      )).toBe(true)

      // gt wrong
      expect(() => filtersValidators.number(
        {gt: 2}, 2
      )).toThrow(Error)
    })

    test('lt', () => {
      // lt
      expect(filtersValidators.number(
        {lt: 2}, 1.99
      )).toBe(true)

      // lt wrong
      expect(() => filtersValidators.number(
        {lt: 2}, 2
      )).toThrow(Error)
    })

    test('step', () => {
      // step
      expect(filtersValidators.number(
        {step: 5}, 25
      )).toBe(true)

      // step wrong
      expect(() => filtersValidators.number(
        {step: 5}, 25.01
      )).toThrow(Error)
    })

    test('int', () => {
      // int
      expect(filtersValidators.number(
        {int: true}, 3
      )).toBe(true)

      expect(filtersValidators.number(
        {int: false}, 3.01
      )).toBe(true)

      // int wrong
      expect(() => filtersValidators.number(
        {int: true}, 3.01
      )).toThrow(Error)
      expect(() => filtersValidators.number(
        {int: false}, 3
      )).toThrow(Error)
    })

    test('finite', () => {
      // finite
      expect(filtersValidators.number(
        {finite: true}, 3
      )).toBe(true)

      expect(filtersValidators.number(
        {finite: false}, Infinity
      )).toBe(true)

      // finite wrong
      expect(() => filtersValidators.number(
        {finite: true}, Infinity
      )).toThrow(Error)
      expect(() => filtersValidators.number(
        {finite: false}, 3
      )).toThrow(Error)
    })

    test('safeInt', () => {
      // safe
      expect(filtersValidators.number(
        {safeInt: true}, Number.MIN_SAFE_INTEGER
      )).toBe(true)
      expect(filtersValidators.number(
        {safeInt: true}, Number.MAX_SAFE_INTEGER
      )).toBe(true)

      expect(filtersValidators.number(
        {safeInt: false}, Number.MIN_SAFE_INTEGER - 1
      )).toBe(true)
      expect(filtersValidators.number(
        {safeInt: false}, Number.MAX_SAFE_INTEGER + 1
      )).toBe(true)

      // safe wrong
      expect(() => filtersValidators.number(
        {safeInt: true}, Number.MIN_SAFE_INTEGER - 1
      )).toThrow(Error)
      expect(() => filtersValidators.number(
        {safeInt: false}, 3
      )).toThrow(Error)
      expect(() => filtersValidators.number(
        {safeInt: false}, 0.1
      )).toThrow(Error)
    })
  })

  describe('string', () => {
    test('unsupported validation', () => {
      expect(() => filtersValidators.string(
        {finite: true}, 'text'
      )).toThrow(Error)
    })

    test('min', () => {
      // min
      expect(filtersValidators.string(
        {min: 2}, '12'
      )).toBe(true)

      // min wrong
      expect(() => filtersValidators.string(
        {min: 2}, '1'
      )).toThrow(Error)
    })

    test('max', () => {
      // max
      expect(filtersValidators.string(
        {max: 2}, '12'
      )).toBe(true)

      // max wrong
      expect(() => filtersValidators.string(
        {max: 2}, '123'
      )).toThrow(Error)
    })

    test('length', () => {
      // length
      expect(filtersValidators.string(
        {length: 2}, '12'
      )).toBe(true)

      // length wrong
      expect(() => filtersValidators.string(
        {length: 2}, '1'
      )).toThrow(Error)
    })

    test('startsWith', () => {
      // startsWith
      expect(filtersValidators.string(
        {startsWith: 'he'}, 'hello'
      )).toBe(true)

      // startsWith wrong
      expect(() => filtersValidators.string(
        {startsWith: 'he'}, 'bello'
      )).toThrow(Error)
    })

    test('endsWith', () => {
      // endsWith
      expect(filtersValidators.string(
        {endsWith: 'lo'}, 'hello'
      )).toBe(true)

      // endsWith wrong
      expect(() => filtersValidators.string(
        {endsWith: 'lo'}, 'hells'
      )).toThrow(Error)
    })

    test('includes', () => {
      // includes
      expect(filtersValidators.string(
        {includes: 'lo'}, 'hello'
      )).toBe(true)

      // includes wrong
      expect(() => filtersValidators.string(
        {includes: 'lo'}, 'hi'
      )).toThrow(Error)
    })

    test('excludes', () => {
      // excludes
      expect(filtersValidators.string(
        {excludes: 'lo'}, 'hi'
      )).toBe(true)

      // excludes wrong
      expect(() => filtersValidators.string(
        {excludes: 'lo'}, 'hello'
      )).toThrow(Error)
    })

    test('url', () => {
      // url
      expect(filtersValidators.string(
        {url: true}, 'https://github.com'
      )).toBe(true)
      expect(filtersValidators.string(
        {url: false}, '1234'
      )).toBe(true)

      // url wrong
      expect(() => filtersValidators.string(
        {url: true}, '1234'
      )).toThrow(Error)
      expect(() => filtersValidators.string(
        {url: false}, 'https://github.com'
      )).toThrow(Error)
    })

    test('pattern', () => {
      // pattern
      expect(filtersValidators.string(
        {pattern: /[a-z]/u}, 'text'
      )).toBe(true)

      // pattern wrong
      expect(() => filtersValidators.string(
        {pattern: /[a-z]/u}, '1'
      )).toThrow(Error)
    })

    test('ip', () => {
      // ip
      expect(filtersValidators.string(
        {ip: true}, '192.168.0.1'
      )).toBe(true)
      expect(filtersValidators.string(
        {ip: true}, '2001:db8::ff00:42:8329'
      )).toBe(true)
      expect(filtersValidators.string(
        {ip: false}, '1234'
      )).toBe(true)

      // ip wrong
      expect(() => filtersValidators.string(
        {ip: true}, '1234'
      )).toThrow(Error)
      expect(() => filtersValidators.string(
        {ip: true}, '1234'
      )).toThrow(Error)
      expect(() => filtersValidators.string(
        {ip: false}, '192.168.0.1'
      )).toThrow(Error)
      expect(() => filtersValidators.string(
        {ip: false}, '2001:db8::ff00:42:8329'
      )).toThrow(Error)
    })

    test('ipv4', () => {
      // ipv4
      expect(filtersValidators.string(
        {ipv4: true}, '192.168.0.1'
      )).toBe(true)
      expect(filtersValidators.string(
        {ipv4: false}, '1234'
      )).toBe(true)

      // ipv4 wrong
      expect(() => filtersValidators.string(
        {ipv4: true}, '1234'
      )).toThrow(Error)
      expect(() => filtersValidators.string(
        {ipv4: false}, '192.168.0.1'
      )).toThrow(Error)
    })

    test('ipv6', () => {
      // ipv6
      expect(filtersValidators.string(
        {ipv6: true}, '2001:db8::ff00:42:8329'
      )).toBe(true)
      expect(filtersValidators.string(
        {ipv6: false}, '1234'
      )).toBe(true)

      // ipv6 wrong
      expect(() => filtersValidators.string(
        {ipv6: true}, '1234'
      )).toThrow(Error)
      expect(() => filtersValidators.string(
        {ipv6: false}, '2001:db8::ff00:42:8329'
      )).toThrow(Error)
    })

    test('email', () => {
      // email
      expect(filtersValidators.string(
        {email: true}, 'name@email.com'
      )).toBe(true)
      expect(filtersValidators.string(
        {email: false}, 'name'
      )).toBe(true)

      // email wrong
      expect(() => filtersValidators.string(
        {email: true}, 'name'
      )).toThrow(Error)
      expect(() => filtersValidators.string(
        {email: false}, 'name@email.com'
      )).toThrow(Error)
    })

    test('cuid', () => {
      // cuid
      expect(filtersValidators.string(
        {cuid: true}, 'ch72gsb320000udocl363eofy'
      )).toBe(true)
      expect(filtersValidators.string(
        {cuid: false}, 'something'
      )).toBe(true)

      // cuid wrong
      expect(() => filtersValidators.string(
        {cuid: true}, 'something'
      )).toThrow(Error)
      expect(() => filtersValidators.string(
        {cuid: false}, 'ch72gsb320000udocl363eofy'
      )).toThrow(Error)
    })

    test('cuid2', () => {
      // cuid2
      expect(filtersValidators.string(
        {cuid2: true}, 'itp2u4ozr4'
      )).toBe(true)
      expect(filtersValidators.string(
        {cuid2: false}, '1234'
      )).toBe(true)

      // cuid2 wrong
      expect(() => filtersValidators.string(
        {cuid2: true}, '1234'
      )).toThrow(Error)
      expect(() => filtersValidators.string(
        {cuid2: false}, 'itp2u4ozr4'
      )).toThrow(Error)
    })

    test('ulid', () => {
      // ulid
      expect(filtersValidators.string(
        {ulid: true}, '01F8MECHZX3TBDSZ7XR8H8JHAF'
      )).toBe(true)
      expect(filtersValidators.string(
        {ulid: false}, 'something'
      )).toBe(true)

      // ulid wrong
      expect(() => filtersValidators.string(
        {ulid: true}, 'something'
      )).toThrow(Error)
      expect(() => filtersValidators.string(
        {ulid: false}, '01F8MECHZX3TBDSZ7XR8H8JHAF'
      )).toThrow(Error)
    })

    test('uuid', () => {
      // uuid
      expect(filtersValidators.string(
        {uuid: true}, '123e4567-e89b-12d3-a456-426614174000'
      )).toBe(true)
      expect(filtersValidators.string(
        {uuid: false}, 'something'
      )).toBe(true)

      // uuid wrong
      expect(() => filtersValidators.string(
        {uuid: true}, 'something'
      )).toThrow(Error)
      expect(() => filtersValidators.string(
        {uuid: false}, '123e4567-e89b-12d3-a456-426614174000'
      )).toThrow(Error)
    })
  })
})
