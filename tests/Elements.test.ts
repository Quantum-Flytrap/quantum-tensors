import { Cx } from '../src/Complex'
import * as Elements from '../src/Elements'
import './customMatchers'

describe('Optical elements', () => {
  it('Sugar solution', () => {
    expect(Elements.sugarSolution().isCloseToUnitary()).toBe(true)
    expect(Elements.sugarSolution().isCloseToHermitian()).toBe(false)
    expect(Elements.incoherentLightOperator(Elements.sugarSolution())).operatorCloseToNumbers([
      [Cx(1), Cx(0), Cx(0), Cx(0)],
      [Cx(0), Cx(1), Cx(0), Cx(0)],
      [Cx(0), Cx(0), Cx(1), Cx(0)],
      [Cx(0), Cx(0), Cx(0), Cx(1)],
    ])
  })

  it('Attenuator', () => {
    expect(Elements.attenuator().isCloseToUnitary()).toBe(false)
    expect(Elements.attenuator().isCloseToHermitian()).toBe(true)
    expect(Elements.incoherentLightOperator(Elements.attenuator())).operatorCloseToNumbers([
      [Cx(0.5), Cx(0), Cx(0), Cx(0)],
      [Cx(0), Cx(0.5), Cx(0), Cx(0)],
      [Cx(0), Cx(0), Cx(0.5), Cx(0)],
      [Cx(0), Cx(0), Cx(0), Cx(0.5)],
    ])
  })

  it('Vacuum Jar (phase advancer)', () => {
    expect(Elements.vacuumJar().isCloseToUnitary()).toBe(true)
    expect(Elements.vacuumJar().isCloseToHermitian()).toBe(false)
    expect(Elements.incoherentLightOperator(Elements.vacuumJar())).operatorCloseToNumbers([
      [Cx(1), Cx(0), Cx(0), Cx(0)],
      [Cx(0), Cx(1), Cx(0), Cx(0)],
      [Cx(0), Cx(0), Cx(1), Cx(0)],
      [Cx(0), Cx(0), Cx(0), Cx(1)],
    ])
  })

  it('Glass Slab (phase retarder)', () => {
    expect(Elements.glassSlab().isCloseToUnitary()).toBe(true)
    expect(Elements.glassSlab().isCloseToHermitian()).toBe(false)
    expect(Elements.incoherentLightOperator(Elements.glassSlab())).operatorCloseToNumbers([
      [Cx(1), Cx(0), Cx(0), Cx(0)],
      [Cx(0), Cx(1), Cx(0), Cx(0)],
      [Cx(0), Cx(0), Cx(1), Cx(0)],
      [Cx(0), Cx(0), Cx(0), Cx(1)],
    ])
  })

  it('Mirror', () => {
    expect(Elements.mirror(0).isCloseToUnitary()).toBe(false)
    expect(Elements.mirror(0).isCloseToUnitaryOnSubspace()).toBe(true)
    expect(Elements.mirror(0).isCloseToHermitian()).toBe(true)

    expect(Elements.mirror(45).isCloseToUnitary()).toBe(true)
    expect(Elements.mirror(45).isCloseToHermitian()).toBe(true)

    expect(Elements.mirror(90).isCloseToUnitary()).toBe(false)
    expect(Elements.mirror(90).isCloseToUnitaryOnSubspace()).toBe(true)
    expect(Elements.mirror(90).isCloseToHermitian()).toBe(true)

    expect(Elements.mirror(135).isCloseToUnitary()).toBe(true)
    expect(Elements.mirror(135).isCloseToHermitian()).toBe(true)
  })

  it('Beam splitter', () => {
    expect(Elements.beamSplitter(0).isCloseToUnitary()).toBe(false)
    expect(Elements.beamSplitter(0).isCloseToUnitaryOnSubspace()).toBe(true)
    expect(Elements.beamSplitter(0).isCloseToHermitian()).toBe(false)

    expect(Elements.beamSplitter(45).isCloseToUnitary()).toBe(true)
    expect(Elements.beamSplitter(45).isCloseToHermitian()).toBe(false)

    expect(Elements.beamSplitter(90).isCloseToUnitary()).toBe(false)
    expect(Elements.beamSplitter(90).isCloseToUnitaryOnSubspace()).toBe(true)
    expect(Elements.beamSplitter(90).isCloseToHermitian()).toBe(false)

    expect(Elements.beamSplitter(135).isCloseToUnitary()).toBe(true)
    expect(Elements.beamSplitter(135).isCloseToHermitian()).toBe(false)
  })

  it('Corner cube', () => {
    expect(Elements.cornerCube().isCloseToUnitary()).toBe(true)
    expect(Elements.cornerCube().isCloseToHermitian()).toBe(true)
    expect(Elements.incoherentLightOperator(Elements.cornerCube())).operatorCloseToNumbers([
      [Cx(0), Cx(0), Cx(1), Cx(0)],
      [Cx(0), Cx(0), Cx(0), Cx(1)],
      [Cx(1), Cx(0), Cx(0), Cx(0)],
      [Cx(0), Cx(1), Cx(0), Cx(0)],
    ])
  })

  it('Polarizing beam splitter', () => {
    expect(Elements.polarizingBeamsplitter(0).isCloseToUnitary()).toBe(true)
    expect(Elements.polarizingBeamsplitter(0).isCloseToHermitian()).toBe(true)
    expect(Elements.incoherentLightOperator(Elements.polarizingBeamsplitter(0))).operatorCloseToNumbers([
      [Cx(0.5), Cx(0.5), Cx(0), Cx(0)],
      [Cx(0.5), Cx(0.5), Cx(0), Cx(0)],
      [Cx(0), Cx(0), Cx(0.5), Cx(0.5)],
      [Cx(0), Cx(0), Cx(0.5), Cx(0.5)],
    ])

    expect(Elements.polarizingBeamsplitter(90).isCloseToUnitary()).toBe(true)
    expect(Elements.polarizingBeamsplitter(90).isCloseToHermitian()).toBe(true)
    expect(Elements.incoherentLightOperator(Elements.polarizingBeamsplitter(90))).operatorCloseToNumbers([
      [Cx(0.5), Cx(0), Cx(0), Cx(0.5)],
      [Cx(0), Cx(0.5), Cx(0.5), Cx(0)],
      [Cx(0), Cx(0.5), Cx(0.5), Cx(0)],
      [Cx(0.5), Cx(0), Cx(0), Cx(0.5)],
    ])
  })

  it('Faraday rotator', () => {
    expect(Elements.faradayRotator(0).isCloseToUnitary()).toBe(false)
    expect(Elements.faradayRotator(0).isCloseToUnitaryOnSubspace()).toBe(true)
    expect(Elements.faradayRotator(0).isCloseToHermitian()).toBe(false)

    expect(Elements.faradayRotator(90).isCloseToUnitary()).toBe(false)
    expect(Elements.faradayRotator(90).isCloseToUnitaryOnSubspace()).toBe(true)
    expect(Elements.faradayRotator(90).isCloseToHermitian()).toBe(false)

    expect(Elements.faradayRotator(180).isCloseToUnitary()).toBe(false)
    expect(Elements.faradayRotator(180).isCloseToUnitaryOnSubspace()).toBe(true)
    expect(Elements.faradayRotator(180).isCloseToHermitian()).toBe(false)

    expect(Elements.faradayRotator(270).isCloseToUnitary()).toBe(false)
    expect(Elements.faradayRotator(270).isCloseToUnitaryOnSubspace()).toBe(true)
    expect(Elements.faradayRotator(270).isCloseToHermitian()).toBe(false)
  })

  it('Polarizers WE and NS', () => {
    expect(Elements.polarizerWE(0).isCloseToProjection()).toBe(true)
    expect(Elements.polarizerWE(45).isCloseToProjection()).toBe(true)
    expect(Elements.polarizerWE(90).isCloseToProjection()).toBe(true)
    expect(Elements.polarizerWE(135).isCloseToProjection()).toBe(true)

    expect(Elements.polarizerNS(0).isCloseToProjection()).toBe(true)
    expect(Elements.polarizerNS(45).isCloseToProjection()).toBe(true)
    expect(Elements.polarizerNS(90).isCloseToProjection()).toBe(true)
    expect(Elements.polarizerNS(135).isCloseToProjection()).toBe(true)
  })

  it('Quarter wave plates WE and NS', () => {
    expect(Elements.quarterWavePlateWE(0).isCloseToUnitaryOnSubspace()).toBe(true)
    expect(Elements.quarterWavePlateWE(45).isCloseToUnitaryOnSubspace()).toBe(true)
    expect(Elements.quarterWavePlateWE(90).isCloseToUnitaryOnSubspace()).toBe(true)
    expect(Elements.quarterWavePlateWE(135).isCloseToUnitaryOnSubspace()).toBe(true)

    expect(Elements.quarterWavePlateNS(0).isCloseToUnitaryOnSubspace()).toBe(true)
    expect(Elements.quarterWavePlateNS(45).isCloseToUnitaryOnSubspace()).toBe(true)
    expect(Elements.quarterWavePlateNS(90).isCloseToUnitaryOnSubspace()).toBe(true)
    expect(Elements.quarterWavePlateNS(135).isCloseToUnitaryOnSubspace()).toBe(true)
  })
})
