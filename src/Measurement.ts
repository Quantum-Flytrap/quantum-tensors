import Vector from './Vector'
import Operator from './Operator'

export interface INamedVector {
  name: string[]
  vector: Vector
}

/**
 * Class for creating and using weighted projections M=wP for POVMs. 
 */

export class WeightedProjection {
  name: string[]
  weight: number
  operator: Operator

  constructor(name: string[], operator: Operator, weight: number) {
    this.name = name
    this.operator = operator
    this.weight = weight
  }

  /**
   * Created a weighted projection
   * @param name Name (it will be displayed in measurement results)
   * @param operator A projective operator (P^2=P)
   * @param weight Weight w, so that M=wP
   * @param check Check if P is indeed a projection
   * @returns 
   */
  static new(name: string[], operator: Operator, weight = 1., check = true): WeightedProjection {
    if (check && !operator.isCloseToProjection()) {
      throw Error(`WeightedProjection ${name.join('&')} is not a projection.`)
    }
    return new WeightedProjection(name, operator, weight)
  }

  /**
   * Turn a vector (|v|^2 = probability) into an measurement operator.
   * M = |v><v|
   * @param name Name to assing
   * @param vector A (non-normalized) pure state 
   * @returns 
   */
  static fromVector(name: string[], vector: Vector): WeightedProjection {
    const operator = Operator.projectionOn(vector.normalize())
    return WeightedProjection.new(name, operator, vector.normSquared())
  }

  scaledOperator(): Operator {
    return this.operator.mulByReal(this.weight)
  }

  transformationOperator(): Operator {
    return this.operator.mulByReal(Math.sqrt(this.weight))
  }

  remainingShift(): Operator {
    return this.operator.mulByReal(Math.sqrt(1 - this.weight) - 1)
  }
  /**
   * |psi> -> √w P |psi>
   * @param vector Vector to act on
   * @param coordIndices Indices to act on
   * @returns 
   */
  actOnPureState(vector: Vector, coordIndices: number[]): Vector {
    return this.operator.mulVecPartial(coordIndices, vector).mulByReal(Math.sqrt(this.weight))
  }

  /**
   * |psi> -> √w P |psi> and append measurement to named vector name
   * @param namedVector Named vector to act on
   * @param coordIndices Indices to act on
   * @returns 
   */
  actOnNamedVector(namedVector: INamedVector, coordIndices: number[]): INamedVector {
    return {
      name: [...namedVector.name, ...this.name],
      vector: this.actOnPureState(namedVector.vector, coordIndices)
    }
  }
}

/**
 * Class for performing measurements.
 * Results are labeled by names of types T.
 * Supports successive measurements, to deal with many particles.
 */
export default class Measurement {
  states: INamedVector[]

  constructor(states: INamedVector[]) {
    this.states = states
  }

  /**
   * Create measurement from a single state. Normalizes it.
   * @param vector Vector to start with.
   * @param name An optional vector name.
   */
  static fromVector(vector: Vector, name: string[] = []): Measurement {
    return new Measurement([{ name, vector: vector.normalize() }])
  }

  destructiveMeasurement(coordIndices: number[], projections: INamedVector[]): Measurement {
    const newStates = this.states.flatMap((state) => projections.map((projection) => ({
      name: [...state.name, ...projection.name],
      vector: projection.vector.innerPartial(coordIndices, state.vector),
    })))
    return new Measurement(newStates)
  }

  nondemolitionMeasurement(coordIndices: number[], povms: WeightedProjection[], check = true): Measurement {
    if (check && !Operator.add(povms.map((povm) => povm.scaledOperator())).isCloseToIdentity()) {
      throw Error('POVMs do not add up to identity, fix or use projectiveMeasurement instead.')
    }
    const newStates = this.states.flatMap((state) => povms.map((povm) => povm.actOnNamedVector(state, coordIndices)))
    return new Measurement(newStates)
  }

  /**
   * A projective, destructive measurement.
   * @param coordIndices Coordinates to be measured.
   * @param measurements An array of vector projections.
   * @param povms An array of positive operators.
   * To make √M managable, they need to be be weighted arbitrary-dim projection operators.
   * @returns An array of projected states. Their norm squared is the probability.
   * @todo Separate this measurement (with "other" but requiring orthogonality) to two.
   */
  projectiveMeasurement(
    coordIndices: number[],
    projections: INamedVector[],
    povms: WeightedProjection[] = [],
  ): Measurement {
    const newStatesProj = this.destructiveMeasurement(coordIndices, projections).states
    const newStatesPOVM = this.nondemolitionMeasurement(coordIndices, povms, false).states
    // |psi> -> |psi> + Σi(( √(1-w_i) - 1) P_i) |psi>
    const projOnMeasured = Operator.add(
      projections
        .map((projection) => WeightedProjection.fromVector([], projection.vector).remainingShift())
        .concat(povms.map((povm) => povm.remainingShift())),
    )
    const notMeasured = this.states.map(({ name, vector }) => {
      const projectedVec = vector.add(projOnMeasured.mulVecPartial(coordIndices, vector))
      return {
        name,
        vector: projectedVec,
      }
    })

    const allStates = notMeasured
      .concat(newStatesProj)
      .concat(newStatesPOVM)
      .filter((state) => state.vector.normSquared() > 1e-8)
    return new Measurement(allStates)
  }

  /**
   * Print outcomes.
   */
  toString(): string {
    return this.states
      .map((state) => {
        const percent = 100 * state.vector.normSquared()
        const name = state.name.join('&')
        return `${percent.toFixed(1)}% [${name}] ${state.vector.normalize().toKetString()}`
      })
      .join('\n')
  }

  /**
   * Randomly selects outcome, according to probabilities.
   */
  pickRandom(): Measurement {
    const probs = this.states.map((state) => state.vector.normSquared())
    const p = Math.random()
    let acc = 0
    for (let i = 0; i < this.states.length; i++) {
      acc += probs[i]
      if (acc > p) {
        const { name, vector } = this.states[i]
        return Measurement.fromVector(vector, name)
      }
    }
    throw new Error('Measurement probabilities does not sum up to 1.')
  }
}
