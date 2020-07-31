import Simulation from '../src/Simulation'
import Operator from '../src/Operator'

const grid1 = {
  cols: 13,
  rows: 10,
  cells: [
    {
      coord: {
        y: 2,
        x: 3,
      },
      element: 'Laser',
      rotation: 0,
      polarization: 0,
    },
    {
      coord: {
        y: 2,
        x: 9,
      },
      element: 'Detector',
      rotation: 180,
      polarization: 0,
    },
  ],
}

describe('Simulation', () => {
  it('creates a simulation', () => {
    const sim = new Simulation(grid1)
    expect(sim.frames).toStrictEqual([])
    expect(sim.operators).toHaveLength(2)
    expect(sim.globalOperator).toBeInstanceOf(Operator)
  })

  it('Creates an initial frame by firing the laz0rs', () => {
    const sim = new Simulation(grid1)
    sim.initializeFromLaser()
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
    const sim = new Simulation(grid1)
    sim.initializeFromLaser()
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
    const sim = new Simulation(grid1)
    sim.initializeFromLaser()
    sim.generateFrames()
    expect(sim.frames).toHaveLength(7)
  })
})
