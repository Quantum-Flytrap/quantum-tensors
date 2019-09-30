import Photons from "./src/Step"
import Operator from "./src/Operator"
import Dimension from "./src/Dimension"

const sizeX = 3
const sizeY = 5
const state = new Photons(sizeX, sizeY)

state.addPhotonIndicator(0, 2, '>', 'V')
console.log(state.vector.toString())

console.log("Propagated:")
state.propagatePhotons()
console.log(state.vector.toString())

console.log("Add:")
state.addPhotonIndicator(sizeX - 1, sizeY - 1, '^', 'H')
console.log(state.vector.toString())

console.log("Propagated 2:")
state.propagatePhotons()
console.log(state.vector.toString())
