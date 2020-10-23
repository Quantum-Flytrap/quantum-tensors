import Vector from './Vector'
import { Cx } from './Complex'

interface INamedVector<T> {
  name: T[]
  vector: Vector
}

/**
 * Class for performing measurements.
 * Results are labeled by names of types T.
 * Supports successive measurements, to deal with many particles.
 */
export default class Measurement<T> {
  states: INamedVector<T>[]

  constructor(states: INamedVector<T>[]) {
    this.states = states
  }

  /**
   * Create measurement from a single state. Normalizes it.
   * @param vector Vector to start with.
   * @param name Vector name.
   */
  static fromVector<T>(vector: Vector, name: T[] = []): Measurement<T> {
    return new Measurement<T>([{ name, vector: vector.normalize() }])
  }

  /**
   * A projective, destructive measurement.
   * @param coordIndices Coordinates to be measured.
   * @param measurements An array of projections.
   * @returns An array of projected states. Their norm squared is the probability.
   */
  projectiveMeasurement(coordIndices: number[], projections: INamedVector<T>[]): Measurement<T> {
    const newStates = this.states.flatMap((state) => {
      return projections.map((projection) => ({
        name: [...state.name, ...projection.name],
        vector: projection.vector.innerPartial(coordIndices, state.vector),
      }))
    })
    const detectionProbability = newStates.map((state) => state.vector.normSquared()).reduce((a, b) => a + b, 0)
    const noDetectionAmplitude = Cx(Math.sqrt(1 - detectionProbability))
    const oldStates = this.states.map(({ name, vector }) => ({
      name,
      vector: vector.mulConstant(noDetectionAmplitude),
    }))
    const allStates = oldStates.concat(newStates).filter((state) => state.vector.normSquared() > 1e-8)
    return new Measurement<T>(allStates)
  }

  /**
   * Print outcomes.
   */
  toString(): string {
    return this.states
      .map((state) => {
        const percent = 100 * state.vector.normSquared()
        return `${percent.toFixed(1)}%   ${state.vector.normalize().toKetString()}`
      })
      .join('\n')
  }

  /**
   * Randomly selects outcome, according to probabilities.
   */
  pickRandom(): Measurement<T> {
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
