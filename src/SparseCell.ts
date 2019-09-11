// SPARSE MATRIX CELL
// Contains the path to a cell and its value.

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
    
    // Override toString() methodi
    toString() {
        return `Sparse vector entry [${this.coord.toString()}] has value ${this.value.toString()}`
    }

    // Generate coordinates from dense matrix indices and size of those matrices
    // TODO: Check that values are good
    static fromIndex(index: number, sizes: number[], value: Complex): SparseCell {
        // Convert index to coordinate system in the size dimensions
        let i = index
        const coords: number[] = []        
        sizes.forEach((dimSize) => {
            const coord = i % dimSize
            coords.push(coord)
            i = (i - coord) / dimSize
        })
        return new SparseCell(coords, value)
    }
}
