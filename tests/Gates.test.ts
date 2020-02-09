import { Cx } from '../src/Complex'
import * as Gates from '../src/Gates'

describe('X, Y, Z Gate', () => {
  const X = Gates.X()
  const Y = Gates.Y()
  const Z = Gates.Z()

  it('X should create 0<->1', () => {
    expect(X.toDense()).toEqual([
      [Cx(0), Cx(1)],
      [Cx(1), Cx(0)],
    ])
  })

  it('Y', () => {
    expect(Y.toDense()).toEqual([
      [Cx(0), Cx(0, -1)],
      [Cx(0, 1), Cx(0)],
    ])
  })

  it('Z', () => {
    expect(Z.toDense()).toEqual([
      [Cx(1), Cx(0)],
      [Cx(0), Cx(-1)],
    ])
  })

  it('X^2 should be identity', () => {
    expect(X.mulOp(X).toDense()).toEqual(Gates.I().toDense())
  })

  it('X * Y = i Z', () => {
    const lhs = X.mulOp(Y).toDense()
    const rhs = Z.mulConstant(Cx(0, 1)).toDense()
    // see https://www.npmjs.com/package/jest-matcher-deep-close-to (no types!)
    // https://github.com/facebook/jest/issues/4058
    // or do something with toDense for the sake of tests
    expect(lhs[0][0].re).toBeCloseTo(rhs[0][0].re)
    expect(lhs[0][0].im).toBeCloseTo(rhs[0][0].im)
    expect(lhs[1][0].re).toBeCloseTo(rhs[1][0].re)
    expect(lhs[1][0].im).toBeCloseTo(rhs[1][0].im)
    expect(lhs[0][1].re).toBeCloseTo(rhs[0][1].re)
    expect(lhs[0][1].im).toBeCloseTo(rhs[0][1].im)
    expect(lhs[1][1].re).toBeCloseTo(rhs[1][1].re)
    expect(lhs[1][1].im).toBeCloseTo(rhs[1][1].im)
  })
})
