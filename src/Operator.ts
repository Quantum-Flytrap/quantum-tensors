/* eslint-disable-next-line */
import _ from 'lodash'
import { coordsToIndex, checkCoordsSizesCompability, isPermutation, indicesComplement, joinCoordsFunc } from './helpers'
import Complex, { Cx } from './Complex'
import VectorEntry from './VectorEntry'
import OperatorEntry from './OperatorEntry'
import Vector from './Vector'
import Dimension from './Dimension'
import Basis from './Basis'
import { IColumnOrRow, IEntryIndexIndexValue } from './interfaces'

/**
 * Operator class.
 * A complex number sparse matrix aware of dimensions and tensor structure.
 */
export default class Operator {
  readonly entries: OperatorEntry[]
  readonly dimensionsOut: Dimension[]
  readonly dimensionsIn: Dimension[]

  /**
   * Creates an operator from sparse entires.
   * This is a low-level method (due to the explicit use of {@link OperatorEntry}).
   * You may need {@link Operator.fromArray} or {@link Operator.fromSparseCoordNames} instead.
   * @param entries  Operator entries.
   * @param dimensionsOut Output dimensions.
   * @param dimensionsIn Input dimensions. If not specified, assumed to be the same as input dimensions.
   */
  constructor(entries: OperatorEntry[], dimensionsOut: Dimension[], dimensionsIn: Dimension[] = dimensionsOut) {
    this.entries = entries
    this.dimensionsOut = dimensionsOut
    this.dimensionsIn = dimensionsIn

    this.entries.forEach((entry) => {
      checkCoordsSizesCompability(entry.coordOut, this.sizeOut)
      checkCoordsSizesCompability(entry.coordIn, this.sizeIn)
    })
  }

  /**
   * @returns A pair of output and input dimensions.
   */
  get dimensions(): [Dimension[], Dimension[]] {
    return [this.dimensionsOut, this.dimensionsIn]
  }

  /**
   * @returns The sizes of output dimensions.
   * @see {@link Dimension}
   */
  get sizeOut(): number[] {
    return this.dimensionsOut.map((dimension) => dimension.size)
  }

  /**
   * @returns The sizes of input dimensions.
   * @see {@link Dimension}
   */
  get sizeIn(): number[] {
    return this.dimensionsIn.map((dimension) => dimension.size)
  }

  /**
   * @returns The total size of output (a product of all output sizes).
   * It is the matrix row number.
   */
  get totalSizeOut(): number {
    return this.sizeOut.reduce((a, b) => a * b)
  }

  /**
   * @returns The total size of input (a product of all input sizes).
   * It is the matrix column number.
   */
  get totalSizeIn(): number {
    return this.sizeIn.reduce((a, b) => a * b)
  }

  /**
   * @returns Output dimension names.
   * @see {@link Dimension}
   */
  get namesOut(): string[] {
    return this.dimensionsOut.map((dimension) => dimension.name)
  }

  /**
   * @returns Input dimension names.
   * @see {@link Dimension}
   */
  get namesIn(): string[] {
    return this.dimensionsIn.map((dimension) => dimension.name)
  }

  /**
   * @returns Names of the coordinates for each output dimension.
   * @see {@link Dimension}
   */
  get coordNamesOut(): string[][] {
    return this.dimensionsOut.map((dimension) => dimension.coordNames)
  }

  /**
   * @returns Names of the coordinates for each input dimension.
   * @see {@link Dimension}
   */
  get coordNamesIn(): string[][] {
    return this.dimensionsIn.map((dimension) => dimension.coordNames)
  }

  /**
   * Elementwise complex conjugation (no transpose!).
   * https://en.wikipedia.org/wiki/Complex_conjugate
   * @returns A^* - simple conjugate of an operator.
   */
  conj(): Operator {
    const entries = this.entries.map(
      (entry) => new OperatorEntry([...entry.coordOut], [...entry.coordIn], entry.value.conj()),
    )
    return new Operator(entries, this.dimensionsOut, this.dimensionsIn)
  }

  /**
   * Matrix transpose (no cojugation).
   * https://en.wikipedia.org/wiki/Transpose
   * @returns a^T Transpose of an operator.
   */
  transpose(): Operator {
    const entries = this.entries.map((entry) => new OperatorEntry([...entry.coordIn], [...entry.coordOut], entry.value))
    return new Operator(entries, this.dimensionsIn, this.dimensionsOut)
  }

