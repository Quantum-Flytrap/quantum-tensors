import * as _ from "lodash"
import Photons from "../src/Photons"
import Operator from "../src/Operator"
import * as el from "../src/Elements"

// TODO big

// const sizeX = 7
// const sizeY = 4
// const state = new Photons(sizeX, sizeY)

// Sugar solutions and mirrors
// Let's start horizontal
// .......
// .>.S.\.
// ...\./.
// .......

// state.addPhotonIndicator(1, 1, ">", "H")

// // x, y, operator
// const operations: [number, number, Operator][] = [
//   [3, 1, el.sugarSolution(0.125)],
//   [5, 1, el.mirror(3)],
//   [5, 2, el.mirror(1)],
//   [3, 2, el.mirror(3)],
// ]

// console.log("Creating Photon")
// console.log(state.vector.toString())
// console.log("Steps:")

// _.range(10).forEach(i => {
//   console.log(`Step ${i}:`)
//   state.propagatePhotons()
//   state.actOnSinglePhotons(operations)
//   console.log(state.vector.toString())
// })

console.log("===========================")
console.log("BOARD 2")

const sizeX = 8
const sizeY = 3
const state = new Photons(sizeX, sizeY)

// Sugar solutions and mirrors
// Let's start horizontal
// >.\.\..
// ..\.\..
// .......

state.addPhotonIndicator(0, 0, ">", "H")

// x, y, operator
const operations: [number, number, Operator][] = [
  [2, 0, el.beamSplitter(3)],
  [4, 0, el.mirror(3)],
  [2, 1, el.mirror(3)],
  [4, 1, el.beamSplitter(3)],
]

console.log("Creating Photon")
console.log(state.vector.toString())
console.log("Steps:")

_.range(10).forEach(i => {
  console.log(`Step ${i}:`)
  state.propagatePhotons()
  state.actOnSinglePhotons(operations)
  console.log(state.vector.toString())
})
