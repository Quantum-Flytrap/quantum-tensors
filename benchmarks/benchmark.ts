import Simulation from '../src/Simulation'
import { grid1, grid2 } from './levels'

console.log('---Running benchmarks---')
console.time('100 frames')
let sim = new Simulation(grid1)
let laserIndicator = sim.generateLaserIndicator()
sim.initializeFromIndicator(laserIndicator)
sim.generateFrames(100)
console.timeEnd('100 frames')

console.time('Hall of mirrors')
sim = new Simulation(grid2)
laserIndicator = sim.generateLaserIndicator()
sim.initializeFromIndicator(laserIndicator)
sim.generateFrames(100)
console.timeEnd('Hall of mirrors')
