import { TAU } from './Constants'
import { hslToHex } from './helpers'

/**
 * Complex number class
 * https://en.wikipedia.org/wiki/Complex_number
 */
export default class Complex {
  re: number
  im: number

  /**
   * Creates a complex number
   *
   * @param re - The first input number
   * @param im - The second input number
   * @returns Creates a complex number `z = z.re + i z.im `
   */
  constructor(re: number, im = 0) {
    this.re = re
    this.im = im
  }

  /**
   * Radius in polar coordinate
   * @returns number
   */
  get r(): number {
    return this.abs()
  }

  /**
   * Phi angle in polar coordinate
   * @returns angle
   */
  get phi(): number {
    return this.arg()
  }

  /**
   * Phi angle in polar coordinate with TAU
   * @returns angle divided by TAU
   */
  get phiTau(): number {
    return this.arg() / TAU
  }

  /**
   * Length squared: intensity probability
   * @returns number
   */
  abs2(): number {
    return Math.pow(this.re, 2) + Math.pow(this.im, 2)
  }

  /**
   * Absolute value (length)
   * @returns absolute value
   */
  abs(): number {
    return Math.sqrt(Math.pow(this.re, 2) + Math.pow(this.im, 2))
  }

  /**
   * Complex number argument in range [0,Tau]
   * @returns number
   */
  arg(): number {
    let arg = Math.atan2(this.im, this.re)
    if (arg < 0) {
      arg += TAU
    }
    return arg
  }

  /**
   * Complex conjugation
   * @returns z = z{re, -im}
   */
  conj(): Complex {
    return new Complex(this.re, -this.im)
  }

  /**
   * Addition
   * @param z2 complex number to be added
   * @returns z = z1 + z2
   */
  add(z2: Complex): Complex {
    const z1 = this
    return new Complex(z1.re + z2.re, z1.im + z2.im)
  }

  /**
   * Substraction
   * @param z2 complex number to be added
   * @returns z = z1 - z2
   */
  sub(z2: Complex): Complex {
    const z1 = this
    return new Complex(z1.re - z2.re, z1.im - z2.im)
  }

  /**
   * Multiplication
   * @param z2 complex number to be multiplied
   * @returns z = z1 * z2
   */
  mul(z2: Complex): Complex {
    const z1 = this
    return new Complex(z1.re * z2.re - z1.im * z2.im, z1.re * z2.im + z1.im * z2.re)
  }

  /**
   * Division
   * @param z2 complex number denominator
   * @returns z = z1 / z2
   */
  div(z2: Complex): Complex {
    const z1 = this
    const denom = z2.im * z2.im + z2.re * z2.re
    if (denom === 0) {
      throw new Error(`Cannot divide by 0. z1: ${this.toString()} / z2: ${z2.toString()}`)
    }
    const re = (z1.re * z2.re + z1.im * z2.im) / denom
    const im = (z2.re * z1.im - z1.re * z2.im) / denom
    return new Complex(re, im)
  }

  /* eslint-disable max-len */
  /**
   * Normalize
   * https://www.khanacademy.org/computing/computer-programming/programming-natural-simulations/programming-vectors/a/vector-magnitude-normalization
   * @returns z
   */
  normalize(): Complex {
    if (this.r !== 0) {
      return new Complex(this.re / this.r, this.im / this.r)
    } else {
      throw new Error('Cannot normalize a 0 length vector...')
    }
  }

  /**
   * Tests if a complex is close to another
   * @param z2 complex to test proximity
   * @param eps tolerance for the Euclidean norm
   * @returns z1 ~= z2
   */
  isCloseTo(z2: Complex, eps = 1e-6): boolean {
    return this.sub(z2).r < eps
  }

  /**
   * Tests if a complex is equal to another
   * @param z2 complex to test equality
   * @returns z1 === z2
   */
  equal(z2: Complex): boolean {
    return this.re === z2.re && this.im === z2.im
  }

  /**
   * Check if a complex number is zero
   * @return z1 === 0
   */
  isZero(): boolean {
    return this.re === 0 && this.im === 0
  }

  /**
   * Check if a complex number is one
   * @return z1 === 1
   */
  isOne(): boolean {
    return this.re === 1 && this.im === 0
  }

  /**
   * Check if a complex number is zero
   * @param eps tolerance for the Euclidean norm
   * @return z1 ~= 0
   */
  isAlmostZero(eps = 1e-6): boolean {
    return this.r < eps
  }

  /**
   * Check if a complex number is normalized
   * @return z1.r === 1
   */
  isNormal(): boolean {
    return this.r === 1
  }

  /**
   * Override toString() method
   * @param complexFormat choice between ["cartesian", "polar", "polarTau"]
   * @param precision float display precision
   * @returns string with appropriate format
   */
  toString(complexFormat = 'cartesian', precision = 2): string {
    switch (complexFormat) {
      case 'cartesian':
        return `(${this.re.toFixed(precision)} ${this.im >= 0 ? '+' : ''}${this.im.toFixed(precision)}i)`
      case 'polar':
        return `${this.r.toFixed(precision)} exp(${this.phi.toFixed(precision)}i)`
      case 'polarTau':
        return `${this.r.toFixed(precision)} exp(${this.phiTau.toFixed(precision)}τi)`
      default:
        throw new Error(`complexFormat '${complexFormat}' is not in ['cartesian', 'polar', 'polarTau'].`)
    }
  }

  /**
   * Generate HSL color from complex number
   * See complex domain coloring
   * @returns RGB string
   */
  toColor(): string {
    const angle = ((this.phi * 360) / TAU + 360) % 360
    return hslToHex(angle, 100, 100 - 50 * this.r)
  }

  /**
   * Create a complex number from polar coordinates
   * @param r Radius in polar coordinates
   * @param phi Angle in polar coordinates
   */
  static fromPolar(r: number, phi: number): Complex {
    return new Complex(r * Math.cos(phi), r * Math.sin(phi))
  }
}

/**
 * Syntactic sugar for `new Complex(re, im)`
 *
 * @param re - The first input number
 * @param im - The second input number
 * @returns Creates a complex number `z = z.re + i * z.im `
 */
export function Cx(re: number, im = 0): Complex {
  return new Complex(re, im)
}
