import Complex, { Cx } from "./Complex"
import { VectorEntry } from "./Entry"
import Dimension from "./Dimension"
import _ from "lodash"

/**
 * Vector class. 
 * A complex number sparse vector aware of dimensions and tensor structure.
 */
export default class Vector {
  entries: VectorEntry[]
  dimensions: Dimension[]

  // TODO: assume the cells are ordered
  constructor(entries: VectorEntry[], dimensions: Dimension[]) {
    this.entries = entries
    this.dimensions = dimensions
  }

  /**
   * @deprecated
   * A getter to for .entries.
   * Use .entires instead; here only to make sure it is not a breaking change.
   */
  get cells(): VectorEntry[] {
    return this.entries
  }

  // Getters for dimensions
  get size(): number[] {
    return this.dimensions.map(dimension => dimension.size)
  }
  get totalSize(): number {
    return this.size.reduce((a, b) => a * b)
  }
  get names(): string[] {
    return this.dimensions.map(dimension => dimension.name)
  }
  get coordNames(): string[][] {
    return this.dimensions.map(dimension => dimension.coordNames)
  }

  // Conjugate
  conj(): Vector {
    const entries = this.entries.map(entry => new VectorEntry([...entry.coord], entry.value.conj()))
    return new Vector(entries, this.dimensions)
  }

  add(v2: Vector): Vector {
    // NOTE: may be overengineered for adding 2 vectors with this map-reduce approach

    const v1 = this

    Dimension.checkDimensions(v1.dimensions, v2.dimensions)

    const entries = _.chain(v1.entries.concat(v2.entries))
      .groupBy((entry: VectorEntry) => entry.coord.toString())
      .values()
      .map((grouped: VectorEntry[]) => {
        const coord = [...grouped[0].coord]
        const value = grouped.map(entry => entry.value).reduce((a, b) => a.add(b))
        return new VectorEntry(coord, value)
      })
      .value()

    return new Vector(entries, v1.dimensions)
  }

  mulConstant(c: Complex): Vector {
    const entries = this.entries.map(entry => new VectorEntry(entry.coord, entry.value.mul(c)))
    return new Vector(entries, this.dimensions)
  }

  sub(v2: Vector): Vector {
    return this.add(v2.mulConstant(Cx(-1)))
  }

  dot(v2: Vector): Complex {
    const v1 = this

    Dimension.checkDimensions(v1.dimensions, v2.dimensions)

    const result = _.chain(v1.entries.concat(v2.entries))
      .groupBy((entry: VectorEntry) => entry.coord.toString())
      .values()
      .map((grouped: VectorEntry[]) => {
        if (grouped.length === 2) {
          return grouped[0].value.mul(grouped[1].value)
        } else {
          return Cx(0, 0)
        }
      })
      .reduce((a, b) => a.add(b))
      .value()

    return result
  }

  // Outer product of vectors
  outer(v2: Vector): Vector {
    const v1 = this
    const dimensions: Dimension[] = v1.dimensions.concat(v2.dimensions)
    const entries: VectorEntry[] = []
    v1.entries.forEach((entry1: VectorEntry) =>
      v2.entries.forEach((entry2: VectorEntry) =>
        entries.push(entry1.outer(entry2))
      )
    )
    return new Vector(entries, dimensions)
  }

  // TODO: Dense matrix visualisation
  toString(complexFormat = "cartesian", precision = 2, separator = " + ", intro = true): string {
    const valueStr = this.entries
      .map(entry => {
        const coordStr = entry.coord.map((i: number, dim: number) => this.coordNames[dim][i])
        return `${entry.value.toString(complexFormat, precision)} |${coordStr}⟩`
      })
      .join(separator)
    
    if (intro) {
      const introStr = `Vector with ${this.entries.length} entries` +
                       ` of max size [${this.size}] with dimensions [${this.names}]`
      return `${introStr}\n${valueStr}\n`
    } else {
      return valueStr
    }
  }

  // Loading from dense array list of cells
  static fromArray(denseArray: Complex[], dimensions: Dimension[], removeZeros = true): Vector {
    // Get size vector from dimensions
    const sizes = dimensions.map(dimension => dimension.size)
    const totalSize = sizes.reduce((a, b) => a * b)
    if (denseArray.length !== totalSize) {
      throw new Error(`Dimension inconsistency: entry count ${denseArray.length} != total: ${totalSize}`)
    }

    // Map values to cells indices in a dense representation
    const entries: VectorEntry[] = denseArray
      .map((value: Complex, index: number): [number, Complex] => [index, value])
      .filter(([_index, value]: [number, Complex]): boolean => !removeZeros || !value.isZero())
      .map(([index, value]: [number, Complex]): VectorEntry => VectorEntry.fromIndexValue(index, sizes, value))

    return new Vector(entries, dimensions)
  }

  // a vector with only one 1, rest zeros
  static indicator(dimensions: Dimension[], coordNames: string[]): Vector {
    const coords = Dimension.stringToCoordIndices(coordNames, dimensions)
    const entries = [new VectorEntry(coords, Cx(1))]
    return new Vector(entries, dimensions)
  }

  static fromSparseCoordNames(stringedEntries: [string, Complex][], dimensions: Dimension[]): Vector {
    const entries = stringedEntries.map(
      ([coordNameStr, value]) => new VectorEntry(Dimension.stringToCoordIndices(coordNameStr, dimensions), value),
    )
    return new Vector(entries, dimensions)
  }

  // outer product for more
  static outer(vectors: Vector[]): Vector {
    return vectors.reduce((acc, x) => acc.outer(x))
  }

  // add for more (can be optimized)
  static add(vectors: Vector[]): Vector {
    return vectors.reduce((acc, x) => acc.add(x))
  }
}
