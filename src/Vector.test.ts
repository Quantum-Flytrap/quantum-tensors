import Complex from "./Complex"
import { VectorEntry } from "./Entry"

// Coordinates testing
describe('Complex', () => {
    xit('should perform classical operations', () => {
        const complex = new Complex(4, -4)
        expect(complex.isZero()).toBe(false)
        expect(complex.conj.toString()).toEqual(new Complex(4, 4).toString())
    })
})

// Sparse cell testing
describe('VectorEntry', () => {
    it('should convert from index (uid) to coordinates of dimension array', () => {
        const complex = new Complex(4, -4)
        const cell = VectorEntry.fromIndexValue(23, [2, 4, 2], complex)
        expect(cell.coord).toEqual([1, 3, 0])  // now it is small endian; possible to fix
    })
})

// Dimension testing
describe('Dimension', () => {
    xit('should perform classical operations', () => {
        const complex = new Complex(4, -4)
        expect(complex.isZero()).toBe(false)
        expect(complex.conj.toString()).toEqual(new Complex(4, 4).toString())
    })
})

// Vector testing
describe('Vector', () => {
    xit('should perform classical operations', () => {
        const complex = new Complex(4, -4)
        expect(complex.isZero()).toBe(false)
        expect(complex.conj.toString()).toEqual(new Complex(4, 4).toString())
    })
})