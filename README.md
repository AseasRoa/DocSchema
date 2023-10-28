## DocSchema

DocSchema allows you to create schemas from JsDoc comments and use them to validate data.

## Key Features

- Written in JavaScript, uses JsDoc to make schemas
- Zero dependencies
- Works in Node.js and modern browsers

## How to use

- Create a schema
```javascript
import { DocSchema } from 'docschema'

/**
 * @param {string} name
 * @param {number} age
 */
const personSchema = new DocSchema()
```
- Validate your data
```javascript
const correctData = { name: 'John', age: 31 }
const wrongData   = { name: 'John', age: '31' }

personSchema.validate(correctData)
personSchema.validate(wrongData) // throws a TypeError
```
- Or, check your data
```javascript
const correctData = { name: 'John', age: 31 }
const wrongData   = { name: 'John', age: '31' }

personSchema.check(correctData) // returns true
personSchema.check(wrongData) // returns false
```

## Schemas
#### @enum
@enum can be used for a single value:
```javascript
/**
 * @enum {string}
 */
const schema = new DocSchema()

schema.validate('John')
```

