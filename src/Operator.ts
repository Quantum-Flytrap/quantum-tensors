/* eslint-disable-next-line */
import _ from 'lodash'
import { isPermutation } from './helpers'
import Complex, { Cx } from './Complex'
import VectorEntry from './VectorEntry'
import OperatorEntry from './OperatorEntry'
import Vector from './Vector'
import Dimension from './Dimension'

/**
 * Operator class.
 * A complex number sparse matrix aware of dimensions and tensor structure.
 */
export default class Operator {
  entries: OperatorEntry[]
  dimensionsOut: Dimension[]
  dimensionsIn: Dimension[]

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
    return this.dimensionsOut.map(dimension => dimension.size)
  }

  /**
   * @returns The sizes of input dimensions.
   * @see {@link Dimension}
   */
  get sizeIn(): number[] {
    return this.dimensionsIn.map(dimension => dimension.size)
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
    return this.dimensionsOut.map(dimension => dimension.name)
  }

  /**
   * @returns Input dimension names.
   * @see {@link Dimension}
   */
  get namesIn(): string[] {
    return this.dimensionsIn.map(dimension => dimension.name)
  }

  /**
   * @returns Names of the coordinates for each output dimension.
   * @see {@link Dimension}
   */
  get coordNamesOut(): string[][] {
    return this.dimensionsOut.map(dimension => dimension.coordNames)
  }

  /**
   * @returns Names of the coordinates for each input dimension.
   * @see {@link Dimension}
   */
  get coordNamesIn(): string[][] {
    return this.dimensionsIn.map(dimension => dimension.coordNames)
  }

  /**
   * Elementwise complex conjugation (no transpose!).
   * https://en.wikipedia.org/wiki/Complex_conjugate
   * @returns A^* - simple conjugate of an operator.
   */
  conj(): Operator {
    const entries = this.entries.map(
      entry => new OperatorEntry([...entry.coordOut], [...entry.coordIn], entry.value.conj()),
    )
    return new Operator(entries, this.dimensionsOut, this.dimensionsIn)
  }

  /**
   * Matrix transpose (no cojugation).
   * https://en.wikipedia.org/wiki/Transpose
   * @returns a^T Transpose of an operator.
   */
  transpose(): Operator {
    const entries = this.entries.map(entry => new OperatorEntry([...entry.coordIn], [...entry.coordOut], entry.value))
    return new Operator(entries, this.dimensionsIn, this.dimensionsOut)
  }

  /**
   * Conjdugate transpose (Hermitian transpose, dagger operator).
   * https://en.wikipedia.org/wiki/Conjugate_transpose
   * @returns a^† Hermitian conjugate of an operator.
   */
  dag(): Operator {
    const entries = this.entries.map(
      entry => new OperatorEntry([...entry.coordIn], [...entry.coordOut], entry.value.conj()),
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

    m1.entries.forEach((entry1: OperatorEntry) =>
      m2.entries.forEach((entry2: OperatorEntry) => entries.push(entry1.outer(entry2))),
    )

    // local issues with TypeScipt/npm/NVM make it harder
    // const entries: OperatorEntry[] = m1.entries
    //  .flatMap((entry1: OperatorEntry) =>
    //     (m2.entries).map((entry2: OperatorEntry) =>
    //         entry1.outer(entry2)
    //     )
    // )
    return new Operator(entries, dimensionsOut, dimensionsIn)
  }

  /**
   * Add two operators.
   *
   * Note: May be overengineered for adding 2 vectors with this map-reduce approach.
   *
   * @param m2 Other operator with same dimensions.
   * @returns m1 + m2
   */
  add(m2: Operator): Operator {
    const m1 = this

    Dimension.checkDimensions(m1.dimensionsIn, m2.dimensionsIn)
    Dimension.checkDimensions(m1.dimensionsOut, m2.dimensionsOut)

    const entries = _.chain(m1.entries.concat(m2.entries))
      .groupBy((entry: OperatorEntry) => `${entry.coordOut.toString()}-${entry.coordIn.toString()} `)
      .values()
      .map((grouped: OperatorEntry[]) => {
        const coordOut = [...grouped[0].coordOut]
        const coordIn = [...grouped[0].coordIn]
        const value = grouped.map(entry => entry.value).reduce((a, b) => a.add(b))
        return new OperatorEntry(coordOut, coordIn, value)
      })
      .value()

    return new Operator(entries, m1.dimensionsOut, m1.dimensionsIn)
  }

  /**
   * Returns the operator multipied by a complex constant.
   * @param c
   * @returns c M
   */
  mulConstant(c: Complex): Operator {
    const entries = this.entries.map(entry => new OperatorEntry(entry.coordOut, entry.coordIn, entry.value.mul(c)))
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
   * Multiply a operator times a vector.
   * @param v Vector with dimensions compatible with operators input dimensions
   *
   * @returns u = M v (a vector with dimensions as operator output dimensions)
   */
  mulVec(v: Vector): Vector {
    const m: Operator = this

    Dimension.checkDimensions(m.dimensionsIn, v.dimensions)

    const vValueMap = new Map<string, Complex>()
    v.entries.forEach(entry => {
      vValueMap.set(entry.coord.toString(), entry.value)
    })

    const entries = _.chain(m.entries)
      .groupBy((entry: OperatorEntry) => entry.coordOut.toString())
      .values()
      .map(
        (entries: OperatorEntry[]): VectorEntry => {
          const coordOut = entries[0].coordOut
          const sum = entries
            .map(entry => {
              const coordInStr = entry.coordIn.toString()
              const val = vValueMap.get(coordInStr) || Cx(0)
              return entry.value.mul(val)
            })
            .reduce((a, b) => a.add(b))
          return new VectorEntry(coordOut, sum)
        },
      )
      .filter(entry => !entry.value.isZero())
      .value()

    return new Vector(entries, m.dimensionsOut)
  }

  /**
   * Perform an multiplication on a vector, (M v), on some dimensions.
   * E.g. if there are 3 particles, and you want to apply an operation only on the first: M_0 v.
   * Or if you want to apply an operation on the first and the third M_02 v.
   * In principle, you can do the same by mutlipying matrices with identities, but wouldnot scale.
   * @param coordIndices Dimension indices at which be perform the opration.
   * They need to be unique. Right now we accept only when they are sorted.
   * @param v Vector on which we apply the operation.
   *
   * @returns M_(coord_indices) ⊗ I_(everywhere_else) v
   *
   * @todo If needed, I can write also a version in which we don't assume they are sorted.
   */
  mulVecPartial(coordIndices: number[], v: Vector): Vector {
    const m = this

    if (
      !_.chain(coordIndices)
        .sortBy()
        .sortedUniq()
        .isEqual(coordIndices)
    ) {
      throw `Entries of coordIndices ${coordIndices} are not sorted unique.`
    }

    Dimension.checkDimensions(m.dimensionsIn, _.at(v.dimensions, coordIndices))

    const complementIndices = _.range(v.dimensions.length).filter(i => !_.includes(coordIndices, i))

    // if m.dimensionsOut !== m.dimensionsIn
    const newDimensions = _.cloneDeep(v.dimensions)
    _.range(coordIndices.length).forEach(i => (newDimensions[coordIndices[i]] = m.dimensionsOut[i]))

    const newEntries = _.chain(v.entries)
      .groupBy(entry => _.at(entry.coord, complementIndices))
      .values()
      .map(vecEntries => {
        const vValueMap = new Map<string, Complex>()
        vecEntries.forEach(entry => {
          const reducedCoords = _.at(entry.coord, coordIndices)
          vValueMap.set(reducedCoords.toString(), entry.value)
        })

        return _.chain(m.entries)
          .groupBy((entry: OperatorEntry) => entry.coordOut.toString())
          .values()
          .map(
            (opEntries: OperatorEntry[]): VectorEntry => {
              // we need to create a full out coord
              // now it is lightly haky
              const coordOutPart = opEntries[0].coordOut
              const coordOut = [...vecEntries[0].coord]
              _.range(coordIndices.length).forEach(i => (coordOut[coordIndices[i]] = coordOutPart[i]))

              const sum = opEntries
                .map(entry => {
                  const coordInStr = entry.coordIn.toString()
                  const val = vValueMap.get(coordInStr) || Cx(0)
                  return entry.value.mul(val)
                })
                .reduce((a, b) => a.add(b))
              return new VectorEntry(coordOut, sum)
            },
          )
          .filter(entry => !entry.value.isZero())
          .value()
      })
      .flatten()
      .value()

    return new Vector(newEntries, v.dimensions)
  }

  // mulOp(m2: Operator): Operator {
  //     const m1 = this
  //     // TODO: check dimensions here
  //     const result = _
  //         .chain(v1.cells.concat(v2.cells))
  //         .groupBy((entry: VectorEntry) => entry.coord.toString())
  //         .values()
  //         .map((grouped: VectorEntry[]) => {
  //             if (grouped.length === 2) {
  //                 return (grouped[0].value).mul(grouped[1].value)
  //             } else {
  //                 return Cx(0, 0)
  //             }
  //         })
  //         .reduce((a, b) => a.add(b))
  //         .value()

  //     return result

  // }

  /**
   * Changing order of dimensions for a vector, from [0, 1, 2, ...] to something else.
   * @param orderOut  E.g. [2, 0, 1]
   * @param orderIn  E.g. [2, 0, 1]
   */
  permute(orderOut: number[], orderIn = orderOut): Operator {
    if (!isPermutation(orderOut, this.dimensionsOut.length)) {
      throw new Error(`${orderOut} is not a valid permutation for ${this.dimensionsOut.length} dimensions.`)
    }
    if (!isPermutation(orderIn, this.dimensionsOut.length)) {
      throw new Error(`${orderIn} is not a valid permutation for ${this.dimensionsIn.length} dimensions.`)
    }
    const dimensionsOut = _.at(this.dimensionsOut, orderOut)
    const dimensionsIn = _.at(this.dimensionsIn, orderIn)

    const entries = this.entries.map(
      entry => new OperatorEntry(_.at(entry.coordOut, orderOut), _.at(entry.coordOut, orderOut), entry.value),
    )
    return new Operator(entries, dimensionsOut, dimensionsIn)
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
      .map(entry => {
        const coordStrOut = entry.coordOut.map((i: number, dim: number) => this.coordNamesOut[dim][i])
        const coordStrIn = entry.coordIn.map((i: number, dim: number) => this.coordNamesIn[dim][i])
        return `${entry.value.toString(complexFormat, precision)} |${coordStrOut}⟩⟨${coordStrIn}|`
      })
      .join(separator)

    if (intro) {
      const introStr =
        `Operator with ${this.entries.length} entires ` +
        `of max size [[${this.sizeOut}], [${this.sizeIn}]] ` +
        `with dimensions [[${this.namesOut}], [${this.namesIn}]]`
      return `${introStr}\n${valueStr}\n`
    } else {
      return valueStr
    }
  }

  /**
   * Creates identity matrix, given dimensions.
   * https://en.wikipedia.org/wiki/Identity_matrix
   * @param dimensions A list of dimensions.
   * @returns I
   */
  static identity(dimensions: Dimension[]): Operator {
    const sizes = dimensions.map(dimension => dimension.size)
    const totalSize = sizes.reduce((a, b) => a * b)

    const entries = _.range(totalSize).map(index =>
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

    const entries = _.range(start, end).map(index =>
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
    const sizesOut = dimensionsOut.map(dimension => dimension.size)
    const totalSizeOut = sizesOut.reduce((a, b) => a * b)

    const sizesIn = dimensionsIn.map(dimension => dimension.size)
    const totalSizeIn = sizesIn.reduce((a, b) => a * b)

    const rowLengths = denseArray.map(row => row.length)
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
    stringedEntries: [string, string, Complex][],
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
   * @see {@link Operator.add} for the actual implementation.
   *
   * @param ops [m1, m2, ...]
   *
   * @returns m1 + m2 + ...
   *
   * @todo Can be optimized if needed.
   */
  static add(ops: Operator[]): Operator {
    return ops.reduce((acc, x) => acc.add(x))
  }
}
