import Complex, { Cx } from '../src/Complex'
// import Complex from "../src/Complex"
// import { VectorEntry } from "../src/Entry"

// Coordinates testing
describe('Complex', () => {
  it('should create a complex element from two numbers', () => {
    const complex = Cx(4, -4)
    expect(complex.isZero()).toBe(false)
    expect(complex.toString()).toEqual('(4.00 -4.00i)')
  })

  it('should return the complex conjugate of a complex number', () => {
    const complex1 = Cx(4, -4)
    const complex2 = Cx(3, 0)
    const conj1 = complex1.conj()
    expect(conj1.isZero()).toBe(false)
    expect(conj1.toString()).toEqual('(4.00 +4.00i)')
    const conj2 = complex2.conj()
    expect(conj2.isZero()).toBe(false)
    expect(conj2.toString()).toEqual('(3.00 +0.00i)')
  })

  it('should test if a Complex number is zero', () => {
    const complex1 = Cx(4)
    expect(complex1.isZero()).toBe(false)
    const complex2 = Cx(0, 1)
    expect(complex2.isZero()).toBe(false)
    const complex3 = Cx(0, 0)
    expect(complex3.isZero()).toBe(true)
  })

  it('should add two complex numbers', () => {
    const complex1 = Cx(4, -1)
    const complex2 = Cx(2, 3)
    const result1 = complex1.add(complex2)
    const result2 = complex2.add(complex1)
    expect(result1).toEqual({ re: 6, im: 2 })
    expect(result2).toEqual({ re: 6, im: 2 })
  })

  it('should substract two complex numbers', () => {
    const complex1 = Cx(4, -1)
    const complex2 = Cx(2, 3)
    const result1 = complex1.sub(complex2)
    const result2 = complex2.sub(complex1)
    expect(result1).toEqual({ re: 2, im: -4 })
    expect(result2).toEqual({ re: -2, im: 4 })
  })

  it('should multiply two complex numbers', () => {
    const complex1 = Cx(3, 2)
    const complex2 = Cx(1, 7)
    const result1 = complex1.mul(complex2)
    const result2 = complex2.mul(complex1)
    expect(result1).toEqual({ re: -11, im: 23 })
    expect(result2).toEqual({ re: -11, im: 23 })
  })

  it('should normalize if this.r is not 0', () => {
    const complex1 = Cx(0, 0)
    const complex2 = Cx(3, 4)
    expect(() => complex1.normalize()).toThrowError('Cannot normalize a 0 length vector...')
    expect(complex2.normalize()).toEqual({ re: 0.6, im: 0.8 })
  })

  it('should test for equality with a similar complex number', () => {
    const complex1 = Cx(3, 4)
    const complex2 = Cx(3, 4)
    const complex3 = Cx(1, 0)
    expect(complex1.equal(complex2)).toBe(true)
    expect(complex1.equal(complex3)).toBe(false)
  })

  it('should create a complex number from polar coordinates', () => {
    const r = 2
    const phi = 1
    const complex1 = Complex.fromPolar(r, phi)
    expect(complex1).toEqual({ im: 1.682941969615793, re: 1.0806046117362795 })
    expect(complex1.r).toBe(2)
    expect(complex1.phi).toBe(1)
  })
})
