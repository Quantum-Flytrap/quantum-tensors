import Simulation, { generateLaserIndicator } from '../src/Simulation'
import Operator from '../src/Operator'
import { Elem, IGrid } from '../src/interfaces'

const grid1: IGrid = {
  cols: 13,
  rows: 10,
  cells: [
    {
      x: 3,
      y: 2,
      element: Elem.Laser,
      rotation: 0,
      polarization: 0,
    },
    {
      x: 9,
      y: 2,
      element: Elem.Detector,
      rotation: 180,
      polarization: 0,
    },
  ],
}

describe('Simulation', () => {
  it('creates a simulation', () => {
    const sim = Simulation.fromGrid(grid1)
    expect(sim.frames).toStrictEqual([])
    expect(sim.operators).toHaveLength(2)
    expect(sim.globalOperator).toBeInstanceOf(Operator)
  })

  it('Creates an initial frame by firing the laz0rs', () => {
    const sim = Simulation.fromGrid(grid1)
    const laserIndicator = generateLaserIndicator(grid1.cells)
    sim.initializeFromIndicator(laserIndicator)
    expect(sim.frames).toHaveLength(1)
    expect(sim.frames[0].particles).toHaveLength(1)
    const photon = sim.frames[0].particles[0]
    expect(photon).toStrictEqual({
      x: 3,
      y: 2,
      direction: 0,
      are: 1,
      aim: 0,
      bim: 0,
      bre: 0,
    })
  })

  it('should propagate the photon', () => {
    const sim = Simulation.fromGrid(grid1)
    const laserIndicator = generateLaserIndicator(grid1.cells)
    sim.initializeFromIndicator(laserIndicator)
    sim.frames.push(sim.nextFrame())
    expect(sim.lastFrame.particles).toHaveLength(1)
    const photon = sim.lastFrame.particles[0]
    expect(photon).toStrictEqual({
      x: 4,
      y: 2,
      direction: 0,
      are: 1,
      aim: 0,
      bim: 0,
      bre: 0,
    })
  })

  it('should generate frames', () => {
    const sim = Simulation.fromGrid(grid1)
    const laserIndicator = generateLaserIndicator(grid1.cells)
    sim.initializeFromIndicator(laserIndicator)
    sim.generateFrames()
    expect(sim.frames).toHaveLength(7)
  })
})
