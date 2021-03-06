/* eslint-disable prefer-template, import/first */
import { inspect } from '@skpm/util'

export const stringify = inspect

const chalk = {
  green: s => `{{{CHALK_green}}}${s}{{{/CHALK_green}}}`,
  red: s => `{{{CHALK_red}}}${s}{{{/CHALK_red}}}`,
  dim: s => `{{{CHALK_dim}}}${s}{{{/CHALK_dim}}}`,
  inverse: s => `{{{CHALK_inverse}}}${s}{{{/CHALK_inverse}}}`,
}

const REVERSE_REGEX = /{{{CHALK_([a-z]+)}}}([\s\S]*?){{{\/CHALK_\1}}}/gm
export const reverseChalk = (realChalk, s) =>
  s.replace(REVERSE_REGEX, (match, mode, inside) =>
    realChalk[mode](reverseChalk(realChalk, inside))
  )

export const EXPECTED_COLOR = chalk.green
export const RECEIVED_COLOR = chalk.red

const NUMBERS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
]

export const SUGGEST_TO_EQUAL = chalk.dim(
  'Looks like you wanted to test for object/array equality with strict `toBe` matcher. You probably need to use `toEqual` instead.'
)

export const highlightTrailingWhitespace = text =>
  text.replace(/\s+$/gm, chalk.inverse('$&'))

export const printReceived = object =>
  RECEIVED_COLOR(highlightTrailingWhitespace(stringify(object)))
export const printExpected = value =>
  EXPECTED_COLOR(highlightTrailingWhitespace(stringify(value)))

export const getType = value => {
  if (typeof value === 'undefined') {
    return 'undefined'
  } else if (value === null) {
    return 'null'
  } else if (Array.isArray(value)) {
    return 'array'
  } else if (typeof value === 'boolean') {
    return 'boolean'
  } else if (typeof value === 'function') {
    return 'function'
  } else if (typeof value === 'number') {
    return 'number'
  } else if (typeof value === 'string') {
    return 'string'
  } else if (typeof value === 'object') {
    if (value.constructor === RegExp) {
      return 'regexp'
    } else if (value.constructor === Map) {
      return 'map'
    } else if (value.constructor === Set) {
      return 'set'
    } else if (value.class && typeof value.class === 'function') {
      return 'sketch-native'
    }
    return 'object'
    // $FlowFixMe https://github.com/facebook/flow/issues/1015
  } else if (typeof value === 'symbol') {
    return 'symbol'
  }

  throw new Error(`value of unknown type: ${value}`)
}

export const printWithType = (name, received, print) => {
  const type = getType(received)
  return (
    name +
    ':' +
    (type !== 'null' && type !== 'undefined' ? '\n  ' + type + ': ' : ' ') +
    print(received)
  )
}

export const matcherHint = (
  matcherName,
  received = 'received',
  expected = 'expected',
  options
) => {
  const secondArgument = options && options.secondArgument
  const isDirectExpectCall = options && options.isDirectExpectCall
  return (
    chalk.dim('expect' + (isDirectExpectCall ? '' : '(')) +
    RECEIVED_COLOR(received) +
    chalk.dim((isDirectExpectCall ? '' : ')') + matcherName + '(') +
    EXPECTED_COLOR(expected) +
    (secondArgument ? `, ${EXPECTED_COLOR(secondArgument)}` : '') +
    chalk.dim(')')
  )
}

export const ensureNoExpected = (expected, matcherName) => {
  if (typeof expected !== 'undefined') {
    throw new Error(
      `${matcherHint(`[.not]${matcherName || 'This'}`, undefined, '')}

Matcher does not accept any arguments.
${printWithType('Got', expected, printExpected)}`
    )
  }
}

export const ensureActualIsNumber = (actual, matcherName) => {
  if (typeof actual !== 'number') {
    throw new Error(
      matcherHint(`[.not]${matcherName || 'This matcher'}`) +
        '\n\n' +
        `Received value must be a number.\n` +
        printWithType('Received', actual, printReceived)
    )
  }
}

export const ensureExpectedIsNumber = (expected, matcherName) => {
  if (typeof expected !== 'number') {
    throw new Error(
      matcherHint(`[.not]${matcherName || 'This matcher'}`) +
        '\n\n' +
        `Expected value must be a number.\n` +
        printWithType('Got', expected, printExpected)
    )
  }
}

export const ensureNumbers = (actual, expected, matcherName) => {
  ensureActualIsNumber(actual, matcherName)
  ensureExpectedIsNumber(expected, matcherName)
}

export const pluralize = (word, count) =>
  (NUMBERS[count] || count) + ' ' + word + (count === 1 ? '' : 's')
