// SPARSE MATRIX CELL
// Contains the path to a cell and its value.
// TODO: toLaTeX
// TODO: add
// TODO: outer
// TODO: conj
// TODO: permute
// TODO: mul?

import Complex from "./Complex"

export default class SparseCell {
    coord: number[]
    value: Complex

    constructor(coord: number[], value: Complex) {
        this.coord = coord
        this.value = value
    }
    
    // Compute outer product with another sparse cell
    outer(e2: SparseCell): SparseCell {
        const e1 = this
        return new SparseCell(
            (e1.coord).concat(e2.coord),
            (e1.value).mul(e2.value)
        )
    }
    
    // Override toString() method
    toString() {
        return `Sparse matrix cell @ [${this.coord.toString()}] has value ${this.value.toString()}`
    }
}
