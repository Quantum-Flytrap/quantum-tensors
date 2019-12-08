/* eslint-disable-next-line */
import _ from 'lodash'
import Complex, { Cx } from './Complex'
import VectorEntry from './VectorEntry'
import Dimension from './Dimension'

/**
 * Vector class.
 * A complex number sparse vector aware of dimensions and tensor structure.
 *
 * @see {@link Complex} and {@link Dimension}
 */
export default class Vector {
  entries: VectorEntry[]
  dimensions: Dimension[]

  /**
   * Creates a vector entry.
   * This is a low-level method (due to the explicit use of {@link VectorEntry}).
   * You may need {@link Vector.fromArray} or {@link Vector.fromSparseCoordNames} instead.
   * @param entries Vector entries.
   * @param dimensions Dimensions.
   */
  constructor(entries: VectorEntry[], dimensions: Dimension[]) {
    this.entries = entries
    this.dimensions = dimensions
  }

  /**
   * @deprecated
   * A getter to for entries.
   * Use this.entires instead; here only to make sure it is not a breaking change.
   */
  get cells(): VectorEntry[] {
    return this.entries
  }

  /**
   * @returns Sizes of dimensions.
   * @see {@link Dimension}
   */
  get size(): number[] {
    return this.dimensions.map(dimension => dimension.size)
  }

  /**
   * @returns The total size (the total array length).
   */
  get totalSize(): number {
    return this.size.reduce((a, b) => a * b)
  }

  /**
   * @returns Dimension names.
   * @see {@link Dimension}
   */
  get names(): string[] {
    return this.dimensions.map(dimension => dimension.name)
  }

  /**
   * @returns Coordinate names for each {@link Dimension}.
   */
  get coordNames(): string[][] {
    return this.dimensions.map(dimension => dimension.coordNames)
  }

  /**
   * Complex conjugation. Note that that for quantum states it is essentially
   * ket <-> bra, i.e. |psi⟩^† = ⟨psi|
   * @returns Complex conjugation for a vector.
   */
  conj(): Vector {
    const entries = this.entries.map(entry => new VectorEntry([...entry.coord], entry.value.conj()))
    return new Vector(entries, this.dimensions)
  }

  /**
   * Adds to vectors.
   * @param v2 The other vector.
   *
   * @returns v1 + v2
   *
   */
  add(v2: Vector): Vector {
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

  /**
   * Multiply vector by a constant.
   * @param c A complex number.
   * @returns c v
   */
  mulConstant(c: Complex): Vector {
    const entries = this.entries.map(entry => new VectorEntry(entry.coord, entry.value.mul(c)))
    return new Vector(entries, this.dimensions)
  }

  /**
   * Subtracts two vectors.
   * @param v2
   * @returns v1 - v2
   */
  sub(v2: Vector): Vector {
    return this.add(v2.mulConstant(Cx(-1)))
  }

  /**
   * Dot product.
   * Take note that there is no complex conjugation here.
   * @see https://en.wikipedia.org/wiki/Dot_product
   * @param v2
   * @returns v1 . v2
   */
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
      .reduce((a, b) => a.add(b), Cx(0))
      .value()

    return result
  }

  /**
   * It is NOT a safe operation.
   * Unless before we applied an in-bassis projection to this coordinate
   * it will produce something which will cause errors, due to possibility of entries with same coords
   * E.g. for (0.00 -0.71i) |2,3,^,V,1,8,>,H⟩ -> (0.00 -0.71i) |1,8,>,H⟩
   * @todo Create dotPartial and innerPartial instead
   * @param coordIndices Indices to be removed
   */
  _removeDimension(coordIndices: number[]): Vector {
    const complementIndices = _.range(this.dimensions.length).filter(i => !_.includes(coordIndices, i))

    const newDims = _.at(this.dimensions, complementIndices)
    const newEntries = this.entries.map(entry => new VectorEntry(_.at(entry.coord, complementIndices), entry.value))

    return new Vector(newEntries, newDims)
  }

  // dotPartial(coordIndices: number[], v: Vector): Vector {
  // TO DO
  // }

  /**
   * Inner product, the classic ⟨bra|ket⟩ for complex vectors.
   * https://en.wikipedia.org/wiki/Bra%E2%80%93ket_notation
   * It is anti-linear in the first argument, and linear in the seconf.
   * @param v2 The other vector (ket).
   * @returns v1^† . v2 or ⟨v1|v2⟩
   */
  inner(v2: Vector): Complex {
    return this.conj().dot(v2)
  }

  /**
   * Vector norm (vector length) squared.
   * In quantum physics, it is probability of a quantum state.
   *
   * @note Would be equivalent to inner product with itself,
   * but we use a more straightforward implementation (plus, to make sure we get a real number).
   *
   * @returns ⟨v|v⟩
   */
  normSquared(): number {
    return this.entries.map(entry => entry.value.abs2()).reduce((a, b) => a + b, 0)
  }

