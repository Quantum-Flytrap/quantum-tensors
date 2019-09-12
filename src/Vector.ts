// VECTOR CLASS
// Tensor-aware named sparse complex vector

// VECTOR CLASS
// add
// dot product
// permute

import Complex from './Complex'
import { VectorEntry } from './Entry'
import Dimension from './Dimension'
import _ from 'lodash'

export default class Vector {
    cells: VectorEntry[]
    dimensions: Dimension[]

    // TODO: assume the cells are ordered
    constructor(cells: VectorEntry[], dimensions: Dimension[]) {
        this.cells = cells
        this.dimensions = dimensions
    }

    // Getters for dimensions
    get size() {
        return this.dimensions.map((dimension) => dimension.size)
    }
    get total() {
        return this.size.reduce((a, b) => a * b)
    }
    get names() {
        return this.dimensions.map((dimension) => dimension.name)
    }
    get coordNames() {
        return this.dimensions.map((dimension) => dimension.coordNames)
    }

    // Conjugate
    conjugate() {
        return this.cells.map((cell) => {
            return new VectorEntry(cell.coord, cell.value.conj())
        })
    }

    // Outer product of vectors
    outer(v2: Vector): Vector {
        const v1 = this;
        const dimensions: Dimension[] = v1.dimensions.concat(v2.dimensions)
        const cells: VectorEntry[] = []
        v1.cells.forEach((cell1: VectorEntry) =>
            (v2.cells).forEach((cell2: VectorEntry) =>
                cells.push(cell1.outer(cell2))
            )
        )
        return new Vector(cells, dimensions)
    }

    // TODO: Dense matrix visualisation
    toString(dense: boolean = false): string {
        let introStr = ""
        let valueStr = ""
        if (!dense) {
            introStr += `Vector of max size [${this.size}] with dimensions [${this.names}]`
            valueStr += this.cells
                .map((cell) => {
                    const coordStr = (cell.coord).map((i: number, dim: number) => this.coordNames[dim][i])
                    return `(${cell.value.toString()}) |${coordStr}⟩`
                })
                .join(" + ")
        } else {
            introStr += `Vector of max size [${this.size}] with dimensions [${this.names}]`
            valueStr += this.cells
                .map((cell) => {
                    const coordStr = (cell.coord).map((i: number, dim: number) => this.coordNames[dim][i])
                    return `(${cell.value.toString()}) |${coordStr}⟩`
                })
                .join("\n")
        }
        return `${introStr}\n${valueStr}\n`
    }

    // Loading from dense array list of cells
    // TODO: if length array != product of dimension then error throw error
    static fromArray(denseArray: Complex[], dimensions: Dimension[], sparse: boolean = true): Vector {

        // Get size vector from dimensions
        const sizes = dimensions.map((dimension) => dimension.size)
        const total = sizes.reduce((a, b) => a * b)
        if (denseArray.length !== total) {
            throw new Error(`Dimension inconsistency: cell count ${denseArray.length} != total: ${total}`)
        }

        // Map values to cells indices in a dense representation
        const cells: VectorEntry[] = []
        // Output sparse
        if (sparse) {
            denseArray.forEach((value: Complex, index: number) => {
                if (!value.isZero()) {
                    cells.push(VectorEntry.fromIndexValue(index, sizes, value))
                }
            })
            // Output dense matrix 
        } else {
            denseArray.forEach((value: Complex, index: number) => {
                cells.push(VectorEntry.fromIndexValue(index, sizes, value))
            })
        }

        return new Vector(cells, dimensions)
    }
}