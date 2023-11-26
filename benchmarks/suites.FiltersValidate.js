import Benchmark from 'benchmark'
import { cycleCallback } from './functions.js'
import { check } from '../lib/parse-check-filters/check.js'

const suiteFiltersValidate = new Benchmark.Suite('Filters Validate')

suiteFiltersValidate
  .add('array unsupported validation', () => {
    try {
      check({ gte: [2, ''] }, [1, 2])
    }
    catch (e) {
      // nothing
    }
  })
  .add('array min --- valid', () => {
    check({ min: [2, ''] }, [1, 2])
  })
  .add('array min - invalid', () => {
    check({ min: [2, ''] }, [1])
  })
  .add('array max --- valid', () => {
    check({ max: [2, ''] }, [1, 2])
  })
  .add('array max - invalid', () => {
    check({ max: [2, ''] }, [1, 2, 3])
  })
  .add('array length --- valid', () => {
    check({ length: [2, ''] }, [1, 2])
  })
  .add('array length - invalid', () => {
    check({ length: [2, ''] }, [1])
  })
  .add('number min --- valid', () => {
    check({ min: [2, ''] }, 2)
  })
  .add('number min - invalid', () => {
    check({ min: [2, ''] }, 1.99)
  })
  .add('number int --- valid', () => {
    check({ int: [true, ''] }, 3)
  })
  .add('number int - invalid', () => {
    check({ int: [false, ''] }, 3.01)
  })
  .add('string min --- valid', () => {
    check({ min: [2, ''] }, '12')
  })
  .add('string min - invalid', () => {
    check({ min: [2, ''] }, '1')
  })
  .add('string startsWith --- valid', () => {
    check({ startsWith: ['he', ''] }, 'hello')
  })
  .add('string startsWith - invalid', () => {
    check({ startsWith: ['he', ''] }, 'bello')
  })
  .add('string endsWith --- valid', () => {
    check({ endsWith: ['lo', ''] }, 'hello')
  })
  .add('string endsWith - invalid', () => {
    check({ endsWith: ['lo', ''] }, 'hells')
  })
  .add('string includes --- valid', () => {
    check({ includes: ['lo', ''] }, 'hello')
  })
  .add('string includes - invalid', () => {
    check({ includes: ['lo', ''] }, 'hi')
  })
  .add('string url --- valid', () => {
    check({ url: [true, ''] }, 'https://github.com')
  })
  .add('string url - invalid', () => {
    check({ url: [true, ''] }, '1234')
  })
  .add('string pattern --- valid', () => {
    check({ pattern: [/[a-z]/u, ''] }, 'text')
  })
  .add('string pattern - invalid', () => {
    check({ pattern: [/[a-z]/u, ''] }, '1')
  })
  .add('string ip --- valid', () => {
    check({ ip: [true, ''] }, '192.168.0.1')
  })
  .add('string ip - invalid', () => {
    check({ ip: [true, ''] }, '1234')
  })
  .add('string ipv4 --- valid', () => {
    check({ ipv4: [true, ''] }, '192.168.0.1')
  })
  .add('string ipv4 - invalid', () => {
    check({ ipv4: [true, ''] }, '1234')
  })
  .add('string ipv6 --- valid', () => {
    check({ ipv6: [true, ''] }, '2001:db8::ff00:42:8329')
  })
  .add('string ipv6 - invalid', () => {
    check({ ipv6: [true, ''] }, '1234')
  })
  .add('string email --- valid', () => {
    check({ email: [true, ''] }, 'name@email.com')
  })
  .add('string email - invalid', () => {
    check({ email: [true, ''] }, 'name')
  })
  .add('string cuid --- valid', () => {
    check({ cuid: [true, ''] }, 'ch72gsb320000udocl363eofy')
  })
  .add('string cuid - invalid', () => {
    check({ cuid: [true, ''] }, 'something')
  })
  .add('string cuid2 --- valid', () => {
    check({ cuid2: [true, ''] }, 'itp2u4ozr4')
  })
  .add('string cuid2 - invalid', () => {
    check({ cuid2: [true, ''] }, '1234')
  })
  .add('string ulid --- valid', () => {
    check({ ulid: [true, ''] }, '01F8MECHZX3TBDSZ7XR8H8JHAF')
  })
  .add('string ulid - invalid', () => {
    check({ ulid: [true, ''] }, 'something')
  })
  .add('string uuid --- valid', () => {
    check({ uuid: [true, ''] }, '123e4567-e89b-12d3-a456-426614174000')
  })
  .add('string uuid - invalid', () => {
    check({ uuid: [true, ''] }, 'something')
  })
  .on('cycle',cycleCallback)

export { suiteFiltersValidate }
