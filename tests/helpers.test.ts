import { coordsFromIndex, coordsToIndex, isPermutation } from '../src/helpers'

describe('coordsFromIndex', () => {
  it('should map zero to zeros', () => {
    expect(coordsFromIndex(0, [2])).toEqual([0])
    expect(coordsFromIndex(0, [3, 3])).toEqual([0, 0])
    expect(coordsFromIndex(0, [5, 4, 3])).toEqual([0, 0, 0])
  })
  it('should work with binary', () => {
    const sizes = [2, 2, 2]
    expect(coordsFromIndex(0, sizes)).toEqual([0, 0, 0])
    expect(coordsFromIndex(1, sizes)).toEqual([1, 0, 0])
    expect(coordsFromIndex(2, sizes)).toEqual([0, 1, 0])
    expect(coordsFromIndex(3, sizes)).toEqual([1, 1, 0])
    expect(coordsFromIndex(4, sizes)).toEqual([0, 0, 1])
    expect(coordsFromIndex(5, sizes)).toEqual([1, 0, 1])
    expect(coordsFromIndex(6, sizes)).toEqual([0, 1, 1])
    expect(coordsFromIndex(7, sizes)).toEqual([1, 1, 1])
  })
  it('should with other cases', () => {
    expect(coordsFromIndex(7, [3, 2, 5])).toEqual([1, 0, 1])
    expect(coordsFromIndex(7, [3, 2, 5, 9])).toEqual([1, 0, 1, 0])
    expect(coordsFromIndex(23, [5, 3, 4, 7])).toEqual([3, 1, 1, 0])
  })
})

describe('coordsToIndex', () => {
  it('should map zero to zeros', () => {
    expect(coordsToIndex([0], [2])).toEqual(0)
    expect(coordsToIndex([0, 0], [3, 3])).toEqual(0)
    expect(coordsToIndex([0, 0, 0], [5, 4, 3])).toEqual(0)
  })
  it('should work with binary', () => {
    const sizes = [2, 2, 2]
    expect(coordsToIndex([0, 0, 0], sizes)).toEqual(0)
    expect(coordsToIndex([1, 0, 0], sizes)).toEqual(1)
    expect(coordsToIndex([0, 1, 0], sizes)).toEqual(2)
    expect(coordsToIndex([1, 1, 0], sizes)).toEqual(3)
    expect(coordsToIndex([0, 0, 1], sizes)).toEqual(4)
    expect(coordsToIndex([1, 0, 1], sizes)).toEqual(5)
    expect(coordsToIndex([0, 1, 1], sizes)).toEqual(6)
    expect(coordsToIndex([1, 1, 1], sizes)).toEqual(7)
  })
  it('should with other cases', () => {
    expect(coordsToIndex([1, 0, 1], [3, 2, 5])).toEqual(7)
    expect(coordsToIndex([1, 0, 1, 0], [3, 2, 5, 9])).toEqual(7)
    expect(coordsToIndex([3, 1, 1, 0], [5, 3, 4, 7])).toEqual(23)
  })
  it('should be inverse of coordsFromIndex', () => {
    const sizes = [3, 2, 5, 4, 3, 5, 1]
    expect(coordsToIndex(coordsFromIndex(234, sizes), sizes)).toEqual(234)
  })
})

describe('isPermutation', () => {
  it('should work on sorted', () => {
    expect(isPermutation([0])).toEqual(true)
    expect(isPermutation([0, 1, 2, 3])).toEqual(true)
  })

  it('should work on unsorted', () => {
    expect(isPermutation([2, 0, 1])).toEqual(true)
    expect(isPermutation([0, 3, 2, 4, 1])).toEqual(true)
  })

  it('should show more or less elemens', () => {
    expect(isPermutation([2, 1, 1])).toEqual(false)
    expect(isPermutation([2, 1, 1, 1])).toEqual(false)
    expect(isPermutation([5, 3, 2, 4, 0])).toEqual(false)
  })

  it('should check array size', () => {
    expect(isPermutation([0, 1, 2, 3], 3)).toEqual(false)
    expect(isPermutation([0, 1, 2, 3], 4)).toEqual(true)
    expect(isPermutation([0, 1, 2, 3], 5)).toEqual(false)
  })
})
