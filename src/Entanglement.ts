import Vector from './Vector'
import Operator from './Operator'

export default class Entanglement {
  constructor() { }
  /**
   * Renyi-2 entanglement entropy for subsystem split A-B.
   * @param v Normalized vector representing a pure state.
   * @param coordIndices Indices related to a subsystem (either A or B).
   * @returns - log_2 Tr[rho_A^2]
   * @see https://en.wikipedia.org/wiki/Entropy_of_entanglement
   * @note It can be optimized if we omit creating the full density matrix.
   */
  static renyi2(v: Vector, coordIndices: number[]): number {
    const rhoAB = Operator.projectionOn(v)
    const rhoB = rhoAB.partialTrace(coordIndices)
    return -Math.log2(rhoB.mulOp(rhoB).trace().re)
  }
}
