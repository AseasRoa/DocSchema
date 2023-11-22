import Benchmark from 'benchmark'
import { cycleCallback } from './functions.js'
import { limitsValidators } from '../src/limitsValidators.js'

const validatorSuite = new Benchmark.Suite('DocSchemaValidator')

validatorSuite
.add('invalid: array unsupported validation', () => {
  try {
    limitsValidators.array({gte: 2}, [1, 2])
  }
  catch (e) {
    // nothing
  }
})
.add('valid: array min', () => {
  limitsValidators.array({min: 2}, [1, 2])
})
.add('invalid: array min', () => {
  try {
    limitsValidators.array({min: 2}, [1])
  }
  catch (e) {
    // nothing
  }
})
.add('valid: array max', () => {
  limitsValidators.array({max: 2}, [1, 2])
})
.add('invalid: array max', () => {
  try {
    limitsValidators.array({max: 2}, [1, 2, 3])
  }
  catch (e) {
    // nothing
  }
})
.add('valid: array length', () => {
  limitsValidators.array({length: 2}, [1, 2])
})
.add('invalid: array length', () => {
  try {
    limitsValidators.array({length: 2}, [1])
  }
  catch (e) {
    // nothing
  }
})
.add('valid: number min', () => {
  limitsValidators.number({length: 2}, 2)
})
.add('invalid: number min', () => {
  try {
    limitsValidators.number({length: 2}, 1.99)
  }
  catch (e) {
    // nothing
  }
})
.add('valid: number int', () => {
  limitsValidators.number({int: true}, 3)
})
.add('invalid: number int', () => {
  try {
    limitsValidators.number({int: false}, 3.01)
  }
  catch (e) {
    // nothing
  }
})
.add('valid: string min', () => {
  limitsValidators.string({min: 2}, '12')
})
.add('invalid: string min', () => {
  try {
    limitsValidators.string({min: 2}, '1')
  }
  catch (e) {
    // nothing
  }
})
.add('valid: string startsWith', () => {
  limitsValidators.string({startsWith: 'he'}, 'hello')
})
.add('invalid: string startsWith', () => {
  try {
    limitsValidators.string({startsWith: 'he'}, 'bello')
  }
  catch (e) {
    // nothing
  }
})
.add('valid: string endsWith', () => {
  limitsValidators.string({endsWith: 'lo'}, 'hello')
})
.add('invalid: string endsWith', () => {
  try {
    limitsValidators.string({endsWith: 'lo'}, 'hells')
  }
  catch (e) {
    // nothing
  }
})
.add('valid: string includes', () => {
  limitsValidators.string({includes: 'lo'}, 'hello')
})
.add('invalid: string includes', () => {
  try {
    limitsValidators.string({includes: 'lo'}, 'hi')
  }
  catch (e) {
    // nothing
  }
})
.add('valid: string url', () => {
  limitsValidators.string({url: true}, 'https://github.com')
})
.add('invalid: string url', () => {
  try {
    limitsValidators.string({url: true}, '1234')
  }
  catch (e) {
    // nothing
  }
})
.add('valid: string pattern', () => {
  limitsValidators.string({pattern: /[a-z]/u}, 'text')
})
.add('invalid: string pattern', () => {
  try {
    limitsValidators.string({pattern: /[a-z]/u}, '1')
  }
  catch (e) {
    // nothing
  }
})
.add('valid: string ip', () => {
  limitsValidators.string({ip: true}, '192.168.0.1')
})
.add('invalid: string ip', () => {
  try {
    limitsValidators.string({ip: true}, '1234')
  }
  catch (e) {
    // nothing
  }
})
.add('valid: string ipv4', () => {
  limitsValidators.string({ipv4: true}, '192.168.0.1')
})
.add('invalid: string ipv4', () => {
  try {
    limitsValidators.string({ipv4: true}, '1234')
  }
  catch (e) {
    // nothing
  }
})
.add('valid: string ipv6', () => {
  limitsValidators.string({ipv6: true}, '2001:db8::ff00:42:8329')
})
.add('invalid: string ipv6', () => {
  try {
    limitsValidators.string({ipv6: true}, '1234')
  }
  catch (e) {
    // nothing
  }
})
.add('valid: string email', () => {
  limitsValidators.string({email: true}, 'name@email.com')
})
.add('invalid: string email', () => {
  try {
    limitsValidators.string({email: true}, 'name')
  }
  catch (e) {
    // nothing
  }
})
.add('valid: string cuid', () => {
  limitsValidators.string({cuid: true}, 'ch72gsb320000udocl363eofy')
})
.add('invalid: string cuid', () => {
  try {
    limitsValidators.string({cuid: true}, 'something')
  }
  catch (e) {
    // nothing
  }
})
.add('valid: string cuid2', () => {
  limitsValidators.string({cuid2: true}, 'itp2u4ozr4')
})
.add('invalid: string cuid2', () => {
  try {
    limitsValidators.string({cuid2: true}, '1234')
  }
  catch (e) {
    // nothing
  }
})
.add('valid: string ulid', () => {
  limitsValidators.string({ulid: true}, '01F8MECHZX3TBDSZ7XR8H8JHAF')
})
.add('invalid: string ulid', () => {
  try {
    limitsValidators.string({ulid: true}, 'something')
  }
  catch (e) {
    // nothing
  }
})
.add('valid: string uuid', () => {
  limitsValidators.string({uuid: true}, '123e4567-e89b-12d3-a456-426614174000')
})
.add('invalid: string uuid', () => {
  try {
    limitsValidators.string({uuid: true}, 'something')
  }
  catch (e) {
    // nothing
  }
})
.on('cycle',cycleCallback)

export default { suites: [ validatorSuite ] }
