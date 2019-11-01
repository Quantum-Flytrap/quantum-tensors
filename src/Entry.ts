import Complex from "./Complex"

/**
 * Turns an index into a multiindex, according to dimension sizes
 * @param index An integer
 * @param sizes Sizes of each dimension
 * 
 * @returns Index in each dimension
 * 
 * @todo Check that values are good (also: small endian vs big endian )
 */
export function CoordsFromIndex(index: number, sizes: number[]): number[] {
  let i = index
  const coords = sizes.map(dimSize => {
    const coord = i % dimSize
    i = (i - coord) / dimSize
    return coord
  })
  return coords
}

/**
 * Class for vector entires (also know as: vector values, cells).
 * To be used only within a Vector object, or to create such.
 */
export class VectorEntry {
  coord: number[]
  value: Complex

  /**
   * Creates a VectorEntry from coord and value.
   * @param coord 
   * @param value 
   */
  constructor(coord: number[], value: Complex) {
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
    const coords = CoordsFromIndex(index, sizes)
    return new VectorEntry(coords, value)
  }
}

/**
 * Class for operarator entires.
 * To be used only within a Operator object, or to create such.
 */
export class OperatorEntry {
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
    return `Sparse operator entry [${this.coordOut.toString()}, ${this.coordIn.toString()}] ` +
           `has value ${this.value.toString()}`
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

    const coordOut = CoordsFromIndex(indexOut, sizesOut)
    const coordIn = CoordsFromIndex(indexIn, sizesIn)
    return new OperatorEntry(coordOut, coordIn, value)
  }
}
