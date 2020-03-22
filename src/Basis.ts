import Complex, { Cx } from './Complex'
import Vector from './Vector'
import Operator from './Operator'
import Dimension from './Dimension'
import { INamedVector } from './interfaces'

/**
 * Class for dealing with bases.
 */
export default class Basis {
  namedVectors: INamedVector[]

  /**
   * As most constructors, for intenal use only.
   * @param namedVectorValues
   * @param dimension
   */
  constructor(namedVectorValues: { name: string; values: Complex[] }[], computationalDimension: Dimension) {
    if (namedVectorValues.length !== computationalDimension.size) {
      throw new Error(
        `There are ${namedVectorValues.length} vectors` +
          ` - incorrect for a basis for ${computationalDimension.toString()}`,
      )
    }
    if (namedVectorValues.length !== computationalDimension.size) {
      throw new Error(
        `There are ${namedVectorValues.length} vectors` +
          ` - incorrect for a basis for ${computationalDimension.toString()}`,
      )
    }
    this.namedVectors = namedVectorValues.map((d) => ({
      name: d.name,
      vector: Vector.fromArray(d.values, [computationalDimension]).normalize(),
    }))
  }

  /**
   * Get dimension.
   */
  get computationalDimension(): Dimension {
    return this.namedVectors[0].vector.dimensions[0]
  }

  get basisCoordNames(): string[] {
    return this.namedVectors.map((d) => d.name)
  }

  /**
   * Get basis string.
   */
  get basisStr(): string {
    return this.basisCoordNames.join('')
  }

  get basisDimension(): Dimension {
    return this.computationalDimension.reassignCoordNames(this.basisCoordNames)
  }

  /**
   * Generates a string.
   */
  toString(): string {
    const intro = `Basis ${this.basisStr} for dimension ${this.computationalDimension.name}`
    const listStr = this.namedVectors.map((d) => `|${d.name}⟩ = ${d.vector.toKetString('cartesian')}`)
    return `${intro}\n${listStr.join('\n')}`
  }

  /**
   * Bases for polarization {@link Dimension.polarization}
   * @param basisStr 'HV' for horizontal, 'DA' for diagonal, 'LR' for circular
   */
  static polarization(basisStr: string): Basis {
    switch (basisStr) {
      case 'HV':
        return new Basis(
          [
            { name: 'H', values: [Cx(1), Cx(0)] },
            { name: 'V', values: [Cx(0), Cx(1)] },
          ],
          Dimension.polarization(),
        )
      case 'DA':
        return new Basis(
          [
            { name: 'D', values: [Cx(1), Cx(1)] },
            { name: 'A', values: [Cx(-1), Cx(1)] },
          ],
          Dimension.polarization(),
        )
      case 'LR':
        return new Basis(
          [
            { name: 'L', values: [Cx(1), Cx(0, 1)] },
            { name: 'R', values: [Cx(1), Cx(0, -1)] },
          ],
          Dimension.polarization(),
        )
      default:
        throw new Error(`Basis ${basisStr} not aviable bases for polarization ['HV', 'DA', 'LR'].`)
    }
  }

  /**
   * Bases for qubit {@link Dimension.qubit}
   * @note Different from polarization, as |-⟩ ~ |0⟩ - |1⟩.
   * @note |i+⟩ and |i-⟩ will test the ground for multichar coord names.
   * @param basisStr '01' for computational, '+-' for diagonal, '+i-i' for circular
   */
  static qubit(basisStr: string): Basis {
    switch (basisStr) {
      case '01':
        return new Basis(
          [
            { name: '0', values: [Cx(1), Cx(0)] },
            { name: '1', values: [Cx(0), Cx(1)] },
          ],
          Dimension.qubit(),
        )
      case '+-':
        return new Basis(
          [
            { name: '+', values: [Cx(1), Cx(1)] },
            { name: '-', values: [Cx(1), Cx(-1)] },
          ],
          Dimension.qubit(),
        )
      case '+i-i':
        return new Basis(
          [
            { name: '+i', values: [Cx(1), Cx(0, 1)] },
            { name: '-i', values: [Cx(1), Cx(0, -1)] },
          ],
          Dimension.qubit(),
        )
      default:
        throw new Error(`Basis ${basisStr} not aviable bases for qubits ['01', '+-', '+i-i'].`)
    }
  }

