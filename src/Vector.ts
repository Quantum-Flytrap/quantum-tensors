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

export default class Vector {
    cells: SparseCell[]
    dimensions: Dimension[]
    sizes: number[]
    names: string[]
    coordNames: string[][]
    
    constructor(
        cells: SparseCell[],
        dimensions: Dimension[],
        sizes: number[] = [],
        names: string[] = [],
        coordNames: string[][] = [[]] ) {
        // TODO: assume the cells are ordered
        this.cells = cells
        this.dimensions = dimensions
        this.sizes = sizes
        this.names = names
        this.coordNames = coordNames
        
        // TODO: validation check
        // this.dimensions.forEach((dimension) => {
        //     this.sizes.push(dimension.size)i
        //     this.names.push(dimension.name)
        //     this.coordNames.push(dimension.coordNames)
        // })
    }

    // Get sizes of dimensions
    getSizes(dimensions: Dimension[] = this.dimensions) {
        return this.dimensions.map((dimension) => {
            return dimension.size
        })
    }

    // Get sizes of dimensions
    getNames(dimensions: Dimension[] = this.dimensions) {
        return this.dimensions.map((dimension) => {
            return dimension.name
        })
    }

    // Get sizes of dimensions
    getCoordNames(dimensions: Dimension[] = this.dimensions) {
        return this.dimensions.map((dimension) => {
            return dimension.coordNames
        })
    }

    // Outer product of vectors
    outer(v2: Vector): Vector {
        const v1 = this;
        // const sizes      = v1.sizes.concat(v2.sizes)
        // const dimNames   = v1.names.concat(v2.names)
        // const coordNames = v1.coordNames.concat(v2.coordNames)
        let newDims: Dimension[] = []
        v1.dimensions.forEach((d1) => {
            v2.dimensions.forEach((d2) => {
                const newDim = d1.concat(d2)
                newDims.push(newDim)
            })
        })
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap
        const cells: SparseCell[] = []
        v1.cells.forEach((cell1: SparseCell) =>
            (v2.cells).forEach((cell2: SparseCell) =>
                cells.push(cell1.outer(cell2))
            )
        )
        return new Vector(cells, newDims)
    }

    // Override toString() method
    toString(): string {
        const introStr = `--- Vector of max size [${this.getSizes()}] with dimensions [${this.getNames()}] ---`
        
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

    // Constructor from array of numbers
    // static fromArray(arr: Complex[], size: number[], dimNames: string[], coordNames: string[][]): Vector {
    //     const sizeRev = [...size]
    //     sizeRev.reverse()

    //     const cells: SparseCell[] = arr
    //         .map((val: Complex, i: number) => [val, i])
    //         .filter((d: [Complex, number]) => { return !d[0].isZero() })
    //         .map((d: [Complex, number]) => {
    //             const cell = d[0]
    //             const coord: number[] = []
    //             let x: number = d[1]
    //             sizeRev.forEach((d) => {
    //                 const r = x % d
    //                 coord.push(r)
    //                 x = (x - r) / d
    //             })
    //             return new SparseCell(coord, cell)
    //         })
    //     arr.forEach((v: Complex, i: number) => {
    //     })
    //     return new Vector(cells, size, dimNames, coordNames)
    // }
}