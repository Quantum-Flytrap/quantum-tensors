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
})
