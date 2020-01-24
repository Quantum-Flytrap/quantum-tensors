import { Cx } from '../src/Complex'
import Dimension from '../src/Dimension'
import Vector from '../src/Vector'
import Operator from '../src/Operator'

const dimPol = Dimension.polarization()
const dimSpin = Dimension.spin()

// this works

const someVec = Vector.fromSparseCoordNames(
  [
    ['H', Cx(1.23)],
    ['V', Cx(-1, -1)],
  ],
  [dimPol],
)
console.log(someVec.toString())

const someOp = Operator.fromSparseCoordNames(
  [
    ['V', 'H', Cx(1)],
    ['H', 'V', Cx(-10)],
    ['H', 'H', Cx(0, 1)],
  ],
  [dimPol],
)
console.log(someOp.toString())

console.log('M |psi> is...')
console.log(someOp.mulVec(someVec).toString())

// now with more dims

console.log('Now adding one more dim.')

const someVec2 = someVec.outer(
  Vector.fromSparseCoordNames(
    [
      ['H', Cx(1)],
      ['V', Cx(1)],
    ],
    [dimPol],
  ),
)
console.log(someVec2.toString())
someVec2.entries.forEach(cell => console.log(cell))

console.log('X operator')

const opX = Operator.fromSparseCoordNames(
  [
    ['V', 'H', Cx(1)],
    ['H', 'V', Cx(1)],
  ],
  [dimPol],
)

console.log('X on 1')
const xed1 = opX.mulVecPartial([0], someVec2)
console.log(xed1.toString())
xed1.entries.forEach(cell => console.log(cell))

console.log('X on 2')
const xed2 = opX.mulVecPartial([1], someVec2)
console.log(xed2.toString())
xed2.entries.forEach(cell => console.log(cell))

console.log('Now adding one more dim.')

const someVec3 = someVec2.outer(
  Vector.fromSparseCoordNames(
    [
      ['u', Cx(1)],
      ['d', Cx(10)],
    ],
    [dimSpin],
  ),
)
console.log(someVec3.toString())
someVec3.entries.forEach(cell => console.log(cell))

const someVec3bis = Vector.fromSparseCoordNames(
  [
    ['u', Cx(1)],
    ['d', Cx(10)],
  ],
  [dimSpin],
).outer(someVec2)
console.log(someVec3bis.toString())
someVec3bis.entries.forEach(cell => console.log(cell))

console.log('Operations.')

const someOp2 = someOp.outer(Operator.identity([dimPol]))
console.log(someOp2.toString())

console.log('M |psi> is...')
console.log(someOp2.mulVec(someVec2).toString())
