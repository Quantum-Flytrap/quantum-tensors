import { Cx } from '../src/Complex'
import * as Gates from '../src/Gates'
import './customMatchers'

describe('X, Y, Z Gate', () => {
  const X = Gates.X()
  const Y = Gates.Y()
  const Z = Gates.Z()

  it('X should create 0<->1', () => {
    expect(X.isCloseToUnitary()).toBe(true)
    expect(X).operatorCloseToNumbers([
      [Cx(0), Cx(1)],
      [Cx(1), Cx(0)],
    ])
    expect(X.mulOp(X).isCloseToIdentity()).toBe(true)
  })

  it('Y', () => {
    expect(Y.isCloseToUnitary()).toBe(true)
    expect(Y).operatorCloseToNumbers([
      [Cx(0), Cx(0, -1)],
      [Cx(0, 1), Cx(0)],
    ])
    expect(Y.mulOp(Y).isCloseToIdentity()).toBe(true)
  })

  it('Z', () => {
    expect(Z.isCloseToUnitary()).toBe(true)
    expect(Z).operatorCloseToNumbers([
      [Cx(1), Cx(0)],
      [Cx(0), Cx(-1)],
    ])
    expect(Z.mulOp(Z).isCloseToIdentity()).toBe(true)
  })

  it('X * Y = i Z', () => {
    const lhs = X.mulOp(Y)
    const rhs = Z.mulConstant(Cx(0, 1))
    expect(lhs).operatorCloseToNumbers(rhs.toDense())
  })
})

describe('All gates', () => {
  it('identity to be identity', () => {
    expect(Gates.I().isCloseToIdentity()).toBe(true)
  })

  it('all 1-qubit gates are unitary', () => {
    expect(Gates.I().isCloseToUnitary()).toBe(true)
    expect(Gates.X().isCloseToUnitary()).toBe(true)
    expect(Gates.Y().isCloseToUnitary()).toBe(true)
    expect(Gates.Z().isCloseToUnitary()).toBe(true)
    expect(Gates.H().isCloseToUnitary()).toBe(true)
    expect(Gates.S().isCloseToUnitary()).toBe(true)
    expect(Gates.T().isCloseToUnitary()).toBe(true)
  })

  it('some 1-qubit gates are Hermitian', () => {
    expect(Gates.I().isCloseToHermitian()).toBe(true)
    expect(Gates.X().isCloseToHermitian()).toBe(true)
    expect(Gates.Y().isCloseToHermitian()).toBe(true)
    expect(Gates.Z().isCloseToHermitian()).toBe(true)
    expect(Gates.H().isCloseToHermitian()).toBe(true)
    expect(Gates.S().isCloseToHermitian()).toBe(false)
    expect(Gates.T().isCloseToHermitian()).toBe(false)
  })

  it('all 2-qubit gates are unitary', () => {
    expect(Gates.CX().isCloseToUnitary()).toBe(true)
    expect(Gates.CZ().isCloseToUnitary()).toBe(true)
    expect(Gates.Swap().isCloseToUnitary()).toBe(true)
  })

  it('all 2-qubit gates are Hermitian', () => {
    expect(Gates.CX().isCloseToHermitian()).toBe(true)
    expect(Gates.CZ().isCloseToHermitian()).toBe(true)
    expect(Gates.Swap().isCloseToHermitian()).toBe(true)
  })

  it('all 3-qubit gates are unitary', () => {
    expect(Gates.CCX().isCloseToUnitary()).toBe(true)
    expect(Gates.CSwap().isCloseToUnitary()).toBe(true)
  })

  it('all 3-qubit gates are Hermitian', () => {
    expect(Gates.CCX().isCloseToHermitian()).toBe(true)
    expect(Gates.CSwap().isCloseToHermitian()).toBe(true)
  })
})
