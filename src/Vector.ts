// VECTOR CLASS
// Tensor-aware named sparse complex vector

// VECTOR CLASS
// TODO: index from/to coordinate
// add
// dot product
// conjugate
// permute

import Complex from './Complex'
import SparseCell from './SparseCell'
import Dimension from './Dimension'
import _ from 'lodash'

export default class Vector {
    cells: SparseCell[]
    dimensions: Dimension[]
    
    // TODO: assume the cells are ordered
    constructor(cells: SparseCell[], dimensions: Dimension[]) {
        this.cells = cells
        this.dimensions = dimensions
    }

    // Getters for dimensions
    get sizes() {
        return this.dimensions.map((dimension) => dimension.size)
    }
    get names() {
        return this.dimensions.map((dimension) => dimension.name)
    }
    get coordNames() {
        return this.dimensions.map((dimension) => dimension.coordNames)
    }

    // Outer product of vectors
    outer(v2: Vector): Vector {
        const v1 = this;
        const dimensions: Dimension[] = v1.dimensions.concat(v2.dimensions)
        const cells: SparseCell[] = []
        v1.cells.forEach((cell1: SparseCell) =>
            (v2.cells).forEach((cell2: SparseCell) =>
                cells.push(cell1.outer(cell2))
            )
        )
        return new Vector(cells, dimensions)
    }

    // Override toString() method
    // Recover piotr ket formalism
    toString(): string {
        const introStr = `--- Vector of max size [${this.sizes}] with dimensions [${this.names}] ---`
        
        let cellsStr = `\nThere are ${this.cells.length} cells in the vector:\n`
        this.cells.map((cell) => {
            cellsStr += `- ${cell.toString()}\n`
        })
        let dimensionsStr = `\nThere are ${this.dimensions.length} dimensions in the vector:\n`
        this.dimensions.map((dimension) => {
            dimensionsStr += `- ${dimension.toString()}\n`
        })
        return `${introStr}\n${cellsStr}\n${dimensionsStr}`
    }

    // Loading from dense array list of cells
    static fromArray(denseArray: Complex[], dimensions: Dimension[]): Vector {
        // Precompute sizes
        const size = dimensions.map((dimension) => dimension.size).reverse()
        // Map valyes to cells indices in a dense representation
        const filteredCells: SparseCell[] = []
        denseArray.forEach((value: Complex, index: number) => {
            if (!value.isZero()) {
                filteredCells.push(SparseCell.fromIndex(index, size, value))
            }
        })
        return new Vector(filteredCells, dimensions)
    }
}