import { Cx } from '../src/Complex'
import Dimension from '../src/Dimension'
import Basis from '../src/Basis'
import Vector from '../src/Vector'
import * as Elements from '../src/Elements'
import './customMatchers'

describe('Basis', () => {
  it('creates bases for polarization', () => {
    expect(Basis.polarization('HV').toString()).toBe(
      'Basis HV for dimension polarization\n|H⟩ = (1.00 +0.00i) |H⟩\n|V⟩ = (1.00 +0.00i) |V⟩',
    )
    expect(Basis.polarization('DA').toString()).toBe(
      'Basis DA for dimension polarization\n' +
        '|D⟩ = (0.71 +0.00i) |H⟩ + (0.71 +0.00i) |V⟩\n' +
        '|A⟩ = (-0.71 +0.00i) |H⟩ + (0.71 +0.00i) |V⟩',
    )
    expect(Basis.polarization('LR').toString()).toBe(
      'Basis LR for dimension polarization\n' +
        '|L⟩ = (0.71 +0.00i) |H⟩ + (0.00 +0.71i) |V⟩\n' +
        '|R⟩ = (0.00 +0.71i) |H⟩ + (0.71 +0.00i) |V⟩',
    )

    expect(() => Basis.polarization('VH')).toThrowError('')
  })

  it('creates bases for spin', () => {
    expect(Basis.spin('spin-z').toString()).toBe(
      'Basis ud for dimension spin\n|u⟩ = (1.00 +0.00i) |u⟩\n|d⟩ = (1.00 +0.00i) |d⟩',
    )
    expect(Basis.spin('spin-x').toString()).toBe(
      'Basis uxdx for dimension spin\n' +
        '|ux⟩ = (0.71 +0.00i) |u⟩ + (0.71 +0.00i) |d⟩\n' +
        '|dx⟩ = (-0.71 +0.00i) |u⟩ + (0.71 +0.00i) |d⟩',
    )
    expect(Basis.spin('spin-y').toString()).toBe(
      'Basis uydy for dimension spin\n' +
        '|uy⟩ = (0.71 +0.00i) |u⟩ + (0.00 +0.71i) |d⟩\n' +
        '|dy⟩ = (0.00 +0.71i) |u⟩ + (0.71 +0.00i) |d⟩',
    )

    expect(() => Basis.spin('du')).toThrowError('')
  })

  // tests for qubit

  it('polarization: changing to the same basis is identity', () => {
    const polHV = Basis.polarization('HV')
    const polDA = Basis.polarization('DA')
    const polLR = Basis.polarization('LR')

    expect(polHV.basisChangeUnitary(polHV).isCloseToIdentity()).toBe(true)
    expect(polDA.basisChangeUnitary(polDA).isCloseToIdentity()).toBe(true)
    expect(polLR.basisChangeUnitary(polLR).isCloseToIdentity()).toBe(true)
  })

  it('polarization: changing to another basis is unitary but not identity', () => {
    const polHV = Basis.polarization('HV')
    const polDA = Basis.polarization('DA')
    const polLR = Basis.polarization('LR')

    expect(polHV.basisChangeUnitary(polDA).isCloseToUnitary()).toBe(true)
    expect(polDA.basisChangeUnitary(polLR).isCloseToUnitary()).toBe(true)
    expect(polLR.basisChangeUnitary(polHV).isCloseToUnitary()).toBe(true)

    // I cannot use isCloseToUnitary, as the dimensions are different!
    const idValues = [
      [Cx(1), Cx(0)],
      [Cx(0), Cx(1)],
    ]
    expect(polHV.basisChangeUnitary(polDA)).not.operatorCloseToNumbers(idValues)
    expect(polDA.basisChangeUnitary(polLR)).not.operatorCloseToNumbers(idValues)
    expect(polLR.basisChangeUnitary(polHV)).not.operatorCloseToNumbers(idValues)
  })

  it('polarization: dag changes the order', () => {
    const polHV = Basis.polarization('HV')
    const polDA = Basis.polarization('DA')
    const polLR = Basis.polarization('LR')

    expect(polHV.basisChangeUnitary(polDA).dag()).operatorCloseToNumbers(polDA.basisChangeUnitary(polHV).toDense())
    expect(polDA.basisChangeUnitary(polLR).dag()).operatorCloseToNumbers(polLR.basisChangeUnitary(polDA).toDense())
    expect(polLR.basisChangeUnitary(polHV).dag()).operatorCloseToNumbers(polHV.basisChangeUnitary(polLR).toDense())
  })

  it('polarization: cyclic property', () => {
    const polHV = Basis.polarization('HV')
    const polDA = Basis.polarization('DA')
    const polLR = Basis.polarization('LR')

    const ab = polHV.basisChangeUnitary(polDA)
    const bc = polDA.basisChangeUnitary(polLR)
    const ca = polLR.basisChangeUnitary(polHV)

    const abbcca = ab.mulOp(bc).mulOp(ca)
    expect(abbcca.isCloseToIdentity()).toBe(true)
  })

  it('spin: changing to the same basis is identity', () => {
    const spinX = Basis.spin('spin-x')
    const spinY = Basis.spin('spin-y')
    const spinZ = Basis.spin('spin-z')

    expect(spinX.basisChangeUnitary(spinX).isCloseToIdentity()).toBe(true)
    expect(spinY.basisChangeUnitary(spinY).isCloseToIdentity()).toBe(true)
    expect(spinZ.basisChangeUnitary(spinZ).isCloseToIdentity()).toBe(true)
  })

  it('basis change unitary from dimension', () => {
    const polLR = Basis.polarization('LR')
    const toLRfromDA = polLR.basisChangeUnitaryFromDimension(Dimension.polarization(['D', 'A']))
    expect(toLRfromDA.dimensionsOut[0].name).toEqual('polarization')
    expect(toLRfromDA.dimensionsOut[0].coordString).toEqual('LR')
    expect(toLRfromDA.dimensionsIn[0].name).toEqual('polarization')
    expect(toLRfromDA.dimensionsIn[0].coordString).toEqual('DA')
  })

  it('change all dims for vector', () => {
    const vector = Vector.fromSparseCoordNames(
      [
        ['0u0HH', Cx(0.5)],
        ['0u0HV', Cx(0.5)],
        ['2u1VV', Cx(0.5)],
        ['2d1VV', Cx(0.0, -0.5)],
      ],
      [Dimension.position(5), Dimension.spin(), Dimension.qubit(), Dimension.polarization(), Dimension.polarization()],
    )

    const polHV = Basis.polarization('HV')
    const polDA = Basis.polarization('DA')
    const spinY = Basis.spin('spin-y')
    expect(polHV.changeAllDimsOfVector(vector).toKetString('cartesian')).toEqual(
      '(0.50 +0.00i) |0,u,0,H,H⟩ + (0.50 +0.00i) |0,u,0,H,V⟩ + (0.50 +0.00i) |2,u,1,V,V⟩ + (0.00 -0.50i) |2,d,1,V,V⟩',
    )
    expect(polDA.changeAllDimsOfVector(vector).toKetString('cartesian')).toEqual(
      '(0.50 +0.00i) |0,u,0,D,D⟩ + (-0.50 +0.00i) |0,u,0,A,D⟩ + (0.25 +0.00i) |2,u,1,D,D⟩ + (0.25 +0.00i) |2,u,1,D,A⟩' +
        ' + (0.25 +0.00i) |2,u,1,A,D⟩ + (0.25 +0.00i) |2,u,1,A,A⟩ + (0.00 -0.25i) |2,d,1,D,D⟩' +
        ' + (0.00 -0.25i) |2,d,1,D,A⟩ + (0.00 -0.25i) |2,d,1,A,D⟩ + (0.00 -0.25i) |2,d,1,A,A⟩',
    )
    expect(spinY.changeAllDimsOfVector(vector).toKetString('cartesian')).toEqual(
      '(0.35 +0.00i) |0,uy,0,H,H⟩ + (0.35 +0.00i) |0,uy,0,H,V⟩ + (0.00 -0.35i) |0,dy,0,H,H⟩' +
        ' + (0.00 -0.35i) |0,dy,0,H,V⟩ + (0.00 -0.71i) |2,dy,1,V,V⟩',
    )
  })

  it('polarization: change all dims for operator', () => {
    const faradayRotator = Elements.faradayRotator(90)
    const polLR = Basis.polarization('LR')
    const rotatorRotated = polLR.changeAllDimsOfOperator(faradayRotator)
    expect(rotatorRotated.dimensionsOut[0].name).toEqual('direction')
    expect(rotatorRotated.dimensionsOut[1].name).toEqual('polarization')
    expect(rotatorRotated.dimensionsOut[1].coordString).toEqual('LR')
    expect(rotatorRotated.dimensionsIn[0].name).toEqual('direction')
    expect(rotatorRotated.dimensionsIn[1].name).toEqual('polarization')
    expect(rotatorRotated.dimensionsIn[1].coordString).toEqual('LR')
    expect(rotatorRotated.toString('polarTau', 2, ' + ', false)).toEqual(
      '1.00 exp(0.88τi) |^,L⟩⟨^,L| + 1.00 exp(0.13τi) |^,R⟩⟨^,R|' +
        ' + 1.00 exp(0.13τi) |v,L⟩⟨v,L| + 1.00 exp(0.88τi) |v,R⟩⟨v,R|',
    )
  })

  it('photon: singlet state same all bases', () => {
    const singlet = Vector.fromSparseCoordNames(
      [
        ['HV', Cx(Math.SQRT1_2)],
        ['VH', Cx(-Math.SQRT1_2)],
      ],
      [Dimension.polarization(), Dimension.polarization()],
    )

    expect(singlet.toBasisAll('polarization', 'DA').toKetString('cartesian')).toEqual(
      '(0.71 +0.00i) |D,A⟩ + (-0.71 +0.00i) |A,D⟩',
    )
    expect(singlet.toBasisAll('polarization', 'LR').toKetString('cartesian')).toEqual(
      '(0.71 +0.00i) |L,R⟩ + (-0.71 +0.00i) |R,L⟩',
    )
  })

  it('spin singlet state same all bases', () => {
    const singlet = Vector.fromSparseCoordNames(
      [
        ['ud', Cx(Math.SQRT1_2)],
        ['du', Cx(-Math.SQRT1_2)],
      ],
      [Dimension.spin(), Dimension.spin()],
    )

    expect(singlet.toBasisAll('spin', 'spin-y').toKetString('cartesian')).toEqual(
      '(0.71 +0.00i) |uy,dy⟩ + (-0.71 +0.00i) |dy,uy⟩',
    )
    expect(singlet.toBasisAll('spin', 'spin-x').toKetString('cartesian')).toEqual(
      '(0.71 +0.00i) |ux,dx⟩ + (-0.71 +0.00i) |dx,ux⟩',
    )
  })
})