  /**
   * Conjugate transpose (Hermitian transpose, dagger operator).
   * https://en.wikipedia.org/wiki/Conjugate_transpose
   * @returns a^† Hermitian conjugate of an operator.
   */
  dag(): Operator {
    const entries = this.entries.map(
      (entry) => new OperatorEntry([...entry.coordIn], [...entry.coordOut], entry.value.conj()),
    )
    return new Operator(entries, this.dimensionsIn, this.dimensionsOut)
  }

  /**
   * Outer product between two operators.
   * In this context, same as: Kronecker product and tensor product.
   * https://en.wikipedia.org/wiki/Kronecker_product
   * @param m2 Another operator.
   * @returns m1 ⊗ m2
   *
   * @todo Consider using flatMap for clarity.
   */
  outer(m2: Operator): Operator {
    const m1 = this
    const dimensionsOut: Dimension[] = m1.dimensionsOut.concat(m2.dimensionsOut)
    const dimensionsIn: Dimension[] = m1.dimensionsIn.concat(m2.dimensionsIn)
    const entries: OperatorEntry[] = []

    m1.entries.flatMap((entry1: OperatorEntry) =>
      m2.entries.map((entry2: OperatorEntry) => entries.push(entry1.outer(entry2))),
    )
    return new Operator(entries, dimensionsOut, dimensionsIn)
  }

  /**
   * Add two operators.
   *
   * @param m2 Other operator with same dimensions.
   * @returns m1 + m2
   * @see {@link Operator.add} for the actual implementation.
   */
  add(m2: Operator): Operator {
    return Operator.add([this, m2])
  }

  /**
   * Multiplies an operator by a complex constant.
   * @param c
   * @returns c M
   */
  mulConstant(c: Complex): Operator {
    const entries = this.entries.map((entry) => new OperatorEntry(entry.coordOut, entry.coordIn, entry.value.mul(c)))
    return new Operator(entries, this.dimensionsOut, this.dimensionsIn)
  }

  /**
   * Subtract operators from each other.
   * @param m2 Another operator with compatible dimensions.
   *
   * @returns m1 - m2
   */
  sub(m2: Operator): Operator {
    return this.add(m2.mulConstant(Cx(-1)))
  }

  /**
   * Map values
   */
  mapValues(func: (x: Complex) => Complex): Operator {
    const entries = this.entries.map((entry) => new OperatorEntry(entry.coordOut, entry.coordIn, func(entry.value)))
    return new Operator(entries, this.dimensionsOut, this.dimensionsIn)
  }

  /**
   * An operator as row (output) vectors.
   * Mostly for internal use (e.g. multiplication).
   * @returns a sparse array of vector per output.
   */
  toVectorPerOutput(): IColumnOrRow[] {
    return _(this.entries)
      .groupBy((entry) => entry.coordOut.toString())
      .map((entries) => {
        const coord = entries[0].coordOut
        const vecEntries = entries.map((opEntry) => new VectorEntry(opEntry.coordIn, opEntry.value))
        const vector = new Vector(vecEntries, [...this.dimensionsIn])
        return { coord, vector }
      })
      .value()
  }

  /**
   * An operator as column (input) vectors.
   * Mostly for internal use (e.g. multiplication).
   * @returns a sparse array of vector per input
   */
  toVectorPerInput(): IColumnOrRow[] {
    return _(this.entries)
      .groupBy((entry) => entry.coordIn.toString())
      .values()
      .map((entries) => {
        const coord = entries[0].coordIn
        const vecEntries = entries.map((opEntry) => new VectorEntry(opEntry.coordOut, opEntry.value))
        const vector = new Vector(vecEntries, [...this.dimensionsOut])
        return { coord, vector }
      })
      .value()
  }

  /**
   * Multiply an operator by a vector.
   * @param v Vector with dimensions compatible with operators input dimensions.
   *
   * @returns u = M v (a vector with dimensions as operator output dimensions).
   */
  mulVec(v: Vector): Vector {
    Dimension.checkDimensions(this.dimensionsIn, v.dimensions)
    const vecEntries = this.toVectorPerOutput()
      .map((row) => new VectorEntry(row.coord, row.vector.dot(v)))
      .filter((entry) => !entry.value.isAlmostZero())
    return new Vector(vecEntries, [...this.dimensionsOut])
  }

