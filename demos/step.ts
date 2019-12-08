import Photons from '../src/Photons'
import Operator from '../src/Operator'
import * as el from '../src/Elements'

const sizeX = 7
const sizeY = 5
const state = new Photons(sizeX, sizeY)

state.addPhotonIndicator(0, 2, '>', 'V')
console.log(state.vector.toString())

console.log('Propagated:')
state.propagatePhotons()
console.log(state.vector.toString())

// console.log("Aggregated:")
// console.log(state.aggregatePolarization())

console.log('Apply:')
const operations: [number, number, Operator][] = [
  [3, 2, el.sugarSolution(0.125)],
  [1, 2, el.mirror(3)],
  [2, 3, el.attenuator()],
]
state.actOnSinglePhotons(operations)
console.log(state.vector.toString())

// console.log("Aggregated:")
// console.log(state.aggregatePolarization())

console.log('Propagated:')
state.propagatePhotons()
console.log(state.vector.toString())

console.log('Propagated:')
state.propagatePhotons()
console.log(state.vector.toString())

// console.log("Aggregated:")
// console.log(state.aggregatePolarization())

console.log('Add:')
state.addPhotonIndicator(sizeX - 1, sizeY - 1, '^', 'H')
console.log(state.vector.toString())

console.log('Propagated 2:')
state.propagatePhotons()
console.log(state.vector.toString())
