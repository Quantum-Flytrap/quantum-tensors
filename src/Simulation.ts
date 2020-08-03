import _ from 'lodash'
import Operator from './Operator'
import Frame from './Frame'
import { generateOperators } from './Elements'
import { weightedRandomInt, startingPolarization, startingDirection, singlePhotonInteraction } from './helpers'
import { IAbsorption, IGrid, ICell, IIndicator, IXYOperator } from './interfaces'

/**
 * SIMULATION CLASS
 * Loads a grid
 * Convert its elements into operators and merge them into a global operator.
 * Generate simulation frames and absorptions.
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
   * @returns number of columns of grid
   */
  public get sizeX(): number {
    return this.grid.cols
  }

  /**
   * @returns number of rows of grid
   */
  public get sizeY(): number {
    return this.grid.rows
  }

  /**
   * Generate the laser indicator from the grid laser cell
   * @returns laserIndicator
   */
  public generateLaserIndicator(): IIndicator {
    const lasers = this.grid.cells.filter((cell: ICell) => cell.element === 'Laser')
    if (lasers.length !== 1) {
      throw new Error(`Cannot initialize QuantumSimulation. ${lasers.length} != 1 lasers.`)
    }
    const laserIndicator: IIndicator = {
      x: lasers[0].x,
      y: lasers[0].y,
      direction: startingDirection(lasers[0].rotation),
      polarization: startingPolarization(lasers[0].polarization),
    }
    return laserIndicator
  }

  /**
   * Initialize simulation from indicator
   * @param indicator IIndicator
   */
  public initializeFromIndicator(indicator: IIndicator): void {
    this.frames = []
    const frame = new Frame(this)
    frame.addPhotonFromIndicator(indicator.x, indicator.y, indicator.direction, indicator.polarization)
    this.frames.push(frame)
  }

  /**
   * Get last simulation frame
   * @returns last frame
   */
  public get lastFrame(): Frame {
    return this.frames[this.frames.length - 1]
  }

  /**
   * Compute the next simulation frame
   * @returns computed frame
   */
  public nextFrame(): Frame {
    if (this.frames.length === 0) {
      throw new Error(`Cannot do nextFrame when there are no frames. initializeFromLaser or something else.`)
    }
    const frame = new Frame(this, this.lastFrame.vector)
    frame.propagateAndInteract()
    return frame
  }

  /**
   * Compute next frames until probability threshold
   * @param n default number of frames
   * @param stopThreshold stop if probability below threshold
   * @param logging toggle console debug
   */
  public generateFrames(n = 20, stopThreshold = 1e-6, logging = false): void {
    for (let i = 0; i < n; i += 1) {
      const nextFrame = this.nextFrame()
      this.frames.push(nextFrame)
      if (this.lastFrame.probability < stopThreshold) {
        break
      }
    }
    if (logging) {
      console.debug('POST-SIMULATION LOG:')
      console.debug('probabilityPerFrame', this.probabilityPerFrame)
      console.debug('totalAbsorptionPerFrame', this.totalAbsorptionPerFrame)
      console.debug('totalAbsorptionPerTile', this.totalAbsorptionPerTile)
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
   * @todo If needed, I we can add exact (off-board) coordinates of all lost photons.
   * @returns E.g.
   * [{x: 2, y: 1, probability: 0.25}, {x: 3, y: 5, probability: 0.25}, {x: -1, y: -1, probability: 0.25}]
   */
  public get totalAbsorptionPerTile(): IAbsorption[] {
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
    // eslint-disable-next-line indent
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
