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
//   [5, 1, el.mirror(135)],
//   [5, 2, el.mirror(45)],
//   [3, 2, el.mirror(135)],
// ]

// console.log("===========================")
// console.log("BOARD 2")

// const sizeX = 8
// const sizeY = 3
// const state = new Photons(sizeX, sizeY)

// // Sugar solutions and mirrors
// // Let's start horizontal
// // >.\..\.
// // ..\V.\.
// // .......

// state.addPhotonIndicator(0, 0, ">", "H")

// // x, y, operator
// const operations: [number, number, Operator][] = [
//   [2, 0, el.beamSplitter(135)],
//   [5, 0, el.mirror(135)],
//   [2, 1, el.mirror(135)],
//   [3, 1, el.vacuumJar()],
//   [4, 1, el.vacuumJar()],
//   [5, 1, el.beamSplitter(135)],
// ]

// console.log("===========================")
// console.log("BOARD 3")

// const sizeX = 8
// const sizeY = 3
// const state = new Photons(sizeX, sizeY)

// Sugar solutions and PBS
// Let's start horizontal
// >.S.\..
// ..../..
// .......

// state.addPhotonIndicator(0, 0, ">", "H")

// // x, y, operator
// const operations: [number, number, Operator][] = [
//   [2, 0, el.sugarSolution()],
//   [4, 0, el.polarizingBeamsplitter(135)],
//   [4, 1, el.polarizingBeamsplitter(45)],
// ]

console.log("===========================")
console.log("BOARD 4")

const sizeX = 8
const sizeY = 8
const state = new Photons(sizeX, sizeY)

state.addPhotonIndicator(0, 2, ">", "H")
state.addPhotonIndicator(2, 0, "v", "H")

// // x, y, operator
const operations: [number, number, Operator][] = [
  [2, 2, el.beamSplitter(135)],
]

// // print part
// // works the same for everything

console.log("Creating Photon")
console.log(state.ketString())
console.log("Steps:")

_.range(10).forEach(i => {
  state.propagatePhotons()
  //// this seem to work
  // const abs = state.measureAbsorptionAtOperator(3, 2, el.attenuator(0), 0)
  // console.log("Abs at 3,2: ", abs)
  console.log(state.vectorValuedMeasurement(3, 2, el.attenuator(0), 0))
  console.log(state.vectorValuedMeasurement(3, 2, el.attenuator(0), 1)) // paticle 2
  state.actOnSinglePhotons(operations)
  console.log(`Step ${i}: ${state.ketString()}`)
})