  /**
   * Multiply an operator by another operator.
   * Order as in the syntax (M1 this operator, M2 - the argument).
   * @param m2 Operator M2 with dimensions compatible with operators input dimensions of M1 (`this`).
   *
   * @returns M = M1 M2
   */
  mulOp(m2: Operator): Operator {
    const m1 = this
    Dimension.checkDimensions(m1.dimensionsIn, m2.dimensionsOut)
    const vecPerInput = m2.toVectorPerInput()
    const entries = m1
      .toVectorPerOutput()
      .flatMap((row) => vecPerInput.map((col) => new OperatorEntry(row.coord, col.coord, row.vector.dot(col.vector))))
      .filter((entry) => !entry.value.isAlmostZero())
    return new Operator(entries, [...m1.dimensionsOut], [...m2.dimensionsIn])
  }

  /**
   * Perform multiplication on a vector, (M v), on some dimensions.
   * E.g. if there are 3 particles, and you want to apply an operation only on the first: M_0 v.
   * Or if you want to apply an operation on the first and the third: M_02 v.
   * In principle, you can do the same by mutlipying matrices with identities, but wouldnot scale.
   * @param coordIndices Dimension indices at which we perform the opration. They need to be unique.
   * @param v Vector on which we apply the operation.
   *
   * @returns M_(coord_indices) ⊗ I_(everywhere_else) v
   */
  mulVecPartial(coordIndices: number[], v: Vector): Vector {
    const complementIndices = indicesComplement(coordIndices, v.dimensions.length)
    const joinCoords = joinCoordsFunc(coordIndices, complementIndices)

    const newEntries = v
      .toGroupedByCoords(coordIndices)
      .map((row) => ({
        coord: row.coord,
        vector: this.mulVec(row.vector),
      }))
      .flatMap((row) =>
        row.vector.entries.map((entry) => new VectorEntry(joinCoords(row.coord, entry.coord), entry.value)),
      )

    return new Vector(newEntries, v.dimensions)
  }

  /**
   * Operator contraction with a vector, reducing 'output' dimensions.
   * @param coordIndices Dimension indices at which we perform the opration. They need to be unique.
   * @param v Vector to contract with.
   * @returns  sum_i1 v_i1 A_(i1 i2),j
   */
  contractLeft(coordIndices: number[], v: Vector): Operator {
    const complementIndices = indicesComplement(coordIndices, this.dimensionsOut.length)

    const newEntries = this.toVectorPerInput()
      .map((col) => ({
        coord: col.coord,
        vector: v.dotPartial(coordIndices, col.vector),
      }))
      .flatMap((col) => col.vector.entries.map((entry) => new OperatorEntry(entry.coord, col.coord, entry.value)))

    return new Operator(newEntries, _.at(this.dimensionsOut, complementIndices), [...this.dimensionsIn])
  }

  /**
   * Operator contraction with a vector, reducing 'input' dimensions.
   * @param coordIndices Dimension indices at which we perform the opration. They need to be unique.
   * @param v Vector to contract with.
   * @returns  sum_j1 A_i,(j1 j2) v_j1
   */
  contractRight(coordIndices: number[], v: Vector): Operator {
    const complementIndices = indicesComplement(coordIndices, this.dimensionsIn.length)

    const newEntries = this.toVectorPerOutput()
      .map((row) => ({
        coord: row.coord,
        vector: v.dotPartial(coordIndices, row.vector),
      }))
      .flatMap((row) => row.vector.entries.map((entry) => new OperatorEntry(row.coord, entry.coord, entry.value)))

    return new Operator(newEntries, [...this.dimensionsOut], _.at(this.dimensionsIn, complementIndices))
  }

  /**
   * Changing order of dimensions for an operator, from [0, 1, 2, ...] to something else.
   * @param orderOut  E.g. [2, 0, 1]
   * @param orderIn  E.g. [2, 0, 1] (be default, same as orderOut)
   */
  permute(orderOut: number[], orderIn = orderOut): Operator {
    if (!isPermutation(orderOut, this.dimensionsOut.length)) {
      throw new Error(`${orderOut} is not a valid permutation for ${this.dimensionsOut.length} output dimensions.`)
    }
    if (!isPermutation(orderIn, this.dimensionsIn.length)) {
      throw new Error(`${orderIn} is not a valid permutation for ${this.dimensionsIn.length} input dimensions.`)
    }
    const dimensionsOut = _.at(this.dimensionsOut, orderOut)
    const dimensionsIn = _.at(this.dimensionsIn, orderIn)

    const entries = this.entries.map(
      (entry) => new OperatorEntry(_.at(entry.coordOut, orderOut), _.at(entry.coordIn, orderIn), entry.value),
    )
    return new Operator(entries, dimensionsOut, dimensionsIn)
  }

