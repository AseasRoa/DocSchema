/**
 * Types and instances:
 * - String values to be checked using "typeof"
 * - Non-string values to be checked using "instanceof"
 */
const types = {
  boolean: 'boolean',
  number: 'number',
  string: 'string',
  RegExp: RegExp,
}

const paramsMap = {
  array: {
    min: types.number,
    max: types.number,
    length: types.number
  },
  number: {
    min: types.number,
    max: types.number,
    gte: types.number,
    lte: types.number,
    gt: types.number,
    lt: types.number,
    step: types.number,
    int: types.boolean,
    finite: types.boolean,
    safeInt: types.boolean,
  },
  string: {
    min: types.number,
    max: types.number,
    length: types.number,
    startsWith: types.string,
    endsWith: types.string,
    includes: types.string,
    excludes: types.string,
    url: types.string,
    pattern: types.RegExp,
    ip: types.string,
    email: types.string,
    cuid: types.string,
    cuid2: types.string,
    ulid: types.string,
    uuid: types.string,
    ipv4: types.string,
    ipv6: types.string,
  }
}

/**
 * @param {string} typeName
 * @param {DocSchemaLimits} limitsObject
 */
export function limitsParsers(typeName, limitsObject) {
  if (!(typeName in paramsMap)) {
    throw new Error(`Type ${typeName} doesn't work when limits are used. Limits only work on array, number or string types.`)
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
        throw new Error(`The value of "${key}" has wrong type. The type is ${typeActual}, but it must be ${typeShouldBe}. In ${JSON.stringify(limitsObject)}`)
      }
    }
    else {
      if (!(value instanceof shouldBe)) {
        throw new Error(`The value of "${key}" has wrong type. It must be an instance of ${shouldBe.name}. In ${JSON.stringify(limitsObject)}`)
      }
    }
  }
}
