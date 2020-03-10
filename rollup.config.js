import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'
import { terser } from 'rollup-plugin-terser'

// delete old typings to avoid issues
// eslint-disable-next-line @typescript-eslint/no-empty-function
require('fs').unlink('dist/src/index.d.ts', () => {})

const globals = {
  lodash: '_',
}

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      name: 'QuantumTensors',
      compact: true,
      exports: 'named',
      globals,
    },
    {
      file: pkg.module,
      format: 'esm',
      name: 'QuantumTensors',
      exports: 'named',
      globals,
    },
    {
      file: pkg.browser,
      format: 'iife',
      name: 'QuantumTensors',
      compact: true,
      exports: 'named',
      globals,
    },
  ],
  external: [...Object.keys(pkg.dependencies || {})],
  plugins: [
    typescript({
      typescript: require('typescript'),
    }),
    terser(),
  ],
}
