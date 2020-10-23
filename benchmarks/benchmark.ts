// See infos at https://nodejs.org/api/perf_hooks.html#perf_hooks_performance_now
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { performance } = require('perf_hooks')
import Simulation, { generateLaserIndicator } from '../src/Simulation'
import { grid1, grid2 } from './levels'

console.log('---Running benchmarks---')
let sim = Simulation.fromGrid(grid1)
sim.initializeFromIndicator(generateLaserIndicator(grid1.cells))
const t0 = performance.now()
sim.generateFrames(100)
const t1 = performance.now()
console.log(`Grid 1 (100 frames) took ${t1 - t0} milliseconds.`)

sim = Simulation.fromGrid(grid2)
sim.initializeFromIndicator(generateLaserIndicator(grid2.cells))
const t2 = performance.now()
sim.generateFrames(100)
const t3 = performance.now()
console.log(`Grid 2 (100 frames) took ${t3 - t2} milliseconds.`)
