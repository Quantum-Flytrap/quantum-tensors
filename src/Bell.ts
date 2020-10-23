import { Cx } from './Complex'
import Dimension from './Dimension'
import Vector from './Vector'
import Operator from './Operator'
import { DEG_TO_RAD } from './Constants'

// takem from Quantum Boxing
// https://github.com/sneakyweasel/quantum-boxing
// and maybe it can come back!

// TODO in main package:
// - jest
// - operators X, Y, Z, etc
// - how many non-zero entries in toString method
// - rename tensor dims
// - base change

// TODO HERE:
// - application
// - measurement
// - some formula view

const dimPol = Dimension.polarization()

export const singletState = Vector.fromSparseCoordNames(
  [
    ['HV', Cx(1)],
    ['VH', Cx(-1)],
  ],
  [dimPol, dimPol],
)

export const opI = Operator.identity([dimPol])

export const opX = Operator.fromSparseCoordNames(
  [
    ['V', 'H', Cx(1)],
    ['H', 'V', Cx(1)],
  ],
  [dimPol],
)

export const opY = Operator.fromSparseCoordNames(
  [
    ['V', 'H', Cx(0, 1)],
    ['H', 'V', Cx(0, -1)],
  ],
  [dimPol],
)

export const opZ = Operator.fromSparseCoordNames(
  [
    ['H', 'H', Cx(1)],
    ['V', 'V', Cx(-1)],
  ],
  [dimPol],
)

/**
 * Creates a lineart polarized state
 * @param alpha Angle for detector (in degrees)
 */
function linearPol(alpha: number): Vector {
  return Vector.fromSparseCoordNames(
    [
      ['H', Cx(Math.cos(alpha * DEG_TO_RAD))],
      ['V', Cx(Math.sin(alpha * DEG_TO_RAD))],
    ],
    [dimPol],
  )
}

/**
 * Mesure one qubit
 * @param alpha Angle of detector (in degrees)
 * @param vec Vector to be measured
 */
function measurementOne(alpha: number, vec: Vector): [number, number] {
  const res = linearPol(alpha).conj().dot(vec).abs2()
  return [res, 1 - res]
}

/**
 * Formats probability as percent string.
 * @param p number 0 to 1
 */
function perc(p: number): string {
  return `${(100 * p).toFixed(0)}%`
}

// testing
const ourState = linearPol(45)
const angles: number[] = [-45, 0, 45, 90, 135]
angles.forEach((alpha) => {
  const [res, opRes] = measurementOne(alpha, ourState)
  console.log(`At ${alpha} the result was: ${perc(res)} vs ${perc(opRes)}`)
})

// TO DO measumementOneOfTwo(alpha: number, particle: number)
