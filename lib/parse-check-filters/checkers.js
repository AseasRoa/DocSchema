import { checkResult } from '../errors/ValidationError.js'

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
 * @param {keyof regexesForString} filterName
 * @param {string} value
 * @param {[boolean, string]} tupleFilter
 * @returns {boolean}
 */
function applyRegexCheck(filterName, value, tupleFilter) {
  const [ toBe, errorMessage ] = tupleFilter

  if (toBe === true && !regexesForString[filterName].test(value)) {
    setError(
      errorMessage || `${errorPrefixes.string}"${value}" to be ${filterName}`,
      filterName,
      tupleFilter[0]
    )

    return false
  }

  if (toBe === false && regexesForString[filterName].test(value)) {
    setError(
      errorMessage ||`${errorPrefixes.string}"${value}" to not be ${filterName}`,
      filterName,
      tupleFilter[0]
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
 * @param {string} message
 * @param {keyof Filters} filterName
 * @param {boolean | number | string | RegExp} filterValue
 */
function setError(message, filterName, filterValue) {
  checkResult.message = message
  checkResult.kind = 'filter'
  checkResult.filter = { name: filterName, value: filterValue }
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
          customErrorMessage
          || `${errorPrefixes.array}"${arrayStr}" to have ${toBe} or more elements`,
          'min',
          toBe
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
          customErrorMessage
          || `${errorPrefixes.array}"${arrayStr}" to have ${toBe} or less elements`,
          'max',
          toBe
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
          customErrorMessage
          || `${errorPrefixes.array}"${arrayStr}" to have exactly ${toBe} elements`,
          'length',
          toBe
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
          customErrorMessage
          || `${errorPrefixes.number}${value} to be ${toBe} or higher`,
          'min',
          toBe
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
          customErrorMessage
          || `${errorPrefixes.number}${value} to be ${toBe} or lower`,
          'max',
          toBe
        )

        return false
      }

      return true
    },
    gte: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (value < toBe) {
        setError(
          customErrorMessage
          || `${errorPrefixes.number}${value} to be ${toBe} or higher`,
          'gte',
          toBe
        )

        return false
      }

      return true
    },
    lte: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (value > toBe) {
        setError(
          customErrorMessage
          || `${errorPrefixes.number}${value} to be ${toBe} or lower`,
          'lte',
          toBe
        )

        return false
      }

      return true
    },
    gt: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (value <= toBe) {
        setError(
          customErrorMessage
          || `${errorPrefixes.number}${value} to be higher than ${toBe}`,
          'gt',
          toBe
        )

        return false
      }

      return true
    },
    lt: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (value >= toBe) {
        setError(
          customErrorMessage
          || `${errorPrefixes.number}${value} to be lower than ${toBe}`,
          'lt',
          toBe
        )

        return false
      }

      return true
    },
    step: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if ((value % toBe !== 0)) {
        setError(
          customErrorMessage
          || `${errorPrefixes.number}${value} to be multiple of ${toBe}`,
          'step',
          toBe
        )

        return false
      }

      return true
    },
    int: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter
      const isInteger = Number.isInteger(value)

      if (toBe === true && !isInteger) {
        setError(
          customErrorMessage
          || `${errorPrefixes.number}${value} to be integer`,
          'int',
          toBe
        )

        return false
      }

      if (toBe === false && isInteger) {
        setError(
          customErrorMessage
          || `${errorPrefixes.number}${value} not to be integer`,
          'int',
          toBe
        )

        return false
      }

      return true
    },
    finite: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter
      const isFinite = Number.isFinite(value)

      if (toBe === true && !isFinite) {
        setError(
          customErrorMessage
          || `${errorPrefixes.number}${value} to be finite`,
          'finite',
          toBe
        )

        return false
      }

      if (toBe === false && isFinite) {
        setError(
          customErrorMessage
          || `${errorPrefixes.number}${value} not to be finite`,
          'finite',
          toBe
        )

        return false
      }

      return true
    },
    safeInt: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (!Number.isInteger(value)) {
        setError(
          customErrorMessage
          || `${errorPrefixes.number}${value} to be integer`,
          'safeInt',
          toBe
        )

        return false
      }

      if (
        toBe === true
        && (value < Number.MIN_SAFE_INTEGER || value > Number.MAX_SAFE_INTEGER)
      ) {
        setError(
          customErrorMessage
          || `${errorPrefixes.number}${value} to be safe`,
          'safeInt',
          toBe
        )

        return false
      }

      if (
        toBe === false
        && (value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER)
      ) {
        setError(
          customErrorMessage
          || `${errorPrefixes.number}${value} not to be safe`,
          'safeInt',
          toBe
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
          customErrorMessage
          || `${errorPrefixes.string}"${value}" to be at least ${toBe} characters long`,
          'min',
          toBe
        )

        return false
      }

      return true
    },
    max: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (value.length > toBe) {
        setError(
          customErrorMessage
          || `${errorPrefixes.string}"${value}" to be max ${toBe} characters long`,
          'max',
          toBe
        )

        return false
      }

      return true
    },
    length: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (value.length !== toBe) {
        setError(
          customErrorMessage
          || `${errorPrefixes.string}"${value}" to be exactly ${toBe} characters long`,
          'length',
          toBe
        )

        return false
      }

      return true
    },
    startsWith: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (!value.startsWith(toBe)) {
        setError(
          customErrorMessage
          || `${errorPrefixes.string}"${value}" to start with "${toBe}"`,
          'startsWith',
          toBe
        )

        return false
      }

      return true
    },
    endsWith: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (!value.endsWith(toBe)) {
        setError(
          customErrorMessage
          || `${errorPrefixes.string}"${value}" to end with "${toBe}"`,
          'endsWith',
          toBe
        )

        return false
      }

      return true
    },
    includes: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (!value.includes(toBe)) {
        setError(
          customErrorMessage
          || `${errorPrefixes.string}"${value}" to include "${toBe}"`,
          'endsWith',
          toBe
        )

        return false
      }

      return true
    },
    excludes: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (value.includes(toBe)) {
        setError(
          customErrorMessage
          || `${errorPrefixes.string}"${value}" not to include "${toBe}"`,
          'endsWith',
          toBe
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
            customErrorMessage
            || `${errorPrefixes.string}"${value}" to be URL`,
            'url',
            toBe
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
          customErrorMessage
          || `${errorPrefixes.string}"${value}" not to be URL`,
          'url',
          toBe
        )

        return false
      }

      return true
    },
    pattern: (value, tupleFilter) => {
      const [ toBe, customErrorMessage ] = tupleFilter

      if (!toBe.test(value)) {
        setError(
          customErrorMessage
          || `${errorPrefixes.string}"${value}" to respect the regex pattern ${toBe}`,
          'pattern',
          toBe
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
          customErrorMessage
          || `${errorPrefixes.string}"${value}" to be IP address`,
          'ip',
          toBe
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
          customErrorMessage
          || `${errorPrefixes.string}"${value}" to not be IP address`,
          'ip',
          toBe
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