  /**
   * Changing order of output dimensions for an operator, from [0, 1, 2, ...] to something else.
   * @param orderOut  E.g. [2, 0, 1]
   */
  permuteDimsOut(orderOut: number[]): Operator {
    if (!isPermutation(orderOut, this.dimensionsOut.length)) {
      throw new Error(`${orderOut} is not a valid permutation for ${this.dimensionsOut.length} output dimensions.`)
    }
    const dimensionsOut = _.at(this.dimensionsOut, orderOut)

    const entries = this.entries.map(
      (entry) => new OperatorEntry(_.at(entry.coordOut, orderOut), entry.coordIn, entry.value),
    )
    return new Operator(entries, dimensionsOut, this.dimensionsIn)
  }

  /**
   * Changing order of input dimensions for an operator, from [0, 1, 2, ...] to something else.
   * @param orderIn  E.g. [2, 0, 1]
   */
  permuteDimsIn(orderIn: number[]): Operator {
    if (!isPermutation(orderIn, this.dimensionsIn.length)) {
      throw new Error(`${orderIn} is not a valid permutation for ${this.dimensionsIn.length} input dimensions.`)
    }
    const dimensionsIn = _.at(this.dimensionsIn, orderIn)

    const entries = this.entries.map(
      (entry) => new OperatorEntry(entry.coordOut, _.at(entry.coordIn, orderIn), entry.value),
    )
    return new Operator(entries, this.dimensionsOut, dimensionsIn)
  }

  /**
   * Change all dimensions with a given dimName to the desired basis.
   * @see {@link Basis.fromString} and {@link changeAllDimsOfVector}
   * @param dimName 'polarization', 'spin' or 'qubit'
   * @param basisStr basis
   */
  toBasisAll(dimName: string, basisStr: string): Operator {
    const basis = Basis.fromString(dimName, basisStr)
    return basis.changeAllDimsOfOperator(this)
  }

  /**
   * String description of an operator.
   * @see {@link Complex.toString} for formating options.
   *
   * @param complexFormat complex number format; a choice between ["cartesian", "polar", "polarTau"]
   * @param precision float display precision
   * @param separator entry separator
   * @param intro if to show dimensions and sized
   *
   * @returns A string like:
   * Operator with 4 entiresof max size [[2,2], [2,2]] with dimensions [[polarization,spin], [polarization,spin]]
   * (1.00 +0.00i) |H,u⟩⟨H,u| + (1.00 +0.00i) |H,d⟩⟨H,d| + (1.00 +0.00i) |V,u⟩⟨V,u| + (1.00 +0.00i) |V,d⟩⟨V,d|
   */
  toString(complexFormat = 'cartesian', precision = 2, separator = ' + ', intro = true): string {
    const valueStr = this.entries
      // .filter((entry: OperatorEntry): boolean => entry.isOne())
      .map((entry) => {
        const coordStrOut = entry.coordOut.map((i: number, dim: number) => this.coordNamesOut[dim][i])
        const coordStrIn = entry.coordIn.map((i: number, dim: number) => this.coordNamesIn[dim][i])
        return `${entry.value.toString(complexFormat, precision)} |${coordStrOut}⟩⟨${coordStrIn}|`
      })
      .join(separator)

    if (intro) {
      const introStr =
        `Operator with ${this.entries.length} entries ` +
        `of max size [[${this.sizeOut}], [${this.sizeIn}]] ` +
        `with dimensions [[${this.namesOut}], [${this.namesIn}]]`
      return `${introStr}\n${valueStr}\n`
    } else {
      return valueStr
    }
  }

