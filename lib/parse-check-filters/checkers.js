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
 * @param {[boolean, string]} tupleFilter
 * @returns {boolean}
 */
function applyRegexCheck(key, value, tupleFilter) {
  const [ toBe, errorMessage ] = tupleFilter

  if (toBe === true && !regexesForString[key].test(value)) {
    setError(
      `string:${key}`,
      errorMessage || `${errorPrefixes.string}"${value}" to be ${key}`
    )

    return false
  }

  if (toBe === false && regexesForString[key].test(value)) {
    setError(
      `string:${key}`,
      errorMessage ||`${errorPrefixes.string}"${value}" to not be ${key}`
    )

    return false
  }

  return true
}

/**
 * @param {any[]} array
 * @param {number} [maxSymbols]
 * @returns {string}
 * @throws {TypeError}
 */
function arrayStringify(array, maxSymbols = 30) {
  if (!(array instanceof Array)) {
    throw new TypeError('The input value "array" must be an Array')
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
   *   min:    function(any[], [number, string]): boolean,
   *   max:    function(any[], [number, string]): boolean,
   *   length: function(any[], [number, string]): boolean,
   * }}
   */
  array: {
    min: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (value.length < toBe) {
        const arrayStr = arrayStringify(value)

        setError(
          'array:min',
          customErrorMessage
          || `${errorPrefixes.array}"${arrayStr}" to have ${toBe} or more elements`
        )

        return false
      }

      return true
    },
    max: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (value.length > toBe) {
        const arrayStr = arrayStringify(value)

        setError(
          'array:max',
          customErrorMessage
          || `${errorPrefixes.array}"${arrayStr}" to have ${toBe} or less elements`
        )

        return false
      }

      return true
    },
    length: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (value.length !== toBe) {
        const arrayStr = arrayStringify(value)

        setError(
          'array:length',
          customErrorMessage
          || `${errorPrefixes.array}"${arrayStr}" to have exactly ${toBe} elements`
        )

        return false
      }

      return true
    }
  },
  /**
   * @type {{
   *   min:  function(number, [number, string]): boolean,
   *   max:  function(number, [number, string]): boolean,
   *   gte:  function(number, [number, string]): boolean,
   *   lte:  function(number, [number, string]): boolean,
   *   gt:   function(number, [number, string]): boolean,
   *   lt:   function(number, [number, string]): boolean,
   *   step: function(number, [number, string]): boolean,
   *   int:     function(number, [boolean, string]): boolean,
   *   finite:  function(number, [boolean, string]): boolean,
   *   safeInt: function(number, [boolean, string]): boolean,
   * }}
   */
  number: {
    // gte alias
    min: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (value < toBe) {
        setError(
          'number:min',
          customErrorMessage
          || `${errorPrefixes.number}${value} to be ${toBe} or higher`
        )

        return false
      }

      return true
    },
    // lte alias
    max: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (value > toBe) {
        setError(
          'number:max',
          customErrorMessage
          || `${errorPrefixes.number}${value} to be ${toBe} or lower`
        )

        return false
      }

      return true
    },
    gte: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (value < toBe) {
        setError(
          'number:gte',
          customErrorMessage
          || `${errorPrefixes.number}${value} to be ${toBe} or higher`
        )

        return false
      }

      return true
    },
    lte: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (value > toBe) {
        setError(
          'number:lte',
          customErrorMessage
          || `${errorPrefixes.number}${value} to be ${toBe} or lower`
        )

        return false
      }

      return true
    },
    gt: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (value <= toBe) {
        setError(
          'number:gt',
          customErrorMessage
          || `${errorPrefixes.number}${value} to be higher than ${toBe}`
        )

        return false
      }

      return true
    },
    lt: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (value >= toBe) {
        setError(
          'number:lt',
          customErrorMessage
          || `${errorPrefixes.number}${value} to be lower than ${toBe}`
        )

        return false
      }

      return true
    },
    step: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if ((value % toBe !== 0)) {
        setError(
          'number:step',
          customErrorMessage
          || `${errorPrefixes.number}${value} to be multiple of ${toBe}`
        )

        return false
      }

      return true
    },
    int: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (toBe === true && !Number.isInteger(value)) {
        setError(
          'number:int',
          customErrorMessage
          || `${errorPrefixes.number}${value} to be integer`
        )

        return false
      }

      if (toBe === false && Number.isInteger(value)) {
        setError(
          'number:int',
          customErrorMessage
          || `${errorPrefixes.number}${value} not to be integer`
        )

        return false
      }

      return true
    },
    finite: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (toBe === true && !Number.isFinite(value)) {
        setError(
          'number:finite',
          customErrorMessage
          || `${errorPrefixes.number}${value} to be finite`
        )

        return false
      }

      if (toBe === false && Number.isFinite(value)) {
        setError(
          'number:finite',
          customErrorMessage
          || `${errorPrefixes.number}${value} not to be finite`
        )

        return false
      }

      return true
    },
    safeInt: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (!Number.isInteger(value)) {
        setError(
          'number:safe',
          customErrorMessage
          || `${errorPrefixes.number}${value} to be integer`
        )

        return false
      }

      if (
        toBe === true
        && (value < Number.MIN_SAFE_INTEGER || value > Number.MAX_SAFE_INTEGER)
      ) {
        setError(
          'number:safe',
          customErrorMessage
          || `${errorPrefixes.number}${value} to be safe`
        )

        return false
      }

      if (
        toBe === false
        && (value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER)
      ) {
        setError(
          'number:safe',
          customErrorMessage
          || `${errorPrefixes.number}${value} not to be safe`
        )

        return false
      }

      return true
    }
  },
  /**
   * @type {{
   *   min:  function(string, [number, string]): boolean,
   *   max:  function(string, [number, string]): boolean,
   *   length:  function(string, [number, string]): boolean,
   *   startsWith: function(string, [string, string]): boolean,
   *   endsWith: function(string, [string, string]): boolean,
   *   includes: function(string, [string, string]): boolean,
   *   excludes: function(string, [string, string]): boolean,
   *   url: function(string, [boolean, string]): boolean,
   *   pattern: function(string, [RegExp, string]): boolean,
   *   ip: function(string, [boolean, string]): boolean,
   *   email: function(string, [boolean, string]): boolean,
   *   cuid: function(string, [boolean, string]): boolean,
   *   cuid2: function(string, [boolean, string]): boolean,
   *   ulid: function(string, [boolean, string]): boolean,
   *   uuid: function(string, [boolean, string]): boolean,
   *   ipv4: function(string, [boolean, string]): boolean,
   *   ipv6: function(string, [boolean, string]): boolean,
   * }}
   */
  string: {
    min: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (value.length < toBe) {
        setError(
          'string:min',
          customErrorMessage
          || `${errorPrefixes.string}"${value}" to be at least ${toBe} characters long`
        )

        return false
      }

      return true
    },
    max: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (value.length > toBe) {
        setError(
          'string:max',
          customErrorMessage
          || `${errorPrefixes.string}"${value}" to be max ${toBe} characters long`
        )

        return false
      }

      return true
    },
    length: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (value.length !== toBe) {
        setError(
          'string:length',
          customErrorMessage
          || `${errorPrefixes.string}"${value}" to be exactly ${toBe} characters long`
        )

        return false
      }

      return true
    },
    startsWith: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (!value.startsWith(toBe)) {
        setError(
          'string:startsWith',
          customErrorMessage
          || `${errorPrefixes.string}"${value}" to start with "${toBe}"`
        )

        return false
      }

      return true
    },
    endsWith: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (!value.endsWith(toBe)) {
        setError(
          'string:endsWith',
          customErrorMessage
          || `${errorPrefixes.string}"${value}" to end with "${toBe}"`
        )

        return false
      }

      return true
    },
    includes: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (!value.includes(toBe)) {
        setError(
          'string:endsWith',
          customErrorMessage
          || `${errorPrefixes.string}"${value}" to include "${toBe}"`
        )

        return false
      }

      return true
    },
    excludes: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (value.includes(toBe)) {
        setError(
          'string:endsWith',
          customErrorMessage
          || `${errorPrefixes.string}"${value}" not to include "${toBe}"`
        )

        return false
      }

      return true
    },
    url: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (toBe === true) {
        try {
          const url = new URL(value)
        }
        catch {
          setError(
            'string:url',
            customErrorMessage
            || `${errorPrefixes.string}"${value}" to be URL`
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
          customErrorMessage
          || `${errorPrefixes.string}"${value}" not to be URL`
        )

        return false
      }

      return true
    },
    pattern: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (!toBe.test(value)) {
        setError(
          'string:pattern',
          customErrorMessage
          || `${errorPrefixes.string}"${value}" to respect the regex pattern ${toBe}`
        )

        return false
      }

      return true
    },
    ip: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (
        toBe === true
        && (
          !regexesForString.ipv4.test(value)
          && !regexesForString.ipv6.test(value)
        )
      ) {
        setError(
          'string:ip',
          customErrorMessage
          || `${errorPrefixes.string}"${value}" to be IP address`
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
          customErrorMessage
          || `${errorPrefixes.string}"${value}" to not be IP address`
        )

        return false
      }

      return true
    },
    email: (value, tupleFilter) => {
      return applyRegexCheck('email', value, tupleFilter)
    },
    cuid: (value, tupleFilter) => {
      return applyRegexCheck('cuid', value, tupleFilter)
    },
    cuid2: (value, tupleFilter) => {
      return applyRegexCheck('cuid2', value, tupleFilter)
    },
    ulid: (value, tupleFilter) => {
      return applyRegexCheck('ulid', value, tupleFilter)
    },
    uuid: (value, tupleFilter) => {
      return applyRegexCheck('uuid', value, tupleFilter)
    },
    ipv4: (value, tupleFilter) => {
      return applyRegexCheck('ipv4', value, tupleFilter)
    },
    ipv6: (value, tupleFilter) => {
      return applyRegexCheck('ipv6', value, tupleFilter)
    }
  }
}

export { checkers }
