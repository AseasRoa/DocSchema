import { DocSchema } from '#docschema'

/**
 * @param {string} name
 * @param {number} age
 * @preserve
 */
const personSchema = new DocSchema()

const correctData = { name: 'John', age: 31 }
const wrongData   = { name: 'John', age: '31' }

const resultOnCorrectData = personSchema.check(correctData)
const resultOnWrongData = personSchema.check(wrongData)

console.log('resultOnCorrectData: ', resultOnCorrectData)
console.log('resultOnWrongData: ', resultOnWrongData)
