import { Cx } from '../src/Complex'
import VectorEntry from '../src/VectorEntry'

// Sparse cell testing
describe('VectorEntry', () => {
  it('should convert from index (uid) to coordinates of dimension array', () => {
    const complex = Cx(4, -4)
    const cell = VectorEntry.fromIndexValue(23, [2, 4, 2], complex)
    expect(cell.coord).toEqual([1, 3, 0]) // now it is small endian; possible to fix
  })
})
