import Vector from './Vector'
import Operator from './Operator'

export interface INamedVector {
  name: string[]
  vector: Vector
}

export interface INamedOperator {
  name: string[]
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
   * @param measurements An array of projections.
   * @param povms An array of positive operators.
   * @returns An array of projected states. Their norm squared is the probability.
   */
  projectiveMeasurement(
    coordIndices: number[],
    projections: INamedVector[],
    povms: INamedOperator[] = [],
  ): Measurement {
    const newStatesProj = this.states.flatMap((state) => {
      return projections.map((projection) => ({
        name: [...state.name, ...projection.name],
        vector: projection.vector.innerPartial(coordIndices, state.vector),
      }))
    })
    const newStatesPOVM = this.states.flatMap((state) => {
      return povms.map((povm) => {
        const projectedVec = povm.operator.mulVecPartial(coordIndices, state.vector)
        const scalePOVM = Math.sqrt(projectedVec.inner(state.vector).abs()) / projectedVec.norm
        return {
          name: [...state.name, ...povm.name],
          vector: projectedVec.mulByReal(scalePOVM),
        }
      })
    })
    const projOnMeasured = Operator.add(
      projections
        .map((projection) => Operator.projectionOn(projection.vector))
        .concat(povms.map((povm) => povm.operator)),
    )
    const notMeasured = this.states.map(({ name, vector }) => {
      // non-normalized projection does:
      // |v⟩ -> P |v⟩
      // we want to have
      // |v⟩ -> √P |v⟩
      // hence this scalePOVM factor (as it is hard to square operators)
      const projectedVec = vector.sub(projOnMeasured.mulVecPartial(coordIndices, vector))
      const scalePOVM = Math.sqrt(projectedVec.inner(vector).abs()) / projectedVec.norm
      return {
        name,
        vector: projectedVec.mulByReal(scalePOVM),
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
