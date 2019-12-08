/* eslint-disable-next-line */
import _ from 'lodash'
import { IParticle } from './interfaces'
import Vector from './Vector'
import Operator from './Operator'
import Dimension from './Dimension'
import { Cx } from './Complex'
import { Complex } from '../main'

/**
 * Photons class.
 * A state of many photons, each with with dimensions:
 * x, y, direction, polarization
 * @see {@link @Dimension.position}, {@link @Dimension.direction}, {@link @Dimension.polarization}
 * Designed so that it will work with https://github.com/stared/quantum-game-2 board.
 * @todo Think deeply about which things should change in-plance, and which: modify this object.
 * @todo A lot of things with interfaces to make them consistent.
 */
export default class Photons {
  readonly sizeX: number
  readonly sizeY: number
  vector: Vector
  nPhotons: number
  readonly dimX: Dimension
  readonly dimY: Dimension

  /**
   * Create a board for photons.
   * @param sizeX An integer, size x (width) of the board.
   * @param sizeY An integer, size y (height) of the board.
   */
  constructor(sizeX: number, sizeY: number) {
    this.sizeX = sizeX
    this.sizeY = sizeY
    this.vector = new Vector([], [])
    this.nPhotons = 0
    this.dimX = Dimension.position(sizeX, 'x')
    this.dimY = Dimension.position(sizeY, 'y')
  }

  /**
   * @returns A deep copy of the same object.
   */
  copy(): Photons {
    const newPhotons = new Photons(this.sizeX, this.sizeY)
    newPhotons.vector = this.vector.copy()
    newPhotons.nPhotons = this.nPhotons
    return newPhotons
  }

  /**
   * Normalize in-place
   */
  normalizeInplace(): void {
    this.vector = this.vector.normalize()
  }

  /**
   * Normalize a copy
   */
  normalize(): Photons {
    const newPhotons = this.copy()
    this.normalizeInplace()
    return newPhotons
  }

  /**
   * Dimension indices for particle i, for [posX, posY, dir, pol].
   * @param i Photon id, from [0, ..., nPhotons - 1]
   * @returns E.g. for 1: [4, 5, 6, 7]
   */
  vectorIndicesForParticle(i: number): number[] {
    return [4 * i, 4 * i + 1, 4 * i + 2, 4 * i + 3]
  }

  /**
   * Dimension indices for particle i, for [posX, posY, dir].
   * @param i Photon id, from [0, ..., nPhotons - 1]
   * @returns E.g. for 1: [4, 5, 6]
   */
  vectorPosDirIndicesForParticle(i: number): number[] {
    return [4 * i, 4 * i + 1, 4 * i + 2]
  }

  /**
   * Dimension indices for particle i, for [posX, posY].
   * @param i Photon id, from [0, ..., nPhotons - 1]
   * @returns E.g. for 1: [4, 5]
   */
  vectorPosIndicesForParticle(i: number): number[] {
    return [4 * i, 4 * i + 1]
  }

  /**
   * Create a single photon vector.
   * @param posX Position of the photon, x.
   * @param posY Position of the photon, y.
   * @param dirDirection Direction from ['>', '^', '<', 'v].
   * @param pol Polarization from ['H', 'V'].
   *
   * @returns A vector [dimX, DimY, dir, pol], does not modify the object.
   */
  createPhoton(posX: number, posY: number, dir: string, pol: string): Vector {
    const dimensions = [this.dimX, this.dimY, Dimension.direction(), Dimension.polarization()]
    const state = [posX.toString(), posY.toString(), dir, pol]

    return Vector.indicator(dimensions, state)
  }

  /**
   * Add one more photon to the state, using {@link createPhoton}.
   *
   * @remark
   *
   * @param posX Position of the photon, x.
   * @param posY Position of the photon, y.
   * @param dir Direction from ['>', '^', '<', 'v].
   * @param pol Polarization from ['H', 'V'].
   *
   * @returns Nothings, acts in-place.
   * TODO: could use an interface
   */
  addPhotonIndicator(posX: number, posY: number, dir: string, pol: string): void {
    const newPhoton = this.createPhoton(posX, posY, dir, pol)
    const oldPhotons = this.vector
    this.nPhotons += 1
    if (this.nPhotons === 1) {
      this.vector = newPhoton
    } else if (this.nPhotons === 2) {
      if (!newPhoton.dot(this.vector).isZero) {
        throw `Adding photons not yet implemented for non-ortogonal states.` +
          `Old photon:\n${this.vector}\nand new photon:\n${newPhoton}`
      }
      this.vector = Vector.add([oldPhotons.outer(newPhoton), newPhoton.outer(oldPhotons)]).mulConstant(Cx(Math.SQRT1_2))
    } else {
      throw `Adding 3 or more particles not yet implemented`
    }
  }

