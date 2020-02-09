import { Cx } from '../src/Complex'
import Dimension from '../src/Dimension'
import Vector from '../src/Vector'
import * as Ops from '../src/Ops'

describe('Basis change', () => {
  it('For basis vectors', () => {
    const polD = Vector.fromArray([Cx(1), Cx(1)], [Dimension.polarization(['H', 'V'])]).normalize()
    const vecDiag = Ops.basisToDA.mulVec(polD)

    expect(vecDiag.dimensions[0].coordNames).toEqual(['D', 'A'])
    // expect(vecDiag.entries.length).toEqual(1)
    expect(vecDiag.toDense()[0].re).toBeCloseTo(1)
    expect(vecDiag.toDense()[0].im).toBeCloseTo(0)
    expect(vecDiag.toDense()[1].re).toBeCloseTo(0)
    expect(vecDiag.toDense()[1].im).toBeCloseTo(0)
  })
})
