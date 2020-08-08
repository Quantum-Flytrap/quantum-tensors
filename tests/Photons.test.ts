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
