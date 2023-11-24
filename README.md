## DocSchema

DocSchema allows you to create schemas from JsDoc comments and use them to check data
at runtime.

## Key Features

- Written in JavaScript, uses JsDoc comments to make schemas
- Zero dependencies
- Works in Node.js and modern browsers
- Validates the types and has additional filters

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
personSchema.validate(wrongData) // throws ValidationError
```
- Or, check your data
```javascript
const correctData = { name: 'John', age: 31 }
const wrongData   = { name: 'John', age: '31' }

personSchema.check(correctData) // returns true
personSchema.check(wrongData) // returns false
```

## Schemas

To define a schema, some of the standard JsDoc tags are used, but in a little bit
different way. These tags are @enum, @param (one or more) and @typedef.

### @enum

Why @enum, but not @type? Because @type sets the type of the variable below, and we
don't want that.

For a simple type:

```javascript
/**
 * @enum {string}
 */
const schema = new DocSchema()

schema.validate('John')
```

For an Object, you can use the object literal syntax:

```javascript
/**
 * @enum {{ name: string, age: number }}
 */
const personSchema = new DocSchema()

personSchema.validate({ name: 'John', age: 31 })
```

### @param

For an Object, you can use one or more @param tags:

```javascript
/**
 * @param {string} name
 * @param {number} age
 */
const personSchema = new DocSchema()

personSchema.validate({ name: 'John', age: 31 })
```

### @typedef

For an Object, you can use one @typedef tag with type Object and one or more @property
tags:

```javascript
/**
 * @typedef {Object} PersonSchema
 * @property {string} name
 * @property {number} age
 */
const personSchema = new DocSchema()

personSchema.validate({ name: 'John', age: 31 })
```

This variation is also valid:

```javascript
/**
 * @typedef PersonSchema
 * @type {Object}
 * @property {string} name
 * @property {number} age
 */
const personSchema = new DocSchema()

personSchema.validate({ name: 'John', age: 31 })
```

## Filters (additional validations) overview

Sometimes validating only the type is not enough. Maybe you want a number with minimum
value, or a string with certain contents? Use filters for that.

The syntax is like a normal JavaScript Object, but only some key-value pairs would work.
The filters are placed in the description section of each parameter. Unfortunately, 
because of that in your IDE you will not get linting or code completion for the filters.
However, if you define them incorrectly, you should get errors (SyntaxError) at parse
time.

In the example below, there are two filters: *{ min: 1 }* and *{ min: 18 }*:

```javascript
/**
 * @param {string} name - { min: 1 }
 * @param {number} age - { min: 18 }
 */
const personSchema = new DocSchema()

personSchema.validate({ name: 'John', age: 31 }) // pass
personSchema.validate({ name: '', age: 31 }) // throws ValidationError
personSchema.validate({ name: 'John', age: 15 }) // throws ValidationError
```

And you can also add an actual description for each parameter, which can be placed
before, after or even on both sides of the filter object:

```javascript
/**
 * @param {string} name - The name should not be empty { min: 1 }
 * @param {number} age - { min: 18 } Adults only
 */
const personSchema = new DocSchema()
```

The dash in the description is optional:

```javascript
/**
 * @param {string} name The name should not be empty { min: 1 }
 * @param {number} age { min: 18 } Adults only
 */
const personSchema = new DocSchema()
```

Also, the descriptions can be in multiple rows. In this case, keep in mind that the
description of each parameter starts after its name and ends where the next tag is
defined.

```javascript
/**
 * @param {string} name The name should not be empty
 * { min: 1 }
 * @param {number} age Adults only
 * { min: 18 }
 */
const personSchema = new DocSchema()
```

Filters also work with object literal syntax. In this case, the description section
looks more like a comment.

Note: Having descriptions like that is not a standard practice in JsDoc and you may
get an error in your IDE, or depending on your ESLint settings.

```javascript
/**
 * @enum {{
 *   name: string, // { min: 1 }
 *   age: number,  // { min: 18 }
 * }}
 */
const personSchema = new DocSchema()
```

## Available filters

### Array-specific filters
- With numeric value:
  - min - Minimum length of the array.
  - max - Maximum length of the array.
  - length - Exact lenght of the array.

### Number-specific filters
- With numeric value:
  - min - Minimum value (gte alias).
  - max - Maximum value (lte alias).
  - gte - Greater than or equal.
  - gte - Greater than or equal.
  - gt - Greater than.
  - lt - Lower than.
  - step - The number must be divisible by the number of "step".
- With boolean value (either true or false):
  - int - The number must (or not) be integer.
  - finite - The number must (or not) be finite (not Infinity and not -Infinity)
  - safeInt - The number must (or not) be safe integer (between Number.MIN_SAFE_INTEGER
  and Number.MAX_SAFE_INTEGER)

### String-specific filters
- With numeric value:
  - min - Minimum characters in the string.
  - max - Maximum characters in the string.
  - length - Exact amount of characters in the string.
- With string value:
  - startsWith - The string must start with the specified string.
  - endsWith - The string must end with the specified string.
  - includes - The string must include the specified string.
  - excludes - The string must not include the specified string.
  - url - The string must be a valid URL.
- With boolean value (either true or false):
  - email - The string must (or not) be a valid email name.
  - ip - The string must (or not) be a valid IPv4 or IPv6 address.
  - ipv4 - The string must (or not) be a valid IPv4 address.
  - ipv6 - The string must (or not) be a valid IPv6 address.
  - cuid - The string must (or not) be a valid CUID.
  - cuid2 - The string must (or not) be a valid CUID2.
  - ulid - The string must (or not) be a valid ULID.
  - uuid - The string must (or not) be a valid UUID.
- With RegExp value:
    - pattern - Regex pattern. RegExp value.
