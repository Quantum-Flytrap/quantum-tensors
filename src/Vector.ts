/* eslint-disable-next-line */
import _ from 'lodash'
import {
  coordsToIndex,
  checkCoordsSizesCompability,
  indicesComplement,
  isPermutation,
  // eslint-disable-next-line comma-dangle
  coordsFromIndex,
} from './helpers'
import Complex, { Cx } from './Complex'
import VectorEntry from './VectorEntry'
import Dimension from './Dimension'
import Basis from './Basis'
import { IColumnOrRow, IEntryIndexValue, IKetComponent } from './interfaces'

/**
 * Vector class.
 * A complex number sparse vector aware of dimensions and tensor structure.
 *
 * @see {@link Complex} and {@link Dimension}
 */
export default class Vector {
  readonly entries: VectorEntry[]
  readonly dimensions: Dimension[]

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

    const size = this.size
    for (const entry of entries) {
      checkCoordsSizesCompability(entry.coord, size)
    }
  }

  /**
   * @returns Sizes of dimensions.
   * @see {@link Dimension}
   */
  get size(): number[] {
    return this.dimensions.map((dimension) => dimension.size)
  }

  /**
   * @returns The total size (the total array length).
   * FIXME: size and totalSize is confusing, rename to length or size, sizes?
   */
  get totalSize(): number {
    return this.dimensions.reduce((a, dim) => a * dim.size, 1)
  }

  /**
   * @returns Dimension names.
   * @see {@link Dimension}
   */
  get names(): string[] {
    return this.dimensions.map((dimension) => dimension.name)
  }

  /**
   * @returns Coordinate names for each {@link Dimension}.
   */
  get coordNames(): string[][] {
    return this.dimensions.map((dimension) => dimension.coordNames)
  }

  /**
   * Vector norm (vector length) squared.
   * In quantum physics, it is probability of a quantum state.
   *
   * @note Would be equivalent to inner product with itself,
   * but we use a more straightforward implementation (plus, to make sure we get a real number).
   *
   * @returns ⟨v|v⟩
   * FIXME: Feels it should be a getter
   */
  normSquared(): number {
    return this.entries.map((entry) => entry.value.abs2()).reduce((a, b) => a + b, 0)
  }

  /**
   * Vector norm (vector length).
   * In quantum physics, it is probability of a quantum state.
   *
   * @note Would be equivalent to inner product with itself,
   * but we use a more straightforward implementation (plus, to make sure we get a real number).
   *
   * @returns sqrt⟨v|v⟩
   */
  get norm(): number {
    return Math.sqrt(this.normSquared())
  }

  /**
   * Create a copy of the vector.
   * @todo Make it more lightweight than using lodash.
   */
  copy(): Vector {
    return _.cloneDeep(this)
  }

  /**
   * Sort entires in-place (internal, important for diplay formats)
   */
  sortedEntries(): VectorEntry[] {
    return this.entries.sort((a, b) => coordsToIndex(a.coord, this.size) - coordsToIndex(b.coord, this.size))
  }

  /**
   * Complex conjugation. Note that that for quantum states it is essentially
   * ket <-> bra, i.e. |psi⟩^† = ⟨psi|
   * @returns Complex conjugation for a vector.
   */
  conj(): Vector {
    const entries = this.entries.map((entry) => new VectorEntry([...entry.coord], entry.value.conj()))
    return new Vector(entries, this.dimensions)
  }

  /**
   * Creates a normalized vector (i.e. with norm 1).
   * @returns A normalized vector: |v⟩ / √⟨v|v⟩
   */
  normalize(): Vector {
    const norm = Math.sqrt(this.normSquared())
    if (norm === 0) {
      throw new Error('Cannot normalize a zero-length vector!')
    }
    return this.mulConstant(Cx(1 / norm))
  }

  /**
   * Multiply vector by a constant.
   * @param c A complex number.
   * @returns c v
   */
  mulConstant(c: Complex): Vector {
    const entries = this.entries.map((entry) => new VectorEntry(entry.coord, entry.value.mul(c)))
    return new Vector(entries, this.dimensions)
  }

  /**
   * Multiplies vector by a real number.
   * @param x A factor.
   * @returns x v
   */
  mulByReal(x: number): Vector {
    return this.mulConstant(Cx(x))
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

    // this function is very hot, so loops are hand-rolled
    const entriesByCoord: Record<string, VectorEntry> = {}

    // hash entries from v1 by coordinates
    for (const entry of v1.entries) {
      const key = entry.coord.toString()
      entriesByCoord[key] = entry
    }

    for (const entry of v2.entries) {
      // look up entries by coordiantes from second vector
      const key = entry.coord.toString()
      if (entriesByCoord.hasOwnProperty(key)) {
        // add values under the same coordinates
        const value = entriesByCoord[key].value.add(entry.value)
        if (value.isAlmostZero()) {
          // remove near-zero sum results
          delete entriesByCoord[key]
        } else {
          entriesByCoord[key] = new VectorEntry(entry.coord, value)
        }
      } else {
        // entry didn't exist in v1, sum is just a value from v2
        entriesByCoord[key] = entry
      }
    }

    return new Vector(Object.values(entriesByCoord), v1.dimensions)
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

    // this function is very hot, so loops are hand-rolled for performance
    let dotSum = Cx(0, 0)
    const entriesByCoord: Record<string, VectorEntry> = {}
    // hash entries from v1 by coordinates
    for (const entry of v1.entries) {
      const key = entry.coord.toString()
      entriesByCoord[key] = entry
    }

    // lookup entries based on coordinates from v2
    for (const entry of v2.entries) {
      const key = entry.coord.toString()
      if (entriesByCoord.hasOwnProperty(key)) {
        // for every entry existing on both v1 and v2, add their product to the dot
        dotSum = dotSum.add(entriesByCoord[key].value.mul(entry.value))
      }
    }
    return dotSum
  }

  /**
   * Inner product, the classic ⟨bra|ket⟩ for complex vectors.
   * https://en.wikipedia.org/wiki/Bra%E2%80%93ket_notation
   * It is anti-linear in the first argument, and linear in the second.
   * @param v2 The other vector (ket).
   * @returns v1^† . v2 or ⟨v1|v2⟩
   */
  inner(v2: Vector): Complex {
    return this.conj().dot(v2)
  }

  /**
   * Map values
   */
  mapValues(func: (x: Complex) => Complex): Vector {
    const entries = this.entries.map((entry) => new VectorEntry(entry.coord, func(entry.value)))
    return new Vector(entries, this.dimensions)
  }

  /**
   * Groups some of vector coordinates.
   * Mostly for intrnal use, e.g. partial inner product, Schmidt decomposition, etc.
   * @param coordIndices Sorted indices of dimensions for vectors. Complementary ones are used for grouping.
   */
  toGroupedByCoords(coordIndices: readonly number[]): IColumnOrRow[] {
    const complementIndices = indicesComplement(coordIndices, this.dimensions.length)
    const contractionDimensions = _.at(this.dimensions, coordIndices)

    return _(this.entries)
      .groupBy((entry) => _.at(entry.coord, complementIndices))
      .values()
      .map((entries) => {
        const coord = _.at(entries[0].coord, complementIndices)
        const vecEntries = entries.map((entry) => new VectorEntry(_.at(entry.coord, coordIndices), entry.value))
        const vector = new Vector(vecEntries, contractionDimensions)
        return { coord, vector }
      })
      .value()
  }

  /**
   * Dot product for all dimensions of v1 and some for v2.
   * @param coordIndices Indices of dimensions for v2.
   * @param v The other vector
   * @returns sum_i v1_i v2_ij
   */
  dotPartial(coordIndices: number[], v: Vector): Vector {
    const groupedByCoords = v.toGroupedByCoords(coordIndices)
    const contractionDimensions = groupedByCoords[0].vector.dimensions
    const complementDimensions = v.dimensions.filter((_dim, i) => !_.includes(coordIndices, i))

    Dimension.checkDimensions(this.dimensions, contractionDimensions)

    const vecEntries = groupedByCoords
      .map((row) => new VectorEntry(row.coord, this.dot(row.vector)))
      .filter((entry) => !entry.value.isAlmostZero())
    return new Vector(vecEntries, complementDimensions)
  }

  /**
   * Inner product, the classic ⟨bra_indices|ket⟩ for complex vectors.
   * https://en.wikipedia.org/wiki/Bra%E2%80%93ket_notation
   * It is anti-linear in the first argument, and linear in the seconf.
   * @param v2 The other vector (ket).
   * @returns |v2⟩_reduced = v1_indices^† . v2 or ⟨v1_indices|v2⟩
   */
  innerPartial(coordIndices: number[], v2: Vector): Vector {
    return this.conj().dotPartial(coordIndices, v2)
  }

  /**
   * Outer product between two vectors.
   * In this context, same as: Kronecker product and tensor product.
   * https://en.wikipedia.org/wiki/Kronecker_product
   * @param v2 Another operator.
   * @returns v = v1 ⊗ v2
   *
   * @todo Consider using flatMap for clarity.
   * FIXME: Result shouldn't be a multi-column vector type
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
   * Changing order of dimensions for a vector, from [0, 1, 2, ...] to something else.
   * @param order  E.g. [2, 0, 1]
   */
  permute(order: number[]): Vector {
    if (!isPermutation(order, this.dimensions.length)) {
      throw new Error(`${order} is not a valid permutation for ${this.dimensions.length} dimensions.`)
    }
    const dimensions = _.at(this.dimensions, order)
    const entries = this.entries.map((entry) => new VectorEntry(_.at(entry.coord, order), entry.value))
    return new Vector(entries, dimensions)
  }

  /**
   * Is it close to zero?
   * @param eps Euclidean distance tolerance.
   * @return Checks v ~= 0
   */
  isCloseToZero(eps = 1e-6): boolean {
    return Math.sqrt(this.normSquared()) < eps
  }

  /**
   * Change all dimensions with a given dimName to the desired basis.
   * @see {@link Basis.fromString} and {@link changeAllDimsOfVector}
   * @param dimName 'polarization', 'spin' or 'qubit'
   * @param basisStr basis
   */
  toBasisAll(dimName: string, basisStr: string): Vector {
    const basis = Basis.fromString(dimName, basisStr)
    return basis.changeAllDimsOfVector(this)
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
    const valueStr = this.sortedEntries()
      .map((entry) => {
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

  /**
   * Generates a string for kets.
   * See {@link Vector.toString} for formatting options.
   * @param complexFormat ['cartesian', 'polar', 'polarTau'].
   * @param precision Float precision.
   *
   * @returns A ket string, e.g. 0.71 exp(0.00τi) |3,1,>,V⟩ + 0.71 exp(1.00τi) |2,2,v,V⟩.
   */
  toKetString(complexFormat = 'polarTau', precision = 2): string {
    return this.toString(complexFormat, precision, ' + ', false)
  }

  /**
   * Export to a dense array format
   * @returns Complex[] array vector
   */
  toDense(): Complex[] {
    const denseVector: Complex[] = Array(this.totalSize).fill(Cx(0, 0))
    this.entries.forEach((entry: VectorEntry) => {
      denseVector[coordsToIndex(entry.coord, this.size)] = entry.value
    })
    return denseVector
  }

  /**
   * Export entires into a flatten, sparse list.
   * @returns E.g. [{i: 2, v: Cx(2, 4)}, {i: 5, v: Cx(-1, 0)}, ...]
   */
  toIndexValues(): IEntryIndexValue[] {
    return this.sortedEntries().map((entry) => ({
      i: coordsToIndex(entry.coord, this.size),
      v: entry.value,
    }))
  }

  /**
   * Exports a form suitable for visualization, with fixed basis.
   * @param probThreshold Minimal probability to emit an entry.
   * @returns An array of elements like {amplitude: Cx(0.1, -0.5), coordStrings: ['3', 'H', 'V' '>', 'u']}
   */
  toKetComponents(probThreshold = 1e-4): IKetComponent[] {
    return this.sortedEntries()
      .map(
        (entry: VectorEntry): IKetComponent => ({
          amplitude: entry.value,
          coordStrs: entry.coord.map((c: number, dim: number) => this.coordNames[dim][c]),
        }),
      )
      .filter((d) => d.amplitude.abs2() > probThreshold)
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
    const sizes = dimensions.map((dimension) => dimension.size)
    const totalSize = dimensions.reduce((a, dim) => a * dim.size, 1)
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
   * Vector with only zeros.
   * @param dimensions
   */
  static zeros(dimensions: Dimension[]): Vector {
    return new Vector([], dimensions)
  }

  /**
   * Vector with only ones.
   * Completely dense!
   * @param dimensions
   */
  static ones(dimensions: Dimension[]): Vector {
    const sizes = dimensions.map((dim) => dim.size)
    const size = sizes.reduce((a, b) => a * b, 1)
    const values: Complex[] = Array(size).fill(Cx(1, 0))
    const entries = values.map((v, i) => new VectorEntry(coordsFromIndex(i, sizes), v))
    return new Vector(entries, dimensions)
  }

  /**
   * A normalized vector, from uniform distribution of U(n).
   * Completely dense!
   * @param dimensions
   */
  static random(dimensions: Dimension[]): Vector {
    const sizes = dimensions.map((dim) => dim.size)
    const size = sizes.reduce((a, b) => a * b, 1)
    const entries = _.range(size).map((i) => new VectorEntry(coordsFromIndex(i, sizes), Complex.randomGaussian()))
    return new Vector(entries, dimensions).normalize()
  }

  /**
   * A normalized vector, from uniform distribution of U(n),
   * restricted only to indices of vector.
   * Think of it as {@link Vector.random} optimized for inner products with the vector.
   */
  randomOnSubspace(): Vector {
    const entries = this.entries.map((entry) => new VectorEntry(entry.coord, Complex.randomGaussian()))
    return new Vector(entries, this.dimensions).normalize()
  }

  /**
   * A normalized vector, from uniform distribution of U(n),
   * restricted only to indices of vector,
   * on a tensor component.
   * Think of it as {@link Vector.random} optimized for partial inner products with the vector, on a selected subspace.
   * @param coordIndices coordinates we want to keep
   */
  randomOnPartialSubspace(coordIndices: number[]): Vector {
    const contractionDimensions = _.at(this.dimensions, coordIndices)

    const partialCoords = this.entries.map((entry) => _.at(entry.coord, coordIndices))
    const partialCoordsUniq = _.uniqBy(partialCoords, (coord) => coord.join(','))
    const entries = partialCoordsUniq.map((coord) => new VectorEntry(coord, Complex.randomGaussian()))
    return new Vector(entries, contractionDimensions).normalize()
  }

  /**
   * Scalar.
   * @z
   */
  static scalar(z = Cx(1)): Vector {
    return new Vector([new VectorEntry([], z)], [])
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
   *
   * @note Consider changing arg order, to conform with other parts of this library.
   */
  static indicator(dimensions: Dimension[], coordNames: string | string[]): Vector {
    const coords = Dimension.stringToCoordIndices(coordNames, dimensions)
    const entries = [new VectorEntry(coords, Cx(1))]
    return new Vector(entries, dimensions)
  }

  /**
   *
   * @example
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
