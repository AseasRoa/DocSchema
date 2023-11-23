import Benchmark from 'benchmark'
import { cycleCallback } from './functions.js'
import { validate } from '../lib/parse-validate-filters/validate.js'

const suiteFiltersValidate = new Benchmark.Suite('Filters Validate')

suiteFiltersValidate
  .add('array unsupported validation', () => {
    try {
      validate({gte: 2}, [1, 2])
    }
    catch (e) {
      // nothing
    }
  })
  .add('array min --- valid', () => {
    validate({min: 2}, [1, 2])
  })
  .add('array min - invalid', () => {
    try {
      validate({min: 2}, [1])
    }
    catch (e) {
      // nothing
    }
  })
  .add('array max --- valid', () => {
    validate({max: 2}, [1, 2])
  })
  .add('array max - invalid', () => {
    try {
      validate({max: 2}, [1, 2, 3])
    }
    catch (e) {
      // nothing
    }
  })
  .add('array length --- valid', () => {
    validate({length: 2}, [1, 2])
  })
  .add('array length - invalid', () => {
    try {
      validate({length: 2}, [1])
    }
    catch (e) {
      // nothing
    }
  })
  .add('number min --- valid', () => {
    validate({min: 2}, 2)
  })
  .add('number min - invalid', () => {
    try {
      validate({min: 2}, 1.99)
    }
    catch (e) {
      // nothing
    }
  })
  .add('number int --- valid', () => {
    validate({int: true}, 3)
  })
  .add('number int - invalid', () => {
    try {
      validate({int: false}, 3.01)
    }
    catch (e) {
      // nothing
    }
  })
  .add('string min --- valid', () => {
    validate({min: 2}, '12')
  })
  .add('string min - invalid', () => {
    try {
      validate({min: 2}, '1')
    }
    catch (e) {
      // nothing
    }
  })
  .add('string startsWith --- valid', () => {
    validate({startsWith: 'he'}, 'hello')
  })
  .add('string startsWith - invalid', () => {
    try {
      validate({startsWith: 'he'}, 'bello')
    }
    catch (e) {
      // nothing
    }
  })
  .add('string endsWith --- valid', () => {
    validate({endsWith: 'lo'}, 'hello')
  })
  .add('string endsWith - invalid', () => {
    try {
      validate({endsWith: 'lo'}, 'hells')
    }
    catch (e) {
      // nothing
    }
  })
  .add('string includes --- valid', () => {
    validate({includes: 'lo'}, 'hello')
  })
  .add('string includes - invalid', () => {
    try {
      validate({includes: 'lo'}, 'hi')
    }
    catch (e) {
      // nothing
    }
  })
  .add('string url --- valid', () => {
    validate({url: true}, 'https://github.com')
  })
  .add('string url - invalid', () => {
    try {
      validate({url: true}, '1234')
    }
    catch (e) {
      // nothing
    }
  })
  .add('string pattern --- valid', () => {
    validate({pattern: /[a-z]/u}, 'text')
  })
  .add('string pattern - invalid', () => {
    try {
      validate({pattern: /[a-z]/u}, '1')
    }
    catch (e) {
      // nothing
    }
  })
  .add('string ip --- valid', () => {
    validate({ip: true}, '192.168.0.1')
  })
  .add('string ip - invalid', () => {
    try {
      validate({ip: true}, '1234')
    }
    catch (e) {
      // nothing
    }
  })
  .add('string ipv4 --- valid', () => {
    validate({ipv4: true}, '192.168.0.1')
  })
  .add('string ipv4 - invalid', () => {
    try {
      validate({ipv4: true}, '1234')
    }
    catch (e) {
      // nothing
    }
  })
  .add('string ipv6 --- valid', () => {
    validate({ipv6: true}, '2001:db8::ff00:42:8329')
  })
  .add('string ipv6 - invalid', () => {
    try {
      validate({ipv6: true}, '1234')
    }
    catch (e) {
      // nothing
    }
  })
  .add('string email --- valid', () => {
    validate({email: true}, 'name@email.com')
  })
  .add('string email - invalid', () => {
    try {
      validate({email: true}, 'name')
    }
    catch (e) {
      // nothing
    }
  })
  .add('string cuid --- valid', () => {
    validate({cuid: true}, 'ch72gsb320000udocl363eofy')
  })
  .add('string cuid - invalid', () => {
    try {
      validate({cuid: true}, 'something')
    }
    catch (e) {
      // nothing
    }
  })
  .add('string cuid2 --- valid', () => {
    validate({cuid2: true}, 'itp2u4ozr4')
  })
  .add('string cuid2 - invalid', () => {
    try {
      validate({cuid2: true}, '1234')
    }
    catch (e) {
      // nothing
    }
  })
  .add('string ulid --- valid', () => {
    validate({ulid: true}, '01F8MECHZX3TBDSZ7XR8H8JHAF')
  })
  .add('string ulid - invalid', () => {
    try {
      validate({ulid: true}, 'something')
    }
    catch (e) {
      // nothing
    }
  })
  .add('string uuid --- valid', () => {
    validate({uuid: true}, '123e4567-e89b-12d3-a456-426614174000')
  })
  .add('string uuid - invalid', () => {
    try {
      validate({uuid: true}, 'something')
    }
    catch (e) {
      // nothing
    }
  })
  .on('cycle',cycleCallback)

export { suiteFiltersValidate }
