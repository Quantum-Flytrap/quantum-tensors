const { Benchmark } = require('benchmark')
const suite = new Benchmark.Suite()

/**
 * Multiplication
 * @param z2 complex number to be multiplied
 * @returns z = z1 * z2
 */
function mul(z1, z2) {
  return { re: z1.re * z2.re - z1.im * z2.im, im: z1.re * z2.im + z1.im * z2.re }
}

/**
 * Gauss complex multiplication algorithm
 * https://en.wikipedia.org/wiki/Multiplication_algorithm#Complex_multiplication_algorithm
 * @param z2 complex number to be multiplied
 * @returns z = z1 * z2
 */
function mulGauss(z1, z2) {
  const k1 = z2.re * (z1.re + z1.im)
  const k2 = z1.re * (z2.im - z2.re)
  const k3 = z1.im * (z2.re + z2.im)
  return { re: k1 - k3, im: k1 + k2 }
}

const z1 = { re: 0.58, im: 1.68 }
const z2 = { re: -1.6, im: 0.94 }

// add tests
suite
  .add('ComplexMultiply#Naive', function () {
    mul(z1, z2)
  })
  .add('ComplexMultiply#Gauss', function () {
    mulGauss(z1, z2)
  })
  // add listeners
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  // run async
  .run({ async: true })
