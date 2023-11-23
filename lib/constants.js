/**
 * List of From => To values
 *
 * IMPORTANT: For the keys, put keys like @constructor before @const, so the
 * tag replacements works properly after that.
 *
 * @see https://jsdoc.app/
 * @type  {Object<string, string>}
 */
export const TAG_REPLACEMENTS = Object.freeze({
  '@virtual'      : '@abstract',
  '@extends'      : '@augments',
  '@constructor'  : '@class',
  '@const'        : '@constant',
  '@defaultvalue' : '@default',
  '@desc'         : '@description',
  '@host'         : '@external',
  '@fileoverview' : '@file',
  '@overview'     : '@file',
  '@emits'        : '@fires',
  '@func'         : '@function',
  '@method'       : '@function',
  '@var'          : '@member',
  '@arg'          : '@param',
  '@argument'     : '@param',
  '@prop'         : '@property',
  '@return'       : '@returns',
  '@exception'    : '@throws',
  '@yield'        : '@yields',
  '@linkcode'     : '@link',
  '@linkplain'    : '@link'
})

/**
 * List of From => To values.
 * All From keys must be lowercase.
 *
 * Note: The star seems to be official "any" in JsDoc
 *
 * @type {Object<string, string>}
 */
export const COMMON_MISTAKE_FIXES = Object.freeze({
  ''       : '*',
  'any'    : '*',
  '[]'     : '*[]',
  'array'  : '*[]',
  '{}'     : 'Object<*,*>',
  'object' : 'Object<*,*>'
})
