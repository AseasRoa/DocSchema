import { PersonSchema } from './schemas.js'

/** @type {PersonSchema} */
const correctData = { name: 'John', age: 31 }
const wrongData   = { name: 'John', age: '31' }

const resultOnCorrectData = PersonSchema.check(correctData)
const resultOnWrongData = PersonSchema.check(wrongData)

console.log('resultOnCorrectData:', resultOnCorrectData)
console.log('resultOnWrongData:', resultOnWrongData)
