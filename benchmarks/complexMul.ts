// eslint-disable-next-line @typescript-eslint/no-var-requires
const b = require('benny')
import Complex from '../src/Complex'

/**
 * Random float generator
 */
function randFloat(min = -10000, max = 10000): number {
  return (Math.random() * (max - min) + min) / 100
}
const z1 = new Complex(randFloat(), randFloat())
const z2 = new Complex(randFloat(), randFloat())

// add tests
b.suite(
  'ComplexMul algorithms',

  b.add('ComplexMultiply#Naive', function () {
    z1.mul(z2)
  }),

  b.add('ComplexMultiply#Gauss', function () {
    z1.mulGauss(z2)
  }),

  b.cycle(),

  b.complete(),
)
