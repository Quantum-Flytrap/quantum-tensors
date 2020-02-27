import Circuit from '../src/Circuit'
import './customMatchers'

describe('Circuit', () => {
  it('creates a new quantum computing circuit', () => {
    const qc = Circuit.empty()
    const qc3 = qc
      .addQubit()
      .addQubit()
      .addQubit()

    expect(qc3.vector.toKetString('cartesian')).toBe('(1.00 +0.00i) |0,0,0⟩')
    expect(Circuit.qubits(3).vector).vectorCloseTo(qc3.vector)
  })

  it('applied a few one-qubit gates', () => {
    const qc = Circuit.qubits(3)
      .X(0)
      .X(2)

    expect(qc.vector.toKetString('cartesian')).toBe('(1.00 +0.00i) |1,0,1⟩')
  })

  it('applied CNOT', () => {
    const qc = Circuit.qubits(3)
      .H(1)
      .CNOT(1, 0)
      .X(2)

    expect(qc.vector.toKetString('cartesian')).toBe('(0.71 +0.00i) |0,0,1⟩ + (0.71 +0.00i) |1,1,1⟩')
  })

  it('measurement', () => {
    const qc = Circuit.qubits(3)
      .H(1)
      .CNOT(1, 0)
      .X(2)

    const meas0 = qc.measureQubit(0)

    expect(meas0.length).toBe(2)
    expect(meas0[0].measured).toBe('0')
    expect(meas0[0].probability).toBeCloseTo(0.5)
    expect(meas0[0].newState.vector.toKetString('cartesian')).toBe('(0.71 +0.00i) |0,1⟩')
    expect(meas0[0].newState.qubitIds).toEqual([1, 2])
    expect(meas0[1].measured).toBe('1')
    expect(meas0[1].probability).toBeCloseTo(0.5)
    expect(meas0[1].newState.vector.toKetString('cartesian')).toBe('(0.71 +0.00i) |1,1⟩')
    expect(meas0[1].newState.qubitIds).toEqual([1, 2])

    const meas1 = qc.measureQubit(1)
    expect(meas1[0].probability).toBeCloseTo(0.5)
    expect(meas1[0].newState.vector.toKetString('cartesian')).toBe('(0.71 +0.00i) |0,1⟩')
    expect(meas1[0].newState.qubitIds).toEqual([0, 2])
    expect(meas1[1].probability).toBeCloseTo(0.5)
    expect(meas1[1].newState.vector.toKetString('cartesian')).toBe('(0.71 +0.00i) |1,1⟩')
    expect(meas1[1].newState.qubitIds).toEqual([0, 2])

    const meas2 = qc.measureQubit(2)
    expect(meas2[0].probability).toBeCloseTo(0)
    expect(meas2[0].newState.vector.toKetString('cartesian')).toBe('')
    expect(meas2[0].newState.qubitIds).toEqual([0, 1])
    expect(meas2[1].probability).toBeCloseTo(1)
    expect(meas2[1].newState.vector.toKetString('cartesian')).toBe('(0.71 +0.00i) |0,0⟩ + (0.71 +0.00i) |1,1⟩')
    expect(meas2[1].newState.qubitIds).toEqual([0, 1])
  })
})
