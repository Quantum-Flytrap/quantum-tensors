import { Cx } from '../src/Complex'
import Dimension from '../src/Dimension'
import Vector from '../src/Vector'
import Operator from '../src/Operator'

describe('Sparse Complex Operator', () => {
  it('should create identity', () => {
    const idPol = Operator.identity([Dimension.polarization()])
    expect(idPol.toString('cartesian', 2, ' + ', false)).toEqual('(1.00 +0.00i) |H⟩⟨H| + (1.00 +0.00i) |V⟩⟨V|')
  })

  it('should create from array', () => {
    const spinY = Operator.fromArray(
      [
        [Cx(0), Cx(0, -1)],
        [Cx(0, 1), Cx(0)],
      ],
      [Dimension.spin()],
    )
    expect(spinY.toString('cartesian', 2, ' + ', false)).toEqual('(0.00 -1.00i) |u⟩⟨d| + (0.00 +1.00i) |d⟩⟨u|')
  })

  it('should create from sparse', () => {
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

  it('should export to sparse index index value', () => {
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
        ['dH', 'uH', Cx(-1, -1)],
        ['dV', 'uH', Cx(0.5, 2.5)],
      ],
      [Dimension.spin(), Dimension.polarization()],
    )
    const vecsIn = op.toVectorPerInput()
    const vecsOut = op.toVectorPerOutput()
    expect(vecsIn.length).toEqual(1)
    expect(vecsOut.length).toEqual(2)

    const vecIn = Vector.fromSparseCoordNames(
      [
        ['dH', Cx(0, 2)],
        ['dH', Cx(-1, -1)],
        ['dV', Cx(0.5, 2.5)],
      ],
      [Dimension.spin(), Dimension.polarization()],
    )
    expect(vecsIn[0].vector).toEqual(vecIn)

    expect(op.transpose().toVectorPerInput()).toEqual(op.toVectorPerOutput())
  })
})
