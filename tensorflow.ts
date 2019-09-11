import * as tf from '@tensorflow/tfjs-node'

// const indices = tf.tensor1d([4, 5, 6, 1, 2, 3], 'int32')
// const values = tf.tensor1d([10, 11, 12, 13, 14, 15], 'float32')
// const shape = [8]
// tf.sparseToDense(indices, values, shape).print()

// https://js.tensorflow.org/api/latest/#gatherND
// const indicesG = tf.tensor2d([0, 1, 1, 0], [2, 2], 'int32');
// const input = tf.tensor2d([9, 10, 11, 12], [2, 2]);
// tf.gatherND(input, indicesG).print() // [10, 11]

// https://js.tensorflow.org/api/latest/#scatterND
// const indices = tf.tensor2d([4, 3, 1, 7], [4, 1], 'int32');
// const updates = tf.tensor1d([9, 10, 11, 12]);
// const shape = [8];
// tf.scatterND(indices, updates, shape).print() //[0, 11, 0, 10, 9, 0, 0, 12]

// // Create a rank-3 tensor (matrix) matrix tensor from a multidimensional array.
const a = tf.tensor(
    [
        [
            [1, 2],
            [3, 4]
        ],
        [
            [5, 6],
            [7, 8]
        ],
        [
            [9, 10],
            [11, 12]
        ]
    ]
)

// Complex tensor
// const real = tf.tensor1d([2.25, 3.25])
// const imag = tf.tensor1d([4.75, 5.75])
// const complex = tf.complex(real, imag)
// complex.print()

// Pass a nested array.
// tf.tensor2d([[1, 2], [3, 4]]).print();
// Pass a flat array and specify a shape.
// tf.tensor2d([1, 2, 3, 4], [2, 2]).print();

// Get tensor shape
console.log('shape:', a.shape)
a.print()
a.flatten().print()

// Get specific cell
const reducer = (accumulator: number, currentValue: number) => accumulator * currentValue
const total = a.shape.reduce(reducer)
console.log(`TOTAL: ${total}`)

// Using one hot could be a good way to provide sparse indices
// const indices = tf.oneHot(tf.tensor1d([1], 'int32'), total)

tf.gatherND(a, indices).print() // [10, 11]
// const indicesG = tf.tensor([0, 0, 0, 0], a.shape, 'int32');


