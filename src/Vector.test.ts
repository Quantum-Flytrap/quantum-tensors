import Complex from "./Complex"

// Coordinates testing
describe('Complex', () => {
    it('should perform classical operations', () => {
        const complex = new Complex(4, -4)
        expect(complex.isZero()).toBe(false)
        expect(complex.conj.toString()).toEqual(new Complex(4, 4).toString())
    })
})