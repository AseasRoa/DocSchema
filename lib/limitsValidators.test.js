import { limitsValidators } from './limitsValidators.js'

describe('limitsValidators', () => {
  describe('array', () => {
    test('unsupported validation', () => {
      expect(() => limitsValidators.array(
        {gte: 2}, [1, 2]
      )).toThrow(Error)
    })

    test('min', () => {
      // min
      expect(limitsValidators.array(
        {min: 2}, [1, 2]
      )).toBe(true)

      // min wrong
      expect(() => limitsValidators.array(
        {min: 2}, [1]
      )).toThrow(Error)
    })

    test('max', () => {
      // max
      expect(limitsValidators.array(
        {max: 2}, [1, 2]
      )).toBe(true)

      // max wrong
      expect(() => limitsValidators.array(
        {max: 2}, [1, 2, 3]
      )).toThrow(Error)
    })

    test('length', () => {
      // length
      expect(limitsValidators.array(
        {length: 2}, [1, 2]
      )).toBe(true)

      // length wrong
      expect(() => limitsValidators.array(
        {length: 2}, [1]
      )).toThrow(Error)
    })
  })

  describe('number', () => {
    test('unsupported validation', () => {
      expect(() => limitsValidators.number(
        {startsWith: '1'}, 123
      )).toThrow(Error)
    })

    test('min', () => {
      // min
      expect(limitsValidators.number(
        {min: 2}, 2
      )).toBe(true)

      // min wrong
      expect(() => limitsValidators.number(
        {min: 2}, 1.99
      )).toThrow(Error)
    })

    test('max', () => {
      // min
      expect(limitsValidators.number(
        {max: 2}, 2
      )).toBe(true)

      // min wrong
      expect(() => limitsValidators.number(
        {max: 2}, 2.01
      )).toThrow(Error)
    })

    test('gte', () => {
      // min
      expect(limitsValidators.number(
        {gte: 2}, 2
      )).toBe(true)

      // min wrong
      expect(() => limitsValidators.number(
        {gte: 2}, 1.99
      )).toThrow(Error)
    })

    test('lte', () => {
      // min
      expect(limitsValidators.number(
        {lte: 2}, 2
      )).toBe(true)

      // min wrong
      expect(() => limitsValidators.number(
        {lte: 2}, 2.01
      )).toThrow(Error)
    })

    test('gt', () => {
      // gt
      expect(limitsValidators.number(
        {gt: 2}, 2.01
      )).toBe(true)

      // gt wrong
      expect(() => limitsValidators.number(
        {gt: 2}, 2
      )).toThrow(Error)
    })

    test('lt', () => {
      // lt
      expect(limitsValidators.number(
        {lt: 2}, 1.99
      )).toBe(true)

      // lt wrong
      expect(() => limitsValidators.number(
        {lt: 2}, 2
      )).toThrow(Error)
    })

    test('step', () => {
      // step
      expect(limitsValidators.number(
        {step: 5}, 25
      )).toBe(true)

      // step wrong
      expect(() => limitsValidators.number(
        {step: 5}, 25.01
      )).toThrow(Error)
    })

    test('int', () => {
      // int
      expect(limitsValidators.number(
        {int: true}, 3
      )).toBe(true)

      expect(limitsValidators.number(
        {int: false}, 3.01
      )).toBe(true)

      // int wrong
      expect(() => limitsValidators.number(
        {int: true}, 3.01
      )).toThrow(Error)
      expect(() => limitsValidators.number(
        {int: false}, 3
      )).toThrow(Error)
    })

    test('finite', () => {
      // finite
      expect(limitsValidators.number(
        {finite: true}, 3
      )).toBe(true)

      expect(limitsValidators.number(
        {finite: false}, Infinity
      )).toBe(true)

      // finite wrong
      expect(() => limitsValidators.number(
        {finite: true}, Infinity
      )).toThrow(Error)
      expect(() => limitsValidators.number(
        {finite: false}, 3
      )).toThrow(Error)
    })

    test('safeInt', () => {
      // safe
      expect(limitsValidators.number(
        {safeInt: true}, Number.MIN_SAFE_INTEGER
      )).toBe(true)
      expect(limitsValidators.number(
        {safeInt: true}, Number.MAX_SAFE_INTEGER
      )).toBe(true)

      expect(limitsValidators.number(
        {safeInt: false}, Number.MIN_SAFE_INTEGER - 1
      )).toBe(true)
      expect(limitsValidators.number(
        {safeInt: false}, Number.MAX_SAFE_INTEGER + 1
      )).toBe(true)

      // safe wrong
      expect(() => limitsValidators.number(
        {safeInt: true}, Number.MIN_SAFE_INTEGER - 1
      )).toThrow(Error)
      expect(() => limitsValidators.number(
        {safeInt: false}, 3
      )).toThrow(Error)
      expect(() => limitsValidators.number(
        {safeInt: false}, 0.1
      )).toThrow(Error)
    })
  })

  describe('string', () => {
    test('unsupported validation', () => {
      expect(() => limitsValidators.string(
        {finite: true}, 'text'
      )).toThrow(Error)
    })

    test('min', () => {
      // min
      expect(limitsValidators.string(
        {min: 2}, '12'
      )).toBe(true)

      // min wrong
      expect(() => limitsValidators.string(
        {min: 2}, '1'
      )).toThrow(Error)
    })

    test('max', () => {
      // max
      expect(limitsValidators.string(
        {max: 2}, '12'
      )).toBe(true)

      // max wrong
      expect(() => limitsValidators.string(
        {max: 2}, '123'
      )).toThrow(Error)
    })

    test('length', () => {
      // length
      expect(limitsValidators.string(
        {length: 2}, '12'
      )).toBe(true)

      // length wrong
      expect(() => limitsValidators.string(
        {length: 2}, '1'
      )).toThrow(Error)
    })

    test('startsWith', () => {
      // startsWith
      expect(limitsValidators.string(
        {startsWith: 'he'}, 'hello'
      )).toBe(true)

      // startsWith wrong
      expect(() => limitsValidators.string(
        {startsWith: 'he'}, 'bello'
      )).toThrow(Error)
    })

    test('endsWith', () => {
      // endsWith
      expect(limitsValidators.string(
        {endsWith: 'lo'}, 'hello'
      )).toBe(true)

      // endsWith wrong
      expect(() => limitsValidators.string(
        {endsWith: 'lo'}, 'hells'
      )).toThrow(Error)
    })

    test('includes', () => {
      // includes
      expect(limitsValidators.string(
        {includes: 'lo'}, 'hello'
      )).toBe(true)

      // includes wrong
      expect(() => limitsValidators.string(
        {includes: 'lo'}, 'hi'
      )).toThrow(Error)
    })

    test('excludes', () => {
      // excludes
      expect(limitsValidators.string(
        {excludes: 'lo'}, 'hi'
      )).toBe(true)

      // excludes wrong
      expect(() => limitsValidators.string(
        {excludes: 'lo'}, 'hello'
      )).toThrow(Error)
    })

    test('url', () => {
      // url
      expect(limitsValidators.string(
        {url: true}, 'https://github.com'
      )).toBe(true)
      expect(limitsValidators.string(
        {url: false}, '1234'
      )).toBe(true)

      // url wrong
      expect(() => limitsValidators.string(
        {url: true}, '1234'
      )).toThrow(Error)
      expect(() => limitsValidators.string(
        {url: false}, 'https://github.com'
      )).toThrow(Error)
    })

    test('pattern', () => {
      // pattern
      expect(limitsValidators.string(
        {pattern: /[a-z]/u}, 'text'
      )).toBe(true)

      // pattern wrong
      expect(() => limitsValidators.string(
        {pattern: /[a-z]/u}, '1'
      )).toThrow(Error)
    })

    test('ip', () => {
      // ip
      expect(limitsValidators.string(
        {ip: true}, '192.168.0.1'
      )).toBe(true)
      expect(limitsValidators.string(
        {ip: true}, '2001:db8::ff00:42:8329'
      )).toBe(true)
      expect(limitsValidators.string(
        {ip: false}, '1234'
      )).toBe(true)

      // ip wrong
      expect(() => limitsValidators.string(
        {ip: true}, '1234'
      )).toThrow(Error)
      expect(() => limitsValidators.string(
        {ip: true}, '1234'
      )).toThrow(Error)
      expect(() => limitsValidators.string(
        {ip: false}, '192.168.0.1'
      )).toThrow(Error)
      expect(() => limitsValidators.string(
        {ip: false}, '2001:db8::ff00:42:8329'
      )).toThrow(Error)
    })

    test('ipv4', () => {
      // ipv4
      expect(limitsValidators.string(
        {ipv4: true}, '192.168.0.1'
      )).toBe(true)
      expect(limitsValidators.string(
        {ipv4: false}, '1234'
      )).toBe(true)

      // ipv4 wrong
      expect(() => limitsValidators.string(
        {ipv4: true}, '1234'
      )).toThrow(Error)
      expect(() => limitsValidators.string(
        {ipv4: false}, '192.168.0.1'
      )).toThrow(Error)
    })

    test('ipv6', () => {
      // ipv6
      expect(limitsValidators.string(
        {ipv6: true}, '2001:db8::ff00:42:8329'
      )).toBe(true)
      expect(limitsValidators.string(
        {ipv6: false}, '1234'
      )).toBe(true)

      // ipv6 wrong
      expect(() => limitsValidators.string(
        {ipv6: true}, '1234'
      )).toThrow(Error)
      expect(() => limitsValidators.string(
        {ipv6: false}, '2001:db8::ff00:42:8329'
      )).toThrow(Error)
    })

    test('email', () => {
      // email
      expect(limitsValidators.string(
        {email: true}, 'name@email.com'
      )).toBe(true)
      expect(limitsValidators.string(
        {email: false}, 'name'
      )).toBe(true)

      // email wrong
      expect(() => limitsValidators.string(
        {email: true}, 'name'
      )).toThrow(Error)
      expect(() => limitsValidators.string(
        {email: false}, 'name@email.com'
      )).toThrow(Error)
    })

    test('cuid', () => {
      // cuid
      expect(limitsValidators.string(
        {cuid: true}, 'ch72gsb320000udocl363eofy'
      )).toBe(true)
      expect(limitsValidators.string(
        {cuid: false}, 'something'
      )).toBe(true)

      // cuid wrong
      expect(() => limitsValidators.string(
        {cuid: true}, 'something'
      )).toThrow(Error)
      expect(() => limitsValidators.string(
        {cuid: false}, 'ch72gsb320000udocl363eofy'
      )).toThrow(Error)
    })

    test('cuid2', () => {
      // cuid2
      expect(limitsValidators.string(
        {cuid2: true}, 'itp2u4ozr4'
      )).toBe(true)
      expect(limitsValidators.string(
        {cuid2: false}, '1234'
      )).toBe(true)

      // cuid2 wrong
      expect(() => limitsValidators.string(
        {cuid2: true}, '1234'
      )).toThrow(Error)
      expect(() => limitsValidators.string(
        {cuid2: false}, 'itp2u4ozr4'
      )).toThrow(Error)
    })

    test('ulid', () => {
      // ulid
      expect(limitsValidators.string(
        {ulid: true}, '01F8MECHZX3TBDSZ7XR8H8JHAF'
      )).toBe(true)
      expect(limitsValidators.string(
        {ulid: false}, 'something'
      )).toBe(true)

      // ulid wrong
      expect(() => limitsValidators.string(
        {ulid: true}, 'something'
      )).toThrow(Error)
      expect(() => limitsValidators.string(
        {ulid: false}, '01F8MECHZX3TBDSZ7XR8H8JHAF'
      )).toThrow(Error)
    })

    test('uuid', () => {
      // uuid
      expect(limitsValidators.string(
        {uuid: true}, '123e4567-e89b-12d3-a456-426614174000'
      )).toBe(true)
      expect(limitsValidators.string(
        {uuid: false}, 'something'
      )).toBe(true)

      // uuid wrong
      expect(() => limitsValidators.string(
        {uuid: true}, 'something'
      )).toThrow(Error)
      expect(() => limitsValidators.string(
        {uuid: false}, '123e4567-e89b-12d3-a456-426614174000'
      )).toThrow(Error)
    })
  })
})
