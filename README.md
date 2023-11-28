## DocSchema

![Static Badge](https://img.shields.io/badge/100%25%20JavaScript-F0DB4F?style=for-the-badge&logo=JavaScript&labelColor=black)
![Static Badge](https://img.shields.io/badge/NodeJs-3C873A?style=for-the-badge&logo=node.js&labelColor=black)

[![npm version](https://img.shields.io/npm/v/docschema.svg?logo=npm&color=cb3837)](https://www.npmjs.com/package/docschema)
![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/docschema?color=cb3837)
![npm downloads](https://img.shields.io/npm/dm/docschema?color=cb3837)
![npm type definitions](https://img.shields.io/npm/types/docschema)
[![test](https://github.com/AseasRoa/DocSchema/actions/workflows/test.yml/badge.svg)](https://github.com/AseasRoa/DocSchema/actions/workflows/test.yml)
![license](https://img.shields.io/npm/l/docschema)

DocSchema allows you to create schemas from JsDoc comments and use them to validate data
at runtime.

## Table of Contents

- [Key Features](#key-features)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Preserve JsDoc Comments](#preserve-jsdoc-comments)
- [Schemas](#schemas)
  - [@enum](#enum)
  - [@param](#param)
  - [@typedef](#typedef)
- [Filters](#filters)
  - [Array-specific filters](#array-specific-filters)
  - [Number-specific filters](#number-specific-filters)
  - [String-specific-filters](#string-specific-filters)
- [Error Handling](#error-handling)

## Key Features

- 100% JavaScript, uses JsDoc comments to make schemas
- Works in Node.js and modern browsers
- Zero dependencies
- Validates the types and has additional filters to validate the value
- Comes with typings

## Installation

```bash [npm]
npm install docschema
```
```bash [pnpm]
pnpm add docschema
```
```bash [yarn]
yarn add docschema
```

## Basic Usage

- Create a schema
```javascript
import { DocSchema } from 'docschema'

/**
 * @param {string} name
 * @param {number} age
 */
const personSchema = new DocSchema()
```
Or, like this:
```javascript
import { docSchema } from 'docschema'
// import docSchema from 'docschema' // Also valid

/**
 * @param {string} name
 * @param {number} age
 */
const personSchema = docSchema() // new DocSchema() alias
```
- Validate your data
```javascript
const correctData = { name: 'John', age: 31 }
const wrongData   = { name: 'John', age: '31' }

personSchema.validate(correctData)
personSchema.validate(wrongData) // Throws ValidationError
```
- Or, check your data
```javascript
const correctData = { name: 'John', age: 31 }
const wrongData   = { name: 'John', age: '31' }

personSchema.check(correctData) // Returns an object
personSchema.check(wrongData) // Returns an object, containing error data
```
- Or, approve your data
```javascript
const correctData = { name: 'John', age: 31 }
const wrongData   = { name: 'John', age: '31' }

personSchema.approves(correctData) // Returns true
personSchema.approves(wrongData) // Returns false
```
## Preserve JsDoc Comments

When JavaScript files are minified, JsDoc comments are removed. We don't want that to
happen to our JsDoc schemas. To preserve them, use the `@preserve` (or `@license`) tag:

```javascript
/**
 * @param {string} name
 * @param {number} age
 * @preserve
 */
```

## Schemas

To define a schema, some of the standard JsDoc tags are used, but in a little bit
different way. These tags are `@enum`, `@param` (one or more) and `@typedef`.

### @enum

Why `@enum`, but not `@type`? Because `@type` sets the type of the variable below, and we
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

For an `Object`, you can use one or more `@param` tags:

```javascript
/**
 * @param {string} name
 * @param {number} age
 */
const personSchema = new DocSchema()

personSchema.validate({ name: 'John', age: 31 })
```

### @typedef

For an `Object`, you can use one `@typedef` tag with type `Object` and one or more @property
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

## Filters

Sometimes validating only the type is not enough. Maybe you want a number with minimum
value, or a string with certain contents? Use filters for that.

The syntax is like a normal JavaScript Object, but only some key-value pairs would work.
The filters are placed in the description section of each parameter. Unfortunately, 
because of that in your IDE you will not get linting or code completion for the filters.
However, if you define them incorrectly, you should get errors
([`SyntaxError`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SyntaxError))
at parse time.

In the example below, there are two filters: `{ min: 1 }` and `{ min: 18 }`:

```javascript
/**
 * @param {string} name - { min: 1 }
 * @param {number} age - { min: 18 }
 */
const personSchema = new DocSchema()

personSchema.validate({ name: 'John', age: 31 }) // Pass
personSchema.validate({ name: '', age: 31 }) // Throws ValidationError
personSchema.validate({ name: 'John', age: 15 }) // Throws ValidationError
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

### Array-specific filters
- With `numeric` value:
  - `min` - Minimum length of the array.
  - `max` - Maximum length of the array.
  - `length` - Exact length of the array.

### Number-specific filters
- With `numeric` value:
  - `min` - Minimum value (`gte` alias).
  - `max` - Maximum value (`lte` alias).
  - `gte` - Greater than or equal.
  - `gte` - Greater than or equal.
  - `gt` - Greater than.
  - `lt` - Lower than.
  - `step` - The number must be divisible by the number of "step".
- With boolean value (either true or false):
  - `int` - The number must (or not) be integer.
  - `finite` - The number must (or not) be finite (not `Infinity` and not `-Infinity`)
  - `safeInt` - The number must (or not) be safe integer (between 
  `Number.MIN_SAFE_INTEGER` and `Number.MAX_SAFE_INTEGER`)

### String-specific filters
- With `numeric` value:
  - `min` - Minimum characters in the string.
  - `max` - Maximum characters in the string.
  - `length` - Exact amount of characters in the string.
- With `string` value:
  - `startsWith` - The string must start with the specified string.
  - `endsWith` - The string must end with the specified string.
  - `includes` - The string must include the specified string.
  - `excludes` - The string must not include the specified string.
  - `url` - The string must be a valid URL.
- With `boolean` value (either true or false):
  - `email` - The string must (or not) be a valid email name.
  - `ip` - The string must (or not) be a valid IPv4 or IPv6 address.
  - `ipv4` - The string must (or not) be a valid IPv4 address.
  - `ipv6` - The string must (or not) be a valid IPv6 address.
  - `cuid` - The string must (or not) be a valid [CUID](https://github.com/paralleldrive/cuid).
  - `cuid2` - The string must (or not) be a valid [CUID2](https://github.com/paralleldrive/cuid2).
  - `ulid` - The string must (or not) be a valid [ULID](https://github.com/ulid/spec).
  - `uuid` - The string must (or not) be a valid [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier).
- With `RegExp` value:
    - `pattern` - Regex pattern. `RegExp` value.

### Error Handling
`ValidationError` is a child class of `Error` and is thrown only when using
`.validate()`. It contains some additional properties,
providing information about the validation error. The same properties are returned by
`.check()`, but as an `Object`.

On validation success, the properties are mostly empty, except `pass` and `tag`:

```javascript
{
  pass: true,
  tag: 'enum',
  // The others are empty
  message: '',
  kind: '',
  expectedType: '',
  filter: undefined,
  value: undefined,
  valuePath: []
}
```

On validation failure, the properties are as follows:

- `pass` - `false`.
- `tag` - String. The name of the tag where the validation failed.
<br>For example `"enum"`,
- `message` - String. Error message, containing information about the problem.
- `kind` - `"type"` on type checking failure or `"filter"` on filter checking failure.
- `expectedType` - String. The expected type.
`"param"`, `"property"`.
- `filter` - Object with two properties - name and value. It appears on filter
validation failure only and provides information about the filter that was used.
<br>For example, on input number 5: `{ name: "min", value: 10 }`
- `value` - The value at which the validation failure happened.
- `valuePath` - Array. The path to the value at which the validation failure happened,
as a separate string values in the array.
<br>For example:
  - With simple value it is an empty array `[]`.
  - With Object `{ foo: { bar: "wrong-value" } }` it is like this: `[ "foo", "bar" ]`.
  - With Array `{ foo: [ "wrong-value" ] }` it is like this: `[ "foo", "0" ]`
