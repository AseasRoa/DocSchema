import Benchmark from 'benchmark'
import { cycleCallback } from './functions.js'
import { filtersValidators } from '../lib/filtersValidators.js'

const validatorSuite = new Benchmark.Suite('DocSchemaValidator')

validatorSuite
  .add('invalid: array unsupported validation', () => {
    try {
      filtersValidators.array({gte: 2}, [1, 2])
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: array min', () => {
    filtersValidators.array({min: 2}, [1, 2])
  })
  .add('invalid: array min', () => {
    try {
      filtersValidators.array({min: 2}, [1])
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: array max', () => {
    filtersValidators.array({max: 2}, [1, 2])
  })
  .add('invalid: array max', () => {
    try {
      filtersValidators.array({max: 2}, [1, 2, 3])
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: array length', () => {
    filtersValidators.array({length: 2}, [1, 2])
  })
  .add('invalid: array length', () => {
    try {
      filtersValidators.array({length: 2}, [1])
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: number min', () => {
    filtersValidators.number({length: 2}, 2)
  })
  .add('invalid: number min', () => {
    try {
      filtersValidators.number({length: 2}, 1.99)
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: number int', () => {
    filtersValidators.number({int: true}, 3)
  })
  .add('invalid: number int', () => {
    try {
      filtersValidators.number({int: false}, 3.01)
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string min', () => {
    filtersValidators.string({min: 2}, '12')
  })
  .add('invalid: string min', () => {
    try {
      filtersValidators.string({min: 2}, '1')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string startsWith', () => {
    filtersValidators.string({startsWith: 'he'}, 'hello')
  })
  .add('invalid: string startsWith', () => {
    try {
      filtersValidators.string({startsWith: 'he'}, 'bello')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string endsWith', () => {
    filtersValidators.string({endsWith: 'lo'}, 'hello')
  })
  .add('invalid: string endsWith', () => {
    try {
      filtersValidators.string({endsWith: 'lo'}, 'hells')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string includes', () => {
    filtersValidators.string({includes: 'lo'}, 'hello')
  })
  .add('invalid: string includes', () => {
    try {
      filtersValidators.string({includes: 'lo'}, 'hi')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string url', () => {
    filtersValidators.string({url: true}, 'https://github.com')
  })
  .add('invalid: string url', () => {
    try {
      filtersValidators.string({url: true}, '1234')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string pattern', () => {
    filtersValidators.string({pattern: /[a-z]/u}, 'text')
  })
  .add('invalid: string pattern', () => {
    try {
      filtersValidators.string({pattern: /[a-z]/u}, '1')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string ip', () => {
    filtersValidators.string({ip: true}, '192.168.0.1')
  })
  .add('invalid: string ip', () => {
    try {
      filtersValidators.string({ip: true}, '1234')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string ipv4', () => {
    filtersValidators.string({ipv4: true}, '192.168.0.1')
  })
  .add('invalid: string ipv4', () => {
    try {
      filtersValidators.string({ipv4: true}, '1234')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string ipv6', () => {
    filtersValidators.string({ipv6: true}, '2001:db8::ff00:42:8329')
  })
  .add('invalid: string ipv6', () => {
    try {
      filtersValidators.string({ipv6: true}, '1234')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string email', () => {
    filtersValidators.string({email: true}, 'name@email.com')
  })
  .add('invalid: string email', () => {
    try {
      filtersValidators.string({email: true}, 'name')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string cuid', () => {
    filtersValidators.string({cuid: true}, 'ch72gsb320000udocl363eofy')
  })
  .add('invalid: string cuid', () => {
    try {
      filtersValidators.string({cuid: true}, 'something')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string cuid2', () => {
    filtersValidators.string({cuid2: true}, 'itp2u4ozr4')
  })
  .add('invalid: string cuid2', () => {
    try {
      filtersValidators.string({cuid2: true}, '1234')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string ulid', () => {
    filtersValidators.string({ulid: true}, '01F8MECHZX3TBDSZ7XR8H8JHAF')
  })
  .add('invalid: string ulid', () => {
    try {
      filtersValidators.string({ulid: true}, 'something')
    }
    catch (e) {
    // nothing
    }
  })
  .add('valid: string uuid', () => {
    filtersValidators.string({uuid: true}, '123e4567-e89b-12d3-a456-426614174000')
  })
  .add('invalid: string uuid', () => {
    try {
      filtersValidators.string({uuid: true}, 'something')
    }
    catch (e) {
    // nothing
    }
  })
  .on('cycle',cycleCallback)

export default { suites: [ validatorSuite ] }
