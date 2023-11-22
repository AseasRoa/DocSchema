import { ValidationError } from './ValidationError.js'

const regexesForString = {
  email: /^(?!\.)(?!.*\.\.)([A-Z0-9_+-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/ui,
  cuid: /^c[^\s-]{8,}$/ui,
  cuid2: /^[a-z][a-z0-9]*$/u,
  ulid: /^[0-9A-HJKMNP-TV-Z]{26}$/u,
  uuid: /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/ui,
  ipv4: /^(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))$/u,
  ipv6: /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/u
}

/**
 * @type {Record<keyof validators, string>}
 */
const prefixes = {
  array: 'Expected array ',
  number: 'Expected number ',
  string: 'Expected string '
}

const validators = {
  /**
   * @type {{
   *   min:    function(any[], number): void,
   *   max:    function(any[], number): void,
   *   length: function(any[], number): void,
   * }}
   */
  array: {
    min: (value, toBe) => {
      if (value.length < toBe) {
        const arrayStr = arrayStringify(value)

        throwValidationError(
          'array:min',
          `${prefixes.array}"${arrayStr}" to have ${toBe} or more elements.`
        )
      }
    },
    max: (value, toBe) => {
      if (value.length > toBe) {
        const arrayStr = arrayStringify(value)

        throwValidationError(
          'array:max',
          `${prefixes.array}"${arrayStr}" to have ${toBe} or less elements.`
        )
      }
    },
    length: (value, toBe) => {
      if (value.length !== toBe) {
        const arrayStr = arrayStringify(value)

        throwValidationError(
          'array:length',
          `${prefixes.array}"${arrayStr}" to have exactly ${toBe} elements.`
        )
      }
    }
  },
  /**
   * @type {{
   *   min:  function(number, number): void,
   *   max:  function(number, number): void,
   *   gte:  function(number, number): void,
   *   lte:  function(number, number): void,
   *   gt:   function(number, number): void,
   *   lt:   function(number, number): void,
   *   step: function(number, number): void,
   *   int:     function(number, boolean): void,
   *   finite:  function(number, boolean): void,
   *   safeInt: function(number, boolean): void,
   *   min:     function(number, number): void,
   * }}
   */
  number: {
    // gte alias
    min: (value, toBe) => {
      if (value < toBe) {
        throwValidationError(
          'number:min',
          `${prefixes.number}${value} to be ${toBe} or higher.`
        )
      }
    },
    // lte alias
    max: (value, toBe) => {
      if (value > toBe) {
        throwValidationError(
          'number:max',
          `${prefixes.number}${value} to be ${toBe} or lower.`
        )
      }
    },
    gte: (value, toBe) => {
      if (value < toBe) {
        throwValidationError(
          'number:gte',
          `${prefixes.number}${value} to be ${toBe} or higher.`
        )
      }
    },
    lte: (value, toBe) => {
      if (value > toBe) {
        throwValidationError(
          'number:lte',
          `${prefixes.number}${value} to be ${toBe} or lower.`
        )
      }
    },
    gt: (value, toBe) => {
      if (value <= toBe) {
        throwValidationError(
          'number:gt',
          `${prefixes.number}${value} to be higher than ${toBe}.`
        )
      }
    },
    lt: (value, toBe) => {
      if (value >= toBe) {
        throwValidationError(
          'number:lt',
          `${prefixes.number}${value} to be lower than ${toBe}.`
        )
      }
    },
    step: (value, toBe) => {
      if ((value % toBe !== 0)) {
        throwValidationError(
          'number:step',
          `${prefixes.number}${value} to be multiple of ${toBe}.`
        )
      }
    },
    int: (value, toBe) => {
      if (toBe === true && !Number.isInteger(value)) {
        throwValidationError(
          'number:int',
          `${prefixes.number}${value} to be integer.`
        )
      }

      if (toBe === false && Number.isInteger(value)) {
        throwValidationError(
          'number:int',
          `${prefixes.number}${value} not to be integer.`
        )
      }
    },
    finite: (value, toBe) => {
      if (toBe === true && !Number.isFinite(value)) {
        throwValidationError(
          'number:finite',
          `${prefixes.number}${value} to be finite.`
        )
      }

      if (toBe === false && Number.isFinite(value)) {
        throwValidationError(
          'number:finite',
          `${prefixes.number}${value} not to be finite.`
        )
      }
    },
    safeInt: (value, toBe) => {
      if (!Number.isInteger(value)) {
        throwValidationError(
          'number:safe',
          `${prefixes.number}${value} to be integer.`
        )
      }

      if (
        toBe === true
        && (value < Number.MIN_SAFE_INTEGER || value > Number.MAX_SAFE_INTEGER)
      ) {
        throwValidationError(
          'number:safe',
          `${prefixes.number}${value} to be safe.`
        )
      }

      if (
        toBe === false
        && (value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER)
      ) {
        throwValidationError(
          'number:safe',
          `${prefixes.number}${value} not to be safe.`
        )
      }
    }
  },
  /**
   * @type {{
   *   min:  function(string, number): void,
   *   max:  function(string, number): void,
   *   length:  function(string, number): void,
   *   startsWith: function(string, string): void,
   *   endsWith: function(string, string): void,
   *   includes: function(string, string): void,
   *   excludes: function(string, string): void,
   *   url: function(string, boolean): void,
   *   pattern: function(string, RegExp): void,
   *   ip: function(string, boolean): void,
   *   email: function(string, boolean): void,
   *   cuid: function(string, boolean): void,
   *   cuid2: function(string, boolean): void,
   *   ulid: function(string, boolean): void,
   *   uuid: function(string, boolean): void,
   *   ipv4: function(string, boolean): void,
   *   ipv6: function(string, boolean): void,
   * }}
   */
  string: {
    min: (value, toBe) => {
      if (value.length < toBe) {
        throwValidationError(
          'string:min',
          `${prefixes.string}"${value}" to be at least ${toBe} symbols long.`
        )
      }
    },
    max: (value, toBe) => {
      if (value.length > toBe) {
        throwValidationError(
          'string:max',
          `${prefixes.string}"${value}" to be max ${toBe} symbols long.`
        )
      }
    },
    length: (value, toBe) => {
      if (value.length !== toBe) {
        throwValidationError(
          'string:length',
          `${prefixes.string}"${value}" to be exactly ${toBe} symbols long.`
        )
      }
    },
    startsWith: (value, toBe) => {
      if (!value.startsWith(toBe)) {
        throwValidationError(
          'string:startsWith',
          `${prefixes.string}"${value}" to start with "${toBe}".`
        )
      }
    },
    endsWith: (value, toBe) => {
      if (!value.endsWith(toBe)) {
        throwValidationError(
          'string:endsWith',
          `${prefixes.string}"${value}" to end with "${toBe}".`
        )
      }
    },
    includes: (value, toBe) => {
      if (!value.includes(toBe)) {
        throwValidationError(
          'string:endsWith',
          `${prefixes.string}"${value}" to include "${toBe}".`
        )
      }
    },
    excludes: (value, toBe) => {
      if (value.includes(toBe)) {
        throwValidationError(
          'string:endsWith',
          `${prefixes.string}"${value}" not to include "${toBe}".`
        )
      }
    },
    url: (value, toBe) => {
      if (toBe === true) {
        try {
          const url = new URL(value)
        }
        catch {
          throwValidationError(
            'string:url',
            `${prefixes.string}"${value}" to be URL.`
          )
        }
      }

      if (toBe === false) {
        try {
          const url = new URL(value)
        }
        catch {
          return
        }

        throwValidationError(
          'string:url',
          `${prefixes.string}"${value}" not to be URL.`
        )
      }
    },
    pattern: (value, toBe) => {
      if (!toBe.test(value)) {
        throwValidationError(
          'string:pattern',
          `${prefixes.string}"${value}" to respect the regex pattern ${toBe}.`
        )
      }
    },
    ip: (value, toBe) => {
      if (
        toBe === true
        && (
          !regexesForString.ipv4.test(value)
          && !regexesForString.ipv6.test(value)
        )
      ) {
        throwValidationError(
          'string:ip',
          `${prefixes.string}"${value}" to be IP address.`
        )
      }

      if (
        toBe === false
        && (
          regexesForString.ipv4.test(value)
          || regexesForString.ipv6.test(value)
        )
      ) {
        throwValidationError(
          'string:ip',
          `${prefixes.string}"${value}" to not be IP address.`
        )
      }
    },
    email: (value, toBe) => {
      applyRegexValidations('email', value, toBe)
    },
    cuid: (value, toBe) => {
      applyRegexValidations('cuid', value, toBe)
    },
    cuid2: (value, toBe) => {
      applyRegexValidations('cuid2', value, toBe)
    },
    ulid: (value, toBe) => {
      applyRegexValidations('ulid', value, toBe)
    },
    uuid: (value, toBe) => {
      applyRegexValidations('uuid', value, toBe)
    },
    ipv4: (value, toBe) => {
      applyRegexValidations('ipv4', value, toBe)
    },
    ipv6: (value, toBe) => {
      applyRegexValidations('ipv6', value, toBe)
    }
  }
}

/**
 * @type {Record<keyof validators, string>}
 */
const validValidations = {
  array: Object.keys(validators.array).map((value) => `"${value}"`).join(', '),
  number: Object.keys(validators.number).map((value) => `"${value}"`).join(', '),
  string: Object.keys(validators.string).map((value) => `"${value}"`).join(', ')
}

/**
 * @type {{
 *   array: (limitsObject: Limits, value: Array<any>) => boolean,
 *   number: (limitsObject: Limits, value: number) => boolean,
 *   string: (limitsObject: Limits, value: string) => boolean,
 * }}
 */
export const limitsValidators = {
  array: (limitsObject, value) => {
    if (!(value instanceof Array)) {
      throw new Error(`Expected "${value}" to be Array`)
    }

    for (const limitsObjectKey in limitsObject) {
      if (!(limitsObjectKey in validators.array)) {
        throw new Error(
          `"${limitsObjectKey}" is not a valid validation for arrays.`
          + ` Use any of these: ${validValidations.array}.`
        )
      }

      validators.array[limitsObjectKey](value, limitsObject[limitsObjectKey])
    }

    return true
  },
  number: (limitsObject, value) => {
    if (typeof value !== 'number') {
      throw new Error(`Expected "${value}" to be number`)
    }

    for (const limitsObjectKey in limitsObject) {
      if (!(limitsObjectKey in validators.number)) {
        throw new Error(
          `"${limitsObjectKey}" is not a valid validation for numbers.`
          + ` Use any of these: ${validValidations.number}.`
        )
      }

      validators.number[limitsObjectKey](value, limitsObject[limitsObjectKey])
    }

    return true
  },
  string: (limitsObject, value) => {
    if (typeof value !== 'string') {
      throw new Error(`Expected "${value}" to be string`)
    }

    for (const limitsObjectKey in limitsObject) {
      if (!(limitsObjectKey in validators.string)) {
        throw new Error(
          `"${limitsObjectKey}" is not a valid validation for strings.`
          + ` Use any of these: ${validValidations.string}.`
        )
      }

      validators.string[limitsObjectKey](value, limitsObject[limitsObjectKey])
    }

    return true
  },
}

/**
 * @param {keyof regexesForString} key
 * @param {string} value
 * @param {boolean} toBe
 */
function applyRegexValidations(key, value, toBe) {
  if (toBe === true && !regexesForString[key].test(value)) {
    throwValidationError(
      `string:${key}`,
      `${prefixes.string}"${value}" to be ${key}.`
    )
  }

  if (toBe === false && regexesForString[key].test(value)) {
    throwValidationError(
      `string:${key}`,
      `${prefixes.string}"${value}" to not be ${key}.`
    )
  }
}

/**
 * @param {any[]} array
 * @param {number} [maxSymbols]
 * @returns {string}
 * @throws {Error}
 */
function arrayStringify(array, maxSymbols = 30) {
  if (!(array instanceof Array)) {
    throw new Error('The input value "array" must be an Array')
  }

  let arrayStr = array.toString()

  arrayStr = (arrayStr.length > maxSymbols)
    ? `${arrayStr.substring(0, maxSymbols - 4)} ...`
    : arrayStr
  arrayStr = `[${arrayStr}]`

  return arrayStr
}

/**
 * @param {string} errorCode
 * @param {string} errorMessage
 * @throws {Error}
 */
function throwValidationError(errorCode, errorMessage) {
  const error = new ValidationError(errorMessage)
  // @ts-ignore
  if (errorCode) error.code = errorCode

  throw error
}
