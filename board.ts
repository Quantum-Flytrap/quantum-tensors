import {Cx} from "./src/Complex"
import SparseCell from "./src/SparseCell"
import Dimension from "./src/Dimension"
import Vector from "./src/Vector"

const complex1 = Cx(1)
const complex2 = Cx(0)
const complex3 = Cx(2, 1)
const complex4 = Cx(1)


// const vectorComplex = [new Complex(1, 0), new Complex(0, 0), new Complex(2, 1), new Complex(0, -1)]
const dim1 = Dimension.direction()
const dim2 = Dimension.spin()
const vector1 = Vector.fromArray([Cx(1), Cx(0), Cx(2, 1), Cx(0, -1)], [dim1], false)
const vector2 = Vector.fromArray([Cx(0, 0.5), Cx(1)], [dim2], false)
console.log(vector1.toString())
console.log(vector2.toString())

// Outer product
const outerVec = vector1.outer(vector2)
console.log(outerVec.toString(true))
