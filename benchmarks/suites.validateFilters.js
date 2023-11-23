import Benchmark from 'benchmark'
import { cycleCallback } from './functions.js'
import { validate } from '../lib/parse-validate-filters/validate.js'

const validatorSuite = new Benchmark.Suite('DocSchemaValidator')

validatorSuite
  .add('invalid: array unsupported validation', () => {
    try {
      validate({gte: 2}, [1, 2])
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: array min', () => {
    validate({min: 2}, [1, 2])
  })
  .add('invalid: array min', () => {
    try {
      validate({min: 2}, [1])
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: array max', () => {
    validate({max: 2}, [1, 2])
  })
  .add('invalid: array max', () => {
    try {
      validate({max: 2}, [1, 2, 3])
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: array length', () => {
    validate({length: 2}, [1, 2])
  })
  .add('invalid: array length', () => {
    try {
      validate({length: 2}, [1])
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: number min', () => {
    validate({length: 2}, 2)
  })
  .add('invalid: number min', () => {
    try {
      validate({length: 2}, 1.99)
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: number int', () => {
    validate({int: true}, 3)
  })
  .add('invalid: number int', () => {
    try {
      validate({int: false}, 3.01)
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string min', () => {
    validate({min: 2}, '12')
  })
  .add('invalid: string min', () => {
    try {
      validate({min: 2}, '1')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string startsWith', () => {
    validate({startsWith: 'he'}, 'hello')
  })
  .add('invalid: string startsWith', () => {
    try {
      validate({startsWith: 'he'}, 'bello')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string endsWith', () => {
    validate({endsWith: 'lo'}, 'hello')
  })
  .add('invalid: string endsWith', () => {
    try {
      validate({endsWith: 'lo'}, 'hells')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string includes', () => {
    validate({includes: 'lo'}, 'hello')
  })
  .add('invalid: string includes', () => {
    try {
      validate({includes: 'lo'}, 'hi')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string url', () => {
    validate({url: true}, 'https://github.com')
  })
  .add('invalid: string url', () => {
    try {
      validate({url: true}, '1234')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string pattern', () => {
    validate({pattern: /[a-z]/u}, 'text')
  })
  .add('invalid: string pattern', () => {
    try {
      validate({pattern: /[a-z]/u}, '1')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string ip', () => {
    validate({ip: true}, '192.168.0.1')
  })
  .add('invalid: string ip', () => {
    try {
      validate({ip: true}, '1234')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string ipv4', () => {
    validate({ipv4: true}, '192.168.0.1')
  })
  .add('invalid: string ipv4', () => {
    try {
      validate({ipv4: true}, '1234')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string ipv6', () => {
    validate({ipv6: true}, '2001:db8::ff00:42:8329')
  })
  .add('invalid: string ipv6', () => {
    try {
      validate({ipv6: true}, '1234')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string email', () => {
    validate({email: true}, 'name@email.com')
  })
  .add('invalid: string email', () => {
    try {
      validate({email: true}, 'name')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string cuid', () => {
    validate({cuid: true}, 'ch72gsb320000udocl363eofy')
  })
  .add('invalid: string cuid', () => {
    try {
      validate({cuid: true}, 'something')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string cuid2', () => {
    validate({cuid2: true}, 'itp2u4ozr4')
  })
  .add('invalid: string cuid2', () => {
    try {
      validate({cuid2: true}, '1234')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string ulid', () => {
    validate({ulid: true}, '01F8MECHZX3TBDSZ7XR8H8JHAF')
  })
  .add('invalid: string ulid', () => {
    try {
      validate({ulid: true}, 'something')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string uuid', () => {
    validate({uuid: true}, '123e4567-e89b-12d3-a456-426614174000')
  })
  .add('invalid: string uuid', () => {
    try {
      validate({uuid: true}, 'something')
    }
    catch (e) {
    // nothing
    }
  })
  .on('cycle',cycleCallback)

export default { suites: [ validatorSuite ] }