  /**
   * Export to a dense array format.
   * @returns array m[i][j], where i is output index and j in input index.
   */
  toDense(): Complex[][] {
    const denseVector: Complex[][] = _.range(this.totalSizeOut).map(() => _.range(this.totalSizeIn).map(() => Cx(0)))
    // Array(this.totalSizeOut).fill(Array(this.totalSizeIn).fill(Cx(0, 0)))
    this.entries.forEach((entry: OperatorEntry) => {
      const i = coordsToIndex(entry.coordOut, this.sizeOut)
      const j = coordsToIndex(entry.coordIn, this.sizeIn)
      denseVector[i][j] = entry.value
    })
    return denseVector
  }

  /**
   * Export entires into a flatten, sparse list.
   * @returns E.g. [{i: 2, j: 0, v: Cx(2, 4)}, {i: 5, j: 3, v: Cx(-1, 0)}, ...]
   */
  toIndexIndexValues(): IEntryIndexIndexValue[] {
    return this.entries.map((entry) => ({
      i: coordsToIndex(entry.coordOut, this.sizeOut),
      j: coordsToIndex(entry.coordIn, this.sizeIn),
      v: entry.value,
    }))
  }

  /**
   * Creates identity matrix, given dimensions.
   * https://en.wikipedia.org/wiki/Identity_matrix
   * @param dimensions A list of dimensions.
   * @returns I
   */
  static identity(dimensions: Dimension[]): Operator {
    const sizes = dimensions.map((dimension) => dimension.size)
    const totalSize = sizes.reduce((a, b) => a * b)

    const entries = _.range(totalSize).map((index) =>
      OperatorEntry.fromIndexIndexValue(index, index, sizes, sizes, Cx(1, 0)),
    )
    return new Operator(entries, dimensions, dimensions)
  }

  /**
   * A shift operator in one dimension. Things outside go to zero.
   * https://en.wikipedia.org/wiki/Shift_matrix
   * Useful e.g. for moving particles in position by one.
   * @param dimension dimension
   * @param shift an integer (e.g. +1 or -1)
   */
  static shift(dimension: Dimension, shift: number): Operator {
    const start = Math.max(0, -shift)
    const end = Math.min(dimension.size, dimension.size - shift)

    const entries = _.range(start, end).map((index) =>
      OperatorEntry.fromIndexIndexValue(index + shift, index, [dimension.size], [dimension.size], Cx(1, 0)),
    )
    return new Operator(entries, [dimension], [dimension])
  }

  /**
   * A zero operator for given dimensions.
   * https://en.wikipedia.org/wiki/Zero_matrix
   * @param dimensionsOut
   * @param dimensionsIn
   *
   * @returns 0 (as a matrix)
   */
  static zeros(dimensionsOut: Dimension[], dimensionsIn: Dimension[] = dimensionsOut): Operator {
    return new Operator([], dimensionsOut, dimensionsIn)
  }

  /**
   * Creates an operator from a dense array of complex numbers.
   * It needs dimensions to create the complex structure.
   *
   * @example
   * const spinY = Operator.fromArray([
   *  [Cx(0, 0), Cx(0, -1)],
   *  [Cx(0, 1), Cx(0,  0)]
   * ], [Dimension.spin()])
   *
   * @param denseArray A 2-d array of complex numbers.
   * @param dimensionsOut Dimensions out.
   * @param dimensionsIn Dimensions in (if not provided, then the same as out).
   * @param removeZeros If to remove zero value.
   *
   * @todo Consider using flatMap for readibility.
   */
  static fromArray(
    denseArray: Complex[][],
    dimensionsOut: Dimension[],
    dimensionsIn: Dimension[] = dimensionsOut,
    removeZeros = true,
  ): Operator {
    // Get size vector from dimensions
    const sizesOut = dimensionsOut.map((dimension) => dimension.size)
    const totalSizeOut = sizesOut.reduce((a, b) => a * b)

    const sizesIn = dimensionsIn.map((dimension) => dimension.size)
    const totalSizeIn = sizesIn.reduce((a, b) => a * b)

    const rowLengths = denseArray.map((row) => row.length)
    if (_.min(rowLengths) !== _.max(rowLengths)) {
      throw new Error(`Is not a rectangular array. Row sizes ${_.min(rowLengths)} to ${_.max(rowLengths)}.`)
    }

    if (denseArray.length !== totalSizeOut || denseArray[0].length !== totalSizeIn) {
      throw new Error(
        `Dimension inconsistency: array is [${denseArray.length}, ${denseArray[0].length}] ` +
          `and dimensions total sizes are [${totalSizeOut}, ${totalSizeIn}]`,
      )
    }

    const flatlist: [number, number, Complex][] = []
    denseArray.forEach((row: Complex[], indexOut: number) =>
      row.forEach((value: Complex, indexIn: number) => flatlist.push([indexOut, indexIn, value])),
    )

    // Broken TypeScript on my compy, so
    // const entries: OperatorEntry[] = denseArray
    //     .flatMap((row: Complex[], indexOut: number): [number, number, Complex][] =>
    //         row.map((value: Complex, indexIn: number): [number, number, Complex] =>
    //             [indexOut, indexIn, value]
    //         )
    //     )
    const entries: OperatorEntry[] = flatlist
      .filter(([_indexOut, _indexIn, value]: [number, number, Complex]): boolean => !removeZeros || !value.isZero())
      .map(
        ([indexOut, indexIn, value]: [number, number, Complex]): OperatorEntry =>
          OperatorEntry.fromIndexIndexValue(indexOut, indexIn, sizesOut, sizesIn, value),
      )

    return new Operator(entries, dimensionsOut, dimensionsIn)
  }

