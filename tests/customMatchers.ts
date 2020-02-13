/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/interface-name-prefix */
export {}

declare global {
  namespace jest {
    interface Matchers<R> {
      myMatcher: (received: string) => CustomMatcherResult
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

expect.extend({
  myMatcher,
})
