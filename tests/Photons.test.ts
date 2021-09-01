import { performance } from 'perf_hooks';
import Dimension from '../src/Dimension'
import Photons from '../src/Photons'
import * as Elements from '../src/Elements'
import { IXYOperator } from '../src/interfaces'
import './customMatchers'

describe('Photons', () => {
  it('creates a photon', () => {
    const photons = Photons.emptySpace(7, 5)

    expect(photons.dimX).toEqual(Dimension.position(7, 'x'))
    expect(photons.dimY).toEqual(Dimension.position(5, 'y'))
    expect(photons.nPhotons).toBe(0)

    photons.addPhotonFromIndicator(0, 2, '>', 'V')

    expect(photons.nPhotons).toBe(1)

    expect(photons.ketString()).toBe('(1.00 +0.00i) |0,2,>,V⟩')
  })

  it('creates a photon in antidiagonal state', () => {
    const photons = Photons.emptySpace(7, 5)
    photons.addPhotonFromIndicator(6, 1, '^', 'A')
    expect(photons.ketString()).toBe('(-0.71 +0.00i) |6,1,^,H⟩ + (0.71 +0.00i) |6,1,^,V⟩')
  })

  it('does not create photon in an nonexisting state', () => {
    const photons = Photons.emptySpace(7, 5)
    expect(() => photons.addPhotonFromIndicator(6, 1, '^', 'h')).toThrowError('Polarization string h not supported.')
  })

  it('propagates a photon', () => {
    const photons = Photons.emptySpace(3, 5).addPhotonFromIndicator(0, 2, '>', 'V')

    expect(photons.ketString()).toBe('(1.00 +0.00i) |0,2,>,V⟩')
    photons.propagatePhotons()
    expect(photons.ketString()).toBe('(1.00 +0.00i) |1,2,>,V⟩')
    photons.propagatePhotons()
    expect(photons.ketString()).toBe('(1.00 +0.00i) |2,2,>,V⟩')
    photons.propagatePhotons()
    expect(photons.ketString()).toBe('')
  })

  it('propagates a photon - with operator', () => {
    const photons = Photons.emptySpace(3, 5).addPhotonFromIndicator(0, 2, '>', 'V')

    expect(photons.ketString()).toBe('(1.00 +0.00i) |0,2,>,V⟩')
    photons.propagatePhotonsWithOperator()
    expect(photons.ketString()).toBe('(1.00 +0.00i) |1,2,>,V⟩')
    photons.propagatePhotonsWithOperator()
    expect(photons.ketString()).toBe('(1.00 +0.00i) |2,2,>,V⟩')
    photons.propagatePhotonsWithOperator()
    expect(photons.ketString()).toBe('')
  })

  it('interacts a photon with no effect on empty board', () => {
    const photons = Photons.emptySpace(3, 5).addPhotonFromIndicator(0, 2, '>', 'V')

    expect(photons.ketString()).toBe('(1.00 +0.00i) |0,2,>,V⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(1.00 +0.00i) |1,2,>,V⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(1.00 +0.00i) |2,2,>,V⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('')
  })

  it('interacts a photon', () => {
    const photons = Photons.emptySpace(7, 6).addPhotonFromIndicator(0, 2, '>', 'V')

    const operations: IXYOperator[] = [
      { x: 1, y: 5, op: Elements.sugarSolution(0.125) },
      { x: 1, y: 2, op: Elements.mirror(135) },
      { x: 1, y: 4, op: Elements.attenuator() },
    ]
    photons.updateOperators(operations)

    expect(photons.ketString()).toBe('(1.00 +0.00i) |0,2,>,V⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(-1.00 +0.00i) |1,2,v,V⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(-1.00 +0.00i) |1,3,v,V⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(-0.71 +0.00i) |1,4,v,V⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.50 +0.00i) |1,5,v,H⟩ + (-0.50 +0.00i) |1,5,v,V⟩')
  })

  it('3 mirrors, same sugar twice', () => {
    // Sugar solutions and mirrors
    // Let's start horizontal
    // .......
    // .>.S.\.
    // ...\./.
    // .......

    const photons = Photons.emptySpace(7, 4)
    photons.addPhotonFromIndicator(1, 1, '>', 'H')
    const operations: IXYOperator[] = [
      { x: 3, y: 1, op: Elements.sugarSolution(0.125) },
      { x: 5, y: 1, op: Elements.mirror(135) },
      { x: 5, y: 2, op: Elements.mirror(45) },
      { x: 3, y: 2, op: Elements.mirror(135) },
    ]
    photons.updateOperators(operations)

    expect(photons.ketString()).toBe('(1.00 +0.00i) |1,1,>,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(1.00 +0.00i) |2,1,>,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.71 +0.00i) |3,1,>,H⟩ + (0.71 +0.00i) |3,1,>,V⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.71 +0.00i) |4,1,>,H⟩ + (0.71 +0.00i) |4,1,>,V⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.71 +0.00i) |5,1,v,H⟩ + (-0.71 +0.00i) |5,1,v,V⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.71 +0.00i) |5,2,<,H⟩ + (0.71 +0.00i) |5,2,<,V⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.71 +0.00i) |4,2,<,H⟩ + (0.71 +0.00i) |4,2,<,V⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.71 +0.00i) |3,2,^,H⟩ + (-0.71 +0.00i) |3,2,^,V⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(1.00 +0.00i) |3,1,^,H⟩')
  })

  it('interference', () => {
    // Sugar solutions and mirrors
    // Let's start horizontal
    // >.\..\.
    // ..\VV\.
    // .......

    const photons = Photons.emptySpace(8, 3)
    photons.addPhotonFromIndicator(0, 0, '>', 'H')
    const operations: IXYOperator[] = [
      { x: 2, y: 0, op: Elements.beamSplitter(135) },
      { x: 5, y: 0, op: Elements.mirror(135) },
      { x: 2, y: 1, op: Elements.mirror(135) },
      { x: 3, y: 1, op: Elements.vacuumJar() },
      { x: 4, y: 1, op: Elements.vacuumJar() },
      { x: 5, y: 1, op: Elements.beamSplitter(135) },
    ]
    photons.updateOperators(operations)

    expect(photons.ketString()).toBe('(1.00 +0.00i) |0,0,>,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(1.00 +0.00i) |1,0,>,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.71 +0.00i) |2,0,>,H⟩ + (0.00 +0.71i) |2,0,v,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.00 +0.71i) |2,1,>,H⟩ + (0.71 +0.00i) |3,0,>,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.71 +0.00i) |3,1,>,H⟩ + (0.71 +0.00i) |4,0,>,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.00 -0.71i) |4,1,>,H⟩ + (0.71 +0.00i) |5,0,v,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(1.00 +0.00i) |5,1,v,H⟩')
  })

  it('polarizing beam splitters', () => {
    // Sugar solutions and PBS
    // Let's start horizontal
    // >.S.\..
    // ..../..
    // .......

    const photons = Photons.emptySpace(8, 3)
    photons.addPhotonFromIndicator(0, 0, '>', 'H')
    const operations: IXYOperator[] = [
      { x: 2, y: 0, op: Elements.sugarSolution() },
      { x: 4, y: 0, op: Elements.polarizingBeamsplitter(90) },
      { x: 4, y: 1, op: Elements.polarizingBeamsplitter(0) },
      { x: 5, y: 0, op: Elements.polarizingBeamsplitter(0) },
    ]
    photons.updateOperators(operations)

    expect(photons.ketString()).toBe('(1.00 +0.00i) |0,0,>,H⟩')
    photons.propagatePhotons()
    photons.propagatePhotons()
    photons.actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.71 +0.00i) |2,0,>,H⟩ + (0.71 +0.00i) |2,0,>,V⟩')
    photons.propagatePhotons()
    photons.propagatePhotons()
    photons.actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.71 +0.00i) |4,0,>,H⟩ + (0.71 +0.00i) |4,0,v,V⟩')
    photons.propagatePhotons()
    photons.actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.71 +0.00i) |4,1,<,V⟩ + (0.71 +0.00i) |5,0,>,H⟩')
  })

  it('Hong-Ou-Mandel', () => {
    // Sugar solutions and PBS
    // Let's start horizontal
    // ..v..
    // .....
    // >.\..
    // .....

    const photons = Photons.emptySpace(4, 4)
      .addPhotonFromIndicator(0, 2, '>', 'H')
      .addPhotonFromIndicator(2, 0, 'v', 'H')
    expect(photons.nPhotons).toBe(2)

    const operations: IXYOperator[] = [{ x: 2, y: 2, op: Elements.beamSplitter(135) }]
    photons.updateOperators(operations)

    expect(photons.ketString()).toBe('(0.71 +0.00i) |0,2,>,H,2,0,v,H⟩ + (0.71 +0.00i) |2,0,v,H,0,2,>,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.71 +0.00i) |1,2,>,H,2,1,v,H⟩ + (0.71 +0.00i) |2,1,v,H,1,2,>,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.00 +0.71i) |2,2,>,H,2,2,>,H⟩ + (0.00 +0.71i) |2,2,v,H,2,2,v,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.00 +0.71i) |2,3,v,H,2,3,v,H⟩ + (0.00 +0.71i) |3,2,>,H,3,2,>,H⟩')
  })

  it('attenuation', () => {
    // 50% absorption filters
    // >.\AA..
    // .......
    // ..A....
    // .......

    const photons = Photons.emptySpace(7, 4)
    photons.addPhotonFromIndicator(0, 0, '>', 'H')
    const operations: IXYOperator[] = [
      { x: 2, y: 0, op: Elements.beamSplitter(135) },
      { x: 3, y: 0, op: Elements.attenuator() },
      { x: 4, y: 0, op: Elements.attenuator() },
      { x: 2, y: 2, op: Elements.attenuator() },
    ]
    photons.updateOperators(operations)

    expect(photons.ketString()).toBe('(1.00 +0.00i) |0,0,>,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(1.00 +0.00i) |1,0,>,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.71 +0.00i) |2,0,>,H⟩ + (0.00 +0.71i) |2,0,v,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.00 +0.71i) |2,1,v,H⟩ + (0.50 +0.00i) |3,0,>,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.00 +0.50i) |2,2,v,H⟩ + (0.35 +0.00i) |4,0,>,H⟩')
  })

  it('measurement', () => {
    // 50% absorption filters
    // >.\AA..
    // .......
    // ..A....
    // .......

    const photons = Photons.emptySpace(7, 4)
    photons.addPhotonFromIndicator(0, 0, '>', 'H')
    const operations: IXYOperator[] = [
      { x: 2, y: 0, op: Elements.beamSplitter(135) },
      { x: 3, y: 0, op: Elements.attenuator() },
      { x: 4, y: 0, op: Elements.attenuator() },
      { x: 2, y: 2, op: Elements.attenuator() },
    ]
    photons.updateOperators(operations)

    expect(photons.ketString()).toBe('(1.00 +0.00i) |0,0,>,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(1.00 +0.00i) |1,0,>,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.71 +0.00i) |2,0,>,H⟩ + (0.00 +0.71i) |2,0,v,H⟩')
    photons.propagatePhotons()
    expect(photons.measureAbsorptionAtOperator({ x: 3, y: 0, op: Elements.attenuator() })).toBeCloseTo(0.25)
    photons.actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.00 +0.71i) |2,1,v,H⟩ + (0.50 +0.00i) |3,0,>,H⟩')
    photons.propagatePhotons()
    expect(photons.measureAbsorptionAtOperator({ x: 3, y: 0, op: Elements.attenuator() })).toBeCloseTo(0)
    expect(photons.measureAbsorptionAtOperator({ x: 4, y: 0, op: Elements.attenuator() })).toBeCloseTo(0.125)
    expect(photons.measureAbsorptionAtOperator({ x: 2, y: 2, op: Elements.attenuator() })).toBeCloseTo(0.25)
    photons.actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.00 +0.50i) |2,2,v,H⟩ + (0.35 +0.00i) |4,0,>,H⟩')
  })

  it('measurement: proj', () => {
    // 100% absorption filters
    // >.\.X..
    // .......
    // .......
    // .......

    const photons = Photons.emptySpace(7, 4)
    photons.addPhotonFromIndicator(0, 0, '>', 'H')
    const operations: IXYOperator[] = [{ x: 2, y: 0, op: Elements.beamSplitter(135) }]
    photons.updateOperators(operations)
    photons.updateMeasurements([{ x: 4, y: 0, nVecs: Photons.allDirectionsVec() }])

    expect(photons.ketString()).toBe('(1.00 +0.00i) |0,0,>,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.71 +0.00i) |2,0,>,H⟩ + (0.00 +0.71i) |2,0,v,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.00 +0.71i) |2,2,v,H⟩ + (0.71 +0.00i) |4,0,>,H⟩')
    const measurement = photons.measure()
    expect(photons.measurementVecs.length).toBe(8)
    expect(photons.measurementVecs[0].name[0]).toBe('4-0->H')
    expect(photons.measurementVecs[0].vector.toKetString()).toBe('1.00 exp(0.00τi) |4,0,>,H⟩')
    expect(measurement.toString()).toBe(
      ['50.0% [] 1.00 exp(0.25τi) |2,2,v,H⟩', '50.0% [4-0->H] 1.00 exp(0.00τi) |⟩'].join('\n'),
    )
  })

  it('measurement: non-destructive', () => {
    // 100% detection, no absorbtion
    // >.\.M..
    // .......
    // .......
    // .......

    const photons = Photons.emptySpace(7, 4)
    photons.addPhotonFromIndicator(0, 0, '>', 'H')
    const operations: IXYOperator[] = [{ x: 2, y: 0, op: Elements.beamSplitter(135) }]
    photons.updateOperators(operations)
    photons.updateMeasurements([], [{ x: 4, y: 0, nOps: Photons.allDirectionsOps() }])

    expect(photons.ketString()).toBe('(1.00 +0.00i) |0,0,>,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.71 +0.00i) |2,0,>,H⟩ + (0.00 +0.71i) |2,0,v,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.00 +0.71i) |2,2,v,H⟩ + (0.71 +0.00i) |4,0,>,H⟩')
    const measurement = photons.measure()
    expect(photons.measurementOps.length).toBe(8)
    expect(photons.measurementOps[0].name[0]).toBe('4-0->H')
    expect(photons.measurementOps[0].operator.toString()).toBe(
      [
        // eslint-disable-next-line max-len
        'Operator with 1 entries of max size [[7,4,4,2], [7,4,4,2]] with dimensions [[x,y,direction,polarization], [x,y,direction,polarization]]',
        '(1.00 +0.00i) |4,0,>,H⟩⟨4,0,>,H|',
        '',
      ].join('\n'),
    )
    expect(measurement.toString()).toBe(
      ['50.0% [] 1.00 exp(0.25τi) |2,2,v,H⟩', '50.0% [4-0->H] 1.00 exp(0.00τi) |4,0,>,H⟩'].join('\n'),
    )
  })

  it('measurement: non-destructive', () => {
    // 100% detection, no absorbtion + 50% attenuation
    // >.\.M..
    // .......
    // ..A....
    // .......

    const photons = Photons.emptySpace(7, 4)
    photons.addPhotonFromIndicator(0, 0, '>', 'H')
    const operations: IXYOperator[] = [{ x: 2, y: 0, op: Elements.beamSplitter(135) }]
    photons.updateOperators(operations)
    photons.updateMeasurements(
      [{ x: 2, y: 2, nVecs: Photons.allDirectionsVec(Math.SQRT1_2) }],
      [{ x: 4, y: 0, nOps: Photons.allDirectionsOps() }],
    )

    expect(photons.ketString()).toBe('(1.00 +0.00i) |0,0,>,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.71 +0.00i) |2,0,>,H⟩ + (0.00 +0.71i) |2,0,v,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.00 +0.71i) |2,2,v,H⟩ + (0.71 +0.00i) |4,0,>,H⟩')
    const measurement = photons.measure()
    expect(measurement.toString()).toBe(
      [
        '25.0% [] 1.00 exp(0.25τi) |2,2,v,H⟩',
        '25.0% [2-2-vH] 1.00 exp(0.25τi) |⟩',
        '50.0% [4-0->H] 1.00 exp(0.00τi) |4,0,>,H⟩',
      ].join('\n'),
    )
  })

  it('measurement: pick random', () => {
    // 100% detection, no absorbtion + 50% attenuation
    // >.\.M..
    // .......
    // ..A....
    // .......

    const photons = Photons.emptySpace(7, 4)
    photons.addPhotonFromIndicator(0, 0, '>', 'H')
    const operations: IXYOperator[] = [{ x: 2, y: 0, op: Elements.beamSplitter(135) }]
    photons.updateOperators(operations)
    photons.updateMeasurements(
      [{ x: 2, y: 2, nVecs: Photons.allDirectionsVec(Math.SQRT1_2) }],
      [{ x: 4, y: 0, nOps: Photons.allDirectionsOps() }],
    )
    photons.propagatePhotons().actOnSinglePhotons()
    photons.propagatePhotons().actOnSinglePhotons()
    photons.propagatePhotons().actOnSinglePhotons()
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.00 +0.71i) |2,2,v,H⟩ + (0.71 +0.00i) |4,0,>,H⟩')
    const measurement = photons.measure()
    const randomRes = measurement.pickRandom()
    expect(randomRes.states.length).toBe(1)
    expect(randomRes.states[0].vector.normSquared()).toBeCloseTo(1)
  })

  it('measurement: Hong-Ou-Mandel', () => {
    // ..v..
    // .....
    // >.\..
    // ..A..

    const photons = Photons.emptySpace(4, 4)
      .addPhotonFromIndicator(0, 2, '>', 'H')
      .addPhotonFromIndicator(2, 0, 'v', 'H')
    expect(photons.nPhotons).toBe(2)

    const operations: IXYOperator[] = [{ x: 2, y: 2, op: Elements.beamSplitter(135) }]
    photons.updateOperators(operations)
    photons.updateMeasurements([{ x: 2, y: 3, nVecs: Photons.allDirectionsVec() }])
    expect(photons.ketString()).toBe('(0.71 +0.00i) |0,2,>,H,2,0,v,H⟩ + (0.71 +0.00i) |2,0,v,H,0,2,>,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    photons.propagatePhotons().actOnSinglePhotons()
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.00 +0.71i) |2,3,v,H,2,3,v,H⟩ + (0.00 +0.71i) |3,2,>,H,3,2,>,H⟩')
    const measurement = photons.measure()
    expect(measurement.toString()).toBe(
      ['50.0% [] 1.00 exp(0.25τi) |3,2,>,H,3,2,>,H⟩', '50.0% [2-3-vH&2-3-vH] 1.00 exp(0.25τi) |⟩'].join('\n'),
    )
  })

  it('measurement: Hong-Ou-Mandel at 50% detection', () => {
    // 50% absorbtion
    // ..v..
    // .....
    // >.\..
    // ..A..

    const photons = Photons.emptySpace(4, 4)
      .addPhotonFromIndicator(0, 2, '>', 'H')
      .addPhotonFromIndicator(2, 0, 'v', 'H')
    expect(photons.nPhotons).toBe(2)

    const operations: IXYOperator[] = [{ x: 2, y: 2, op: Elements.beamSplitter(135) }]
    photons.updateOperators(operations)
    photons.updateMeasurements([{ x: 2, y: 3, nVecs: Photons.allDirectionsVec(Math.SQRT1_2) }])
    expect(photons.ketString()).toBe('(0.71 +0.00i) |0,2,>,H,2,0,v,H⟩ + (0.71 +0.00i) |2,0,v,H,0,2,>,H⟩')
    photons.propagatePhotons().actOnSinglePhotons()
    photons.propagatePhotons().actOnSinglePhotons()
    photons.propagatePhotons().actOnSinglePhotons()
    expect(photons.ketString()).toBe('(0.00 +0.71i) |2,3,v,H,2,3,v,H⟩ + (0.00 +0.71i) |3,2,>,H,3,2,>,H⟩')
    const measurement = photons.measure()
    expect(measurement.toString()).toBe(
      [
        '67.5% [] 0.24 exp(0.25τi) |2,3,v,H,2,3,v,H⟩ + 0.97 exp(0.25τi) |3,2,>,H,3,2,>,H⟩',
        '12.5% [2-3-vH] 1.00 exp(0.25τi) |2,3,v,H⟩',
        '7.5% [2-3-vH] 1.00 exp(0.25τi) |2,3,v,H⟩',
        '12.5% [2-3-vH&2-3-vH] 1.00 exp(0.25τi) |⟩',
      ].join('\n'),
    )
    // WARNING: I am not sure if the result is correct
    // expected 62.5% + (12.5% + 12.5%) + 12.5%
    // maybe I still does not understand something with multiple boson absorption, though
  })

  it('performance propagation: size 100x100', () => {
    const photons = Photons.emptySpace(100, 100)
    photons.addPhotonFromIndicator(0, 0, '>', 'H')

    const t0 = performance.now()
    photons.propagatePhotons()
    const dt = performance.now() - t0

    expect(dt).toBeLessThanOrEqual(1) // ms (741ms->0.02ms on i7-9750H CPU)
  })

  it('performance propagation: size 20x20', () => {
    const photons = Photons.emptySpace(20, 20)
    photons.addPhotonFromIndicator(0, 0, '>', 'H')

    const t0 = performance.now()
    photons.propagatePhotons()
    const dt = performance.now() - t0

    expect(dt).toBeLessThanOrEqual(1) // ms (22-34ms->0.02ms on i7-9750H CPU)
  })

  it('performance operation: size 20x20', () => {
    const photons = Photons.emptySpace(20, 20)
    photons.addPhotonFromIndicator(0, 0, '>', 'H')
    const operations: IXYOperator[] = [
      { x: 2, y: 0, op: Elements.beamSplitter(135) },
      { x: 5, y: 0, op: Elements.mirror(135) },
      { x: 2, y: 1, op: Elements.mirror(135) },
      { x: 3, y: 1, op: Elements.vacuumJar() },
      { x: 4, y: 1, op: Elements.vacuumJar() },
      { x: 5, y: 1, op: Elements.beamSplitter(135) },
    ]
    photons.updateOperators(operations)

    const t0 = performance.now()
    photons.actOnSinglePhotons()
    const dt = performance.now() - t0

    expect(dt).toBeLessThanOrEqual(10) // ms (80ms->1.5ms on i7-9750H CPU)
  })
})
