import { Cx } from '../src/Complex'
import Dimension from '../src/Dimension'
import Vector from '../src/Vector'
import Entanglement from '../src/Entanglement'

describe('Entanglement', () => {

  it('Renyi 2 product state', () => {
    const vec0 = Vector.fromSparseCoordNames(
      [
        ['uu', Cx(1, 0)],
        ['du', Cx(0, 1)],
      ],
      [Dimension.spin(), Dimension.spin()],
    ).normalize()
    expect(Entanglement.renyi2(vec0, [0])).toBeCloseTo(0)
  })

  it('Renyi 2 entangled states', () => {
    const vec1 = Vector.fromSparseCoordNames(
      [
        ['uu', Cx(1, 0)],
        ['dd', Cx(0, 1)],
      ],
      [Dimension.spin(), Dimension.spin()],
    ).normalize()
    expect(Entanglement.renyi2(vec1, [0])).toBeCloseTo(1)

    const vec2 = Vector.fromSparseCoordNames(
      [
        ['>3', Cx(1, 0)],
        ['^0', Cx(0, 1)],
        ['<1', Cx(0, -1)],
      ],
      [Dimension.direction(), Dimension.position(5)],
    ).normalize()
    expect(Entanglement.renyi2(vec2, [0])).toBeCloseTo(Math.log2(3))

    const vec3 = Vector.fromSparseCoordNames(
      [
        ['>3', Cx(1, 0)],
        ['>0', Cx(0, 1)],
        ['<1', Cx(-1, 0)],
        ['<2', Cx(0, -1)],
      ],
      [Dimension.direction(), Dimension.position(5)],
    ).normalize()
    expect(Entanglement.renyi2(vec3, [0])).toBeCloseTo(1)

    const vec4 = Vector.fromSparseCoordNames(
      [
        ['>3u', Cx(1, 0)],
        ['>0u', Cx(0, 1)],
        ['<1d', Cx(-1, 0)],
        ['<2d', Cx(0, -1)],
      ],
      [Dimension.direction(), Dimension.position(5), Dimension.spin()],
    ).normalize()
    expect(Entanglement.renyi2(vec4, [0, 2])).toBeCloseTo(1)

    const vec5 = Vector.fromSparseCoordNames(
      [
        ['>3u', Cx(1, 0)],
        ['>0d', Cx(0, 1)],
        ['<1u', Cx(-1, 0)],
        ['<2d', Cx(0, -1)],
      ],
      [Dimension.direction(), Dimension.position(5), Dimension.spin()],
    ).normalize()
    expect(Entanglement.renyi2(vec5, [0, 2])).toBeCloseTo(2)
  })

})