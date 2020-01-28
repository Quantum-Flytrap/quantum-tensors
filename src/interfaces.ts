import Complex from './Complex'

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
