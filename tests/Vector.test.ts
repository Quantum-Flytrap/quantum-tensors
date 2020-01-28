import { Cx } from '../src/Complex'
import Dimension from '../src/Dimension'
import VectorEntry from '../src/VectorEntry'
import Vector from '../src/Vector'

// Vector tests
describe('Sparse Complex Vector', () => {
  const dimensions = [Dimension.spin(), Dimension.position(2)]
  const complex0 = Cx(0, 0)
  const complex1 = Cx(1, -1)
  const complex2 = Cx(2, -2)
  const complex3 = Cx(3, -3)
  const entry1 = new VectorEntry([0], complex1)
  const entry2 = new VectorEntry([1], complex2)
  const entry3 = new VectorEntry([2], complex3)
  const entries = [entry1, entry2, entry3]
  const vector = new Vector(entries, dimensions)
  // it is incorrect, and the file requires complete rewrite

  xit('should create a vector from entries and dimensions', () => {
    const dimensions = [Dimension.spin(), Dimension.direction(), Dimension.spin()]
    const entry1 = new VectorEntry([2], complex1)
    const entry2 = new VectorEntry([4], complex2)
    const entry3 = new VectorEntry([6], complex3)
    const vector = new Vector([entry1, entry2, entry3], dimensions)
    expect(vector.toString()).toEqual('')
  })

  // Test vector getters
  it('should give vector getter properties', () => {
    expect(vector.size).toEqual([2, 2])
    expect(vector.totalSize).toEqual(4)
    expect(vector.names).toEqual(['spin', 'x'])
    expect(vector.coordNames).toEqual([
      ['u', 'd'],
      ['0', '1'],
    ])
  })

  // Test export to dense array
  it('should convert a vector to its dense representation', () => {
    expect(vector.toDense()).toEqual([[complex1], [complex2], [complex3], [complex0]])
  })

  // Test export to dense array
  it('should conjugate a vector', () => {
    const complex0conj = Cx(0, 0)
    const complex1conj = Cx(1, 1)
    const complex2conj = Cx(2, 2)
    const complex3conj = Cx(3, 3)
    expect(vector.conj().toDense()).toEqual([[complex1conj], [complex2conj], [complex3conj], [complex0conj]])
  })

  // TODO: permutations

  // Norm squared
  it('should compute the norm squared of a vector', () => {
    expect(vector.normSquared()).toEqual(28)
  })

  // Normalize vector
  it('should normalize a vector', () => {
    expect(vector.normalize().toDense()).toEqual([[Cx(28, -28)], [Cx(56, -56)], [Cx(84, -84)], [Cx(0, 0)]])
  })

  // Add
  it('should add two vectors', () => {
    const entries1 = [entry1, entry2, entry3]
    const entries2 = [entry1, entry2, entry3]
    const vector1 = new Vector(entries1, dimensions)
    const vector2 = new Vector(entries2, dimensions)
    expect(vector1.add(vector2).toDense()).toEqual([[Cx(2, -2)], [Cx(4, -4)], [Cx(6, -6)], [Cx(0, 0)]])
  })

  // Scale
  it('should scale a vector with a complex scalar', () => {
    const scalar1 = Cx(1, 0)
    expect(vector.mulConstant(scalar1).toDense()).toEqual(vector.toDense())
    const scalar2 = Cx(-1, 0)
    expect(vector.mulConstant(scalar2).toDense()).toEqual([[Cx(-1, 1)], [Cx(-2, 2)], [Cx(-3, 3)], [Cx(0, 0)]])
  })

  // Substract
  it('should substract a vector from another one', () => {
    const entries1 = [entry1, entry2, entry3]
    const vector1 = new Vector(entries1, dimensions)
    const entries2 = [entry1, entry2, entry3]
    const vector2 = new Vector(entries2, dimensions)
    expect(vector1.sub(vector2).toDense()).toEqual([[Cx(0, 0)], [Cx(0, 0)], [Cx(0, 0)], [Cx(0, 0)]])
  })

  // Dot product
  it('should compute the dot product of two vectors', () => {
    const entries1 = [entry1, entry2, entry3]
    const vector1 = new Vector(entries1, dimensions)
    const entries2 = [entry1, entry2, entry3]
    const vector2 = new Vector(entries2, dimensions)
    expect(vector1.dot(vector2)).toEqual(Cx(0, -28))
  })

  // Inner product
  it('should compute the inner product of two vectors', () => {
    const entries1 = [entry1, entry2, entry3]
    const vector1 = new Vector(entries1, dimensions)
    const entries2 = [entry1, entry2, entry3]
    const vector2 = new Vector(entries2, dimensions)
    expect(vector1.inner(vector2)).toEqual(Cx(28, 0))
  })

  // Outer product
  it('should compute the outer product of two vectors', () => {
    const entries1 = [entry1, entry2, entry3]
    const vector1 = new Vector(entries1, dimensions)
    const entries2 = [entry1, entry2, entry3]
    const vector2 = new Vector(entries2, dimensions)
    expect(vector1.outer(vector2).toDense()).toEqual([
      [Cx(0, -6)],
      [Cx(0, -12)],
      [Cx(0, -18)],
      [Cx(0, 0)],
      [Cx(0, 0)],
      [Cx(0, 0)],
      [Cx(0, 0)],
      [Cx(0, 0)],
      [Cx(0, 0)],
      [Cx(0, 0)],
      [Cx(0, 0)],
      [Cx(0, 0)],
      [Cx(0, 0)],
      [Cx(0, 0)],
      [Cx(0, 0)],
      [Cx(0, 0)],
    ])
  })
})