  /**
   * Create a propagator, given this object dimX and dimY.
   * @param yDirMeansDown For true, direction 'v' increments dimY.
   *
   * @return An operator, with dimensions [dimX, dimY, {@link Dimension.direction()}].
   */
  createPhotonPropagator(yDirMeansDown = true): Operator {
    const dir = Dimension.direction()
    const dimX = this.dimX
    const dimY = this.dimY
    const s = yDirMeansDown ? 1 : -1

    return Operator.add([
      Operator.outer([Operator.shift(dimX, +1), Operator.identity([dimY]), Operator.indicator([dir], ['>'])]),
      Operator.outer([Operator.shift(dimX, -1), Operator.identity([dimY]), Operator.indicator([dir], ['<'])]),
      Operator.outer([Operator.identity([dimX]), Operator.shift(dimY, +s), Operator.indicator([dir], ['v'])]),
      Operator.outer([Operator.identity([dimX]), Operator.shift(dimY, -s), Operator.indicator([dir], ['^'])]),
    ])
  }

  /**
   * Propagate all particles, using {@link createPhotonPropagator}.
   * @param yDirMeansDown or true, direction 'v' increments dimY.
   *
   * @returns Nothing, acts in-place.
   */
  propagatePhotons(yDirMeansDown = true): void {
    const photonPropagator = this.createPhotonPropagator(yDirMeansDown)
    _.range(this.nPhotons).forEach(i => {
      this.vector = photonPropagator.mulVecPartial(this.vectorPosDirIndicesForParticle(i), this.vector)
    })
  }

  /**
   * Create an operator for a particular place, projecting only on the particular position.
   * @param op Operator, assumed to be with dimensions [pol, dir].
   * @param posX Position x.
   * @param posY Posiiton y.
   *
   * @returns An operator [dimX, dimY, pol, dir].
   */
  createLocalizedOperator(op: Operator, posX: number, posY: number): Operator {
    return Operator.outer([Operator.indicator([this.dimX, this.dimY], [`${posX}`, `${posY}`]), op])
  }

  /**
   * Measure the absolute absorbtion on a given tile.
   * @param posX Position x.
   * @param posY Position y.
   * @param op Operator, assumed to be with dimensions [pol, dir].
   *
   * @returns Probability lost at tile (x, y) after applying the operator.
   * Does not change the photon object.
   */
  measureAbsorptionAtOperator(posX: number, posY: number, op: Operator, photonId = 0): number {
    const localizedOperator = this.createLocalizedOperator(op, posX, posY)
    const localizedId = Operator.indicator([this.dimX, this.dimY], [`${posX}`, `${posY}`])
    const newVector = localizedOperator.mulVecPartial(this.vectorIndicesForParticle(photonId), this.vector)
    const oldVector = localizedId.mulVecPartial(this.vectorPosIndicesForParticle(photonId), this.vector)
    return oldVector.normSquared() - newVector.normSquared()
  }

  /**
   * Demo of measurement of one particle
   * So far the basis is FIXED, so it won't give corrent results with operators absorbing in a basis
   * that does not commute with this basis.
   * Vide {@link measureAbsorptionAtOperator} as the structure is
   * @param posX
   * @param posY
   * @param op
   * @param photonId
   *
   * @return Only measurement (zeros excluded). Conditional state is NOT normalized (to avoid issues with division by )
   * FIXME: No return type
   */
  /* eslint-disable-next-line */
  vectorValuedMeasurement(posX: number, posY: number, op: Operator, photonId = 0): any {
    // as I see later, localizedOperator can be discarded as
    // we use localizedId anyway
    const localizedOperator = this.createLocalizedOperator(op, posX, posY)
    // for decomposition of identity
    // this step is dirty, as it won't work, say, for polarizer at non H/V angle
    const basis = ['>H', '>V', '^H', '^V', '<H', '<V', 'vH', 'vV']
    const dimDir = Dimension.direction()
    const dimPol = Dimension.polarization()

    // for sho
    // just in case [...posInd] if I modify it elsewere (better safe than sorry)
    const posInd = this.vectorPosIndicesForParticle(photonId)
    const dirPolInd = [4 * photonId + 2, 4 * photonId + 3]

    const localizedId = Operator.indicator([this.dimX, this.dimY], [`${posX}`, `${posY}`])
    // we already project on pos, so it is consistent!
    // it may be goo to gather it, though

    const oldVectorHere = localizedId.mulVecPartial([...posInd], this.vector)

    return basis
      .map(coordStr => {
        const projection = Operator.indicator([dimDir, dimPol], coordStr)
        const vectorProjected = projection.mulVecPartial(dirPolInd, oldVectorHere)
        const inputProjectedProbabability = vectorProjected.normSquared()
        const allId = this.vectorIndicesForParticle(photonId)
        const outputProjectedProbability = localizedOperator.mulVecPartial([...allId], vectorProjected).normSquared()
        const p = inputProjectedProbabability - outputProjectedProbability

        const proj = Operator.indicator(
          [this.dimX, this.dimY, dimDir, dimPol],
          [`${posX}`, `${posY}`, coordStr[0], coordStr[1]],
        )

        const newPhotons = this.copy()
        newPhotons.nPhotons -= 1

        newPhotons.vector = proj.mulVecPartial([...allId], this.vector)._removeDimension([...allId])
        return {
          photonId: photonId,
          x: posX,
          y: posY,
          dirStr: coordStr[0],
          polStr: coordStr[1],
          inputProb: inputProjectedProbabability,
          probability: p,
          projectedState: newPhotons.ketString(), // for now just print  // not normalized
        }
      })
      .filter(d => d.inputProb > 0)
  }

