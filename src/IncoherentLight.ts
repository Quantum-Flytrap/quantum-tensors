/* eslint-disable-next-line */
import _ from 'lodash'
import { IXYOperator } from './interfaces'
import Vector from './Vector'
import Operator from './Operator'
import Dimension from './Dimension'
import Photons from './Photons'
import { incoherentLightOperator } from './Elements'
import { Cx } from './Complex'

/**
 * For classic, incoherent light:
 * only intensity, not phase or polarization
 */
export default class IncoherentLight {
  vector: Vector

  /**
   * Create a board for incoherent light.
   * Mostly for internal use.
   * @param sizeX An integer, size x (width) of the board.
   * @param sizeY An integer, size y (height) of the board.
   * @param vector Vector with [x1 y, dir].
   */
  constructor(vector: Vector) {
    this.vector = vector
  }

  /**
   * Create an empty board for photons, with a given size.
   * @param sizeX An integer, size x (width) of the board.
   * @param sizeY An integer, size y (height) of the board.
   */
  static emptySpace(sizeX: number, sizeY: number): IncoherentLight {
    const vector = Vector.zeros([Dimension.position(sizeX, 'x'), Dimension.position(sizeY, 'y'), Dimension.direction()])
    return new IncoherentLight(vector)
  }

  /**
   * Dimension x.
   */
  get dimX(): Dimension {
    return this.vector.dimensions[0]
  }

  /**
   * Dimension x.
   */
  get dimY(): Dimension {
    return this.vector.dimensions[1]
  }

  /**
   * Size x ('width') of the board.
   */
  get sizeX(): number {
    return this.dimX.size
  }

  /**
   * Size y ('height') of the board.
   */
  get sizeY(): number {
    return this.dimY.size
  }

  /**
   * @returns A deep copy of the same object.
   */
  copy(): IncoherentLight {
    return new IncoherentLight(this.vector.copy())
  }

  /**
   * Total intensity
   */
  get totalIntensity(): number {
    return this.vector.entries.map((entry) => entry.value).reduce((a, b) => a.add(b), Cx(0)).re
  }

  /**
   * Normalize. Unlike in photos, we normalize by sum.
   * @returns Itself, for chaining.
   */
  normalize(): IncoherentLight {
    this.vector = this.vector.mulConstant(Cx(1 / this.totalIntensity))
    return this
  }

  /**
   * Create a single photon vector.
   * @param sizeX Board size, x.
   * @param sizeY Board size, y.
   * @param posX Position of the photon, x.
   * @param posY Position of the photon, y.
   * @param dirDirection Direction from ['>', '^', '<', 'v].
   *
   * @returns A vector [dimX, DimY, dir, pol], does not modify the object.
   */
  static vectorFromIndicator(sizeX: number, sizeY: number, posX: number, posY: number, dir: string): Vector {
    const dimensions = [Dimension.position(sizeX, 'x'), Dimension.position(sizeY, 'y'), Dimension.direction()]
    const state = [posX.toString(), posY.toString(), dir]

    return Vector.indicator(dimensions, state)
  }

  /**
   * Add one more photon to the state, using {@link Photons.vectorFromIndicator}.
   *
   * @param posX Position of the photon, x.
   * @param posY Position of the photon, y.
   * @param dir Direction from ['>', '^', '<', 'v].
   *
   * @returns Itself, for chaining.
   */
  addIntensityFromIndicator(posX: number, posY: number, dir: string, intensity = 1): IncoherentLight {
    const newIntensity = IncoherentLight.vectorFromIndicator(this.sizeX, this.sizeY, posX, posY, dir).mulConstant(
      Cx(intensity),
    )
    this.vector = this.vector.add(newIntensity)
    return this
  }

  /**
   * Create a propagator, given the board size. Same as for {@link Photons.propagator}
   * @param sizeX Board size, x.
   * @param sizeY Board size, y.
   * @param yDirMeansDown For true, direction 'v' increments dimY.
   *
   * @return An operator, with dimensions [dimX, dimY, {@link Dimension.direction()}].
   */
  static propagator(sizeX: number, sizeY: number, yDirMeansDown = true): Operator {
    return Photons.propagator(sizeX, sizeY, yDirMeansDown)
  }

  /**
   * Propagate all particles, using {@link createPhotonPropagator}.
   * @param yDirMeansDown or true, direction 'v' increments dimY.
   *
   * @returns Itself, for chaining.
   */
  propagateBeam(yDirMeansDown = true): IncoherentLight {
    const photonPropagator = Photons.propagator(this.sizeX, this.sizeY, yDirMeansDown)
    this.vector = photonPropagator.mulVec(this.vector)
    return this
  }

  /**
   * Create an operator for a particular place, projecting only on the particular position.
   * @param sizeX Board size, x.
   * @param sizeY Board size, y.
   * @param posX Position x.
   * @param posY Posiiton y.
   * @param op Operator, assumed to be with dimensions [dir].
   *
   * @returns An operator [dimX, dimY, pol, dir].
   */
  static localizeOperator(sizeX: number, sizeY: number, posX: number, posY: number, op: Operator): Operator {
    const dimX = Dimension.position(sizeX, 'x')
    const dimY = Dimension.position(sizeY, 'y')
    return Operator.outer([Operator.indicator([dimX, dimY], [`${posX}`, `${posY}`]), op])
  }

  /**
   * Turn an list of operators in a complete one-photon iteraction operator for the board.
   * @param sizeX Board size, x.
   * @param sizeY Board size, y.
   * @param opsWithPos A list of [x, y, operator with [dir]].
   */
  static interactionOperator(sizeX: number, sizeY: number, opsWithPos: IXYOperator[]): Operator {
    const localizedOpsShifted = opsWithPos.map((d: IXYOperator) => {
      const { x, y, op } = d
      const idDirPol = Operator.identity([Dimension.direction()])
      const shiftedOp = op.sub(idDirPol)
      return Photons.localizeOperator(sizeX, sizeY, { x, y, op: shiftedOp })
    })

    const dimX = Dimension.position(sizeX, 'x')
    const dimY = Dimension.position(sizeY, 'y')

    return Operator.add([Operator.identity([dimX, dimY, Dimension.direction()]), ...localizedOpsShifted])
  }

  /**
   * Act on single photons with a given set of operations.
   * @remark Absorption for states with n>1 photons is broken.
   * - it tracks only a fixed-number of photons subspace.
   * @param opsWithPos A list of [x, y, operator with [dir, pol]].
   *
   * @returns Itself, for chaining.
   */
  interact(opsWithPos: IXYOperator[]): IncoherentLight {
    const interactionOperator = IncoherentLight.interactionOperator(this.sizeX, this.sizeY, opsWithPos)
    this.vector = interactionOperator.mulVec(this.vector)
    return this
  }

  static opsWithPosMakeIncoherent(opsWithPos: IXYOperator[]): IXYOperator[] {
    return opsWithPos.map(({ x, y, op }) => ({
      x,
      y,
      op: incoherentLightOperator(op),
    }))
  }

  /**
   * Generates a string for kets.
   * As there are only real number, I remove others.
   * @param precision Float precision.
   *
   * @returns A ket string, e.g. 0.75 |3,1,>⟩ + 0.25 |2,2,v⟩.
   */
  ketString(precision = 2): string {
    return this.vector
      .toString('cartesian', precision, ' + ', false)
      .replace(/\(/g, '')
      .replace(/ \+0\.0*i\)/g, '')
  }
}
