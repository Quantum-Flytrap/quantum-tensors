import Vector from './Vector'
import Operator from './Operator'

export interface INamedVector {
  name: string[]
  vector: Vector
}

export interface IWeightedProjection {
  name: string[]
  weight: number
  operator: Operator
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
    povms: IWeightedProjection[] = [],
  ): Measurement {
    const newStatesProj = this.states.flatMap((state) => {
      return projections.map((projection) => ({
        name: [...state.name, ...projection.name],
        vector: projection.vector.innerPartial(coordIndices, state.vector),
      }))
    })
    const newStatesPOVM = this.states.flatMap((state) => {
      return povms.map((povm) => {
        const projectedVec = povm.operator.mulVecPartial(coordIndices, state.vector).mulByReal(Math.sqrt(povm.weight))
        return {
          name: [...state.name, ...povm.name],
          vector: projectedVec,
        }
      })
    })
    // |psi> -> |psi> + Σi(( √(1-w_i) - 1) P_i) |psi>
    const projOnMeasured = Operator.add(
      projections
        .map((projection) => Operator.projectionOn(projection.vector.normalize()).mulByReal(Math.sqrt(1 - projection.vector.normSquared()) - 1))
        .concat(povms.map((povm) => povm.operator.mulByReal(Math.sqrt(1 - povm.weight) - 1))),
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
