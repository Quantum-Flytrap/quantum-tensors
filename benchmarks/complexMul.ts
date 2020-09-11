// eslint-disable-next-line @typescript-eslint/no-var-requires
const Benchmark = require('benchmark')
import Complex from '../src/Complex'
const suite = new Benchmark.Suite()

const z1 = new Complex(0.58, 1.68)
const z2 = new Complex(-1.6, 0.94)

// add tests
suite
  .add('ComplexMultiply#Naive', function () {
    z1.mul(z2)
  })
  .add('ComplexMultiply#Gauss', function () {
    z1.mulGauss(z2)
  })
  // add listeners
  .on('cycle', function (event: Event) {
    console.log(String(event.target))
  })
  .on('complete', () => console.log('Fastest is ' + suite.filter('fastest').map('name')))
  // run async
  .run({ async: true })
