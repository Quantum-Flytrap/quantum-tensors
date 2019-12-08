import Complex, { Cx } from './Complex'
import Operator from './Operator'
import Dimension from './Dimension'
import { TAU } from './Constants'

const dimPol = Dimension.polarization()
const dimDir = Dimension.direction()
const idPol = Operator.identity([dimPol])
const idDir = Operator.identity([dimDir])

const cos = (alpha: number): Complex => Cx(Math.cos(alpha), 0)
const sin = (alpha: number): Complex => Cx(Math.sin(alpha), 0)
const mod = (x: number, n: number): number => ((x % n) + n) % n

// not as fast as this one: https://en.wikipedia.org/wiki/Fast_inverse_square_root
export const isqrt2 = Cx(Math.SQRT1_2)

/**
 * A 2d matrix, a rotation for complex numbers.
 * @param alpha An angle, in radians, i.e. from the range [0, Tau].
 * @param dimension A dimension of size 2, e.g. spin or polarization.
 */
export function rotationMatrix(alpha: number, dimension: Dimension): Operator {
  const array = [
    [cos(alpha), sin(-alpha)],
    [sin(alpha), cos(alpha)],
  ]
  return Operator.fromArray(array, [dimension])
}

/**
 *  A 2d matrix, a projection for complex numbers.
 * @param alpha An angle, in radians, i.e. from the range [0, Tau].
 * @param dimension A dimension of size 2, e.g. spin or polarization.
 */
export function projectionMatrix(alpha: number, dimension: Dimension): Operator {
  const array = [
    [cos(alpha).mul(cos(alpha)), cos(alpha).mul(sin(alpha))],
    [cos(alpha).mul(sin(alpha)), sin(alpha).mul(sin(alpha))],
  ]
  return Operator.fromArray(array, [dimension])
}

/**
 *  A 2d matrix, phase shift between projections. For phase plate.
 * @param alpha An angle, in radians, i.e. from the range [0, Tau].
 * @param phase Phase shift for angle as for the main state, [0, 1].
 * @param phaseOrthogonal Phase shift for for the orthogonal state, [0, 1].
 * @param dimension A dimension of size 2, e.g. spin or polarization.
 */
export function phaseShiftForRealEigenvectors(
  alpha: number,
  phase: number,
  phaseOrthogonal: number,
  dimension: Dimension,
): Operator {
  return Operator.add([
    projectionMatrix(alpha, dimension).mulConstant(Complex.fromPolar(1, phase * TAU)),
    projectionMatrix(alpha + 0.25 * TAU, dimension).mulConstant(Complex.fromPolar(1, phaseOrthogonal * TAU)),
  ])
}

/**
 * Reflection from an optically lighter material.
 * Note that change horrizontal frame of reference.
 */
export function reflectPhaseFromLighter(): Operator {
  const array = [
    [Cx(-1), Cx(0)],
    [Cx(0), Cx(1)],
  ]
  return Operator.fromArray(array, [dimPol], [dimPol])
}

/**
 * Reflection from an optically denser material.
 * Note that change horrizontal frame of reference.
 */
export function reflectPhaseFromDenser(): Operator {
  const array = [
    [Cx(-1), Cx(0)],
    [Cx(0), Cx(1)],
  ]
  return Operator.fromArray(array, [dimPol], [dimPol])
}

/**
 * An omnidirectional operator multiplying by a complex number.
 * @param r Absolute value of amplitide multipier. E.g. Math.SQRT1_2 for
 * @param rot Phase multiplier, in TAU (from range: [0,1]).
 */
export function amplitudeIntensity(r: number, rot: number): Operator {
  return Operator.outer([idDir, idPol]).mulConstant(Complex.fromPolar(r, TAU * rot))
}

/**
 * A reflection from a plane that has two refletive sides.
 * Rotations: - / | \
 * @param angle In degrees, only values [0, 45, 90, 135]. From ->, counterclockwise.
 * @returns Operator with dimensions [Dimension.polarization()]
 */
export function reflectFromPlaneDirection(angle: number): Operator {
  let sparseCoords: [string, string, Complex][]
  switch (mod(angle, 180)) {
    case 0: // -
      sparseCoords = [
        ['v', '^', Cx(1)],
        ['^', 'v', Cx(1)],
      ]
      break
    case 45: // /
      sparseCoords = [
        ['^', '>', Cx(1)],
        ['>', '^', Cx(1)],
        ['v', '<', Cx(1)],
        ['<', 'v', Cx(1)],
      ]
      break
    case 90: // |
      sparseCoords = [
        ['<', '>', Cx(1)],
        ['>', '<', Cx(1)],
      ]
      break
    case 135: // \
      sparseCoords = [
        ['v', '>', Cx(1)],
        ['>', 'v', Cx(1)],
        ['^', '<', Cx(1)],
        ['<', '^', Cx(1)],
      ]
      break
    default:
      throw new Error(`Angle ${angle} % 180 isn't in the set [0, 45, 90, 135]`)
  }
  return Operator.fromSparseCoordNames(sparseCoords, [dimDir])
}

/**
 * An auxiliary operation for beam splitter transmittion directions.
 * @param angle Angle in degrees [0, 45, 90, 135] up to 180. --> and CCW.
 * @returns Operator with dimensions [Dimension.direction()].
 */
export function beamsplitterTransmittionDirections(angle: number): Operator {
  switch (mod(angle, 180)) {
    case 0: // -
      return Operator.fromSparseCoordNames(
        [
          ['^', '^', Cx(1)],
          ['v', 'v', Cx(1)],
        ],
        [dimDir],
      )
    case 45: // /
    case 135: // \
      return idDir
    case 90: // |
      return Operator.fromSparseCoordNames(
        [
          ['>', '>', Cx(1)],
          ['<', '<', Cx(1)],
        ],
        [dimDir],
      )
    default:
      throw new Error(`Angle ${angle} % 180 isn't in the set [0, 45, 90, 135].`)
  }
}

/**
 * An auxiliary operation for constructing other directional operators.
 * @param angle Angle in degrees [0, 90, 180, 270] up to 360. --> and CCW.
 * @returns Operator with dimensions [Dimension.direction()].
 */
export function diodeForDirections(angle: number): Operator {
  switch (mod(angle, 360)) {
    case 0: // ->
      return Operator.fromSparseCoordNames([['>', '>', Cx(1)]], [dimDir])
    case 90: // ^
      return Operator.fromSparseCoordNames([['^', '^', Cx(1)]], [dimDir])
    case 180: // <-
      return Operator.fromSparseCoordNames([['<', '<', Cx(1)]], [dimDir])
    case 270: // v
      return Operator.fromSparseCoordNames([['v', 'v', Cx(1)]], [dimDir])
    default:
      throw new Error(`Angle ${angle} % 360 isn't in the set [0, 90, 180, 270].`)
  }
}

// TODO:
// Add in elements "projection on"
