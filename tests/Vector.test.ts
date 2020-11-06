import { Cx } from '../src/Complex'
import Dimension from '../src/Dimension'
import VectorEntry from '../src/VectorEntry'
import Vector from '../src/Vector'
import './customMatchers'

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
        ['H', Cx(1.23)],
        ['V', Cx(-1, -1)],
      ],
      [Dimension.polarization()],
    )
    expect(vector.toKetString('cartesian')).toBe('(1.23 +0.00i) |H⟩ + (-1.00 -1.00i) |V⟩')

    const vector2 = Vector.fromSparseCoordNames(
      [
        ['uH', Cx(1)],
        ['dV', Cx(-1)],
      ],
      [Dimension.spin(), Dimension.polarization()],
    )
    expect(vector2).vectorCloseToNumbers([Cx(1), Cx(0), Cx(0), Cx(-1)])
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
    expect(vector10.normalize()).vectorCloseToNumbers([Cx(0.1, 0), Cx(-0.3, -0.9), Cx(0, -0.3), Cx(0, 0)])
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

  it('map values', () => {
    const vec = Vector.fromSparseCoordNames(
      [
        ['dH', Cx(0, 2)],
        ['uH', Cx(-1, -1)],
        ['dV', Cx(0.5, 2.5)],
      ],
      [Dimension.spin(), Dimension.polarization()],
    )

    const vecAbs2 = Vector.fromSparseCoordNames(
      [
        ['dH', Cx(4)],
        ['uH', Cx(2)],
        ['dV', Cx(6.5)],
      ],
      [Dimension.spin(), Dimension.polarization()],
    )

    expect(vec.mapValues((z) => z.mul(z.conj()))).vectorCloseTo(vecAbs2)
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

  it('partial dot and inner', () => {
    const vector = Vector.fromSparseCoordNames(
      [
        ['dH0', Cx(1)],
        ['dV1', Cx(-1)],
        ['dV2', Cx(0, 1)],
      ],
      [Dimension.spin(), Dimension.polarization(), Dimension.position(3)],
    )

    const vcs1 = vector.toGroupedByCoords([2])
    expect(vcs1.length).toEqual(2)
    expect(vcs1[0].coord.length).toEqual(2)
    expect(vcs1[0].vector.size).toEqual([3])

    const vcs2 = vector.toGroupedByCoords([0])
    expect(vcs2.length).toEqual(3)
    expect(vcs2[0].coord.length).toEqual(2)
    expect(vcs2[0].vector.size).toEqual([2])

    const vcs3 = vector.toGroupedByCoords([1, 2])
    expect(vcs3.length).toEqual(1)
    expect(vcs3[0].coord.length).toEqual(1)
    expect(vcs3[0].vector.size).toEqual([2, 3])
    expect(vcs3[0].vector.toKetString('cartesian')).toEqual(
      '(1.00 +0.00i) |H,0⟩ + (-1.00 +0.00i) |V,1⟩ + (0.00 +1.00i) |V,2⟩',
    )
  })

  it('partial dot and inner', () => {
    const vector = Vector.fromSparseCoordNames(
      [
        ['dH0', Cx(1)],
        ['dV1', Cx(-1)],
        ['dV2', Cx(0, 1)],
      ],
      [Dimension.spin(), Dimension.polarization(), Dimension.position(3)],
    )
    const smallVector1 = Vector.fromSparseCoordNames(
      [
        ['0', Cx(10)],
        ['2', Cx(0, 3)],
      ],
      [Dimension.position(3)],
    )
    const res1 = Vector.fromSparseCoordNames(
      [
        ['dH', Cx(10)],
        ['dV', Cx(-3)],
      ],
      [Dimension.spin(), Dimension.polarization()],
    )
    expect(smallVector1.dotPartial([2], vector).toKetString('cartesian')).toEqual(
      '(10.00 +0.00i) |d,H⟩ + (-3.00 +0.00i) |d,V⟩',
    )
    expect(smallVector1.dotPartial([2], vector)).vectorCloseTo(res1)

    expect(smallVector1.innerPartial([2], vector).toKetString('cartesian')).toEqual(
      '(10.00 +0.00i) |d,H⟩ + (3.00 +0.00i) |d,V⟩',
    )

    const smallVector2 = Vector.fromSparseCoordNames([['H', Cx(0, 1)]], [Dimension.polarization()])
    const res2inner = Vector.fromSparseCoordNames([['d0', Cx(0, -1)]], [Dimension.spin(), Dimension.position(3)])
    expect(smallVector2.innerPartial([1], vector).toString()).toEqual(
      'Vector with 1 entries of max size [2,3] with dimensions [spin,x]\n(0.00 -1.00i) |d,0⟩\n',
    )
    expect(smallVector2.innerPartial([1], vector)).vectorCloseToNumbers(res2inner.toDense())

    const smallVector3 = Vector.fromSparseCoordNames([['u', Cx(0, 1)]], [Dimension.spin()])
    expect(smallVector3.innerPartial([0], vector).normSquared()).toBeCloseTo(0)

    const smallVector4 = Vector.fromSparseCoordNames(
      [
        ['d1', Cx(0, 1)],
        ['d2', Cx(0, 1)],
      ],
      [Dimension.spin(), Dimension.position(3)],
    )
    expect(smallVector4.innerPartial([0, 2], vector).toString()).toEqual(
      'Vector with 1 entries of max size [2] with dimensions [polarization]\n(1.00 +1.00i) |V⟩\n',
    )
  })

  it('should compute the outer product of two vectors', () => {
    const v1 = Vector.fromArray([Cx(0), Cx(1), Cx(2), Cx(3)], [Dimension.spin(), Dimension.position(2)])
    const v2 = Vector.fromArray([Cx(1), Cx(0, 1), Cx(-1), Cx(0, -1)], [Dimension.spin(), Dimension.position(2)])
    expect(v1.outer(v2)).vectorCloseToNumbers([
      Cx(0),
      Cx(0),
      Cx(0),
      Cx(0),
      Cx(1, 0),
      Cx(0, 1),
      Cx(-1, 0),
      Cx(0, -1),
      Cx(2, 0),
      Cx(0, 2),
      Cx(-2, 0),
      Cx(0, -2),
      Cx(3, 0),
      Cx(0, 3),
      Cx(-3, 0),
      Cx(0, -3),
    ])
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

    expect(vector.toBasisAll('polarization', 'HV').toKetString('cartesian')).toEqual(
      '(0.50 +0.00i) |0,u,0,H,H⟩ + (0.50 +0.00i) |0,u,0,H,V⟩ + (0.50 +0.00i) |2,u,1,V,V⟩ + (0.00 -0.50i) |2,d,1,V,V⟩',
    )
    expect(vector.toBasisAll('polarization', 'DA').toKetString('cartesian')).toEqual(
      '(0.50 +0.00i) |0,u,0,D,D⟩ + (-0.50 +0.00i) |0,u,0,A,D⟩ + (0.25 +0.00i) |2,u,1,D,D⟩ + (0.25 +0.00i) |2,u,1,D,A⟩' +
        ' + (0.25 +0.00i) |2,u,1,A,D⟩ + (0.25 +0.00i) |2,u,1,A,A⟩ + (0.00 -0.25i) |2,d,1,D,D⟩' +
        ' + (0.00 -0.25i) |2,d,1,D,A⟩ + (0.00 -0.25i) |2,d,1,A,D⟩ + (0.00 -0.25i) |2,d,1,A,A⟩',
    )
    expect(vector.toBasisAll('spin', 'spin-y').toKetString('cartesian')).toEqual(
      '(0.35 +0.00i) |0,uy,0,H,H⟩ + (0.35 +0.00i) |0,uy,0,H,V⟩ + (0.00 -0.35i) |0,dy,0,H,H⟩' +
        ' + (0.00 -0.35i) |0,dy,0,H,V⟩ + (0.00 -0.71i) |2,dy,1,V,V⟩',
    )
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
    expect(vector.toString()).toEqual('Vector with 3 entries of max size [2,2] with dimensions [spin,x]\n(1.00 -1.00i) |u,0⟩ + (2.00 -2.00i) |u,1⟩ + (3.00 -3.00i) |d,0⟩\n')
    expect(vector.toString('polarTau', 3, ' ', false)).toEqual(
      '1.414 exp(0.875τi) |u,0⟩ 2.828 exp(0.875τi) |u,1⟩ 4.243 exp(0.875τi) |d,0⟩',
    )
  })

  it('creates simplified ket string', () => {
    expect(vector.toKetString()).toEqual('1.41 exp(0.88τi) |u,0⟩ + 2.83 exp(0.88τi) |u,1⟩ + 4.24 exp(0.88τi) |d,0⟩')
  })

  it('creates index values output', () => {
    expect(vector.toIndexValues()).toEqual([
      { i: 0, v: Cx(1, -1) },
      { i: 1, v: Cx(2, -2) },
      { i: 2, v: Cx(3, -3) },
    ])
  })

  it('ket components output', () => {
    const vector = Vector.fromSparseCoordNames(
      [
        ['dH0', Cx(1)],
        ['dV1', Cx(-1)],
        ['dV2', Cx(0, 1)],
      ],
      [Dimension.spin(), Dimension.polarization(), Dimension.position(3)],
    ).toBasisAll('spin', 'spin-x')
    const ketComponents = vector.toKetComponents()
    expect(ketComponents.length).toBe(6)
    expect(ketComponents[0].amplitude.re).toBeCloseTo(Math.SQRT1_2)
    expect(ketComponents[0].coordStrs).toEqual(['ux', 'H', '0'])
  })

  it('ket components output - keeping order', () => {
    const vector = Vector.fromSparseCoordNames(
      [
        ['dV1', Cx(-1)],
        ['dH0', Cx(1)],
        ['dV2', Cx(0, 1)],
      ],
      [Dimension.spin(), Dimension.polarization(), Dimension.position(3)],
    ).toBasisAll('spin', 'spin-x')
    const ketComponents = vector.toKetComponents()
    expect(ketComponents[0].amplitude.re).toBeCloseTo(Math.SQRT1_2)
    expect(ketComponents[0].coordStrs).toEqual(['ux', 'H', '0'])
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

  it('vector of ones', () => {
    const ones = Vector.ones([Dimension.spin(), Dimension.direction()])
    expect(ones.toKetString()).toEqual(
      // eslint-disable-next-line max-len
      '1.00 exp(0.00τi) |u,>⟩ + 1.00 exp(0.00τi) |u,^⟩ + 1.00 exp(0.00τi) |u,<⟩ + 1.00 exp(0.00τi) |u,v⟩ + 1.00 exp(0.00τi) |d,>⟩ + 1.00 exp(0.00τi) |d,^⟩ + 1.00 exp(0.00τi) |d,<⟩ + 1.00 exp(0.00τi) |d,v⟩',
    )
  })

  it('random, dense vector', () => {
    const rand = Vector.random([Dimension.spin(), Dimension.polarization()])
    // expect(rand.toKetString()).toEqual('')
    // e.g.: '0.57 exp(0.66τi) |u,H⟩ + 0.16 exp(0.17τi) |u,V⟩ + 0.24 exp(0.02τi) |d,H⟩ + 0.77 exp(0.49τi) |d,V⟩'
    expect(rand.entries.length).toEqual(4)
  })

  it('random vector from a subspace', () => {
    const vector = Vector.fromSparseCoordNames(
      [
        ['dV1', Cx(-1)],
        ['dH0', Cx(1)],
        ['dV2', Cx(0, 1)],
      ],
      [Dimension.spin(), Dimension.polarization(), Dimension.position(3)],
    )
    const rand = vector.randomOnSubspace()
    // expect(rand.toKetString()).toEqual('')
    // e.g.: '0.62 exp(0.23τi) |d,H,0⟩ + 0.58 exp(0.69τi) |d,V,1⟩ + 0.53 exp(0.93τi) |d,V,2⟩'
    expect(rand.entries.length).toEqual(3)
  })

  it('random vector from a partial subspace', () => {
    const vector = Vector.fromSparseCoordNames(
      [
        ['dV1', Cx(-1)],
        ['dH0', Cx(1)],
        ['dV2', Cx(0, 1)],
      ],
      [Dimension.spin(), Dimension.polarization(), Dimension.position(3)],
    )
    const rand0 = vector.randomOnPartialSubspace([0])
    // expect(rand0.toKetString()).toEqual('')
    // e.g.: '1.00 exp(0.12τi) |d⟩'
    expect(rand0.entries.length).toEqual(1)

    const rand2 = vector.randomOnPartialSubspace([2])
    // expect(rand2.toKetString()).toEqual('')
    // e.g.: '0.61 exp(0.69τi) |0⟩ + 0.10 exp(0.12τi) |1⟩ + 0.79 exp(0.10τi) |2⟩'
    expect(rand2.entries.length).toEqual(3)

    const rand12 = vector.randomOnPartialSubspace([1, 2])
    //expect(rand12.toKetString()).toEqual('')
    // e.g.: '0.44 exp(0.65τi) |H,0⟩ + 0.68 exp(0.49τi) |V,1⟩ + 0.59 exp(0.79τi) |V,2⟩'
    expect(rand12.entries.length).toEqual(3)

    const rand01 = vector.randomOnPartialSubspace([0, 1])
    // expect(rand01.toKetString()).toEqual('')
    // e.g.: '0.46 exp(0.67τi) |d,H⟩ + 0.89 exp(0.68τi) |d,V⟩'
    expect(rand01.entries.length).toEqual(2)
  })
})