  /**
   * Creates an operator projecting on a single element, given by its symbol, e.g. |H,u⟩⟨H,u|.
   *
   * @example
   * Operator.indicator([Dimensions.polarization(), Dimensions.spin()], 'Hu')
   *
   * @param dimensions
   * @param coordNames Symbols for each ordinate.
   * For symbols with more than one letter you need to use an array of strings.
   *
   */
  static indicator(dimensions: Dimension[], coordNames: string | string[]): Operator {
    const coords = Dimension.stringToCoordIndices(coordNames, dimensions)
    const entries = [new OperatorEntry(coords, coords, Cx(1))]
    return new Operator(entries, dimensions, dimensions)
  }

  /**
   * The most typically way of creating custom operators,
   * directly from its entries (delivered in a visual form).
   *
   * @example
   * export const opY =  Operator.fromSparseCoordNames([
   * ['V', 'H', Cx(0, 1)],
   * ['H', 'V', Cx(0, -1)],
   * ], [Dimension.polariztion()])
   *
   * @param stringedEntries A list of entries, using symbols.
   * ['Hu', 'Vu', C(0.5, -1)] ->  (0.50 - 1.00i) |H,u⟩⟨V,u|
   * @param dimensionsOut Output dimensions.
   * @param dimensionsIn Input dimensions. If not specified, the same as in dimensionsOut.
   *
   * @returns An operator, as desired.
   *
   */
  static fromSparseCoordNames(
    stringedEntries: [string | string[], string | string[], Complex][],
    dimensionsOut: Dimension[],
    dimensionsIn: Dimension[] = dimensionsOut,
  ): Operator {
    const entries = stringedEntries.map(
      ([coordNameStrOut, coordNameStrIn, value]) =>
        new OperatorEntry(
          Dimension.stringToCoordIndices(coordNameStrOut, dimensionsOut),
          Dimension.stringToCoordIndices(coordNameStrIn, dimensionsIn),
          value,
        ),
    )
    return new Operator(entries, dimensionsOut, dimensionsIn)
  }

  /**
   * L2 norm, Frobenius norm, or Hilbert-Schmidt norm. Squared.
   * https://en.wikipedia.org/wiki/Matrix_norm#Frobenius_norm
   */
  normSquared(): number {
    return this.entries.map((entry) => entry.value.abs2()).reduce((a, b) => a + b, 0)
  }

  /**
   * Is it close to zero?
   * @param eps Euclidean distance tolerance.
   * @return Checks M ~= 0
   */
  isCloseToZero(eps = 1e-6): boolean {
    return Math.sqrt(this.normSquared()) < eps
  }

  /**
   * Is it close to another operator?
   * @param m2 An operator to compare
   * @param eps Euclidean distance tolerance.
   * @return Checks M1 ~= M2
   */
  isCloseTo(m2: Operator, eps = 1e-6): boolean {
    return this.sub(m2).isCloseToZero(eps)
  }

  /**
   * Is it close to a Hermitian matrix?
   * @see https://en.wikipedia.org/wiki/Hermitian_matrix
   * @param eps Euclidean distance tolerance.
   * @return Checks M^dag ~= M
   */
  isCloseToHermitian(eps = 1e-6): boolean {
    return this.dag().isCloseTo(this, eps)
  }

