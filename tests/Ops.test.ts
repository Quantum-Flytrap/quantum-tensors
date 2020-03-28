import { Cx } from '../src/Complex'
import Dimension from '../src/Dimension'
import * as Ops from '../src/Ops'
import './customMatchers'

describe('Auxiliary operators', () => {
  const TAU = 2 * Math.PI

  it('polarization', () => {
    expect(Ops.polStates['D'].toKetString('cartesian')).toBe('(0.71 +0.00i) |H⟩ + (0.71 +0.00i) |V⟩')
    expect(Ops.polStates['Z']).toBe(undefined)
  })

  it('rotation', () => {
    expect(Ops.rotationMatrix(0, Dimension.qubit()).isCloseToIdentity()).toBe(true)
    expect(Ops.rotationMatrix(-13 * TAU, Dimension.qubit()).isCloseToIdentity()).toBe(true)
    const rot1 = Ops.rotationMatrix(1.3 * TAU, Dimension.qubit())
    const rot2 = Ops.rotationMatrix(2.4 * TAU, Dimension.qubit())
    const rot3 = Ops.rotationMatrix(0.7 * TAU, Dimension.qubit())
    expect(rot1.mulOp(rot2)).operatorCloseToNumbers(rot3.toDense())
  })

  it('projection', () => {
    expect(Ops.projectionMatrix(13, Dimension.qubit()).isCloseToProjection()).toBe(true)
    const proj1 = Ops.projectionMatrix(4.2, Dimension.qubit())
    const proj2 = Ops.projectionMatrix(4.2 + TAU / 2, Dimension.qubit())
    const proj3 = Ops.projectionMatrix(4.2 + TAU / 4, Dimension.qubit())
    expect(proj1.mulOp(proj2).isCloseToZero()).toBe(false)
    expect(proj1.mulOp(proj3).isCloseToZero()).toBe(true)
  })

  it('phase shift', () => {
    expect(Ops.phaseShiftForRealEigenvectors(4.2, 0.13, 1.37, Dimension.qubit()).isCloseToUnitary()).toBe(true)
    const shift1 = Ops.phaseShiftForRealEigenvectors(4.2, -0.15, 0.3, Dimension.qubit())
    const shift2 = Ops.phaseShiftForRealEigenvectors(4.2, 0.19, 0.4, Dimension.qubit())
    const shift3 = Ops.phaseShiftForRealEigenvectors(4.2, 0.04, 0.7, Dimension.qubit())
    expect(shift1.mulOp(shift2)).operatorCloseToNumbers(shift3.toDense())
  })

  it('reflection', () => {
    expect(Ops.reflectPhaseFromDenser().isCloseToUnitary()).toBe(true)
    expect(Ops.reflectPhaseFromDenser().isCloseToHermitian()).toBe(true)
    expect(Ops.reflectPhaseFromDenser().mulConstant(Cx(-1))).operatorCloseToNumbers(
      Ops.reflectPhaseFromLighter().toDense(),
    )
  })

  it('amplitude and intensity', () => {
    expect(Ops.amplitudeIntensity(1, 1.37).isCloseToUnitary()).toBe(true)
    expect(Ops.amplitudeIntensity(0.99, 1.37).isCloseToUnitary()).toBe(false)
    expect(Ops.amplitudeIntensity(0, 1.37).isCloseToZero()).toBe(true)
    expect(Ops.amplitudeIntensity(0.42, 0).isCloseToHermitian()).toBe(true)
    const amp1 = Ops.amplitudeIntensity(0.8, 1.4)
    const amp2 = Ops.amplitudeIntensity(0.3, -3.1)
    const amp3 = Ops.amplitudeIntensity(0.24, 0.3)
    expect(amp1.mulOp(amp2)).operatorCloseToNumbers(amp3.toDense())
  })

  it('reflections from a plane', () => {
    expect(Ops.reflectFromPlaneDirection(0).isCloseToUnitary()).toBe(false)
    expect(Ops.reflectFromPlaneDirection(0).isCloseToUnitaryOnSubspace()).toBe(true)
    expect(Ops.reflectFromPlaneDirection(45).isCloseToUnitary()).toBe(true)
    expect(Ops.reflectFromPlaneDirection(90).isCloseToUnitary()).toBe(false)
    expect(Ops.reflectFromPlaneDirection(90).isCloseToUnitaryOnSubspace()).toBe(true)
    expect(Ops.reflectFromPlaneDirection(135).isCloseToUnitary()).toBe(true)

    expect(Ops.reflectFromPlaneDirection(0).isCloseToHermitian()).toBe(true)
    expect(Ops.reflectFromPlaneDirection(45).isCloseToHermitian()).toBe(true)
    expect(Ops.reflectFromPlaneDirection(90).isCloseToHermitian()).toBe(true)
    expect(Ops.reflectFromPlaneDirection(135).isCloseToHermitian()).toBe(true)

    expect(() => Ops.reflectFromPlaneDirection(136)).toThrowError("Angle 136 % 180 isn't in the set [0, 45, 90, 135]")
  })

  it('beam splitter transmittion', () => {
    expect(Ops.beamsplitterTransmittionDirections(0).isCloseToProjection()).toBe(true)
    expect(Ops.beamsplitterTransmittionDirections(90).isCloseToProjection()).toBe(true)
    expect(Ops.beamsplitterTransmittionDirections(45).isCloseToIdentity()).toBe(true)
    expect(Ops.beamsplitterTransmittionDirections(135).isCloseToIdentity()).toBe(true)
    expect(() => Ops.beamsplitterTransmittionDirections(136)).toThrowError(
      "Angle 136 % 180 isn't in the set [0, 45, 90, 135]",
    )
  })

  it('diode transmittion', () => {
    expect(Ops.diodeForDirections(0).isCloseToProjection()).toBe(true)
    expect(Ops.diodeForDirections(90).isCloseToProjection()).toBe(true)
    expect(Ops.diodeForDirections(180).isCloseToProjection()).toBe(true)
    expect(Ops.diodeForDirections(270).isCloseToProjection()).toBe(true)
    expect(() => Ops.diodeForDirections(45)).toThrowError("Angle 45 % 360 isn't in the set [0, 90, 180, 270].")
  })
})
