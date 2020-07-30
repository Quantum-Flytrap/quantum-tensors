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
})
