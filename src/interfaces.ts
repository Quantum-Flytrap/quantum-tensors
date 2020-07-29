import Complex from './Complex'
import Vector from './Vector'
import Operator from './Operator'

/**
 * PARTICLE INTERFACE
 * Particle interface in primitives
 */
export interface IParticle {
  x: number
  y: number
  direction: number
  are: number
  aim: number
  bre: number
  bim: number
}

/**
 * A newer version of {@link IParticle}
 */
export interface IPolarization {
  x: number
  y: number
  direction: number
  h: Complex
  v: Complex
}

/**
 * For turning Operator in a sparse array of rows of columns
 */
export interface IColumnOrRow {
  coord: number[]
  vector: Vector
}

/**
 * For flat VectorEntry exports.
 */
export interface IEntryIndexValue {
  i: number
  v: Complex
}

/**
 * For flat MatrixEntry exports.
 */
export interface IEntryIndexIndexValue {
  i: number
  j: number
  v: Complex
}

/**
 * For basis changes.
 */
export interface INamedVector {
  name: string
  vector: Vector
}

/**
 * For position (x, y) and operator with direction and polarization dimensions.
 */
export interface IXYOperator {
  x: number
  y: number
  op: Operator
}

/**
 * And interface for visualizing kets. Serializes as amplitudes, and an array of coord strings.
 */
export interface IKetComponent {
  amplitude: Complex
  coordStrs: string[]
}

/**
 * Interface for localized operators
 */
export interface ITileIntensity {
  x: number
  y: number
  probability: number
}

/**
 * Interface used for goals and absorptions
 */
export interface IAbsorption {
  x: number
  y: number
  probability: number
}

/**
 * @todo Duplicate naming is confusing
 */
export interface IKetComponentFrame {
  amplitude: Complex
  particleCoords: IParticleCoord[]
}

// TODO: Should come as enum in a nicer format
export interface IParticleCoord {
  kind: string // for now only 'photon'
  x: number
  y: number
  dir: number // 0: > 1: ^, 2: <. 3: v
  pol: number // 0: H, 1: V
}
