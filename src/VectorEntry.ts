import Complex from './Complex'
import { coordsFromIndex } from './helpers'

/**
 * Class for vector entires (also know as: vector values, cells).
 * To be used only within a Vector object, or to create such.
 */
export default class VectorEntry {
  readonly coord: readonly number[]
  readonly value: Complex

  /**
   * Creates a VectorEntry from coord and value.
   * @param coord
   * @param value
   */
  constructor(coord: readonly number[], value: Complex) {
    this.coord = coord
    this.value = value
  }

  /**
   * Tensor product of two entires (multiplies values, concatenates coordinates).
   * @param e2 The other entry
   */
  outer(e2: VectorEntry): VectorEntry {
    const e1 = this
    return new VectorEntry(e1.coord.concat(e2.coord), e1.value.mul(e2.value))
  }

  /**
   * Overrides toString() method.
   * @returms E.g. "Sparse vector entry [3,0,1] has value (1.00 - 0.50 i)"
   */
  toString(): string {
    return `Sparse vector entry [${this.coord.toString()}] has value ${this.value.toString()}`
  }

  /**
   * Creates a VectorEntry from an integer index, coordinate sizes and value.
   * @param index an integer
   * @param sizes sizes od dimensions
   * @param value entry value
   */
  static fromIndexValue(index: number, sizes: number[], value: Complex): VectorEntry {
    const coords = coordsFromIndex(index, sizes)
    return new VectorEntry(coords, value)
  }
}
