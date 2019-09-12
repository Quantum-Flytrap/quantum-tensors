// SPARSE MATRIX CELL
// Contains the path to a cell and its value.

// coordinate as an abstracted entry?
// MultiIndex 

// VectoryEntry
// MatrixEntry

import Complex from "./Complex"

export function CoordsFromIndex(index: number, sizes: number[]): number[] {
    // Convert index to coordinate system in the size dimensions
    // TODO: Check that values are good
    let i = index
    const coords = sizes.map((dimSize) => {
        const coord = i % dimSize
        i = (i - coord) / dimSize
        return coord
    })
    return coords
}

export class VectorEntry {
    coord: number[]
    value: Complex

    constructor(coord: number[], value: Complex) {
        this.coord = coord
        this.value = value
    }
    
    // Compute outer product with another sparse cell
    outer(e2: VectorEntry): VectorEntry {
        const e1 = this
        return new VectorEntry(
            (e1.coord).concat(e2.coord),
            (e1.value).mul(e2.value)
        )
    }
    
    // Override toString() methodi
    toString() {
        return `Sparse vector entry [${this.coord.toString()}] has value ${this.value.toString()}`
    }

    // Generate coordinates from dense matrix indices and size of those matrices
    static fromIndexValue(index: number, sizes: number[], value: Complex): VectorEntry {
        // Convert index to coordinate system in the size dimensions
        const coords = CoordsFromIndex(index, sizes)
        return new VectorEntry(coords, value)
    }
}
