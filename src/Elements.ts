import _ from "lodash"
import { Cx } from "./Complex"
import Dimension from "./Dimension"
import Operator from "./Operator"
import { TAU } from "./Constants"
import * as ops from "./Ops"

const dimPol = Dimension.polarization()
const dimDir = Dimension.direction()
const idPol = Operator.identity([dimPol])
const idDir = Operator.identity([dimDir])
const projH = Operator.indicator([dimPol], "H")
const projV = Operator.indicator([dimPol], "V")

const mod = (x: number, n: number): number => ((x % n) + n) % n

/**
 * Sugar solution (for polarization rotation)
 * @param rot Rotation angle (in TAU) for polarization. By default 1/8 (45deg).
 * For more sugar cubes, 2/8 and 3/8 make sense.
 */
export function sugarSolution(polarizationRotation = 0.125): Operator {
  return Operator.outer([idDir, ops.rotationMatrix(polarizationRotation * TAU, dimPol)])
}

/**
 * An attenuator, or: neutral density filter
 * @param r Amplitude attenuation factor. Intensity is changed by r^2.
 * By default it absorbs 50% photons.
 */
export function attenuator(r = Math.SQRT1_2): Operator {
  return ops.amplitudeIntensity(r, 0)
}

/**
 * A vacuum jar - advances phase by lambda/4.
 */
export function vacuumJar(): Operator {
  return ops.amplitudeIntensity(1, -0.25)
}

/**
 * A glass slab - delays phase by lambda/4.
 */
export function glassSlab(): Operator {
  return ops.amplitudeIntensity(1, +0.25)
}

/**
 * A both-sided mirror, from metal or any other optically denser medium.
 * 0: -, 45: /, 90: |, 135: \
 * @angle Angle in degrees, from -> CCW. Needs to be multiple of 45deg.
 * @returns Operator with dimensions [dimDir, dimPol].
 */
export function mirror(angle: number): Operator {
  return Operator.outer([
    ops.reflectFromPlaneDirection(angle),
    ops.reflectPhaseFromDenser(),
  ])
}

/**
 * A symmetric non-polarizing beam splitter.
 * Think: a very thin slab of glass.
 * 0: -, 45: /, 90: |, 135: \
 * @angle Angle in degrees, from -> CCW. Needs to be multiple of 45deg.
 * @returns Operator with dimensions [dimDir, dimPol].
 * @todo CHECK reflection phase.
 */
export function beamSplitter(angle: number): Operator {
  return Operator.outer([ops.reflectFromPlaneDirection(angle), ops.reflectPhaseFromDenser()])
    .mulConstant(Cx(0, 1)) // TODO: check phase here
    .add(ops.beamsplitterTransmittionDirections(angle).outer(idPol))
    .mulConstant(ops.isqrt2)
}

/**
 * A corner cube, from in all 4 directions.
 * https://en.wikipedia.org/wiki/Corner_reflector
 */
export function cornerCube(): Operator {
  return Operator.outer([
    Operator.fromSparseCoordNames(
      [["<", ">", Cx(1)], ["v", "^", Cx(1)], [">", "<", Cx(1)], ["^", "v", Cx(1)]],
      [dimDir]
    ),
    idPol,
  ])
}

/**
 * A polarizing beam splitter.
 * Think: a very thin slab of glass.
 * 45: [/], 135: [\]
 * @angle Angle in degrees, from -> CCW. Needs to be 45 or 135deg, up to 180deg.
 * @returns Operator with dimensions [dimDir, dimPol].
 */
export function polarizingBeamsplitter(angle: number): Operator {
  if (!_.includes([45, 135], mod(angle, 180))) {
    throw new Error(`polarizingBeamsplitter: angle ${angle} mod 180 not in [45, 135].`)
  }

  return Operator.add([
    idDir.outer(projH),
    ops.reflectFromPlaneDirection(angle).outer(projV),
  ])
}

/**
 * Faraday rotator (for polarization rotation)
 * https://en.wikipedia.org/wiki/Faraday_rotator
 * @angle Angle in degrees, from -> CCW. Needs to be multiple of 90.
 * 0: ->, 45: ^, 90: <-, 135: v
 * @param rot Rotation angle (in TAU) for polarization. By default 1/8 (45deg).
 * For more current, 2/8 and 3/8 make sense.
 */
export function faradayRotator(angle: number, polarizationRotation = 0.125): Operator {
  return Operator.add([
    Operator.outer([
      ops.diodeForDirections(angle),
      ops.rotationMatrix(polarizationRotation * TAU, dimPol),
    ]),
    Operator.outer([
      ops.diodeForDirections(angle + 180),
      ops.rotationMatrix(-polarizationRotation * TAU, dimPol),
    ]),
  ])
}

// TODO:
// - polarizer
// - phase plate