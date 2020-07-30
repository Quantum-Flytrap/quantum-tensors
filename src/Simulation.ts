import _ from 'lodash'
import Vector from './Vector'
import Operator from './Operator'
import Frame from './Frame'
import { generateOperators } from './Elements'
import { weightedRandomInt, startingPolarization, startingDirection, singlePhotonInteraction } from './helpers'
import { IAbsorption, IGrid, PolEnum, ICell, IIndicator, IXYOperator, IOperatorGrid, IParticle } from './interfaces'

/**
 * QUANTUM SIMULATION CLASS
 * Contains the frames of the simulation
 */
export default class Simulation {
  private grid: IGrid
  public operators: IXYOperator[]
  public globalOperator: Operator
  public frames: Frame[]

  public constructor(grid: IGrid) {
    this.grid = grid
    this.operators = generateOperators(grid)
    this.globalOperator = singlePhotonInteraction(grid.cols, grid.rows, this.operators)
    this.frames = []
  }

  /**
   * Generate an operator grid with size information
   */
  public get opGrid(): IOperatorGrid {
    return {
      sizeX: this.grid.cols,
      sizeY: this.grid.rows,
      operators: this.operators,
    }
  }

  public get sizeX(): number {
    return this.grid.cols
  }
  public get sizeY(): number {
    return this.grid.rows
  }

  /**
   * Initialize simulation from laser
   * First generate the indicator for the laser from the grid
   * Then initialize with the indicator.
   * @param pol Override of the starting polarization
   */
  public initializeFromLaser(polOverride?: PolEnum): void {
    // Select initial laser
    const lasers = this.grid.cells.filter((cell: ICell) => cell.element === 'Laser')
    if (lasers.length !== 1) {
      throw new Error(`Cannot initialize QuantumSimulation. ${lasers.length} != 1 lasers.`)
    }
    // Override laser cell polarization if an optional argument is provided
    const laserIndicator: IIndicator = {
      x: lasers[0].coord.x,
      y: lasers[0].coord.y,
      direction: startingDirection(lasers[0].rotation),
      polarization: startingPolarization(lasers[0].polarization),
    }
    if (polOverride) {
      laserIndicator.polarization = polOverride
    }
    this.initializeFromIndicator(laserIndicator)
  }

  /**
   * Initialize simulation from indicator
   * @param indicator IIndicator
   */
  public initializeFromIndicator(indicator: IIndicator): void {
    this.frames = []
    const frame = new Frame(this.sizeX, this.sizeY, this.operators)
    frame.addPhotonFromIndicator(indicator.x, indicator.y, indicator.direction, indicator.polarization)
    this.frames.push(frame)
  }

  /**
   * Initialize simulation from XY State
   * @param indicator IIndicator
   */
  intializeFromXYState(posX: number, posY: number, vecDirPol: Vector): void {
    this.frames = []
    const frame = new Frame(this.sizeX, this.sizeY, this.operators)

    const posInd = Vector.indicator([frame.dimX, frame.dimY], [posX.toString(), posY.toString()])
    if (vecDirPol.dimensions[0].name === 'direction') {
      frame.vector = posInd.outer(vecDirPol).toBasisAll('polarization', 'HV')
    } else {
      frame.vector = posInd.outer(vecDirPol.permute([1, 0])).toBasisAll('polarization', 'HV')
    }

    this.frames.push(frame)
  }

  /**
   * Get last simulation frame
   * @returns last QuantumFrame
   */
  public get lastFrame(): Frame {
    return this.frames[this.frames.length - 1]
  }

  /**
   * Compute the next simulation frame
   * @returns QuantumFrame
   */
  public nextFrame(): Frame {
    if (this.frames.length === 0) {
      throw new Error(`Cannot do nextFrame when there are no frames. initializeFromLaser or something else.`)
    }
    const frame = new Frame(this.lastFrame.sizeX, this.lastFrame.sizeY, this.lastFrame.operators, this.lastFrame.vector)
    frame.propagateAndInteract()
    return frame
  }

  /**
   * Compute next frames until probability threshold
   * @param n default number of frames
   * @param stopThreshold stop if probability below threshold
   */
  public computeFrames(n = 20, stopThreshold = 1e-6): void {
    const logging = false
    for (let i = 0; i < n; i += 1) {
      this.frames.push(this.nextFrame())
      if (this.lastFrame.probability < stopThreshold) {
        break
      }
    }
    if (logging) {
      console.debug('POST-SIMULATION LOG:')
      console.debug('probabilityPerFrame', this.probabilityPerFrame)
      console.debug('totalAbsorptionPerFrame', this.totalAbsorptionPerFrame)
      console.debug('totalAbsorptionPerTile', this.totalIAbsorptionPerTile)
      console.debug('An example of realization:')
      // const randomSample = this.sampleRandomRealization();
      // randomSample.statePerFrame.forEach((state) => console.debug(state.ketString()));
      // console.debug(
      //   `Detected: in ${randomSample.fate.name} at (${randomSample.fate.x},${randomSample.fate.y})`
      // );
    }
  }

  /**
   * Quantum state probability for each frame.
   * @returns probability of frame
   */
  public get probabilityPerFrame(): number[] {
    return this.frames.map((frame): number => frame.probability)
  }

  /**
   * Quantum state probability of absorption for each frame.
   */
  public get totalAbsorptionPerFrame(): number[] {
    return this.frames.map((frame): number => frame.totalProbabilityLoss)
  }

  /**
   * Total (summed over all frames) absorption per tile.
   * {x: -1, y: -1, probability: ...} means falling of the board.
   * @todo If needed, I we can add exact (off-board) cooardinates of all lost photons.
   * @returns E.g.
   * [{x: 2, y: 1, probability: 0.25}, {x: 3, y: 5, probability: 0.25}, {x: -1, y: -1, probability: 0.25}]
   */
  public get totalIAbsorptionPerTile(): IAbsorption[] {
    return _(this.frames)
      .flatMap((frame): IAbsorption[] => frame.absorptions)
      .groupBy((absorption: IAbsorption): string => `(${absorption.x}.${absorption.y})`)
      .values()
      .map(
        (absorptions): IAbsorption => ({
          x: absorptions[0].x,
          y: absorptions[0].y,
          probability: _.sumBy(absorptions, 'probability'),
        }),
      )
      .value()
  }

  /**
   * Retrieve a list of all the particles for quantum path computation
   * @returns particle list
   */
  public get allParticles(): IParticle[] {
    const result: IParticle[] = []
    this.frames.forEach((frame): void => {
      frame.particles.forEach((particle): void => {
        result.push(particle)
      })
    })
    return result
  }

  /**
   * Create a random realization. So - the state is normalized, until a successful measurement.
   * @remark So far for 1 particle.
   * @todo Make it work for more particles.
   * @todo Maybe make it another object? Or use QuantumFrame?
   * @todo Kinda ugly return
   */
  public sampleRandomRealization(): {
    statePerFrame: Frame[]
    probability: number
    step: number
    x: number
    y: number
  } {
    // first, which frame
    const lastId = weightedRandomInt(this.totalAbsorptionPerFrame, false)
    // -1 if no measurement, and we need to deal with that
    const lastFrameAbs = this.frames[lastId].absorptions
    const absorptionId = weightedRandomInt(
      lastFrameAbs.map((d): number => d.probability),
      true,
    )
    const absorption = lastFrameAbs[absorptionId]
    const states = this.frames.slice(0, lastId).map((frame): Frame => frame.normalize())

    return {
      statePerFrame: states,
      probability: absorption.probability,
      step: lastId,
      x: absorption.x,
      y: absorption.y,
    }
  }
}
