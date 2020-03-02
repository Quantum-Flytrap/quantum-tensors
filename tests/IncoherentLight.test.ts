import Dimension from '../src/Dimension'
import IncoherentLight from '../src/IncoherentLight'
import * as Elements from '../src/Elements'
import { IXYOperator } from '../src/interfaces'
import './customMatchers'

describe('IncoherentLight', () => {
  it('creates some space', () => {
    const space = IncoherentLight.emptySpace(7, 5)

    expect(space.dimX).toEqual(Dimension.position(7, 'x'))
    expect(space.dimY).toEqual(Dimension.position(5, 'y'))

    space.addIntensityFromIndicator(0, 2, '>')

    expect(space.totalIntensity).toBeCloseTo(1)
    expect(space.ketString()).toBe('(1.00 +0.00i) |0,2,>⟩')
  })

  it('propagates a beam', () => {
    const space = IncoherentLight.emptySpace(3, 5).addIntensityFromIndicator(0, 2, '>')

    expect(space.ketString()).toBe('(1.00 +0.00i) |0,2,>⟩')
    space.propagateBeam()
    expect(space.ketString()).toBe('(1.00 +0.00i) |1,2,>⟩')
    space.propagateBeam()
    expect(space.ketString()).toBe('(1.00 +0.00i) |2,2,>⟩')
    space.propagateBeam()
    expect(space.ketString()).toBe('')
  })

  it('beam interaction with elements', () => {
    const space = IncoherentLight.emptySpace(7, 6).addIntensityFromIndicator(0, 2, '>')

    const operations: IXYOperator[] = IncoherentLight.opsWithPosMakeIncoherent([
      { x: 1, y: 5, op: Elements.sugarSolution(0.125) },
      { x: 1, y: 2, op: Elements.mirror(135) },
      { x: 1, y: 4, op: Elements.attenuator() },
    ])

    expect(space.ketString()).toBe('(1.00 +0.00i) |0,2,>⟩')
    space.propagateBeam().interact(operations)
    expect(space.ketString()).toBe('(1.00 +0.00i) |1,2,v⟩')
    space.propagateBeam().interact(operations)
    expect(space.ketString()).toBe('(1.00 +0.00i) |1,3,v⟩')
    space.propagateBeam().interact(operations)
    expect(space.ketString()).toBe('(0.50 +0.00i) |1,4,v⟩')
    space.propagateBeam().interact(operations)
    expect(space.ketString()).toBe('(0.50 +0.00i) |1,5,v⟩')
  })

  it('no interference', () => {
    // Sugar solutions and mirrors
    // Let's start horizontal
    // >.\..\.
    // ..\VV\.
    // .......

    const space = IncoherentLight.emptySpace(8, 3).addIntensityFromIndicator(0, 0, '>')
    const operations: IXYOperator[] = IncoherentLight.opsWithPosMakeIncoherent([
      { x: 2, y: 0, op: Elements.beamSplitter(135) },
      { x: 5, y: 0, op: Elements.mirror(135) },
      { x: 2, y: 1, op: Elements.mirror(135) },
      { x: 3, y: 1, op: Elements.vacuumJar() },
      { x: 4, y: 1, op: Elements.vacuumJar() },
      { x: 5, y: 1, op: Elements.beamSplitter(135) },
    ])

    expect(space.ketString()).toBe('(1.00 +0.00i) |0,0,>⟩')
    space.propagateBeam().interact(operations)
    expect(space.ketString()).toBe('(1.00 +0.00i) |1,0,>⟩')
    space.propagateBeam().interact(operations)
    expect(space.ketString()).toBe('(0.50 +0.00i) |2,0,>⟩ + (0.50 +0.00i) |2,0,v⟩')
    space.propagateBeam().interact(operations)
    expect(space.ketString()).toBe('(0.50 +0.00i) |3,0,>⟩ + (0.50 +0.00i) |2,1,>⟩')
    space.propagateBeam().interact(operations)
    expect(space.ketString()).toBe('(0.50 +0.00i) |3,1,>⟩ + (0.50 +0.00i) |4,0,>⟩')
    space.propagateBeam().interact(operations)
    expect(space.ketString()).toBe('(0.50 +0.00i) |4,1,>⟩ + (0.50 +0.00i) |5,0,v⟩')
    space.propagateBeam().interact(operations)
    expect(space.ketString()).toBe('(0.50 +0.00i) |5,1,>⟩ + (0.50 +0.00i) |5,1,v⟩')
  })

  it('polarizing beam splitters', () => {
    // Sugar solutions and PBS
    // Let's start horizontal
    // >.S.\..
    // ..../..
    // .......

    const space = IncoherentLight.emptySpace(8, 3).addIntensityFromIndicator(0, 0, '>')
    const operations: IXYOperator[] = IncoherentLight.opsWithPosMakeIncoherent([
      { x: 2, y: 0, op: Elements.sugarSolution() },
      { x: 4, y: 0, op: Elements.polarizingBeamsplitter(90) },
      { x: 4, y: 1, op: Elements.polarizingBeamsplitter(0) },
      { x: 5, y: 0, op: Elements.polarizingBeamsplitter(0) },
    ])

    expect(space.ketString()).toBe('(1.00 +0.00i) |0,0,>⟩')
    space.propagateBeam()
    space.propagateBeam()
    space.interact(operations)
    expect(space.ketString()).toBe('(1.00 +0.00i) |2,0,>⟩')
    space.propagateBeam()
    space.propagateBeam()
    space.interact(operations)
    expect(space.ketString()).toBe('(0.50 +0.00i) |4,0,>⟩ + (0.50 +0.00i) |4,0,v⟩')
    space.propagateBeam()
    space.interact(operations)
    expect(space.ketString()).toBe(
      '(0.25 +0.00i) |4,1,<⟩ + (0.25 +0.00i) |4,1,v⟩ + (0.25 +0.00i) |5,0,>⟩ + (0.25 +0.00i) |5,0,^⟩',
    )
  })

  it('attenuation', () => {
    // 50% absorption filters
    // >.\AA..
    // .......
    // ..A....
    // .......

    const space = IncoherentLight.emptySpace(7, 4).addIntensityFromIndicator(0, 0, '>')
    const operations: IXYOperator[] = IncoherentLight.opsWithPosMakeIncoherent([
      { x: 2, y: 0, op: Elements.beamSplitter(135) },
      { x: 3, y: 0, op: Elements.attenuator() },
      { x: 4, y: 0, op: Elements.attenuator() },
      { x: 2, y: 2, op: Elements.attenuator() },
    ])
    expect(space.ketString()).toBe('(1.00 +0.00i) |0,0,>⟩')
    space.propagateBeam().interact(operations)
    expect(space.ketString()).toBe('(1.00 +0.00i) |1,0,>⟩')
    space.propagateBeam().interact(operations)
    expect(space.ketString()).toBe('(0.50 +0.00i) |2,0,>⟩ + (0.50 +0.00i) |2,0,v⟩')
    space.propagateBeam().interact(operations)
    expect(space.ketString()).toBe('(0.50 +0.00i) |2,1,v⟩ + (0.25 +0.00i) |3,0,>⟩')
    space.propagateBeam().interact(operations)
    expect(space.ketString()).toBe('(0.25 +0.00i) |2,2,v⟩ + (0.13 +0.00i) |4,0,>⟩')
  })
})
