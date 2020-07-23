import Photons from '../src/Photons'
import * as el from '../src/Elements'
import { Cx } from '../src/Complex'
import { ILocalOperator } from '../src/interfaces'

const sizeX = 7
const sizeY = 5
const state = new Photons(sizeX, sizeY)

// state.addPhotonIndicator(0, 2, '>', 'V') Using IPolarization
state.addPhotonIndicator({ x: 0, y: 2, direction: 0, h: Cx(1, 0), v: Cx(0, 1) })
console.log(state.vector.toString())

console.log('Propagated:')
state.propagatePhotons()
console.log(state.vector.toString())

// console.log("Aggregated:")
// console.log(state.aggregatePolarization())

console.log('Apply:')
const operations: ILocalOperator[] = [
  { x: 3, y: 2, operator: el.sugarSolution(0.125) },
  { x: 1, y: 2, operator: el.mirror(3) },
  { x: 2, y: 3, operator: el.attenuator() },
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
state.addPhotonIndicator({ x: sizeX - 1, y: sizeY - 1, direction: 0, h: Cx(0, 1), v: Cx(1, 0) })
console.log(state.vector.toString())

console.log('Propagated 2:')
state.propagatePhotons()
console.log(state.vector.toString())
