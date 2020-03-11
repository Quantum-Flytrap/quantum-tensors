import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

// delete old typings to avoid issues
// eslint-disable-next-line @typescript-eslint/no-empty-function
require('fs').unlink('dist/src/index.d.ts', () => {})

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      name: 'QuantumTensors',
      compact: true,
      exports: 'named',
    },
    {
      file: pkg.module,
      format: 'esm',
      name: 'QuantumTensors',
      exports: 'named',
    },
    {
      file: pkg.unpkg,
      format: 'iife',
      name: 'QuantumTensors',
      compact: true,
      exports: 'named',
    },
  ],
  plugins: [
    commonjs(),
    resolve(),
    typescript({
      typescript: require('typescript'),
    }),
    terser(),
  ],
}
