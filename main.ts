import * as math from "mathjs"
import Complex from "./src/Complex"
import SparseCell from "./src/SparseCell"
import Vector from "./src/Vector"
import Dimension from "./src/Dimension"

const complex1 = new Complex(3, -1)
const complex2 = new Complex(2, 0)
const complex3 = new Complex(0, -1)
const complex4 = new Complex(1, -1)

console.log("Testing complex implementation:")
console.log(complex1.toString())
console.log(complex2.toString())
console.log(complex3.toString())
console.log(complex4.toString())

console.log("Testing complex radial:")
console.log(complex1.toStringRadial())
console.log(complex2.toStringRadial())
console.log(complex3.toStringRadial())
console.log(complex4.toStringRadial())

console.log("Testing complex radial with TAU:")
console.log(complex1.toStringRadialTau())
console.log(complex2.toStringRadialTau())
console.log(complex3.toStringRadialTau())
console.log(complex4.toStringRadialTau())

console.log("\nTesting sparse cell:")
const cell1 = new SparseCell([2, 1, 2], complex1)
const cell2 = new SparseCell([2, 0, 2], complex2)
const cell3 = new SparseCell([0, 1, 2], complex3)
const cell4 = new SparseCell([0, 2, 1], complex4)
console.log(cell1.toString())
console.log(cell2.toString())

console.log("\nTesting sparse cell outer product:")
const outerCell = cell1.outer(cell2)
console.log(outerCell.toString())

console.log("\nTesting dimensions:")
const dim1 = Dimension.polarization()
const dim2 = Dimension.spin()
const dim3 = Dimension.direction()
const dims1 = [dim1, dim2, dim3]
const dims2 = [dim1, dim2, dim3]
console.log(dim1.toString())
console.log(dim2.toString())
console.log(dim3.toString())

console.log("\nTesting vector:")
const vector1 = new Vector([cell1, cell2, cell1], dims1)
const vector2 = new Vector([cell3, cell4, cell4], dims2)
console.log(vector1.toString())
console.log(vector2.toString())

console.log("\nLoading vector from dense matrix sequential list.")
const vector3 = Vector.fromArray([complex1, complex2, complex3, complex4], [dim1, dim2])

console.log("\nTesting vector outer product:")
const outerVector1 = vector1.outer(vector2)
console.log(outerVector1.toString())
