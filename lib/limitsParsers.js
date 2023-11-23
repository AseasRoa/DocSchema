/**
 * Types and instances:
 * - String values to be checked using "typeof"
 * - Non-string values to be checked using "instanceof"
 */
const paramsMap = {
  array: {
    min: 'number',
    max: 'number',
    length: 'number',
  },
  number: {
    min: 'number',
    max: 'number',
    gte: 'number',
    lte: 'number',
    gt: 'number',
    lt: 'number',
    step: 'number',
    int: 'boolean',
    finite: 'boolean',
    safeInt: 'boolean',
  },
  string: {
    min: 'number',
    max: 'number',
    length: 'number',
    startsWith: 'string',
    endsWith: 'string',
    includes: 'string',
    excludes: 'string',
    url: 'string',
    pattern: RegExp,
    ip: 'boolean',
    email: 'boolean',
    cuid: 'boolean',
    cuid2: 'boolean',
    ulid: 'boolean',
    uuid: 'boolean',
    ipv4: 'boolean',
    ipv6: 'boolean',
  }
}

/**
 * @param {string} typeName
 * @param {Limits} limitsObject
 */
export function limitsParsers(typeName, limitsObject) {
  if (!(typeName in paramsMap)) {
    throw new Error(
      `Type ${typeName} doesn't work when limits are used.`
      + ` Limits only work on array, number or string types.`)
  }

  for (const key in limitsObject) {
    if (!(key in paramsMap[typeName])) {
      continue
    }

    const value = limitsObject[key]
    const shouldBe = paramsMap[typeName][key]

    if (typeof shouldBe === 'string') {
      const typeActual = typeof value
      const typeShouldBe = shouldBe

      if (typeActual !== typeShouldBe) {
        throw new Error(
          `The value of "${key}" has wrong type.`
          + ` The type is ${typeActual}, but it must be ${typeShouldBe}.`
          + ` In ${JSON.stringify(limitsObject)}`
        )
      }
    }
    else {
      if (!(value instanceof shouldBe)) {
        throw new Error(`The value of "${key}" has wrong type.`
          + ` It must be an instance of ${shouldBe.name}.`
          + ` In ${JSON.stringify(limitsObject)}`)
      }
    }
  }
}