  /**
   * Creates a normalized vector (i.e. with norm 1).
   * @returns A normalized vector: |v⟩ / √⟨v|v⟩
   */
  normalize(): Vector {
    const norm = this.normSquared()
    if (norm === 0) {
      throw new Error('Cannot normalize a zero-length vector!')
    }
    return this.mulConstant(Cx(norm))
  }

  /**
   * Outer product between two vectors.
   * In this context, same as: Kronecker product and tensor product.
   * https://en.wikipedia.org/wiki/Kronecker_product
   * @param v2 Another operator.
   * @returns v = v1 ⊗ v2
   *
   * @todo Consider using flatMap for clarity.
   */
  outer(v2: Vector): Vector {
    const v1 = this
    const dimensions: Dimension[] = v1.dimensions.concat(v2.dimensions)
    const entries: VectorEntry[] = []
    v1.entries.forEach((entry1: VectorEntry) =>
      v2.entries.forEach((entry2: VectorEntry) => entries.push(entry1.outer(entry2))),
    )
    return new Vector(entries, dimensions)
  }

  /**
   * Create a copy of the vector.
   * @todo Make it more lightweight than using lodash.
   */
  copy(): Vector {
    return _.cloneDeep(this)
  }

  /**
   * String description of a vector.
   * @see {@link Complex.toString} for formating options.
   * @param complexFormat Complex number format - a choice between ["cartesian", "polar", "polarTau"].
   * @param precision Float display precision.
   * @param separator Entry separator.
   * @param intro If to show dimensions and sized.
   *
   * @returns A string, e.g.:
   *
   * Vector with 3 entries of max size [2,2] with dimensions [spin,polarization]
   * (0.00 +2.00i) |u,H⟩ + (-1.00 -1.00i) |d,H⟩ + (0.50 +2.50i) |d,V⟩
   */
  toString(complexFormat = 'cartesian', precision = 2, separator = ' + ', intro = true): string {
    const valueStr = this.entries
      .map(entry => {
        const coordStr = entry.coord.map((i: number, dim: number) => this.coordNames[dim][i])
        return `${entry.value.toString(complexFormat, precision)} |${coordStr}⟩`
      })
      .join(separator)

    if (intro) {
      const introStr =
        `Vector with ${this.entries.length} entries ` + `of max size [${this.size}] with dimensions [${this.names}]`
      return `${introStr}\n${valueStr}\n`
    } else {
      return valueStr
    }
  }

  toDenseMatrix() {
    this.entries.map((entry: VectorEntry) => {})
  }

  /**
   * Creates a a vector from a dense array of complex numbers.
   * It needs dimensions to create the complex structure.
   *
   * @example
   * const vec = Vector.fromArray([Cx(1), Cx(0), Cx(2, 1), Cx(0, -1)], [Dimension.spin(), Dimension.spin()])
   *
   * @param denseArray A 1-d array of complex numbers.
   * @param dimensions Dimensions.
   * @param removeZeros If to remove zero value.
   */
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

  /**
   * Creates a vector with a single 1 value and all zeros, e.g. |H,u⟩.
   *
   * @example
   * Vector.indicator([Dimensions.polarization(), Dimensions.spin()], 'Hu')
   *
   * @param dimensions
   * @param coordNames Symbols for each ordinate.
   * For symbols with more than one letter you need to use an array of strings.
   */
  static indicator(dimensions: Dimension[], coordNames: string[]): Vector {
    const coords = Dimension.stringToCoordIndices(coordNames, dimensions)
    const entries = [new VectorEntry(coords, Cx(1))]
    return new Vector(entries, dimensions)
  }

  /**
   *
   * @example
   *
   * const singletState = Vector.fromSparseCoordNames([
   *   ['ud', Cx(1)],
   *   ['du', Cx(-1)],
   * ], [Dimension.spin(), Dimension.spin()])
   *
   * @param stringedEntries A list of entries, using symbols.
   * ['Hu', C(0.5, -1)] ->  (0.50 - 1.00i) |H,u⟩
   * @param dimensions
   *
   * @returns A vector, as desired.
   */
  static fromSparseCoordNames(stringedEntries: [string, Complex][], dimensions: Dimension[]): Vector {
    const entries = stringedEntries.map(
      ([coordNameStr, value]) => new VectorEntry(Dimension.stringToCoordIndices(coordNameStr, dimensions), value),
    )
    return new Vector(entries, dimensions)
  }

  /**
   * Outer product (vectors product) between two or more vectors.
   *
   * @see {@link Vector.outer} for the actual implementation.
   *
   * @param ops [v1, v2, ...]
   *
   * @returns ⨂[v1, v2, ...]
   *
   * @todo Can be optimized if needed.
   */
  static outer(vectors: Vector[]): Vector {
    return vectors.reduce((acc, x) => acc.outer(x))
  }

  /**
   * As sum of many vectors with compatible dimensions.
   * @see {@link Vector.add} for the actual implementation.
   *
   * @param ops [v1, v2, ...]
   *
   * @returns v1 + v2 + ...
   *
   * @todo Can be optimized if needed.
   */
  static add(vectors: Vector[]): Vector {
    return vectors.reduce((acc, x) => acc.add(x))
  }
}
