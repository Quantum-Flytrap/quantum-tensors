import { Cx } from './Complex'
import Dimension from './Dimension'
import VectorEntry from './VectorEntry'
import Vector from './Vector'
import Operator from './Operator'
import * as Gates from './Gates'

const qubit0 = Vector.fromArray([Cx(1), Cx(0)], [Dimension.qubit()])
const qubit1 = Vector.fromArray([Cx(0), Cx(1)], [Dimension.qubit()])

interface IMeasurementResult<S> {
  measured: string
  probability: number
  newState: S
}

/**
 * Represent the present state of a quantum computing circuit.
 */
export default class Circuit {
  vector: Vector
  qubitCounter: number
  qubitIds: number[]

  constructor(vector: Vector, qubitCounter: number, qubitIds: number[]) {
    this.vector = vector
    this.qubitCounter = qubitCounter
    this.qubitIds = qubitIds
  }

  static empty(): Circuit {
    return new Circuit(new Vector([new VectorEntry([], Cx(1))], []), 0, [])
  }

  static qubits(n: number): Circuit {
    const qubitIds = [...new Array(n)].map((x, i) => i)
    const vector = new Vector(
      [
        new VectorEntry(
          qubitIds.map(() => 0),
          Cx(1),
        ),
      ],
      qubitIds.map(() => Dimension.qubit()),
    )
    return new Circuit(vector, n, qubitIds)
  }

  addQubit(): Circuit {
    this.vector = this.vector.outer(qubit0)
    this.qubitIds.push(this.qubitCounter)
    this.qubitCounter += 1
    return this
  }

  applyGate(gate: Operator, at: number[]): Circuit {
    // we need to map at to the current qubitIds
    this.vector = gate.mulVecPartial(at, this.vector)
    return this
  }

  copy(): Circuit {
    return new Circuit(this.vector.copy(), this.qubitCounter, [...this.qubitIds])
  }

  saveTo(history: Circuit[]): Circuit {
    history.push(this.copy())
    return this
  }

  measureQubit(at: number): IMeasurementResult<Circuit>[] {
    const newQubitIds = this.qubitIds.filter((i) => i !== at)
    const vector0 = qubit0.innerPartial([at], this.vector)
    const vector1 = qubit1.innerPartial([at], this.vector)
    return [
      {
        measured: '0',
        probability: vector0.normSquared(),
        newState: new Circuit(vector0, this.qubitCounter, [...newQubitIds]),
      },
      {
        measured: '1',
        probability: vector1.normSquared(),
        newState: new Circuit(vector1, this.qubitCounter, [...newQubitIds]),
      },
    ]
  }

  // all gates

  X(i: number): Circuit {
    return this.applyGate(Gates.X(), [i])
  }

  Y(i: number): Circuit {
    return this.applyGate(Gates.Y(), [i])
  }

  Z(i: number): Circuit {
    return this.applyGate(Gates.Z(), [i])
  }

  H(i: number): Circuit {
    return this.applyGate(Gates.H(), [i])
  }

  CNOT(control: number, target: number): Circuit {
    return this.applyGate(Gates.CX(), [control, target])
  }

  SWAP(i: number, j: number): Circuit {
    return this.applyGate(Gates.Swap(), [i, j])
  }

  TOFFOLI(control1: number, control2: number, target: number): Circuit {
    return this.applyGate(Gates.CCX(), [control1, control2, target])
  }

  FREDKIN(control: number, target1: number, target2: number): Circuit {
    return this.applyGate(Gates.CSwap(), [control, target1, target2])
  }
}
