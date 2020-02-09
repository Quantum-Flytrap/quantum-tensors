import { Cx } from '../src/Complex'
import Dimension from '../src/Dimension'
import VectorEntry from '../src/VectorEntry'
import Vector from '../src/Vector'

describe('Sparse Complex Vector', () => {
  const vector0 = Vector.fromArray([Cx(0), Cx(0), Cx(0), Cx(0)], [Dimension.spin(), Dimension.position(2)])

  const vector = Vector.fromArray(
    [Cx(1, -1), Cx(2, -2), Cx(3, -3), Cx(0, 0)],
    [Dimension.spin(), Dimension.position(2)],
  )

  const vector2 = Vector.fromArray(
    [Cx(0, 0), Cx(-2, 1), Cx(0, 0.5), Cx(0, 0)],
    [Dimension.spin(), Dimension.position(2)],
  )

  it('throw error for fromArray of wrong size', () => {
    const array = [Cx(1, -1), Cx(2, -2), Cx(3, -3)]
    const dimensions = [Dimension.spin(), Dimension.position(2)]
    expect(() => Vector.fromArray(array, dimensions)).toThrowError('Dimension inconsistency: entry count 3 != total: 4')
  })

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

  it('creates vector from sparse entries', () => {
    const vector = Vector.fromSparseCoordNames(
      [
        ['uH', Cx(1)],
        ['dV', Cx(-1)],
      ],
      [Dimension.spin(), Dimension.polarization()],
    )
    expect(vector.toDense()).toEqual([Cx(1), Cx(0), Cx(0), Cx(-1)])
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
    expect(() => vector.permute([0, 1, 2])).toThrowError('0,1,2 is not a valid permutation for 2 dimensions.')
    expect(() => vector.permute([0, 0])).toThrowError('0,0 is not a valid permutation for 2 dimensions.')
    expect(() => vector.permute([2, 0])).toThrowError('2,0 is not a valid permutation for 2 dimensions.')
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
    expect(() => vector0.normalize()).toThrowError('Cannot normalize a zero-length vector!')
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

  it('creates a vector copy', () => {
    const vectorCopy = vector.copy()
    expect(vectorCopy.toDense()).toEqual(vector.toDense())
    vectorCopy.entries[0].value.re = 999
    expect(vector.entries[0].value.re).toEqual(1)
    vectorCopy.dimensions[0].name = 'qqq'
    expect(vector.dimensions[0].name).toEqual('spin')
  })

  it('creates string', () => {
    // eslint-disable-next-line prettier/prettier, max-len
    expect(vector.toString()).toEqual('Vector with 3 entries of max size [2,2] with dimensions [spin,x]\n(1.00 -1.00i) |u,0⟩ + (2.00 -2.00i) |d,0⟩ + (3.00 -3.00i) |u,1⟩\n')
    expect(vector.toString('polarTau', 3, ' ', false)).toEqual(
      '1.414 exp(0.875τi) |u,0⟩ 2.828 exp(0.875τi) |d,0⟩ 4.243 exp(0.875τi) |u,1⟩',
    )
  })

  it('creates siplified ket string', () => {
    expect(vector.toKetString()).toEqual('1.41 exp(0.88τi) |u,0⟩ + 2.83 exp(0.88τi) |d,0⟩ + 4.24 exp(0.88τi) |u,1⟩')
  })

  it('creates index values output', () => {
    expect(vector.toIndexValues()).toEqual([
      { i: 0, v: Cx(1, -1) },
      { i: 1, v: Cx(2, -2) },
      { i: 2, v: Cx(3, -3) },
    ])
  })

  it('creates vector with a single entry', () => {
    const dims = [Dimension.polarization(), Dimension.spin()]
    const vec = Vector.indicator(dims, 'Hd')
    expect(vec.entries.length).toEqual(1)
    expect(vec.entries[0].value).toEqual(Cx(1))
    expect(() => Vector.indicator(dims, 'H')).toThrowError('')
    expect(() => Vector.indicator(dims, 'dH')).toThrowError('')
  })

  it('does outer product for many entires', () => {
    const outer = Vector.outer([
      Vector.fromArray([Cx(1), Cx(-1)], [Dimension.spin()]),
      Vector.fromArray([Cx(0), Cx(0, 1), Cx(0), Cx(0)], [Dimension.direction()]),
      Vector.fromArray([Cx(1), Cx(0), Cx(2)], [Dimension.position(3)]),
    ])
    expect(outer.size).toEqual([2, 4, 3])
    // eslint-disable-next-line prettier/prettier, max-len
    expect(outer.toString()).toEqual('Vector with 4 entries of max size [2,4,3] with dimensions [spin,direction,x]\n(0.00 +1.00i) |u,^,0⟩ + (0.00 +2.00i) |u,^,2⟩ + (0.00 -1.00i) |d,^,0⟩ + (0.00 -2.00i) |d,^,2⟩\n')
  })

  it('does sum product for many entires', () => {
    const sum = Vector.add([
      Vector.fromArray([Cx(1), Cx(-1)], [Dimension.spin()]),
      Vector.fromArray([Cx(3, 2), Cx(1, 1)], [Dimension.spin()]),
      Vector.fromArray([Cx(1), Cx(0)], [Dimension.spin()]),
    ])
    expect(sum.toDense()).toEqual([Cx(5, 2), Cx(0, 1)])
  })
})
