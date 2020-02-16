import { Cx } from '../src/Complex'
import * as Basis from '../src/Basis'
import './customMatchers'

describe('Basis', () => {
  it('same basis results in identity, some not', () => {
    expect(Basis.basisChangeOp(['H', 'V'], ['H', 'V']).isCloseToIdentity()).toBe(true)
    expect(Basis.basisChangeOp(['D', 'A'], ['D', 'A']).isCloseToIdentity()).toBe(true)
    expect(Basis.basisChangeOp(['L', 'R'], ['L', 'R']).isCloseToIdentity()).toBe(true)

    expect(Basis.basisChangeOp(['D', 'A'], ['H', 'V']).isCloseToUnitary()).toBe(true)
    expect(Basis.basisChangeOp(['D', 'A'], ['H', 'V'])).not.operatorCloseToNumbers([
      [Cx(1), Cx(0)],
      [Cx(0), Cx(1)],
    ])
    expect(Basis.basisChangeOp(['L', 'R'], ['D', 'A']).isCloseToUnitary()).toBe(true)
    expect(Basis.basisChangeOp(['L', 'R'], ['D', 'A'])).not.operatorCloseToNumbers([
      [Cx(1), Cx(0)],
      [Cx(0), Cx(1)],
    ])
    expect(Basis.basisChangeOp(['H', 'V'], ['L', 'R']).isCloseToUnitary()).toBe(true)
    expect(Basis.basisChangeOp(['H', 'V'], ['L', 'R'])).not.operatorCloseToNumbers([
      [Cx(1), Cx(0)],
      [Cx(0), Cx(1)],
    ])
  })

  it('dag changes the order', () => {
    expect(Basis.basisChangeOp(['D', 'A'], ['H', 'V']).dag()).operatorCloseToNumbers(
      Basis.basisChangeOp(['H', 'V'], ['D', 'A']).toDense(),
    )
    expect(Basis.basisChangeOp(['L', 'R'], ['D', 'A']).dag()).operatorCloseToNumbers(
      Basis.basisChangeOp(['D', 'A'], ['L', 'R']).toDense(),
    )
    expect(Basis.basisChangeOp(['H', 'V'], ['L', 'R']).dag()).operatorCloseToNumbers(
      Basis.basisChangeOp(['L', 'R'], ['H', 'V']).toDense(),
    )
  })

  it('cyclic property', () => {
    const ab = Basis.basisChangeOp(['H', 'V'], ['D', 'A'])
    const bc = Basis.basisChangeOp(['D', 'A'], ['L', 'R'])
    const ca = Basis.basisChangeOp(['L', 'R'], ['H', 'V'])
    expect(
      ab
        .mulOp(bc)
        .mulOp(ca)
        .isCloseToIdentity(),
    ).toBe(true)
  })
})
