import Measurement from '../src/Measurement'
import Vector from '../src/Vector'
import Dimension from '../src/Dimension'
import { Cx } from '../src/Complex'
import './customMatchers'
import Operator from '../src/Operator'

describe('Measurement', () => {
  it('the simplest measurement', () => {
    const vector = Vector.fromSparseCoordNames(
      [
        ['0', Cx(1)],
        ['1', Cx(1)],
      ],
      [Dimension.qubit()],
    ).normalize()
    const m = new Measurement([{ name: [], vector }])
    expect(m.states.length).toBe(1)
    expect(m.toString()).toBe('100.0% [] 0.71 exp(0.00τi) |0⟩ + 0.71 exp(0.00τi) |1⟩')
    const projections = [
      { name: ['zero'], vector: Vector.indicator([Dimension.qubit()], '0') },
      { name: ['one'], vector: Vector.indicator([Dimension.qubit()], '1') },
    ]
    const newM = m.projectiveMeasurement([0], projections)
    expect(newM.toString()).toBe(['50.0% [zero] 1.00 exp(0.00τi) |⟩', '50.0% [one] 1.00 exp(0.00τi) |⟩'].join('\n'))
  })

  it('two particles', () => {
    const vector = Vector.fromSparseCoordNames(
      [
        ['01', Cx(1)],
        ['10', Cx(-1)],
      ],
      [Dimension.qubit(), Dimension.qubit()],
    ).normalize()
    const m = new Measurement([{ name: [], vector }])
    const projections = [
      { name: ['zero'], vector: Vector.indicator([Dimension.qubit()], '0') },
      { name: ['one'], vector: Vector.indicator([Dimension.qubit()], '1') },
    ]
    const measFirst = m.projectiveMeasurement([0], projections)
    expect(measFirst.toString()).toBe(
      ['50.0% [zero] 1.00 exp(0.00τi) |1⟩', '50.0% [one] 1.00 exp(0.50τi) |0⟩'].join('\n'),
    )

    const measLast = m.projectiveMeasurement([1], projections)
    expect(measLast.toString()).toBe(
      ['50.0% [zero] 1.00 exp(0.50τi) |1⟩', '50.0% [one] 1.00 exp(0.00τi) |0⟩'].join('\n'),
    )
  })

  it('non-complete projection', () => {
    const vector = Vector.fromSparseCoordNames(
      [
        ['01H', Cx(1)],
        ['10V', Cx(-1)],
      ],
      [Dimension.qubit(), Dimension.qubit(), Dimension.polarization()],
    ).normalize()
    const m = new Measurement([{ name: [], vector }])
    const projections = [
      { name: ['0', '0'], vector: Vector.indicator([Dimension.qubit(), Dimension.qubit()], ['0', '0']) },
      { name: ['0', '1'], vector: Vector.indicator([Dimension.qubit(), Dimension.qubit()], ['0', '1']) },
    ]
    const measured = m.projectiveMeasurement([0, 1], projections)
    expect(measured.toString()).toBe(
      ['50.0% [] 1.00 exp(0.50τi) |1,0,V⟩', '50.0% [0&1] 1.00 exp(0.00τi) |H⟩'].join('\n'),
    )
  })

  it('probabilistic measurement', () => {
    const vector = Vector.fromSparseCoordNames(
      [
        ['01H', Cx(1)],
        ['10V', Cx(-1)],
      ],
      [Dimension.qubit(), Dimension.qubit(), Dimension.polarization()],
    ).normalize()
    const m = new Measurement([{ name: [], vector }])
    const projections = [
      { name: ['H'], vector: Vector.indicator([Dimension.polarization()], 'H').mulByReal(Math.SQRT1_2) },
      { name: ['V'], vector: Vector.indicator([Dimension.polarization()], 'V').mulByReal(Math.SQRT1_2) },
    ]
    const measured = m.projectiveMeasurement([2], projections)
    expect(measured.toString()).toBe(
      [
        '50.0% [] 0.71 exp(0.00τi) |0,1,H⟩ + 0.71 exp(0.50τi) |1,0,V⟩',
        '25.0% [H] 1.00 exp(0.00τi) |0,1⟩',
        '25.0% [V] 1.00 exp(0.50τi) |1,0⟩',
      ].join('\n'),
    )
  })

  it('more advanced measurement', () => {
    const vector = Vector.fromSparseCoordNames(
      [
        ['dH0', Cx(0.5)],
        ['dV1', Cx(-0.5)],
        ['dV2', Cx(0, 0.5)],
        ['uV2', Cx(0, -0.5)],
      ],
      [Dimension.spin(), Dimension.polarization(), Dimension.position(3)],
    )
    const m = new Measurement([{ name: [], vector }])
    expect(m.states.length).toBe(1)
    expect(m.toString()).toBe(
      // eslint-disable-next-line max-len
      '100.0% [] 0.50 exp(0.75τi) |u,V,2⟩ + 0.50 exp(0.00τi) |d,H,0⟩ + 0.50 exp(0.50τi) |d,V,1⟩ + 0.50 exp(0.25τi) |d,V,2⟩',
    )
    const projections = [
      { name: ['H'], vector: Vector.indicator([Dimension.polarization()], 'H') },
      { name: ['V'], vector: Vector.indicator([Dimension.polarization()], 'V') },
    ]
    const newM = m.projectiveMeasurement([1], projections)
    expect(newM.states.length).toBe(2)
    expect(newM.states[0].name).toEqual(['H'])
    expect(newM.states[0].vector.toKetString('cartesian')).toEqual('(0.50 +0.00i) |d,0⟩')
    expect(newM.states[1].name).toEqual(['V'])
    expect(newM.states[1].vector.toKetString('cartesian')).toEqual(
      '(0.00 -0.50i) |u,2⟩ + (-0.50 +0.00i) |d,1⟩ + (0.00 +0.50i) |d,2⟩',
    )
    expect(newM.toString()).toBe(
      [
        '25.0% [H] 1.00 exp(0.00τi) |d,0⟩',
        '75.0% [V] 0.58 exp(0.75τi) |u,2⟩ + 0.58 exp(0.50τi) |d,1⟩ + 0.58 exp(0.25τi) |d,2⟩',
      ].join('\n'),
    )
  })

  it('cascade partial measurement', () => {
    const vector = Vector.fromSparseCoordNames(
      [
        ['dH0', Cx(0.5)],
        ['dV1', Cx(-0.5)],
        ['dV2', Cx(0, 0.5)],
        ['uV2', Cx(0, -0.5)],
      ],
      [Dimension.spin(), Dimension.polarization(), Dimension.position(3)],
    )
    const m = new Measurement([{ name: [], vector }])
    const projectionsOne = [
      { name: ['0'], vector: Vector.indicator([Dimension.position(3)], '0') },
      { name: ['2'], vector: Vector.indicator([Dimension.position(3)], '2') },
    ]
    const projectionsTwo = [
      { name: ['H'], vector: Vector.indicator([Dimension.polarization()], 'H') },
      { name: ['V'], vector: Vector.indicator([Dimension.polarization()], 'V').mulByReal(Math.SQRT1_2) },
    ]
    const stepOne = m.projectiveMeasurement([2], projectionsOne)
    expect(stepOne.toString()).toBe(
      [
        '25.0% [] 1.00 exp(0.50τi) |d,V,1⟩',
        '25.0% [0] 1.00 exp(0.00τi) |d,H⟩',
        '50.0% [2] 0.71 exp(0.75τi) |u,V⟩ + 0.71 exp(0.25τi) |d,V⟩',
      ].join('\n'),
    )
    // crucial remark: as the number of dimensions changes, we need to apply operations in reverse order,
    // i.e. starting from the last dimension/particle
    const stepTwo = stepOne.projectiveMeasurement([1], projectionsTwo)
    expect(stepTwo.toString()).toBe(
      [
        '12.5% [] 1.00 exp(0.50τi) |d,V,1⟩',
        '25.0% [2] 0.71 exp(0.75τi) |u,V⟩ + 0.71 exp(0.25τi) |d,V⟩',
        '12.5% [V] 1.00 exp(0.50τi) |d,1⟩',
        '25.0% [0&H] 1.00 exp(0.00τi) |d⟩',
        '25.0% [2&V] 0.71 exp(0.75τi) |u⟩ + 0.71 exp(0.25τi) |d⟩',
      ].join('\n'),
    )
  })

  it('POVM measurement all', () => {
    const vector = Vector.fromSparseCoordNames(
      [
        ['01H', Cx(1)],
        ['10V', Cx(-1)],
      ],
      [Dimension.qubit(), Dimension.qubit(), Dimension.polarization()],
    ).normalize()
    const m = new Measurement([{ name: [], vector }])
    const povms = [
      { name: ['H'], operator: Operator.indicator([Dimension.polarization()], 'H') },
      { name: ['V'], operator: Operator.indicator([Dimension.polarization()], 'V') },
    ]
    const measured = m.projectiveMeasurement([2], [], povms)
    expect(measured.toString()).toBe(
      ['50.0% [H] 1.00 exp(0.00τi) |0,1,H⟩', '50.0% [V] 1.00 exp(0.50τi) |1,0,V⟩'].join('\n'),
    )
  })
  it('POVM measurement part', () => {
    const vector = Vector.fromSparseCoordNames(
      [
        ['01H', Cx(1)],
        ['10V', Cx(-1)],
      ],
      [Dimension.qubit(), Dimension.qubit(), Dimension.polarization()],
    ).normalize()
    const m = new Measurement([{ name: [], vector }])
    const povms = [
      { name: ['H'], operator: Operator.indicator([Dimension.polarization()], 'H').mulConstant(Cx(0.5)) },
      { name: ['V'], operator: Operator.indicator([Dimension.polarization()], 'V') },
    ]
    const measured = m.projectiveMeasurement([2], [], povms)
    expect(measured.toString()).toBe(
      [
        '25.0% [] 1.00 exp(0.00τi) |0,1,H⟩',
        '25.0% [H] 1.00 exp(0.00τi) |0,1,H⟩',
        '50.0% [V] 1.00 exp(0.50τi) |1,0,V⟩',
      ].join('\n'),
    )
  })

  it('Projective + POVM measurement', () => {
    const vector = Vector.fromSparseCoordNames(
      [
        ['dH0', Cx(0.5)],
        ['dV1', Cx(-0.5)],
        ['dV2', Cx(0, 0.5)],
        ['uV2', Cx(0, -0.5)],
      ],
      [Dimension.spin(), Dimension.polarization(), Dimension.position(3)],
    )
    const m = new Measurement([{ name: [], vector }])
    const projections = [
      { name: ['0'], vector: Vector.indicator([Dimension.position(3)], '0') },
      { name: ['1'], vector: Vector.indicator([Dimension.position(3)], '1').mulByReal(Math.SQRT1_2) },
    ]
    const povms = [
      { name: ['1nondest'], operator: Operator.indicator([Dimension.position(3)], '1').mulConstant(Cx(0.5)) },
      { name: ['2nondest'], operator: Operator.indicator([Dimension.position(3)], '2').mulConstant(Cx(0.25)) },
    ]
    const measured = m.projectiveMeasurement([2], projections, povms)
    expect(measured.toString()).toBe(
      [
        '37.5% [] 0.71 exp(0.75τi) |u,V,2⟩ + 0.71 exp(0.25τi) |d,V,2⟩',
        '25.0% [0] 1.00 exp(0.00τi) |d,H⟩',
        '12.5% [1] 1.00 exp(0.50τi) |d,V⟩',
        '12.5% [1nondest] 1.00 exp(0.50τi) |d,V,1⟩',
        '12.5% [2nondest] 0.71 exp(0.75τi) |u,V,2⟩ + 0.71 exp(0.25τi) |d,V,2⟩',
      ].join('\n'),
    )
  })
})
