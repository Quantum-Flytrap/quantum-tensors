/* eslint-disable-next-line */
import _ from 'lodash'
import { IParticle, IXYOperator, ITileIntensity } from './interfaces'
import Vector from './Vector'
import Operator from './Operator'
import Dimension from './Dimension'
import { polStates } from './Ops'
import Complex, { Cx, ComplexFormat } from './Complex'
import VectorEntry from './VectorEntry'
import Measurement, { INamedVector, IWeightedProjection } from './Measurement'

export interface IXYNamedVectors {
  x: number
  y: number
  nVecs: INamedVector[]
}

export interface IXYNamedOperators {
  x: number
  y: number
  nOps: IWeightedProjection[]
}

export interface IPhotonPolarization {
  x: number
  y: number
  direction: number
  h: Complex
  v: Complex
}

/**
 * Photons class.
 * A state of many photons, each with with dimensions:
 * x, y, direction, polarization
 * @see {@link @Dimension.position}, {@link @Dimension.direction}, {@link @Dimension.polarization}
 * Designed so that it will work with https://github.com/Quantum-Game/quantum-game-2 board.
 * @todo Think deeply about which things should change in-plance, and which: modify this object.
 * @todo A lot of things with interfaces to make them consistent.
 */
export default class Photons {
  vector: Vector
  operators: IXYOperator[]
  cachedDiffU: Operator
  measurementVecs: INamedVector[]
  measurementOps: IWeightedProjection[]
  readonly dimX: Dimension
  readonly dimY: Dimension

  /**
   * Create a board for photons.
   * Mostly for internal use.
   * @param sizeX An integer, size x (width) of the board.
   * @param sizeY An integer, size y (height) of the board.
   * @param vector Vector with [x1, y1, dir1, pol1, ..., xn, yn, dirn, poln].
   * @param operators A list of IXYOperator derived from elements from the board.
   */
  constructor(
    sizeX: number,
    sizeY: number,
    vector: Vector,
    operators: IXYOperator[] = [],
    measurementVecs: INamedVector[] = [],
    measurementOps: IWeightedProjection[] = [],
  ) {
    this.vector = vector
    this.operators = operators
    this.measurementVecs = measurementVecs
    this.measurementOps = measurementOps
    this.cachedDiffU = Photons.singlePhotonInteractionDiff(sizeX, sizeY, operators)
    this.dimX = Dimension.position(sizeX, 'x')
    this.dimY = Dimension.position(sizeY, 'y')
  }

  /**
   * Add operators to photons and compute static cachedDiffU
   * @param operators An array of board operators in IXYOperator format.
   */
  updateOperators(operators: IXYOperator[]): void {
    this.operators = operators
    this.cachedDiffU = Photons.singlePhotonInteractionDiff(this.sizeX, this.sizeY, operators)
  }

  updateMeasurements(xyVecs: IXYNamedVectors[], xyOps: IXYNamedOperators[] = []): void {
    this.measurementVecs = xyVecs.flatMap((xyVec) =>
      xyVec.nVecs.map((nVec) => ({
        name: [`${xyVec.x}-${xyVec.y}-${nVec.name[0]}`],
        vector: Photons.localizeVector(this.sizeX, this.sizeY, xyVec.x, xyVec.y, nVec.vector),
      })),
    )
    this.measurementOps = xyOps.flatMap((xyOp) =>
      xyOp.nOps.map((nOp) => ({
        name: [`${xyOp.x}-${xyOp.y}-${nOp.name[0]}`],
        weight: 1,
        operator: Photons.localizeOperator(this.sizeX, this.sizeY, { x: xyOp.x, y: xyOp.y, op: nOp.operator }),
      })),
    )
  }

