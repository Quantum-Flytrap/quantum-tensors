import _ from 'lodash'
import { Cx } from './Complex'
import Dimension from './Dimension'
import Operator from './Operator'
import { TAU } from './Constants'
import * as ops from './Ops'

const dimPol = Dimension.polarization()
const dimDir = Dimension.direction()
const idPol = Operator.identity([dimPol])
const idDir = Operator.identity([dimDir])
const projH = Operator.indicator([dimPol], 'H')
const projV = Operator.indicator([dimPol], 'V')

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
  return Operator.outer([ops.reflectFromPlaneDirection(angle), ops.reflectPhaseFromDenser()])
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
      [
        ['<', '>', Cx(1)],
        ['v', '^', Cx(1)],
        ['>', '<', Cx(1)],
        ['^', 'v', Cx(1)],
      ],
      [dimDir],
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

  return Operator.add([idDir.outer(projH), ops.reflectFromPlaneDirection(angle).outer(projV)])
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
    Operator.outer([ops.diodeForDirections(angle), ops.rotationMatrix(polarizationRotation * TAU, dimPol)]),
    Operator.outer([ops.diodeForDirections(angle + 180), ops.rotationMatrix(-polarizationRotation * TAU, dimPol)]),
  ])
}

/**
 * A linear polarizer.
 * @param angle In plane rotation, in degrees [0, 90, 180, 270], i.e  | - | -.
 * @param polarizationOrientation A number, in tau, i.e. [0, 1]. 0 transmits hotizontal polarization, 0.25 - vertical.
 * @todo Check angle conventions.
 */
export function polarizer(angle: number, polarizationOrientation: number): Operator {
  return Operator.add([
    Operator.outer([ops.diodeForDirections(angle), ops.projectionMatrix(polarizationOrientation * TAU, dimPol)]),
    Operator.outer([ops.diodeForDirections(angle + 180), ops.projectionMatrix(-polarizationOrientation * TAU, dimPol)]),
  ])
}

/**
 * As from Quantum Game 1, for compatibility.
 * Don't use in other.
 * @param angle In deg. Can be any, but we use [0, 45, 90, ...].
 * @todo Check convention, etc
 */
export function polarizerWE(angle: number): Operator {
  return polarizer(0, angle / 360)
}

/**
 * As from Quantum Game 1, for compatibility.
 * Don't use in other.
 * @param angle In deg. Can be any, but we use [0, 45, 90, ...].
 * @todo Check convention, etc
 */
export function PolarizerNS(angle: number): Operator {
  return polarizer(90, angle / 360)
}

/**
 * A phase plate for linear polarization.
 * @param angle In plane rotation, in degrees [0, 90, 180, 270], i.e  | - | -.
 * @param polarizationOrientation A number, in tau, i.e. [0, 1]. 0 transmits hotizontal polarization, 0.25 - vertical.
 * @param phase Phase shift. 1/4 (default) for quater-wave-plate, 1/2 for half-wave-plate.
 * @todo Convention: modify this polarization, ortonogal, or some other way?
 */
export function phasePlate(angle: number, polarizationOrientation: number, phase = 1 / 4): Operator {
  return Operator.add([
    Operator.outer([
      ops.diodeForDirections(angle),
      ops.phaseShiftForRealEigenvectors(polarizationOrientation * TAU, 0, phase, dimPol),
    ]),
    Operator.outer([
      ops.diodeForDirections(angle + 180),
      ops.phaseShiftForRealEigenvectors(-polarizationOrientation * TAU, 0, phase, dimPol),
    ]),
  ])
}

/**
 * As from Quantum Game 1, for compatibility.
 * Don't use in other.
 * @param angle In deg. Can be any, but we use [0, 45, 90, ...].
 * @todo Check convention, etc
 */
export function quarterWavePlateWE(angle: number): Operator {
  return phasePlate(0, angle / 360)
}

/**
 * As from Quantum Game 1, for compatibility.
 * @param angle In deg. Can be any, but we use [0, 45, 90, ...].
 * @todo Check convention, etc
 */
export function quarterWavePlateNS(angle: number): Operator {
  return phasePlate(90, angle / 360)
}