  /**
   * Turn an list of operators in a complete one-photon iteraction operator for the board.
   * @remark Some space for improvement with avoiding identity (direct sum structure),
   * vide {@link Operator.mulVecPartial}.
   * @param opsWithPos A list of [x, y, operator with [dir, pol]].
   */
  createSinglePhotonInteraction(opsWithPos: [number, number, Operator][]): Operator {
    //
    const localizedOpsShifted = opsWithPos.map((x: [number, number, Operator]) => {
      const [posX, posY, op] = x
      const shiftedOp = op.sub(Operator.identity([Dimension.direction(), Dimension.polarization()]))
      return this.createLocalizedOperator(shiftedOp, posX, posY)
    })

    return Operator.add([
      Operator.identity([this.dimX, this.dimY, Dimension.direction(), Dimension.polarization()]),
      ...localizedOpsShifted,
    ])
  }

  /**
   * Act on single photons with a given set of operations.
   * @remark Absorption for states with n>1 photons is broken.
   * - it tracks only a fixed-number of photons subspace.
   * @param opsWithPos A list of [x, y, operator with [dir, pol]].
   *
   * @returns Nothing, as acts in-place.
   */
  actOnSinglePhotons(opsWithPos: [number, number, Operator][]): void {
    const singlePhotonInteraction = this.createSinglePhotonInteraction(opsWithPos)
    _.range(this.nPhotons).forEach(i => {
      this.vector = singlePhotonInteraction.mulVecPartial(this.vectorIndicesForParticle(i), this.vector)
    })
  }

  /**
   * Combine H and V polarization, to
   * Right now kind od dirty, but should work
   * @returns
   * Angles 0-360, starting from --> and moving counterclockwise
   * |psi> = (are + i aim) |H> + (bre + i bim) |V>
   *
   * @todo Interface is clunky and restrictred to 1 particle.
   */
  aggregatePolarization(): IParticle[] {
    if (this.nPhotons !== 1) {
      throw `Right now implemented only for 1 photon. Here we have ${this.nPhotons} photons.`
    }
    const aggregated = _.chain(this.vector.entries)
      .groupBy(entry => _.at(entry.coord, [0, 1, 2]))
      .values()
      .map(entries => {
        const first = entries[0]
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const [x, y, dir, _pol] = first.coord
        const amplitudes: [Complex, Complex] = [Cx(0), Cx(0)]
        entries.forEach(entry => {
          amplitudes[entry.coord[3]] = entry.value
        })
        return {
          x: x,
          y: y,
          direction: 90 * dir,
          are: amplitudes[0].re,
          aim: amplitudes[0].im,
          bre: amplitudes[1].re,
          bim: amplitudes[1].im,
        }
      })
      .value()

    return aggregated
  }

  /**
   * Shows probability of photons.
   * @todo Create probability for any number of photons.
   */
  totalIntensityPerTile(): { x: number; y: number; probability: number }[] {
    if (this.nPhotons !== 1) {
      throw `Right now implemented only for 1 photon. Here we have ${this.nPhotons} photons.`
    }

    const aggregated = _.chain(this.vector.entries)
      .groupBy(entry => _.at(entry.coord, [0, 1]))
      .values()
      .map(entries => {
        const first = entries[0]
        const [x, y, _dir, _pol] = first.coord
        const probability = entries.map(entry => entry.value.abs2()).reduce((a, b) => a + b)

        return { x, y, probability }
      })
      .value()

    return aggregated
  }

  /**
   * Generates a string for kets.
   * See {@link Vector.toString} for formatting options.
   * @param complexFormat ['cartesian', 'polar', 'polarTau'].
   * @param precision Float precision.
   *
   * @returns A ket string, e.g. (0.71 +0.00i) |3,1,>,V⟩ + (0.00 +0.71i) |2,2,v,V⟩.
   */
  ketString(complexFormat = 'cartesian', precision = 2): string {
    return this.vector.toString(complexFormat, precision, ' + ', false)
  }
}
