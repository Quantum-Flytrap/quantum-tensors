import { Cx } from '../src/Complex'
import Dimension from '../src/Dimension'
import Vector from '../src/Vector'
import Operator from '../src/Operator'

// const complex1 = Cx(1)
// const complex2 = Cx(0)
// const complex3 = Cx(2, 1)
// const complex4 = Cx(1)

// const vectorComplex = [new Complex(1, 0), new Complex(0, 0), new Complex(2, 1), new Complex(0, -1)]
const dim1 = Dimension.direction()
const dim2 = Dimension.spin()
const vector1 = Vector.fromArray([Cx(1), Cx(0), Cx(2, 1), Cx(0, -1)], [dim1], false)
const vector2 = Vector.fromArray([Cx(0, 0.5), Cx(1)], [dim2], false)
console.log(vector1.toString())
console.log(vector2.toString())

console.log('Vector from sparse names')
const vecFromSparse = Vector.fromSparseCoordNames(
  [
    ['uH', Cx(0, 2)],
    ['dH', Cx(-1, -1)],
    ['dV', Cx(0.5, 2.5)],
  ],
  [Dimension.spin(), Dimension.polarization()],
)
console.log(vecFromSparse.toString())

// Outer product
const outerVec = vector1.outer(vector2)
console.log(outerVec.toString('cartesian', 2, '\n'))
console.log(outerVec.toString('polar', 2, '\n'))
console.log(outerVec.toString('polarTau', 2, '\n'))

// Add
console.log('Add')
const vector3 = Vector.fromArray([Cx(0, 1), Cx(0), Cx(-1, 2), Cx(0)], [dim1], false)
console.log(vector1.toString())
console.log(vector3.toString())
console.log(vector1.add(vector3).toString())

// Dot
console.log('Dot')
console.log(vector1.dot(vector3).toString())

// Conj
console.log(vector1.conj().toString())

// Operators
console.log('Operators')

console.log('Identity')
const idPolDir = Operator.identity([Dimension.polarization(), Dimension.direction()])
console.log(idPolDir.toString())

console.log('Pieces and a tensor product')
const idPol = Operator.identity([Dimension.polarization()])
console.log(idPol.toString())
const idDir = Operator.identity([Dimension.spin()])
console.log(idDir.toString())

console.log(idPol.outer(idDir).toString())
console.log(idDir.outer(idPol).toString())

console.log('From array')
const spinY = Operator.fromArray(
  [
    [Cx(0), Cx(0, -1)],
    [Cx(0, 1), Cx(0)],
  ],
  [Dimension.spin()],
)
console.log(spinY.toString())
const spinX = Operator.fromArray(
  [
    [Cx(0), Cx(1)],
    [Cx(1), Cx(0)],
  ],
  [Dimension.spin()],
)
console.log(spinX.toString())

console.log('From sparse names')
const opFromSparse = Operator.fromSparseCoordNames(
  [
    ['uH', 'uH', Cx(0, 2)],
    ['dH', 'uV', Cx(-1, -1)],
    ['dV', 'dH', Cx(0.5, 2.5)],
  ],
  [Dimension.spin(), Dimension.polarization()],
)
console.log(opFromSparse.toString())

console.log('Tensor spinY and spinX')
console.log(spinY.outer(spinX).toString())

console.log('Op vec mul')
console.log(vector2.toString())
console.log(spinY.mulVec(vector2).toString())
console.log(spinX.mulVec(vector2).toString())

console.log('Hadamard')
const isrt2 = 1 / Math.sqrt(2)
const spinH = Operator.fromArray(
  [
    [Cx(isrt2), Cx(isrt2)],
    [Cx(isrt2), Cx(-isrt2)],
  ],
  [Dimension.spin()],
)
console.log(spinH.toString())
console.log(spinH.mulVec(vector2).toString())

console.log('And now a place for an error')
const vector4 = Vector.fromArray(
  [Cx(0, 1), Cx(0), Cx(-1, 2), Cx(0)],
  [Dimension.spin(), Dimension.polarization()],
  false,
)
console.log(
  spinY
    .outer(spinX)
    .mulVec(vector4)
    .toString(),
)
