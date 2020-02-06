/**
 * Quantum gates
 * https://en.wikipedia.org/wiki/Quantum_logic_gate
 */

import Complex, { Cx } from './Complex'
import Dimension from './Dimension'
import Operator from './Operator'

const isqrt2 = Cx(Math.SQRT1_2)

/**
 * Pauli I operator
 * @return one-qubit operator
 */
export function I(): Operator {
  return Operator.fromSparseCoordNames(
    [
      ['0', '0', Cx(1)],
      ['1', '1', Cx(1)],
    ],
    [Dimension.qubit()],
  )
}

/**
 * Pauli X operator
 * @see https://en.wikipedia.org/wiki/Pauli_matrices
 * @return one-qubit operator
 */
export function X(): Operator {
  return Operator.fromSparseCoordNames(
    [
      ['0', '1', Cx(1)],
      ['1', '0', Cx(1)],
    ],
    [Dimension.qubit()],
  )
}

/**
 * Pauli Y operator
 * @see https://en.wikipedia.org/wiki/Pauli_matrices
 * @return one-qubit operator
 */
export function Y(): Operator {
  return Operator.fromSparseCoordNames(
    [
      ['0', '1', Cx(0, -1)],
      ['1', '0', Cx(0, 1)],
    ],
    [Dimension.qubit()],
  )
}

/**
 * Pauli Z operator
 * @see https://en.wikipedia.org/wiki/Pauli_matrices
 * @return one-qubit operator
 */
export function Z(): Operator {
  return Operator.fromSparseCoordNames(
    [
      ['0', '0', Cx(1)],
      ['1', '1', Cx(-1)],
    ],
    [Dimension.qubit()],
  )
}

/**
 * Hadaamard gate
 * @see https://en.wikipedia.org/wiki/Hadamard_transform
 * @return one-qubit operator
 */
export function H(): Operator {
  return Operator.fromSparseCoordNames(
    [
      ['0', '0', Cx(1)],
      ['1', '0', Cx(1)],
      ['0', '1', Cx(1)],
      ['1', '1', Cx(-1)],
    ],
    [Dimension.qubit()],
  ).mulConstant(isqrt2)
}

/**
 * Phase operator (shifts by pi/2 = 1/4 full rotation)
 * @return one-qubit operator
 */
export function S(): Operator {
  return Operator.fromSparseCoordNames(
    [
      ['0', '0', Cx(1)],
      ['1', '1', Cx(0, 1)],
    ],
    [Dimension.qubit()],
  )
}

/**
 * Phase operator (shifts by pi/4 = 1/8 full rotation)
 * @return one-qubit operator
 */
export function T(): Operator {
  return Operator.fromSparseCoordNames(
    [
      ['0', '0', Cx(1)],
      ['1', '1', Complex.fromPolar(1, Math.PI / 4)],
    ],
    [Dimension.qubit()],
  )
}

/**
 * Controlled not gate (CNOT)
 * @return two-qubit operator
 */
export function CX(): Operator {
  return Operator.fromSparseCoordNames(
    [
      ['00', '00', Cx(1)],
      ['01', '01', Cx(1)],
      ['10', '11', Cx(1)],
      ['11', '10', Cx(1)],
    ],
    [Dimension.qubit(), Dimension.qubit()],
  )
}

/**
 * Controlled Z gate
 * @return two-qubit operator
 */
export function CZ(): Operator {
  return Operator.fromSparseCoordNames(
    [
      ['00', '00', Cx(1)],
      ['01', '01', Cx(1)],
      ['10', '10', Cx(1)],
      ['11', '11', Cx(-1)],
    ],
    [Dimension.qubit(), Dimension.qubit()],
  )
}

/**
 * Two-quibit swap operator
 * @return two-qubit operator
 */
export function Swap(): Operator {
  return Operator.fromSparseCoordNames(
    [
      ['00', '00', Cx(1)],
      ['10', '01', Cx(1)],
      ['01', '10', Cx(1)],
      ['11', '11', Cx(1)],
    ],
    [Dimension.qubit(), Dimension.qubit()],
  )
}

/**
 * Toffoli gate (CCNOT)
 * @see https://en.wikipedia.org/wiki/Toffoli_gate
 * @return two-qubit operator
 */
export function CCX(): Operator {
  return Operator.fromSparseCoordNames(
    [
      ['000', '000', Cx(1)],
      ['001', '001', Cx(1)],
      ['010', '010', Cx(1)],
      ['011', '011', Cx(1)],
      ['100', '100', Cx(1)],
      ['101', '101', Cx(1)],
      ['111', '110', Cx(1)], // this and
      ['110', '111', Cx(1)], // that differs from identity
    ],
    [Dimension.qubit(), Dimension.qubit()],
  )
}

/**
 * Fredkin gate (CCNOT)
 * @see https://en.wikipedia.org/wiki/Fredkin_gate
 * @return two-qubit operator
 */
export function CSwap(): Operator {
  return Operator.fromSparseCoordNames(
    [
      ['000', '000', Cx(1)],
      ['001', '001', Cx(1)],
      ['010', '010', Cx(1)],
      ['011', '011', Cx(1)],
      ['100', '100', Cx(1)],
      ['110', '101', Cx(1)], // this and
      ['101', '110', Cx(1)], // that differs from identity
      ['111', '111', Cx(1)],
    ],
    [Dimension.qubit(), Dimension.qubit()],
  )
}
