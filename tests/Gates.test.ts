import * as Gates from '../src/Gates'

describe('X Gate', () => {
  it('should create 0<->1', () => {
    expect(Gates.X().toString('cartesian', 2, ' + ', false)).toEqual('(1.00 +0.00i) |0⟩⟨1| + (1.00 +0.00i) |1⟩⟨0|')
  })
})
