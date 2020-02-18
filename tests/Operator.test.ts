import { Cx } from '../src/Complex'
import Dimension from '../src/Dimension'
import Vector from '../src/Vector'
import Operator from '../src/Operator'
import './customMatchers'

describe('Sparse Complex Operator', () => {
  const original = console.error

  beforeEach(() => {
    console.error = jest.fn()
  })

  afterEach(() => {
    console.error = original
  })

  it('creates identity', () => {
    const idPol = Operator.identity([Dimension.polarization()])
    expect(idPol.toString('cartesian', 2, ' + ', false)).toEqual('(1.00 +0.00i) |H⟩⟨H| + (1.00 +0.00i) |V⟩⟨V|')
  })

  it('creates from array', () => {
    const spinY = Operator.fromArray(
      [
        [Cx(0), Cx(0, -1)],
        [Cx(0, 1), Cx(0)],
      ],
      [Dimension.spin()],
    )
    expect(spinY.toString('cartesian', 2, ' + ', false)).toEqual('(0.00 -1.00i) |u⟩⟨d| + (0.00 +1.00i) |d⟩⟨u|')
  })

  it('exports to dense', () => {
    const array = [
      [Cx(0), Cx(0, -1)],
      [Cx(0, 1), Cx(0)],
    ]
    const spinY = Operator.fromArray(array, [Dimension.spin()])
    expect(spinY.toDense()).toEqual(array)
  })

  it('creates from sparse', () => {
    const opFromSparse = Operator.fromSparseCoordNames(
      [
        ['uH', 'uH', Cx(0, 2)],
        ['dH', 'uV', Cx(-1, -1)],
        ['dV', 'dH', Cx(0.5, 2.5)],
      ],
      [Dimension.spin(), Dimension.polarization()],
    )
    expect(opFromSparse.toString('cartesian', 2, ' + ', false)).toEqual(
      '(0.00 +2.00i) |u,H⟩⟨u,H| + (-1.00 -1.00i) |d,H⟩⟨u,V| + (0.50 +2.50i) |d,V⟩⟨d,H|',
    )
  })

  it('exports to sparse index index value', () => {
    const idPolDir = Operator.identity([Dimension.polarization(), Dimension.spin()])
    expect(idPolDir.toIndexIndexValues()).toEqual([
      { i: 0, j: 0, v: Cx(1) },
      { i: 1, j: 1, v: Cx(1) },
      { i: 2, j: 2, v: Cx(1) },
      { i: 3, j: 3, v: Cx(1) },
    ])
  })

  it('row and column representations', () => {
    const idPolDir = Operator.identity([Dimension.polarization(), Dimension.spin()])
    expect(idPolDir.toVectorPerInput()[2].coord).toEqual(idPolDir.toVectorPerInput()[2].vector.entries[0].coord)
    expect(idPolDir.toVectorPerOutput()[2].coord).toEqual(idPolDir.toVectorPerOutput()[2].vector.entries[0].coord)

    const op = Operator.fromSparseCoordNames(
      [
        ['dH', 'uH', Cx(0, 2)],
        ['uH', 'uH', Cx(-1, -1)],
        ['dV', 'uH', Cx(0.5, 2.5)],
      ],
      [Dimension.spin(), Dimension.polarization()],
    )
    const vecsIn = op.toVectorPerInput()
    const vecsOut = op.toVectorPerOutput()
    expect(vecsIn.length).toEqual(1)
    expect(vecsOut.length).toEqual(3)

    const vecIn = Vector.fromSparseCoordNames(
      [
        ['dH', Cx(0, 2)],
        ['uH', Cx(-1, -1)],
        ['dV', Cx(0.5, 2.5)],
      ],
      [Dimension.spin(), Dimension.polarization()],
    )
    expect(vecsIn[0].vector).toEqual(vecIn)

    expect(op.transpose().toVectorPerInput()).toEqual(op.toVectorPerOutput())
  })

  it('complex and Hermitian conjugation', () => {
    const op = Operator.fromSparseCoordNames(
      [
        ['dH', 'dH', Cx(0, 2)],
        ['dH', 'uH', Cx(-1, -1)],
        ['dV', 'uH', Cx(0.5, 2.5)],
      ],
      [Dimension.spin(), Dimension.polarization()],
    )

    const opConj = Operator.fromSparseCoordNames(
      [
        ['dH', 'dH', Cx(0, -2)],
        ['dH', 'uH', Cx(-1, 1)],
        ['dV', 'uH', Cx(0.5, -2.5)],
      ],
      [Dimension.spin(), Dimension.polarization()],
    )

    const opDag = Operator.fromSparseCoordNames(
      [
        ['dH', 'dH', Cx(0, -2)],
        ['uH', 'dH', Cx(-1, 1)],
        ['uH', 'dV', Cx(0.5, -2.5)],
      ],
      [Dimension.spin(), Dimension.polarization()],
    )

    expect(op.conj()).operatorCloseToNumbers(opConj.toDense())
    expect(op.dag()).operatorCloseToNumbers(opDag.toDense())
  })

  it('permute an operator', () => {
    const op = Operator.fromSparseCoordNames(
      [
        ['0H0', 'dH1', Cx(0, 2)],
        ['1H0', 'uH1', Cx(-1, -1)],
        ['0V1', 'uH2', Cx(0.5, 2.5)],
      ],
      [Dimension.qubit(), Dimension.polarization(), Dimension.position(3)],
      [Dimension.spin(), Dimension.polarization(), Dimension.position(3)],
    )

    const opPerm = Operator.fromSparseCoordNames(
      [
        ['H00', 'H1d', Cx(0, 2)],
        ['H01', 'H1u', Cx(-1, -1)],
        ['V10', 'H2u', Cx(0.5, 2.5)],
      ],
      [Dimension.polarization(), Dimension.position(3), Dimension.qubit()],
      [Dimension.polarization(), Dimension.position(3), Dimension.spin()],
    )

    const permuted = op.permute([1, 2, 0])
    expect(permuted.namesOut).toEqual(['polarization', 'x', 'qubit'])
    expect(permuted.namesIn).toEqual(['polarization', 'x', 'spin'])
    expect(permuted).operatorCloseToNumbers(opPerm.toDense())
    expect(() => op.permute([0, 1, 2, 3])).toThrowError('0,1,2,3 is not a valid permutation for 3 dimensions.')
    expect(() => op.permute([0, 0, 0])).toThrowError('0,0,0 is not a valid permutation for 3 dimensions.')
    expect(() => op.permute([2, 0, 0])).toThrowError('2,0,0 is not a valid permutation for 3 dimensions.')
  })

  it('op-vec multiplication', () => {
    const dims = [Dimension.spin(), Dimension.polarization()]
    const id = Operator.identity(dims)
    const op = Operator.fromSparseCoordNames(
      [
        ['dH', 'dH', Cx(0, 2)],
        ['dH', 'uH', Cx(-1, -1)],
        ['dV', 'uH', Cx(0.5, 2.5)],
      ],
      dims,
    )
    const vec = Vector.fromSparseCoordNames(
      [
        ['dH', Cx(0, 1)],
        ['uH', Cx(2, 0)],
        ['dV', Cx(0, 1)],
      ],
      dims,
    )
    expect(id.mulVec(vec).toDense()).toEqual(vec.toDense())
    const vec2 = Vector.fromSparseCoordNames(
      [
        ['dH', Cx(-4, -2)],
        ['dV', Cx(1, 5)],
      ],
      dims,
    )
    expect(op.mulVec(vec).toKetString('cartesian')).toEqual('(-4.00 -2.00i) |d,H⟩ + (1.00 +5.00i) |d,V⟩')
    expect(op.mulVec(vec).toDense()).toEqual(vec2.toDense())
  })

  it('op-op multiplication', () => {
    const dims = [Dimension.spin(), Dimension.polarization()]
    const id = Operator.identity(dims)
    const op = Operator.fromSparseCoordNames(
      [
        ['dH', 'dH', Cx(0, 2)],
        ['dH', 'uH', Cx(-1, -1)],
        ['dV', 'uH', Cx(0.5, 2.5)],
      ],
      dims,
    )
    expect(id.mulOp(op).toDense()).toEqual(op.toDense())
    expect(op.mulOp(id).toDense()).toEqual(op.toDense())
    const op2 = Operator.fromSparseCoordNames(
      [
        ['uH', 'dH', Cx(1)],
        ['dH', 'uH', Cx(1)],
        ['dV', 'dV', Cx(0, 1)],
      ],
      dims,
    )
    const op2right = Operator.fromSparseCoordNames(
      [
        ['dH', 'uH', Cx(0, 2)],
        ['dH', 'dH', Cx(-1, -1)],
        ['dV', 'dH', Cx(0.5, 2.5)],
      ],
      dims,
    )
    const op2left = Operator.fromSparseCoordNames(
      [
        ['uH', 'dH', Cx(0, 2)],
        ['uH', 'uH', Cx(-1, -1)],
        ['dV', 'uH', Cx(-2.5, 0.5)],
      ],
      dims,
    )
    expect(op.mulOp(op2).toDense()).toEqual(op2right.toDense())
    expect(op2.mulOp(op).toDense()).toEqual(op2left.toDense())
  })

  it('op partial vec multiplication', () => {
    const vec = Vector.fromSparseCoordNames(
      [
        ['0dH0', Cx(0, 1)],
        ['1uH0', Cx(2, 0)],
        ['2dV1', Cx(0, 1)],
        ['3dH1', Cx(0, 1)],
        ['4uH2', Cx(2, 0)],
        ['5dV2', Cx(0, 1)],
        ['6dV3', Cx(0, 1)],
      ],
      [Dimension.position(7), Dimension.spin(), Dimension.polarization(), Dimension.position(5)],
    )

    const idSpin = Operator.identity([Dimension.spin()])
    expect(idSpin.mulVecPartial([1], vec)).vectorCloseTo(vec)
    expect(() => idSpin.mulVecPartial([2], vec)).toThrowError('Dimensions array order mismatch...')
    expect(() => idSpin.mulVecPartial([2, 3], vec)).toThrowError('Dimensions array size mismatch...')
    expect(() => idSpin.mulVecPartial([4], vec)).toThrowError()

    const op1 = Operator.fromSparseCoordNames(
      [
        ['dH', 'dH', Cx(0, 2)],
        ['dH', 'uH', Cx(-1, -1)],
        ['dV', 'uH', Cx(0.5, 2.5)],
      ],
      [Dimension.spin(), Dimension.polarization()],
    )
    const vec1res = Vector.fromSparseCoordNames(
      [
        ['0dH0', Cx(-2, 0)],
        ['1dH0', Cx(-2, -2)],
        ['1dV0', Cx(1, 5)],
        ['3dH1', Cx(-2, 0)],
        ['4dH2', Cx(-2, -2)],
        ['4dV2', Cx(1, 5)],
      ],
      [Dimension.position(7), Dimension.spin(), Dimension.polarization(), Dimension.position(5)],
    )
    expect(op1.mulVecPartial([1, 2], vec)).vectorCloseTo(vec1res)
    const op2a = Operator.fromSparseCoordNames(
      [
        ['4', '2', Cx(1)],
        ['4', '5', Cx(1)],
        ['4', '6', Cx(1)],
      ],
      [Dimension.position(7)],
    )
    const op2b = Operator.fromSparseCoordNames(
      [
        ['1', '0', Cx(0)],
        ['1', '1', Cx(1)],
        ['1', '2', Cx(2)],
        ['1', '3', Cx(3)],
      ],
      [Dimension.position(5)],
    )
    const vec2res = Vector.fromSparseCoordNames(
      [['4dV1', Cx(0, 6)]],
      [Dimension.position(7), Dimension.spin(), Dimension.polarization(), Dimension.position(5)],
    )

    const vec2 = op2b.mulVecPartial([3], op2a.mulVecPartial([0], vec))
    expect(vec2).vectorCloseTo(vec2res)
  })
})
