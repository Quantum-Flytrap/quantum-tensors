import { Cx } from '../src/Complex'
import * as Gates from '../src/Gates'
import './customMatchers'

describe('X, Y, Z Gate', () => {
  const X = Gates.X()
  const Y = Gates.Y()
  const Z = Gates.Z()

  it('X should create 0<->1', () => {
    expect(X).operatorCloseToNumbers([
      [Cx(0), Cx(1)],
      [Cx(1), Cx(0)],
    ])
  })

  it('Y', () => {
    expect(Y).operatorCloseToNumbers([
      [Cx(0), Cx(0, -1)],
      [Cx(0, 1), Cx(0)],
    ])
  })

  it('Z', () => {
    expect(Z).operatorCloseToNumbers([
      [Cx(1), Cx(0)],
      [Cx(0), Cx(-1)],
    ])
  })

  it('X^2 should be identity', () => {
    expect(X.mulOp(X)).operatorCloseToNumbers(Gates.I().toDense())
  })

  it('X * Y = i Z', () => {
    const lhs = X.mulOp(Y)
    const rhs = Z.mulConstant(Cx(0, 1))
    expect(lhs).operatorCloseToNumbers(rhs.toDense())
  })
})
