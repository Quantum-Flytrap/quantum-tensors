// TODO: Discuss about something better for dims, size
// TODO: See if cell can hold the dimension and vector inherit it
import * as math from "mathjs"
import Complex from "./src/Complex"
import SparseCell from "./src/SparseCell"
import Vector from "./src/Vector"

const complex1 = new Complex(3, -1)
const complex2 = new Complex(2, 0)
const complex3 = new Complex(0, -1)
const complex4 = new Complex(1, -1)

console.log("Testing complex implementation:")
console.log(complex1.toString())
console.log(complex2.toString())
console.log(complex3.toString())
console.log(complex4.toString())

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

console.log("\nTesting vector:")
const vector1 = new Vector([cell1, cell2, cell1], [5, 5, 5], ["x", "y", "z"], [["a1", "a2", "a3"], ["b1", "b2", "b3"], ["c1", "c2", "c3"]])
const vector2 = new Vector([cell3, cell4, cell4], [5, 5, 5], ["x", "y", "z"], [["d1", "d2", "d3"], ["e1", "e2", "e3"], ["f1", "f2", "f3"]])
console.log(vector1.toString())
console.log(vector2.toString())

console.log("\nTest mathjs matrix conversion:")
// const matrix = math.sparse(vector1.size)
const matrix = math.matrix(math.zeros(vector1.size))
vector1.cells.forEach((cell) => {
    matrix.set(cell.coord, cell.value)
})
console.log(matrix.toString())

console.log("\nTesting vector outer product:")
const outerVector1 = vector1.outer(vector2)
const outerVector2 = vector2.outer(vector1)
console.log(outerVector1.toString())
console.log(outerVector2.toString())
