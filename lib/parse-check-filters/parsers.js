// Spare few bytes by saving values in variables
const boolean = 'boolean'
const number  = 'number'
const string  = 'string'

/**
 * Types and instances:
 * - String values to be checked using "typeof"
 * - Non-string values to be checked using "instanceof"
 */
const parsers = {
  array: {
    min: number,
    max: number,
    length: number,
  },
  number: {
    min: number,
    max: number,
    gte: number,
    lte: number,
    gt: number,
    lt: number,
    step: number,
    int: boolean,
    finite: boolean,
    safeInt: boolean,
  },
  string: {
    min: number,
    max: number,
    length: number,
    startsWith: string,
    endsWith: string,
    includes: string,
    excludes: string,
    url: string,
    pattern: RegExp,
    ip: boolean,
    email: boolean,
    cuid: boolean,
    cuid2: boolean,
    ulid: boolean,
    uuid: boolean,
    ipv4: boolean,
    ipv6: boolean,
  }
}

export { parsers }
