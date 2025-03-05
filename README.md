## DocSchema

![Static Badge](https://img.shields.io/badge/100%25%20JavaScript-F0DB4F?style=for-the-badge&logo=JavaScript&labelColor=black)
![Static Badge](https://img.shields.io/badge/NodeJs-3C873A?style=for-the-badge&logo=node.js&labelColor=black)

[![npm version](https://img.shields.io/npm/v/docschema.svg?logo=npm&color=cb3837)](https://www.npmjs.com/package/docschema)
![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/docschema?color=cb3837)
![npm downloads](https://img.shields.io/npm/dm/docschema?color=cb3837)
![npm type definitions](https://img.shields.io/npm/types/docschema)
[![test](https://github.com/AseasRoa/DocSchema/actions/workflows/test.yml/badge.svg)](https://github.com/AseasRoa/DocSchema/actions/workflows/test.yml)
![license](https://img.shields.io/npm/l/docschema)

DocSchema allows you to create schemas from JsDoc comments and use them to
validate data at runtime.

## Table of Contents

- [Key Features](#key-features)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Preserve JsDoc Comments](#preserve-jsdoc-comments)
- [Schemas](#schemas)
  - [@enum](#enum)
  - [@param](#param)
  - [@typedef](#typedef)
- [External Types](#external-types)
- [Filters](#filters)
  - [Array-specific filters](#array-specific-filters)
  - [Number-specific filters](#number-specific-filters)
  - [String-specific-filters](#string-specific-filters)
- [Error Handling](#error-handling)
- [How it Works?](#how-it-works)
- [How to Use?](#how-to-use)

## Key Features

- 100% JavaScript, uses JsDoc comments to make schemas
- ES6 imports
- Works in Node.js and modern browsers [*](#preserve-jsdoc-comments)
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

- Use `docSchema()` to create a schema:

```javascript
import { docSchema } from 'docschema'
// import docSchema from 'docschema' // Also valid

/**
 * @param {string} name
 * @param {number} age
 */
const personSchema = docSchema()
```
- Validate your data:
```javascript
const correctData = { name: 'John', age: 31 }
const wrongData   = { name: 'John', age: '31' }

personSchema.validate(correctData) // Returns the input value
personSchema.validate(wrongData) // Throws ValidationError
```
- Or, check your data:
```javascript
const correctData = { name: 'John', age: 31 }
const wrongData   = { name: 'John', age: '31' }

personSchema.check(correctData) // Returns an object (explained later)
personSchema.check(wrongData) // Returns an object with the error data
```
- Or, approve your data:
```javascript
const correctData = { name: 'John', age: 31 }
const wrongData   = { name: 'John', age: '31' }

personSchema.approves(correctData) // Returns true
personSchema.approves(wrongData) // Returns false
```
## Preserve JsDoc Comments

When JavaScript files are minified, JsDoc comments are removed. We don't want
that to happen to our JsDoc schemas. To preserve them, try using `@preserve`
or `@license` tag:

```javascript
/**
 * @preserve
 * @param {string} name
 * @param {number} age
 */
```

## Schemas

To define a schema, some of the standard JsDoc tags are used, but not in the
way they are supposed to be used. The tags are `@enum`, `@typedef` and `@param`.
They are chosen, because when they are used directly above a constant or
variable definition, they don't set the type of that constant or variable.

### @enum
For a simple type that is only one word:

```javascript
/**
 * @enum {string}
 */
const schema = docSchema()

schema.validate('John')
```

For an object:

```javascript
/**
 * @enum {{ name: string, age: number }}
 */
const personSchema = docSchema()

personSchema.validate({ name: 'John', age: 31 })
```

Why `@enum`, but not `@type`? Because `@type` sets the type of the constant
below, which is something we don't want in DocSchema. What we want is to use
the information in the JsDoc comment as a schema, for the purpose of
`validate()`.

### @typedef

For an object, you can also use one `@typedef` tag with type `Object` and one
or more `@property` tags:

```javascript
/**
 * @typedef {Object} PersonSchema
 * @property {string} name
 * @property {number} age
 */
const personSchema = docSchema()

personSchema.validate({ name: 'John', age: 31 })
```
Now not only you can do the validations, but the type `PersonSchema` can alo be
used somewhere else in the same file. The use case for this will be demonstrated
later.

By the way, this variation is also valid:

```javascript
/**
 * @typedef PersonSchema
 * @type {Object}
 * @property {string} name
 * @property {number} age
 */
const personSchema = docSchema()

personSchema.validate({ name: 'John', age: 31 })
```

### @param

For an object, you can also use one or more `@param` tags:

```javascript
/**
 * @param {string} name
 * @param {number} age
 */
const personSchema = docSchema()

personSchema.validate({ name: 'John', age: 31 })
```
However, the type information can only be used to make the schema for
`personSchema`. This can be used in a very narrow scope.

## External Types

In schema comments, you can use constructor types. For example:

```javascript
class MyClass { ... }

/**
 * @param {Date} createdAt - createdAt must be an instance of Date
 * @property {MyClass} myClass - myClass must be an instance of MyClass
 */
```

Also, you can define custom typedefs:

```javascript
/**
 * @typedef PersonSchema
 * @type {Object}
 * @property {string} name
 * @property {number} age
 */

/**
 * @enum {PersonSchema}
 */
const personSchema = docSchema()

personSchema.validate({ name: 'John', age: 31 })
```

You can also import types from other files using the @import tag:

```javascript
//---- types.js ----//
/**
 * @typedef PersonSchema
 * @type {Object}
 * @property {string} name
 * @property {number} age
 */
 
//---- index.js ----//
 
/**
 * @import { PersonSchema } from './types.js'
 */

/**
 * @enum {PersonSchema}
 */
const personSchema = docSchema()

personSchema.validate({ name: 'John', age: 31 })
```

It's also possible to use ambient typedefs from external files.
Ambient typedefs are typedefs, located in a file without imports or exports.
Usually you don't have to import these files anywhere, as the types defined in
them are global (ambient) anyway. However, for DocSchema you must import them.
DocSchema does not scan for external files with ambient types by itself,
but it will read external files, imported like this: `import './fileName.js'`:

```javascript
//---- ambientTypedefs.js ----//

// This file should not have imports or exports

/**
 * @typedef PersonSchema
 * @type {Object}
 * @property {string} name
 * @property {number} age
 */


//---- index.js ----//

import './ambientTypedefs.js'

/**
 * @enum {PersonSchema}
 */
const personSchema = docSchema()

personSchema.validate({ name: 'John', age: 31 })
```

## Strict

```javascript
/**
* @typedef PersonSchema
* @type {Object}
* @property {string} name
* @property {number} age
* @strict
*/
const personSchema = docSchema()

personSchema.validate({ name: 'John', age: 31, child: 'Jane' })
```

With `@strict`, the validation will not be successful if the input object
contains properties that are not in the schema. In the example above, the
object contains one extra property `child` that doesn't exist in the schema.

## Filters

Sometimes validating only the type is not enough. Maybe you want a number with
minimum value, or a string with certain contents? Use filters for that.

The syntax is like a normal JavaScript Object, but only some key-value pairs
would work. The filters are placed in the description section of each parameter.
Unfortunately, because of that in your IDE you will not get linting or code
completion for the filters. However, if you define them incorrectly, you should
get errors
([`SyntaxError`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SyntaxError))
at parse time.

In the example below, there are two filters: `{ min: 1 }` and `{ min: 18 }`:

```javascript
/**
 * @param {string} name - { min: 1 }
 * @param {number} age - { min: 18 }
 */
const personSchema = docSchema()

personSchema.validate({ name: 'John', age: 31 }) // Pass
personSchema.validate({ name: '', age: 31 }) // Throws ValidationError
personSchema.validate({ name: 'John', age: 15 }) // Throws ValidationError
```

And you can also add an actual description for each parameter, which can be
placed before, after or even on both sides of the filter object:

```javascript
/**
 * @param {string} name - The name should not be empty { min: 1 }
 * @param {number} age - { min: 18 } Adults only
 */
const personSchema = docSchema()
```

The dash in the description is optional:

```javascript
/**
 * @param {string} name The name should not be empty { min: 1 }
 * @param {number} age { min: 18 } Adults only
 */
const personSchema = docSchema()
```

Also, the descriptions can be in multiple rows. In this case, keep in mind that
the description of each parameter starts after its name and ends where the next
tag is defined.

Note that these descriptions are NOT custom error messages. They are just
regular JsDoc descriptions.

```javascript
/**
 * @param {string} name The name should not be empty
 * { min: 1 }
 * @param {number} age Adults only
 * { min: 18 }
 */
const personSchema = docSchema()
```

Filters also work with object literal syntax. In this case, the description
section looks more like a comment.

Note: Having descriptions like that is not a standard practice in JsDoc and
you may get an error in your IDE, or depending on your ESLint settings.

```javascript
/**
 * @enum {{
 *   name: string, // { min: 1 }
 *   age: number,  // { min: 18 }
 * }}
 */
const personSchema = docSchema()
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
  - `finite` - The number must (or not) be finite (not `Infinity` and not
`-Infinity`)
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

### Custom error messages

On each filter, you can specify a custom error message. To do that, replace the
filter value with a tuple (array with 2 values) where the filter value is at
index 0 and the custom error message is at index 1. For example:

```javascript
/**
 * @param {string} name { min: [ 1, 'The name should not be empty' ] }
 * @param {number} age { min: [ 18, 'Adults only' ] }
 */
const personSchema = docSchema()
```
Or:
```javascript
/**
 * @enum {{
 *   name: string, // { min: [ 1, 'The name should not be empty' ] }
 *   age: number,  // { min: [ 18, 'Adults only' ] }
 * }}
 */
const personSchema = docSchema()
```

## Error Handling
`ValidationError` is a child class of `Error` and is thrown only when using
`.validate()`. It contains some additional properties,
providing information about the validation error. The same properties are
returned by `.check()`, but as an object.

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
- `kind` - `"type"` on type checking failure, `"filter"` on filter checking 
failure, or "strict" on failure when `@strict` is used.
- `expectedType` - String. The expected type.
`"param"`, `"property"`.
- `filter` - Object with two properties - name and value. It appears on filter
validation failure only and provides information about the filter that was used.
<br>For example, on input number 5: `{ name: "min", value: 10 }`
- `value` - The value at which the validation failure happened.
- `valuePath` - Array. The path to the value at which the validation failure
happened, as a separate string values in the array.
<br>For example:
  - With simple value it is an empty array `[]`.
  - With Object `{ foo: { bar: "wrong-value" } }` it is like this:
  `[ "foo", "bar" ]`.
  - With Array `{ foo: [ "wrong-value" ] }` it is like this: `[ "foo", "0" ]`

## How it Works?

- When `docSchema()` is called, a new `Error` is thrown internally and its call
stack is captured.
- From the captured stack, information about the location of `docSchema()` is
extracted - file name, line and column.
- The file (where `docSchema()` is located) is read synchronously. In browsers,
[synchronous XHR request](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest_API/Synchronous_and_Asynchronous_Requests#synchronous_request)
is used. Yes, this is deprecated for a good reason, but in our case we already
got the file in the browser's cache. 
- All JsDoc comments in the file are extracted and parsed. We know where to
locate our comment, it must be at the lines just above `docSchema()`. From our
JsDoc comment we got a schema, and that schema is returned by `docSchema()`.

## How to Use?

### TypeScript?

DocSchema is intended to be used in JavaScript & JsDoc environment, along with
TypeScript for type-checking only. TypeScript understands JsDoc comments very
well, which allows us to use them for type definitions. For this, TypeScript
needs to be configured with
[allowJs](https://www.typescriptlang.org/tsconfig#allowJs)
and [checkJs](https://www.typescriptlang.org/tsconfig#checkJs) set to `true`.
DocSchema itself is configured like this, and you can see its `tsconfig.js`
file for reference.

### Infer Type from Schema

Ideally, we want to use the same JsDoc type definition for the schema and as a
type.

With `@param` we have a problem:
```javascript
/**
 * @param {string} name
 * @param {number} age
 */
const personSchema = docSchema()
```
Here the JsDoc comment is consumed by `docSchema()`, but it can't be used as a
type somewhere else. `personSchema` has the type that is returned by
`docSchema()`.

With `@typedef`:
```javascript
/**
* @typedef {Object} PersonSchema
* @property {string} name
* @property {number} age
*/
const personSchema = docSchema()
```
Here we have a type `PersonSchema` and it can be used somewhere else in the same
file. We can't use `PersonSchema` outside this file. And it's probably not a
good idea to use `PersonSchema` as a type in the same file anyway.

With `@enum`:
```javascript
/**
 * @enum {{ name: string, age: number }}
 */
const PersonSchema = docSchema()

/**
 * @type {PersonSchema}
 */
const person = { name: 'John', age: 31 }

// Validate
PersonSchema.validate(person)
```
Something interesting happens here. `PersonSchema` now acts both as a schema
validator and as a type.

TypeScript will give you an error if you assign a value to `person` that doesn't
match the type in the `@enum`:
```javascript
/**
 * @type {PersonSchema}
 */
const person = 'John'
// TS2322: Type 'string' is not assignable to type 'PersonSchema'
```
```javascript
/**
 * @type {PersonSchema}
 */
const person = { name: 'John', age: '31' }
// TS2322: Type 'string' is not assignable to type 'number'
```

TypeScript will also give you an error if you are not using `PersonSchema`
properly:
```javascript
// Validate
PersonSchema.validateee(person)
// TS2551: Property 'validateee' does not exist on type 'DocSchema'. Did you mean 'validate'?
```

We can also separate our schemas in a separate file, like this:
```javascript
//---- schemas.js ----//

import { docSchema } from 'docschema'

/**
 * @enum {{ name: string, age: number }}
 */
export const PersonSchema = docSchema()


//---- index.js ----//

/**
 * @import { PersonSchema } from './schemas.js'
 */

/**
 * @type {PersonSchema}
 */
const person = { name: 'John', age: 31 }

PersonSchema.validate(person)
```
