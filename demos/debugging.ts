import { Cx } from "../src/Complex"
import Dimension from "../src/Dimension"
import Vector from "../src/Vector"
import Operator from "../src/Operator"

const dimPol = Dimension.polarization()

/// REALLY DISLIKE THIS PART OF Prettier

// this works

const someVec = Vector.fromSparseCoordNames([["H", Cx(1.23)], ["V", Cx(-1, -1)]], [dimPol])
console.log(someVec.toString())

const someOp = Operator.fromSparseCoordNames([["V", "H", Cx(1)], ["H", "V", Cx(-10)], ["H", "H", Cx(0, 1)]], [dimPol])
console.log(someOp.toString())

console.log("M |psi> is...")
console.log(someOp.mulVec(someVec).toString())

// now with more dims

console.log("Now adding one more dim.")

const someVec2 = someVec.outer(Vector.fromSparseCoordNames([["H", Cx(1)], ["V", Cx(1)]], [dimPol]))
console.log(someVec2.toString())

const someOp2 = someOp.outer(Operator.identity([dimPol]))
console.log(someOp2.toString())

console.log("M |psi> is...")
console.log(someOp2.mulVec(someVec2).toString())