  /**
   * Is it close to identity?
   * @note Checks only if in and out dimensions are the same,
   * otherwise there is an error.
   * @param eps Euclidean distance tolerance.
   * @return Checks M ~= Id
   */
  isCloseToIdentity(eps = 1e-6): boolean {
    Dimension.checkDimensions(this.dimensionsIn, this.dimensionsOut)
    const idOp = Operator.identity([...this.dimensionsIn])
    return this.isCloseTo(idOp, eps)
  }

  /**
   * Is it close to a projection?
   * @see https://en.wikipedia.org/wiki/Projection_(linear_algebra)
   * @param eps Euclidean distance tolerance.
   * @return Checks M M ~= M
   */
  isCloseToProjection(eps = 1e-6): boolean {
    return this.mulOp(this).isCloseTo(this, eps)
  }

  /**
   * Is it close to an unitary operator?
   * @see https://en.wikipedia.org/wiki/Unitary_operator
   * @param eps Euclidean distance tolerance.
   * @return Checks M^dag M ~= Id
   */
  isCloseToUnitary(eps = 1e-6): boolean {
    return this.dag().mulOp(this).isCloseToIdentity(eps)
  }

  /**
   * Is it close to a normal operator?
   * @see https://en.wikipedia.org/wiki/Normal_operator
   * @param eps Euclidean distance tolerance.
   * @return Checks M^dag M ~= M M^dag
   */
  isCloseToNormal(eps = 1e-6): boolean {
    const lhs = this.dag().mulOp(this)
    const rhs = this.mulOp(this.dag())
    return lhs.isCloseTo(rhs, eps)
  }

  /**
   * Is it close to an unitary, when restricted to of the subspace defines by its image.
   * A stronger condition than the partial isometry https://en.wikipedia.org/wiki/Partial_isometry.
   * E.g. spin-up operator |u><d| is a partial isometry, but not unitary on subspace.
   * @param eps Euclidean distance tolerance.
   * @returns M^dag M ~= M M^dag ~= P, P P = P
   */
  isCloseToUnitaryOnSubspace(eps = 1e-6): boolean {
    const proj = this.dag().mulOp(this)
    return this.isCloseToNormal(eps) && proj.isCloseToProjection(eps)
  }

  /**
   * Outer product (tensor product) between two or more operators.
   *
   * @see {@link Operator.outer} for the actual implementation.
   *
   * @param ops [m1, m2, ...]
   *
   * @returns ⨂[m1, m2, ...]
   *
   * @todo Can be optimized if needed.
   */
  static outer(ops: Operator[]): Operator {
    return ops.reduce((acc, x) => acc.outer(x))
  }

  /**
   * As sum of many operators with compatible dimensions.
   *
   * @param ops [m1, m2, ...]
   *
   * @returns m1 + m2 + ...
   *
   */
  static add(ops: Operator[]): Operator {
    if (ops.length === 0) {
      throw new Error('add requires at least one operator')
    }
    if (ops.length === 1) {
      return ops[0]
    }

    const [m1, ...rest] = ops
    for (const m2 of rest) {
      Dimension.checkDimensions(m1.dimensionsIn, m2.dimensionsIn)
      Dimension.checkDimensions(m1.dimensionsOut, m2.dimensionsOut)
    }

    // this function is very hot, so loops are hand-rolled for performance
    const entriesByCoord: Record<string, OperatorEntry> = {}

    // hash entries from first operator by their coordinates
    for (const entry of m1.entries) {
      entriesByCoord[entry.coordKey()] = entry
    }
    // for every next operator in the sum
    for (const m2 of rest) {
      for (const entry of m2.entries) {
        const key = entry.coordKey()
        if (entriesByCoord.hasOwnProperty(key)) {
          // if this entry's coordinates are already in the hashmap,
          // calculate the sum and store back, rejecting near-zero results.
          const value = entriesByCoord[key].value.add(entry.value)
          if (value.isAlmostZero()) {
            delete entriesByCoord[key]
          } else {
            entriesByCoord[key] = new OperatorEntry(entry.coordOut, entry.coordIn, value)
          }
        } else {
          // this is the first entry under given coordinates, so store it directly
          entriesByCoord[key] = entry
        }
      }
    }
    return new Operator(Object.values(entriesByCoord), m1.dimensionsOut, m1.dimensionsIn)
  }
}
