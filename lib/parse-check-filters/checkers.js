import { setLastError } from '../errors/ValidationError.js'

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
 * @type {Record<keyof checkers, string>}
 */
const errorPrefixes = {
  array: 'Expected array ',
  number: 'Expected number ',
  string: 'Expected string '
}

/**
 * @param {keyof regexesForString} key
 * @param {string} value
 * @param {boolean} toBe
 * @returns {boolean}
 */
function applyRegexCheck(key, value, toBe) {
  if (toBe === true && !regexesForString[key].test(value)) {
    setError(
      `string:${key}`,
      `${errorPrefixes.string}"${value}" to be ${key}.`
    )

    return false
  }

  if (toBe === false && regexesForString[key].test(value)) {
    setError(
      `string:${key}`,
      `${errorPrefixes.string}"${value}" to not be ${key}.`
    )

    return false
  }

  return true
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
 */
function setError(errorCode, errorMessage) {
  setLastError(errorMessage, errorCode)
}

const checkers = {
  /**
   * @type {{
   *   min:    function(any[], number): boolean,
   *   max:    function(any[], number): boolean,
   *   length: function(any[], number): boolean,
   * }}
   */
  array: {
    min: (value, toBe) => {
      if (value.length < toBe) {
        const arrayStr = arrayStringify(value)

        setError(
          'array:min',
          `${errorPrefixes.array}"${arrayStr}" to have ${toBe} or more elements.`
        )

        return false
      }

      return true
    },
    max: (value, toBe) => {
      if (value.length > toBe) {
        const arrayStr = arrayStringify(value)

        setError(
          'array:max',
          `${errorPrefixes.array}"${arrayStr}" to have ${toBe} or less elements.`
        )

        return false
      }

      return true
    },
    length: (value, toBe) => {
      if (value.length !== toBe) {
        const arrayStr = arrayStringify(value)

        setError(
          'array:length',
          `${errorPrefixes.array}"${arrayStr}" to have exactly ${toBe} elements.`
        )

        return false
      }

      return true
    }
  },
  /**
   * @type {{
   *   min:  function(number, number): boolean,
   *   max:  function(number, number): boolean,
   *   gte:  function(number, number): boolean,
   *   lte:  function(number, number): boolean,
   *   gt:   function(number, number): boolean,
   *   lt:   function(number, number): boolean,
   *   step: function(number, number): boolean,
   *   int:     function(number, boolean): boolean,
   *   finite:  function(number, boolean): boolean,
   *   safeInt: function(number, boolean): boolean,
   *   min:     function(number, number): boolean,
   * }}
   */
  number: {
    // gte alias
    min: (value, toBe) => {
      if (value < toBe) {
        setError(
          'number:min',
          `${errorPrefixes.number}${value} to be ${toBe} or higher.`
        )

        return false
      }

      return true
    },
    // lte alias
    max: (value, toBe) => {
      if (value > toBe) {
        setError(
          'number:max',
          `${errorPrefixes.number}${value} to be ${toBe} or lower.`
        )

        return false
      }

      return true
    },
    gte: (value, toBe) => {
      if (value < toBe) {
        setError(
          'number:gte',
          `${errorPrefixes.number}${value} to be ${toBe} or higher.`
        )

        return false
      }

      return true
    },
    lte: (value, toBe) => {
      if (value > toBe) {
        setError(
          'number:lte',
          `${errorPrefixes.number}${value} to be ${toBe} or lower.`
        )

        return false
      }

      return true
    },
    gt: (value, toBe) => {
      if (value <= toBe) {
        setError(
          'number:gt',
          `${errorPrefixes.number}${value} to be higher than ${toBe}.`
        )

        return false
      }

      return true
    },
    lt: (value, toBe) => {
      if (value >= toBe) {
        setError(
          'number:lt',
          `${errorPrefixes.number}${value} to be lower than ${toBe}.`
        )

        return false
      }

      return true
    },
    step: (value, toBe) => {
      if ((value % toBe !== 0)) {
        setError(
          'number:step',
          `${errorPrefixes.number}${value} to be multiple of ${toBe}.`
        )

        return false
      }

      return true
    },
    int: (value, toBe) => {
      if (toBe === true && !Number.isInteger(value)) {
        setError(
          'number:int',
          `${errorPrefixes.number}${value} to be integer.`
        )

        return false
      }

      if (toBe === false && Number.isInteger(value)) {
        setError(
          'number:int',
          `${errorPrefixes.number}${value} not to be integer.`
        )

        return false
      }

      return true
    },
    finite: (value, toBe) => {
      if (toBe === true && !Number.isFinite(value)) {
        setError(
          'number:finite',
          `${errorPrefixes.number}${value} to be finite.`
        )

        return false
      }

      if (toBe === false && Number.isFinite(value)) {
        setError(
          'number:finite',
          `${errorPrefixes.number}${value} not to be finite.`
        )

        return false
      }

      return true
    },
    safeInt: (value, toBe) => {
      if (!Number.isInteger(value)) {
        setError(
          'number:safe',
          `${errorPrefixes.number}${value} to be integer.`
        )

        return false
      }

      if (
        toBe === true
        && (value < Number.MIN_SAFE_INTEGER || value > Number.MAX_SAFE_INTEGER)
      ) {
        setError(
          'number:safe',
          `${errorPrefixes.number}${value} to be safe.`
        )

        return false
      }

      if (
        toBe === false
        && (value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER)
      ) {
        setError(
          'number:safe',
          `${errorPrefixes.number}${value} not to be safe.`
        )

        return false
      }

      return true
    }
  },
  /**
   * @type {{
   *   min:  function(string, number): boolean,
   *   max:  function(string, number): boolean,
   *   length:  function(string, number): boolean,
   *   startsWith: function(string, string): boolean,
   *   endsWith: function(string, string): boolean,
   *   includes: function(string, string): boolean,
   *   excludes: function(string, string): boolean,
   *   url: function(string, boolean): boolean,
   *   pattern: function(string, RegExp): boolean,
   *   ip: function(string, boolean): boolean,
   *   email: function(string, boolean): boolean,
   *   cuid: function(string, boolean): boolean,
   *   cuid2: function(string, boolean): boolean,
   *   ulid: function(string, boolean): boolean,
   *   uuid: function(string, boolean): boolean,
   *   ipv4: function(string, boolean): boolean,
   *   ipv6: function(string, boolean): boolean,
   * }}
   */
  string: {
    min: (value, toBe) => {
      if (value.length < toBe) {
        setError(
          'string:min',
          `${errorPrefixes.string}"${value}" to be at least ${toBe} symbols long.`
        )

        return false
      }

      return true
    },
    max: (value, toBe) => {
      if (value.length > toBe) {
        setError(
          'string:max',
          `${errorPrefixes.string}"${value}" to be max ${toBe} symbols long.`
        )

        return false
      }

      return true
    },
    length: (value, toBe) => {
      if (value.length !== toBe) {
        setError(
          'string:length',
          `${errorPrefixes.string}"${value}" to be exactly ${toBe} symbols long.`
        )

        return false
      }

      return true
    },
    startsWith: (value, toBe) => {
      if (!value.startsWith(toBe)) {
        setError(
          'string:startsWith',
          `${errorPrefixes.string}"${value}" to start with "${toBe}".`
        )

        return false
      }

      return true
    },
    endsWith: (value, toBe) => {
      if (!value.endsWith(toBe)) {
        setError(
          'string:endsWith',
          `${errorPrefixes.string}"${value}" to end with "${toBe}".`
        )

        return false
      }

      return true
    },
    includes: (value, toBe) => {
      if (!value.includes(toBe)) {
        setError(
          'string:endsWith',
          `${errorPrefixes.string}"${value}" to include "${toBe}".`
        )

        return false
      }

      return true
    },
    excludes: (value, toBe) => {
      if (value.includes(toBe)) {
        setError(
          'string:endsWith',
          `${errorPrefixes.string}"${value}" not to include "${toBe}".`
        )

        return false
      }

      return true
    },
    url: (value, toBe) => {
      if (toBe === true) {
        try {
          const url = new URL(value)
        }
        catch {
          setError(
            'string:url',
            `${errorPrefixes.string}"${value}" to be URL.`
          )

          return false
        }
      }

      if (toBe === false) {
        try {
          const url = new URL(value)
        }
        catch {
          return true
        }

        setError(
          'string:url',
          `${errorPrefixes.string}"${value}" not to be URL.`
        )

        return false
      }

      return true
    },
    pattern: (value, toBe) => {
      if (!toBe.test(value)) {
        setError(
          'string:pattern',
          `${errorPrefixes.string}"${value}" to respect the regex pattern ${toBe}.`
        )

        return false
      }

      return true
    },
    ip: (value, toBe) => {
      if (
        toBe === true
        && (
          !regexesForString.ipv4.test(value)
          && !regexesForString.ipv6.test(value)
        )
      ) {
        setError(
          'string:ip',
          `${errorPrefixes.string}"${value}" to be IP address.`
        )

        return false
      }

      if (
        toBe === false
        && (
          regexesForString.ipv4.test(value)
          || regexesForString.ipv6.test(value)
        )
      ) {
        setError(
          'string:ip',
          `${errorPrefixes.string}"${value}" to not be IP address.`
        )

        return false
      }

      return true
    },
    email: (value, toBe) => {
      return applyRegexCheck('email', value, toBe)
    },
    cuid: (value, toBe) => {
      return applyRegexCheck('cuid', value, toBe)
    },
    cuid2: (value, toBe) => {
      return applyRegexCheck('cuid2', value, toBe)
    },
    ulid: (value, toBe) => {
      return applyRegexCheck('ulid', value, toBe)
    },
    uuid: (value, toBe) => {
      return applyRegexCheck('uuid', value, toBe)
    },
    ipv4: (value, toBe) => {
      return applyRegexCheck('ipv4', value, toBe)
    },
    ipv6: (value, toBe) => {
      return applyRegexCheck('ipv6', value, toBe)
    }
  }
}

export { checkers }
