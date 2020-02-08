import { Cx } from '../src/Complex'
import Dimension from '../src/Dimension'
import VectorEntry from '../src/VectorEntry'
import Vector from '../src/Vector'

describe('Sparse Complex Vector', () => {
  const vector = Vector.fromArray(
    [Cx(1, -1), Cx(2, -2), Cx(3, -3), Cx(0, 0)],
    [Dimension.spin(), Dimension.position(2)],
  )

  const vector2 = Vector.fromArray(
    [Cx(0, 0), Cx(-2, 1), Cx(0, 0.5), Cx(0, 0)],
    [Dimension.spin(), Dimension.position(2)],
  )

  it('should create a vector from entries and dimensions', () => {
    const dimensions = [Dimension.spin(), Dimension.direction()]
    const entry1 = new VectorEntry([0, 3], Cx(1, -1))
    const entry2 = new VectorEntry([1, 0], Cx(2, -2))
    const entry3 = new VectorEntry([1, 3], Cx(3, -3))
    const vector = new Vector([entry1, entry2, entry3], dimensions)
    expect(vector.entries.length).toEqual(3)
  })

  it('should not create a vector if dims are incompatible', () => {
    const dimensions = [Dimension.spin(), Dimension.direction(), Dimension.polarization()]
    const entry1 = new VectorEntry([0, 3, 1], Cx(1, -1))
    const entry2 = new VectorEntry([1, 1, 2], Cx(2, -2))
    const entry3 = new VectorEntry([1, 3, 0], Cx(3, -3))
    expect(() => new Vector([entry1, entry2, entry3], dimensions)).toThrowError(
      'Coordinates [1,1,2] incompatible with sizes [2,4,2].',
    )
  })

  it('should give vector getter properties', () => {
    expect(vector.size).toEqual([2, 2])
    expect(vector.totalSize).toEqual(4)
    expect(vector.names).toEqual(['spin', 'x'])
    expect(vector.coordNames).toEqual([
      ['u', 'd'],
      ['0', '1'],
    ])
  })

  it('should convert a vector to its dense representation', () => {
    expect(vector.toDense()).toEqual([Cx(1, -1), Cx(2, -2), Cx(3, -3), Cx(0, 0)])
  })

  it('should conjugate a vector', () => {
    expect(vector.conj().toDense()).toEqual([Cx(1, 1), Cx(2, 2), Cx(3, 3), Cx(0, 0)])
  })

  it('should permute a vector', () => {
    const permuted = vector.permute([1, 0])
    expect(permuted.names).toEqual(['x', 'spin'])
    expect(permuted.toDense()).toEqual([Cx(1, -1), Cx(3, -3), Cx(2, -2), Cx(0, 0)])
  })

  it('should compute the norm squared of a vector', () => {
    expect(vector.normSquared()).toEqual(28)
  })

  it('should normalize a vector', () => {
    const vector10 = Vector.fromArray(
      [Cx(1, 0), Cx(-3, -9), Cx(0, -3), Cx(0, 0)],
      [Dimension.spin(), Dimension.position(2)],
    )
    // since 0.30000000000000004 vs 0.3, we cannot just toEqual
    // see https://github.com/facebook/jest/issues/4058
    const res = vector10.normalize().toDense()
    expect(res[1].re).toBeCloseTo(-0.3)
    expect(res[2].im).toBeCloseTo(-0.3)
  })

  it('should add two vectors', () => {
    expect(vector.add(vector2).toDense()).toEqual([Cx(1, -1), Cx(0, -1), Cx(3, -2.5), Cx(0, 0)])
  })

  it('should scale a vector with a complex scalar', () => {
    const scalar1 = Cx(1, 0)
    expect(vector.mulConstant(scalar1).toDense()).toEqual(vector.toDense())
    const scalar2 = Cx(-1, 0)
    expect(vector.mulConstant(scalar2).toDense()).toEqual([Cx(-1, 1), Cx(-2, 2), Cx(-3, 3), Cx(0, 0)])
    const scalar3 = Cx(0, 1)
    expect(vector.mulConstant(scalar3).toDense()).toEqual([Cx(1, 1), Cx(2, 2), Cx(3, 3), Cx(0, 0)])
  })

  it('should substract a vector from another one', () => {
    expect(vector.sub(vector).toDense()).toEqual([Cx(0, 0), Cx(0, 0), Cx(0, 0), Cx(0, 0)])
    expect(vector.sub(vector2).toDense()).toEqual([Cx(1, -1), Cx(4, -3), Cx(3, -3.5), Cx(0, 0)])
  })

  it('should compute the dot product of two vectors', () => {
    expect(vector.dot(vector)).toEqual(Cx(0, -28))
    expect(vector.dot(vector2)).toEqual(Cx(-0.5, 7.5))
  })

  it('should compute the inner product of two vectors', () => {
    expect(vector.inner(vector)).toEqual(Cx(28, 0))
    expect(vector.inner(vector2)).toEqual(Cx(-7.5, -0.5))
  })

  it('should compute the outer product of two vectors', () => {
    expect(vector.outer(vector2).toDense()).toEqual([
      Cx(0),
      Cx(0),
      Cx(0),
      Cx(0),
      Cx(-1, 3),
      Cx(-2, 6),
      Cx(-3, 9),
      Cx(0),
      Cx(0.5, 0.5),
      Cx(1, 1),
      Cx(1.5, 1.5),
      Cx(0),
      Cx(0),
      Cx(0),
      Cx(0),
      Cx(0),
    ])
  })
})
