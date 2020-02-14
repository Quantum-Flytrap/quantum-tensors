/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/interface-name-prefix */
import Complex from '../src/Complex'
import Vector from '../src/Vector'
import Operator from '../src/Operator'

export {}

declare global {
  namespace jest {
    interface Matchers<R> {
      myMatcher: (received: string) => CustomMatcherResult
      vectorCloseTo: (received: Vector, eps?: number) => CustomMatcherResult
      vectorCloseToNumbers: (received: Complex[], eps?: number) => CustomMatcherResult
      operatorCloseToNumbers: (received: Complex[][], eps?: number) => CustomMatcherResult
    }
  }
}

/**
 * An example, from https://stackoverflow.com/questions/43667085/extending-third-party-module-that-is-globally-exposed.
 * @param this
 * @param received
 * @param expected
 */
function myMatcher<T>(this: jest.MatcherUtils, received: string, expected: string): jest.CustomMatcherResult {
  const pass = received === expected
  return {
    pass,
    message: (): string => `Expected ${received}\nReceived: ${expected}`,
  }
}

/**
 *
 * @param this
 * @param received
 * @param expected
 */
function vectorCloseTo<T>(
  this: jest.MatcherUtils,
  received: Vector,
  expected: Vector,
  eps = 1e-6,
): jest.CustomMatcherResult {
  const pass = received.sub(expected).norm < eps
  return {
    pass,
    message: (): string => `Expected ${received.toString()}\nReceived: ${expected.toString()}`,
  }
}

/**
 *
 * @param this
 * @param received
 * @param expected
 */
function vectorCloseToNumbers<T>(
  this: jest.MatcherUtils,
  received: Vector,
  expected: Complex[],
  eps = 1e-6,
): jest.CustomMatcherResult {
  const receivedDense = received.toDense()
  let pass: boolean
  if (receivedDense.length !== expected.length) {
    pass = false
  } else {
    pass = receivedDense.map((c, i) => c.isCloseTo(expected[i], eps)).reduce((a, b) => a && b, true)
  }
  return {
    pass,
    message: (): string => `Expected ${receivedDense.toString()}\nReceived: ${expected.toString()}`,
  }
}

/**
 *
 * @param this
 * @param received
 * @param expected
 */
function operatorCloseToNumbers<T>(
  this: jest.MatcherUtils,
  received: Operator,
  expected: Complex[][],
  eps = 1e-6,
): jest.CustomMatcherResult {
  const receivedDense = received.toDense()
  let pass: boolean
  if (receivedDense.length !== expected.length || receivedDense[0].length !== expected[0].length) {
    pass = false
  } else {
    pass = receivedDense
      .flatMap((row, i) => row.map((c, j) => c.isCloseTo(expected[i][j], eps)))
      .reduce((a, b) => a && b, true)
  }
  return {
    pass,
    message: (): string => `Expected ${receivedDense.toString()}\nReceived: ${expected.toString()}`,
  }
}

expect.extend({
  myMatcher,
  vectorCloseTo,
  vectorCloseToNumbers,
  operatorCloseToNumbers,
})