  /**
   * Bases for spin-1/2 {@link Dimension.spin}
   * @note Let's test multiple names.
   * @param basisStr 'ud' or 'spin-z' or 'uzdz' for z, 'spin-x' or 'uxdx', 'spin-y' or 'uydy'
   */
  static spin(basisStr: string): Basis {
    switch (basisStr) {
      case 'spin-z':
      case 'ud':
      case 'uzdz':
        return new Basis(
          [
            { name: 'u', values: [Cx(1), Cx(0)] },
            { name: 'd', values: [Cx(0), Cx(1)] },
          ],
          Dimension.spin(),
        )
      case 'spin-x':
      case 'uxdx':
        return new Basis(
          [
            { name: 'ux', values: [Cx(1), Cx(1)] },
            { name: 'dx', values: [Cx(-1), Cx(1)] },
          ],
          Dimension.spin(),
        )
      case 'spin-y':
      case 'uydy':
        return new Basis(
          [
            { name: 'uy', values: [Cx(1), Cx(0, 1)] },
            { name: 'dy', values: [Cx(1), Cx(0, -1)] },
          ],
          Dimension.spin(),
        )
      default:
        throw new Error(`Basis ${basisStr} not aviable bases for spin.`)
    }
  }

  /**
   * A shorthand method for {@link Basis.polarization}, {@link Basis.spin} and {@link Basis.qubit}.
   * @param dimName One of: ['polarization', 'spin', 'qubit']
   * @param basisStr Basis string.
   */
  static fromString(dimName: string, basisStr: string): Basis {
    switch (dimName) {
      case 'polarization':
        return Basis.polarization(basisStr)
      case 'spin':
        return Basis.spin(basisStr)
      case 'qubit':
        return Basis.qubit(basisStr)
      default:
        throw new Error(`Basis.fromString: dimName ${dimName} not in ['polarization', 'spin', 'qubit'].`)
    }
  }

  static basisChangeU(basisTo: Basis, basisFrom: Basis): Operator {
    const entries = basisTo.namedVectors.flatMap((to) =>
      basisFrom.namedVectors.map((from): [string[], string[], Complex] => {
        return [[to.name], [from.name], to.vector.inner(from.vector)]
      }),
    )
    return Operator.fromSparseCoordNames(entries, [basisTo.basisDimension], [basisFrom.basisDimension])
  }

  basisChangeUnitary(basisFrom: Basis): Operator {
    return Basis.basisChangeU(this, basisFrom)
  }

  basisChangeUnitaryFromDimension(dimension: Dimension): Operator {
    const basisStr = dimension.coordNames.join('')
    switch (dimension.name) {
      case 'polarization':
        return this.basisChangeUnitary(Basis.polarization(basisStr))
      case 'qubit':
        return this.basisChangeUnitary(Basis.qubit(basisStr))
      case 'spin':
        return this.basisChangeUnitary(Basis.spin(basisStr))
      default:
        throw new Error(`Basis change not yet implemented for ${dimension}.`)
    }
  }

  changeAllBasesUnitary(dimensions: Dimension[]): Operator {
    const ops = dimensions.map((dimension) => {
      if (dimension.name !== this.basisDimension.name) {
        return Operator.identity([dimension])
      } else {
        return this.basisChangeUnitaryFromDimension(dimension)
      }
    })
    return Operator.outer(ops)
  }

  changeAllDimsOfVector(vector: Vector): Vector {
    return this.changeAllBasesUnitary(vector.dimensions).mulVec(vector)
  }

  changeAllDimsOfOperator(operator: Operator): Operator {
    const changeOut = this.changeAllBasesUnitary(operator.dimensionsOut)
    const changeIn = this.changeAllBasesUnitary(operator.dimensionsIn).dag()
    return changeOut.mulOp(operator).mulOp(changeIn)
  }
}
