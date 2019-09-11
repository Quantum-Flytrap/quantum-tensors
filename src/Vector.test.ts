import Complex from "./Complex"
import SparseCell from "./SparseCell"

// Coordinates testing
describe('Complex', () => {
    xit('should perform classical operations', () => {
        const complex = new Complex(4, -4)
        expect(complex.isZero()).toBe(false)
        expect(complex.conj.toString()).toEqual(new Complex(4, 4).toString())
    })
})

// Sparse cell testing
describe('SparseCell', () => {
    it('should convert from index (uid) to coordinates of dimension array', () => {
        const complex = new Complex(4, -4)
        const cell = SparseCell.fromIndex(23, [2, 4, 2], complex)
        expect(cell.coord).toEqual("")
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