  /**
   * Create an empty board for photons, with a given size.
   * @param sizeX An integer, size x (width) of the board.
   * @param sizeY An integer, size y (height) of the board.
   */
  static emptySpace(sizeX: number, sizeY: number): Photons {
    const vector = new Vector([], [])
    return new Photons(sizeX, sizeY, vector, [])
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
   * The total number of photons.
   */
  get nPhotons(): number {
    return this.vector.dimensions.length / 4
  }

  /**
   * @returns A deep copy of the same object.
   * @todo Check that the cachedDiffU doesn't hammer performance.
   */
  copy(): Photons {
    return new Photons(this.sizeX, this.sizeY, this.vector.copy(), this.operators)
  }

  /**
   * Normalize
   * @returns Itself, for chaining.
   */
  normalize(): Photons {
    this.vector = this.vector.normalize()
    return this
  }

  /**
   * Dimension indices for particle i, for [posX, posY, dir, pol].
   * @note For internal use.
   * @param i Photon id, from [0, ..., nPhotons - 1]
   * @returns E.g. for 1: [4, 5, 6, 7]
   */
  vectorIndicesForParticle(i: number): number[] {
    return [4 * i, 4 * i + 1, 4 * i + 2, 4 * i + 3]
  }

  /**
   * Dimension indices for particle i, for [posX, posY, dir].
   * @note For internal use.
   * @param i Photon id, from [0, ..., nPhotons - 1]
   * @returns E.g. for 1: [4, 5, 6]
   */
  vectorPosDirIndicesForParticle(i: number): number[] {
    return [4 * i, 4 * i + 1, 4 * i + 2]
  }

  /**
   * Dimension indices for particle i, for [posX, posY].
   * @note For internal use.
   * @param i Photon id, from [0, ..., nPhotons - 1]
   * @returns E.g. for 1: [4, 5]
   */
  vectorPosIndicesForParticle(i: number): number[] {
    return [4 * i, 4 * i + 1]
  }

  /**
   * Create a single photon vector.
   * @todo Aupport 'D', 'A', 'L' and 'R'.
   * @param sizeX Board size, x.
   * @param sizeY Board size, y.
   * @param posX Position of the photon, x.
   * @param posY Position of the photon, y.
   * @param dirDirection Direction from ['>', '^', '<', 'v].
   * @param pol Polarization from ['H', 'V', 'D', 'A', 'L', 'R'].
   *
   * @returns A vector [dimX, DimY, dir, pol], does not modify the object.
   */
  static vectorFromIndicator(
    sizeX: number,
    sizeY: number,
    posX: number,
    posY: number,
    dir: string,
    pol: string,
  ): Vector {
    if (polStates[pol] === undefined) {
      throw new Error(`Polarization string ${pol} not supported.`)
    }

    const dimensions = [Dimension.position(sizeX, 'x'), Dimension.position(sizeY, 'y'), Dimension.direction()]
    const state = [posX.toString(), posY.toString(), dir]

    return Vector.indicator(dimensions, state).outer(polStates[pol])
  }

  /**
   * Generates a DirPol basis for completem projective, destructive measurement.
   * @param factor Multiplicative factor. Use Math.SQRT1_2 for 50% of detection.
   */
  static allDirectionsVec(factor = 1): INamedVector[] {
    const dirs = ['>', '^', '<', 'v']
    const pols = ['H', 'V']
    return dirs.flatMap((dir) =>
      pols.map((pol) => ({
        name: [`${dir}${pol}`],
        vector: Vector.indicator([Dimension.direction(), Dimension.polarization()], [dir, pol]).mulByReal(factor),
      })),
    )
  }

  /**
   * Generates a DirPol projections for completem projective, non-destructive measurement.
   */
  static allDirectionsOps(): IWeightedProjection[] {
    const dirs = ['>', '^', '<', 'v']
    const pols = ['H', 'V']
    return dirs.flatMap((dir) =>
      pols.map((pol) => ({
        name: [`${dir}${pol}`],
        weight: 1,
        operator: Operator.indicator([Dimension.direction(), Dimension.polarization()], [dir, pol]),
      })),
    )
  }

  /**
   * Add one more photon to the state, using {@link Photons.vectorFromIndicator}.
   *
   * @param posX Position of the photon, x.
   * @param posY Position of the photon, y.
   * @param dir Direction from ['>', '^', '<', 'v].
   * @param pol Polarization from ['H', 'V', 'D', 'A', 'L', 'R'].
   *
   * @returns Itself, for chaining.
   */
  addPhotonFromIndicator(posX: number, posY: number, dir: string, pol: string): Photons {
    const newPhoton = Photons.vectorFromIndicator(this.sizeX, this.sizeY, posX, posY, dir, pol)
    const oldPhotons = this.vector
    if (this.nPhotons === 0) {
      this.vector = newPhoton
    } else if (this.nPhotons === 1) {
      if (!newPhoton.dot(this.vector).isZero) {
        throw (
          `Adding photons not yet implemented for non-ortogonal states.` +
          `Old photon:\n${this.vector}\nand new photon:\n${newPhoton}`
        )
      }
      this.vector = Vector.add([oldPhotons.outer(newPhoton), newPhoton.outer(oldPhotons)]).mulByReal(Math.SQRT1_2)
    } else {
      throw `Adding 3 or more particles not yet implemented. We already have: ${this.nPhotons} photons.`
    }
    return this
  }

  /**
   * Create a propagator, given the board size.
   * @param sizeX Board size, x.
   * @param sizeY Board size, y.
   * @param yDirMeansDown For true, direction 'v' increments dimY.
   *
   * @return An operator, with dimensions [dimX, dimY, {@link Dimension.direction()}].
   */
  static propagator(sizeX: number, sizeY: number, yDirMeansDown = true): Operator {
    const dir = Dimension.direction()
    const dimX = Dimension.position(sizeX, 'x')
    const dimY = Dimension.position(sizeY, 'y')
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
   * Use it for a reference. All practical operations with {@link propagatePhotons}.
   * @param yDirMeansDown or true, direction 'v' increments dimY.
   *
   * @returns Itself, for chaining.
   */
  propagatePhotonsWithOperator(yDirMeansDown = true): Photons {
    const photonPropagator = Photons.propagator(this.sizeX, this.sizeY, yDirMeansDown)
    _.range(this.nPhotons).forEach((i) => {
      this.vector = photonPropagator.mulVecPartial(this.vectorPosDirIndicesForParticle(i), this.vector)
    })
    return this
  }

  /**
   * Propagate all particles, hardcoded.
   * See {@link propagatePhotonsWithOperator} for a reference.
   *
   * @returns Itself, for chaining.
   */
  propagatePhotons(): Photons {
    const dirToShiftX = (dir: number): number => {
      if (dir === 0) {
        return 1
      } else if (dir === 2) {
        return -1
      } else {
        return 0
      }
    }

    const dirToShiftY = (dir: number): number => {
      if (dir === 1) {
        return -1
      } else if (dir === 3) {
        return 1
      } else {
        return 0
      }
    }

    const { sizeX, sizeY, nPhotons } = this
    let newEntries = [...this.vector.entries]

    for (let i = 0; i < nPhotons; i++) {
      const [iX, iY, iDir] = this.vectorPosDirIndicesForParticle(i)
      newEntries = newEntries
        .map((entry) => {
          const dir = entry.coord[iDir]
          const x = entry.coord[iX] + dirToShiftX(dir)
          const y = entry.coord[iY] + dirToShiftY(dir)
          const newCoords = entry.coord.slice()
          newCoords[iX] = x
          newCoords[iY] = y
          return new VectorEntry(newCoords, entry.value)
        })
        .filter((entry) => {
          const x = entry.coord[iX]
          const y = entry.coord[iY]
          return 0 <= x && x < sizeX && 0 <= y && y < sizeY
        })
    }

    this.vector = new Vector(newEntries, this.vector.dimensions)
    return this
  }

  /**
   * @see {@link localizeOperator}
   * @param sizeX
   * @param sizeY
   * @param x
   * @param y
   * @param vec
   */
  static localizeVector(sizeX: number, sizeY: number, x: number, y: number, vec: Vector): Vector {
    const dimX = Dimension.position(sizeX, 'x')
    const dimY = Dimension.position(sizeY, 'y')
    return Vector.indicator([dimX, dimY], [`${x}`, `${y}`]).outer(vec)
  }

  /**
   * Create an operator for a particular place, projecting only on the particular position.
   * @param sizeX Board size, x.
   * @param sizeY Board size, y.
   * @param posX Position x.
   * @param posY Posiiton y.
   * @param op Operator, assumed to be with dimensions [pol, dir].
   *
   * @returns An operator [dimX, dimY, pol, dir].
   */
  static localizeOperator(sizeX: number, sizeY: number, op: IXYOperator): Operator {
    const dimX = Dimension.position(sizeX, 'x')
    const dimY = Dimension.position(sizeY, 'y')
    return Operator.outer([Operator.indicator([dimX, dimY], [`${op.x}`, `${op.y}`]), op.op])
  }

  /**
   * Perform measurement given measurement projections and positive operators.
   */
  measure(): Measurement {
    let ensamble = Measurement.fromVector(this.vector)
    for (let i = this.nPhotons - 1; i >= 0; i--) {
      ensamble = ensamble.projectiveMeasurement(
        this.vectorIndicesForParticle(0),
        this.measurementVecs,
        this.measurementOps,
      )
    }
    return ensamble
  }

  /**
   * @deprecated
   * Measure the absolute absorbtion on a given tile.
   * @param posX Position x.
   * @param posY Position y.
   * @param op Operator, assumed to be with dimensions [pol, dir].
   *
   * @returns Probability lost at tile (x, y) after applying the operator.
   * Does not change the photon object.
   */
  measureAbsorptionAtOperator(op: IXYOperator, photonId = 0): number {
    const localizedOperator = Photons.localizeOperator(this.dimX.size, this.dimY.size, op)
    const localizedId = Operator.indicator([this.dimX, this.dimY], [`${op.x}`, `${op.y}`])
    const newVector = localizedOperator.mulVecPartial(this.vectorIndicesForParticle(photonId), this.vector)
    const oldVector = localizedId.mulVecPartial(this.vectorPosIndicesForParticle(photonId), this.vector)
    return oldVector.normSquared() - newVector.normSquared()
  }

  /**
   * @deprecated
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
  vectorValuedMeasurement(op: IXYOperator, photonId = 0) {
    // as I see later, localizedOperator can be discarded as
    // we use localizedId anyway
    const localizedOperator = Photons.localizeOperator(this.sizeX, this.sizeY, op)
    // for decomposition of identity
    // this step is dirty, as it won't work, say, for polarizer at non H/V angle
    const basis = ['>H', '>V', '^H', '^V', '<H', '<V', 'vH', 'vV']
    const dimDir = Dimension.direction()
    const dimPol = Dimension.polarization()

    // for sho
    // just in case [...posInd] if I modify it elsewere (better safe than sorry)
    const posInd = this.vectorPosIndicesForParticle(photonId)
    const dirPolInd = [4 * photonId + 2, 4 * photonId + 3]

    const localizedId = Operator.indicator([this.dimX, this.dimY], [`${op.x}`, `${op.y}`])
    // we already project on pos, so it is consistent!
    // it may be goo to gather it, though

    const oldVectorHere = localizedId.mulVecPartial([...posInd], this.vector)

    return basis
      .map((coordStr) => {
        const projection = Operator.indicator([dimDir, dimPol], coordStr)
        const vectorProjected = projection.mulVecPartial(dirPolInd, oldVectorHere)
        const inputProjectedProbabability = vectorProjected.normSquared()
        const allId = this.vectorIndicesForParticle(photonId)
        const outputProjectedProbability = localizedOperator.mulVecPartial([...allId], vectorProjected).normSquared()
        const p = inputProjectedProbabability - outputProjectedProbability

        const proj = Vector.indicator(
          [this.dimX, this.dimY, dimDir, dimPol],
          [`${op.x}`, `${op.y}`, coordStr[0], coordStr[1]],
        )

        const newPhotons = this.copy()

        newPhotons.vector = proj.innerPartial([...allId], this.vector)
        return {
          photonId: photonId,
          x: op.x,
          y: op.y,
          dirStr: coordStr[0],
          polStr: coordStr[1],
          inputProb: inputProjectedProbabability,
          probability: p,
          projectedState: newPhotons.ketString(), // for now just print  // not normalized
        }
      })
      .filter((d) => d.inputProb > 0)
  }

  /**
   * Turn an list of operators in a complete one-photon iteraction operator for the board (U - Id).
   * @param sizeX Board size, x.
   * @param sizeY Board size, y.
   * @param opsWithPos A list of [x, y, operator with [dir, pol]].
   */
  static singlePhotonInteractionDiff(sizeX: number, sizeY: number, opsWithPos: IXYOperator[]): Operator {
    const localizedOpsShifted = opsWithPos.map((d: IXYOperator) => {
      const { x, y, op } = d
      const idDirPol = Operator.identity([Dimension.direction(), Dimension.polarization()])
      const shiftedOp = op.sub(idDirPol)
      return Photons.localizeOperator(sizeX, sizeY, { x, y, op: shiftedOp })
    })

    if (localizedOpsShifted.length === 0) {
      localizedOpsShifted.push(
        Operator.zeros([
          Dimension.position(sizeX, 'x'),
          Dimension.position(sizeY, 'y'),
          Dimension.direction(),
          Dimension.polarization(),
        ]),
      )
    }
    return Operator.add(localizedOpsShifted)
  }

  /**
   * Turn an list of operators in a complete one-photon iteraction operator for the board.
   * @remark Some space for improvement with avoiding identity (direct sum structure),
   * vide {@link Operator.mulVecPartial}.
   * @param sizeX Board size, x.
   * @param sizeY Board size, y.
   * @param opsWithPos A list of [x, y, operator with [dir, pol]].
   */
  static singlePhotonInteraction(sizeX: number, sizeY: number, opsWithPos: IXYOperator[]): Operator {
    const localizedOpsShifted = Photons.singlePhotonInteractionDiff(sizeX, sizeY, opsWithPos)

    const dimX = Dimension.position(sizeX, 'x')
    const dimY = Dimension.position(sizeY, 'y')

    return localizedOpsShifted.add(Operator.identity([dimX, dimY, Dimension.direction(), Dimension.polarization()]))
  }

  /**
   * Act on single photons with the precomputed cachedDiffU.
   * @remark Absorption for states with n>1 photons is broken.
   * - it tracks only a fixed-number of photons subspace.
   *
   * @returns Itself, for chaining.
   */
  actOnSinglePhotons(): Photons {
    _.range(this.nPhotons).forEach((i) => {
      this.vector = this.cachedDiffU.mulVecPartial(this.vectorIndicesForParticle(i), this.vector).add(this.vector)
    })
    return this
  }

  /**
   * @deprecated
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
    return Photons.onePhotonByPolarization(this.vector).map(({ x, y, direction, h, v }) => ({
      x,
      y,
      direction,
      are: h.re,
      aim: h.im,
      bre: v.re,
      bim: v.im,
    }))
  }

  /**
   * Turns vector of a single photon in an array of amplitudes,
   * grouped by polarization.
   * @param v Vector for one photon.
   */
  static onePhotonByPolarization(v: Vector): IPhotonPolarization[] {
    if (v.dimensions.length !== 4) {
      throw `Right now implemented only for 1 photon, 4 dimensions. Here we have ${v.dimensions.length} dimensions.`
    }
    return _.chain(v.entries)
      .groupBy((entry) => _.at(entry.coord, [0, 1, 2]))
      .values()
      .map((entries) => {
        const first = entries[0]
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const [x, y, dir, _pol] = first.coord
        const amplitudes: [Complex, Complex] = [Cx(0), Cx(0)]
        entries.forEach((entry) => {
          amplitudes[entry.coord[3]] = entry.value
        })
        const [h, v] = amplitudes
        return {
          x,
          y,
          direction: 90 * dir,
          h,
          v,
        }
      })
      .value()
  }

  /**
   * Sampling states for (possibly entangled) particles.
   * A proof-of-concept, everything may change (including its mathematics).
   * For product (i.e. pure, non-entangled) states the result is deterministic, up to the phase.
   */
  sampleTwoPhotonState(): [IPhotonPolarization[], IPhotonPolarization[]] {
    if (this.nPhotons !== 2) {
      throw `Requires exactly 2 photons. Here we have ${this.nPhotons} photons.`
    }
    const coordA = [0, 1, 2, 3]
    const coordB = [4, 5, 6, 7]
    const randA = this.vector.randomOnPartialSubspace(coordA)
    const resB = randA.innerPartial(coordA, this.vector).normalize()
    const resA = resB.innerPartial(coordB, this.vector).normalize()
    return [Photons.onePhotonByPolarization(resA), Photons.onePhotonByPolarization(resB)]
  }

  /**
   * Shows probability of photons.
   * @todo Create probability for any number of photons.
   */
  totalIntensityPerTile(): ITileIntensity[] {
    if (this.nPhotons !== 1) {
      throw `Right now implemented only for 1 photon. Here we have ${this.nPhotons} photons.`
    }

    const aggregated = _.chain(this.vector.entries)
      .groupBy((entry) => _.at(entry.coord, [0, 1]))
      .values()
      .map((entries) => {
        const first = entries[0]
        const [x, y, _dir, _pol] = first.coord
        const probability = entries.map((entry) => entry.value.abs2()).reduce((a, b) => a + b)

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
  ketString(complexFormat: ComplexFormat = 'cartesian', precision = 2): string {
    return this.vector.toString(complexFormat, precision, ' + ', false)
  }
}
