import Complex from './Complex'
import { coordsFromIndex } from './helpers'

/**
 * Class for operarator entires.
 * To be used only within a Operator object, or to create such.
 */
export default class OperatorEntry {
  coordOut: number[]
  coordIn: number[]
  value: Complex

  /**
   * Creates a VectorEntry from output and input coordinates, and value.
   * @param coordOut
   * @param coordIn
   * @param value
   */
  constructor(coordOut: number[], coordIn: number[], value: Complex) {
    this.coordOut = coordOut
    this.coordIn = coordIn
    this.value = value
  }

  /**
   * Tensor product of two entires (multiplies values, concatenates coordinates).
   * @param e2  The other entry
   */
  outer(e2: OperatorEntry): OperatorEntry {
    const e1 = this
    return new OperatorEntry(e1.coordOut.concat(e2.coordOut), e1.coordIn.concat(e2.coordIn), e1.value.mul(e2.value))
  }

  /**
   * Overrides toString() method.
   * @returms E.g. "Sparse operator entry [[3,0,1], [2,1,1]] has value (1.00 - 0.5 i)"
   */
  toString(): string {
    return (
      `Sparse operator entry [${this.coordOut.toString()}, ${this.coordIn.toString()}] ` +
      `has value ${this.value.toString()}`
    )
  }

  /**
   * Check if the entry value is 1.
   * @returms true if value is 1.
   */
  isOne(): boolean {
    return this.value.isOne()
  }

  /**
   * Creates OperatorEntry from two integer indices, coordinate sizes and a value.
   * @param indexOut an integer for output index
   * @param indexIn  an integer for output index
   * @param sizesOut sizes od output dimensions
   * @param sizesIn  sizes od output dimensions
   * @param value  entry value
   */
  static fromIndexIndexValue(
    indexOut: number,
    indexIn: number,
    sizesOut: number[],
    sizesIn: number[],
    value: Complex,
  ): OperatorEntry {
    const coordOut = coordsFromIndex(indexOut, sizesOut)
    const coordIn = coordsFromIndex(indexIn, sizesIn)
    return new OperatorEntry(coordOut, coordIn, value)
  }
}
