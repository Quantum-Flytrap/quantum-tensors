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

/**
 * Grid interface in primitives
 */
export interface IGrid {
  cols: number
  rows: number
  cells: ICell[]
}

/**
 * Cell interface in primitives
 */
export interface ICell {
  coord: ICoord
  element: string
  rotation: number
  polarization: number
  percentage?: number
}

/**
 * Coordinates interface in primitives
 */
export interface ICoord {
  x: number
  y: number
}

/**
 * Photon indicator interface for glue code with qt Photons
 * @deprecated
 */
export interface IIndicator {
  x: number
  y: number
  direction: DirEnum
  polarization: PolEnum
}

/**
 * Temporary interface for localized operators and grid informations
 */
export interface IOperatorGrid {
  sizeX: number
  sizeY: number
  operators: IXYOperator[]
  globalOperator: Operator
}

/**
 * Laser starting polarization enum
 */
export const enum PolEnum {
  V = 'V',
  H = 'H',
}

/**
 * Laser starting direction enum
 */
export const enum DirEnum {
  '>' = '>',
  '^' = '^',
  '<' = '<',
  'v' = 'v',
}

/**
 * List of element names
 */
export enum Elem {
  // Basic
  Void = 'Void',
  Wall = 'Wall',
  Gate = 'Gate',
  // Source
  Laser = 'Laser',
  NonLinearCrystal = 'NonLinearCrystal',
  // Direction
  Mirror = 'Mirror',
  BeamSplitter = 'BeamSplitter',
  PolarizingBeamSplitter = 'PolarizingBeamSplitter',
  CoatedBeamSplitter = 'CoatedBeamSplitter',
  CornerCube = 'CornerCube',
  // Absorption
  Detector = 'Detector',
  Rock = 'Rock',
  Mine = 'Mine',
  Absorber = 'Absorber',
  DetectorFour = 'DetectorFour',
  // Polarization
  Polarizer = 'Polarizer',
  QuarterWavePlate = 'QuarterWavePlate',
  HalfWavePlate = 'HalfWavePlate',
  SugarSolution = 'SugarSolution',
  FaradayRotator = 'FaradayRotator',
  // Phase
  Glass = 'Glass',
  VacuumJar = 'VacuumJar',
}
