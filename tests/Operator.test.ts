import { Cx } from '../src/Complex'
import Dimension from '../src/Dimension'
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
})
