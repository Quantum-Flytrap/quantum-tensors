import Dimension from '../src/Dimension'
import Operator from '../src/Operator'
import Photons from '../src/Photons'
import * as Elements from '../src/Elements'
import './customMatchers'

describe('Photons', () => {
  it('creates a photon', () => {
    const photons = new Photons(7, 5)

    expect(photons.dimX).toEqual(Dimension.position(7, 'x'))
    expect(photons.dimY).toEqual(Dimension.position(5, 'y'))
    expect(photons.nPhotons).toBe(0)

    photons.addPhotonIndicator(0, 2, '>', 'V')

    expect(photons.nPhotons).toBe(1)

    expect(photons.ketString()).toBe('(1.00 +0.00i) |0,2,>,V⟩')
  })

  it('propagates a photon', () => {
    const photons = new Photons(3, 5)
    photons.addPhotonIndicator(0, 2, '>', 'V')

    expect(photons.ketString()).toBe('(1.00 +0.00i) |0,2,>,V⟩')
    photons.propagatePhotons()
    expect(photons.ketString()).toBe('(1.00 +0.00i) |1,2,>,V⟩')
    photons.propagatePhotons()
    expect(photons.ketString()).toBe('(1.00 +0.00i) |2,2,>,V⟩')
    photons.propagatePhotons()
    expect(photons.ketString()).toBe('')
  })

  it('interacts a photon', () => {
    const photons = new Photons(7, 6)
    photons.addPhotonIndicator(0, 2, '>', 'V')

    const operations: [number, number, Operator][] = [
      [1, 5, Elements.sugarSolution(0.125)],
      [1, 2, Elements.mirror(135)],
      [1, 4, Elements.attenuator()],
    ]

    expect(photons.ketString()).toBe('(1.00 +0.00i) |0,2,>,V⟩')

    photons.propagatePhotons()
    photons.actOnSinglePhotons(operations)
    expect(photons.ketString()).toBe('(-1.00 +0.00i) |1,2,v,V⟩')

    photons.propagatePhotons()
    photons.actOnSinglePhotons(operations)
    expect(photons.ketString()).toBe('(-1.00 +0.00i) |1,3,v,V⟩')

    photons.propagatePhotons()
    photons.actOnSinglePhotons(operations)
    expect(photons.ketString()).toBe('(-0.71 +0.00i) |1,4,v,V⟩')

    photons.propagatePhotons()
    photons.actOnSinglePhotons(operations)
    expect(photons.ketString()).toBe('(0.50 +0.00i) |1,5,v,H⟩ + (-0.50 +0.00i) |1,5,v,V⟩')
  })

  it('3 mirrors, same sugar twice', () => {
    // Sugar solutions and mirrors
    // Let's start horizontal
    // .......
    // .>.S.\.
    // ...\./.
    // .......

    const photons = new Photons(7, 4)
    photons.addPhotonIndicator(1, 1, '>', 'H')
    const operations: [number, number, Operator][] = [
      [3, 1, Elements.sugarSolution(0.125)],
      [5, 1, Elements.mirror(135)],
      [5, 2, Elements.mirror(45)],
      [3, 2, Elements.mirror(135)],
    ]

    expect(photons.ketString()).toBe('(1.00 +0.00i) |1,1,>,H⟩')
    photons.propagatePhotons()
    photons.actOnSinglePhotons(operations)
    expect(photons.ketString()).toBe('(1.00 +0.00i) |2,1,>,H⟩')
    photons.propagatePhotons()
    photons.actOnSinglePhotons(operations)
    expect(photons.ketString()).toBe('(0.71 +0.00i) |3,1,>,H⟩ + (0.71 +0.00i) |3,1,>,V⟩')
    photons.propagatePhotons()
    photons.actOnSinglePhotons(operations)
    expect(photons.ketString()).toBe('(0.71 +0.00i) |4,1,>,H⟩ + (0.71 +0.00i) |4,1,>,V⟩')
    photons.propagatePhotons()
    photons.actOnSinglePhotons(operations)
    expect(photons.ketString()).toBe('(0.71 +0.00i) |5,1,v,H⟩ + (-0.71 +0.00i) |5,1,v,V⟩')
    photons.propagatePhotons()
    photons.actOnSinglePhotons(operations)
    expect(photons.ketString()).toBe('(0.71 +0.00i) |5,2,<,H⟩ + (0.71 +0.00i) |5,2,<,V⟩')
    photons.propagatePhotons()
    photons.actOnSinglePhotons(operations)
    expect(photons.ketString()).toBe('(0.71 +0.00i) |4,2,<,H⟩ + (0.71 +0.00i) |4,2,<,V⟩')
    photons.propagatePhotons()
    photons.actOnSinglePhotons(operations)
    expect(photons.ketString()).toBe('(0.71 +0.00i) |3,2,^,H⟩ + (-0.71 +0.00i) |3,2,^,V⟩')
    photons.propagatePhotons()
    photons.actOnSinglePhotons(operations)
    expect(photons.ketString()).toBe('(1.00 +0.00i) |3,1,^,H⟩')
  })

  it('interferference', () => {
    // Sugar solutions and mirrors
    // Let's start horizontal
    // >.\..\.
    // ..\VV\.
    // .......

    const photons = new Photons(8, 3)
    photons.addPhotonIndicator(0, 0, '>', 'H')
    const operations: [number, number, Operator][] = [
      [2, 0, Elements.beamSplitter(135)],
      [5, 0, Elements.mirror(135)],
      [2, 1, Elements.mirror(135)],
      [3, 1, Elements.vacuumJar()],
      [4, 1, Elements.vacuumJar()],
      [5, 1, Elements.beamSplitter(135)],
    ]

    expect(photons.ketString()).toBe('(1.00 +0.00i) |0,0,>,H⟩')
    photons.propagatePhotons()
    photons.actOnSinglePhotons(operations)
    expect(photons.ketString()).toBe('(1.00 +0.00i) |1,0,>,H⟩')
    photons.propagatePhotons()
    photons.actOnSinglePhotons(operations)
    expect(photons.ketString()).toBe('(0.71 +0.00i) |2,0,>,H⟩ + (0.00 +0.71i) |2,0,v,H⟩')
    photons.propagatePhotons()
    photons.actOnSinglePhotons(operations)
    expect(photons.ketString()).toBe('(0.71 +0.00i) |3,0,>,H⟩ + (0.00 +0.71i) |2,1,>,H⟩')
    photons.propagatePhotons()
    photons.actOnSinglePhotons(operations)
    expect(photons.ketString()).toBe('(0.71 +0.00i) |3,1,>,H⟩ + (0.71 +0.00i) |4,0,>,H⟩')
    photons.propagatePhotons()
    photons.actOnSinglePhotons(operations)
    expect(photons.ketString()).toBe('(0.00 -0.71i) |4,1,>,H⟩ + (0.71 +0.00i) |5,0,v,H⟩')
    photons.propagatePhotons()
    photons.actOnSinglePhotons(operations)
    expect(photons.ketString()).toBe('(1.00 +0.00i) |5,1,v,H⟩')
  })

  it('polarizing beam splitters', () => {
    // Sugar solutions and PBS
    // Let's start horizontal
    // >.S.\..
    // ..../..
    // .......

    const photons = new Photons(8, 3)
    photons.addPhotonIndicator(0, 0, '>', 'H')
    const operations: [number, number, Operator][] = [
      [2, 0, Elements.sugarSolution()],
      [4, 0, Elements.polarizingBeamsplitter(90)],
      [4, 1, Elements.polarizingBeamsplitter(0)],
      [5, 0, Elements.polarizingBeamsplitter(0)],
    ]

    expect(photons.ketString()).toBe('(1.00 +0.00i) |0,0,>,H⟩')
    photons.propagatePhotons()
    photons.propagatePhotons()
    photons.actOnSinglePhotons(operations)
    expect(photons.ketString()).toBe('(0.71 +0.00i) |2,0,>,H⟩ + (0.71 +0.00i) |2,0,>,V⟩')
    photons.propagatePhotons()
    photons.propagatePhotons()
    photons.actOnSinglePhotons(operations)
    expect(photons.ketString()).toBe('(0.71 +0.00i) |4,0,>,H⟩ + (0.71 +0.00i) |4,0,v,V⟩')
    photons.propagatePhotons()
    photons.actOnSinglePhotons(operations)
    expect(photons.ketString()).toBe('(0.71 +0.00i) |5,0,>,H⟩ + (0.71 +0.00i) |4,1,<,V⟩')
  })

  it('Hong-Ou-Mandel', () => {
    // Sugar solutions and PBS
    // Let's start horizontal
    // ..v..
    // .....
    // >.\..
    // .....

    const photons = new Photons(4, 4)
    photons.addPhotonIndicator(0, 2, '>', 'H')
    photons.addPhotonIndicator(2, 0, 'v', 'H')
    expect(photons.nPhotons).toBe(2)

    const operations: [number, number, Operator][] = [[2, 2, Elements.beamSplitter(135)]]

    expect(photons.ketString()).toBe('(0.71 +0.00i) |0,2,>,H,2,0,v,H⟩ + (0.71 +0.00i) |2,0,v,H,0,2,>,H⟩')
    photons.propagatePhotons()
    photons.actOnSinglePhotons(operations)
    expect(photons.ketString()).toBe('(0.71 +0.00i) |1,2,>,H,2,1,v,H⟩ + (0.71 +0.00i) |2,1,v,H,1,2,>,H⟩')
    photons.propagatePhotons()
    photons.actOnSinglePhotons(operations)
    expect(photons.ketString()).toBe('(0.00 +0.71i) |2,2,>,H,2,2,>,H⟩ + (0.00 +0.71i) |2,2,v,H,2,2,v,H⟩')
    photons.propagatePhotons()
    photons.actOnSinglePhotons(operations)
    expect(photons.ketString()).toBe('(0.00 +0.71i) |3,2,>,H,3,2,>,H⟩ + (0.00 +0.71i) |2,3,v,H,2,3,v,H⟩')
  })
})
