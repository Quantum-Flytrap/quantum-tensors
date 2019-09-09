import { Complex } from './Complex'

export const PI : number = 3.1415


// Ket-let?
class VectorEntry {

    multiindex: number[]
    value: Complex

    constructor(multiindex: number[], value: Complex) {
        this.multiindex = multiindex
        this.value = value
    }

    outer(e2: VectorEntry): VectorEntry {
        const e1 = this
        return new VectorEntry(
            (e1.multiindex).concat(e2.multiindex),
            (e1.value).mul(e2.value)
        )
    }

    // TODO
    // toString
    // toLaTeX
    // add
    // outer
    // conj
    // permute
    // mul?
}

// MAYBE 'Dimension' as a class and later 


// Tensor-aware named sparse complex vector
// Call it SparseKet?
export class Vector {
    values: VectorEntry[]
    size: number[]
    dimNames: string[]
    coordNames: string[][]

    constructor(values:  VectorEntry[], size: number[], dimNames: string[], coordNames: string[][]) {
        this.values = values  // assume ordered?
        this.size = size  // infer?
        this.dimNames = dimNames  // make optional
        this.coordNames = coordNames  // make optional

        // TODO: tests for numbers of pieces
    }

    outer(v2: Vector): Vector {
        const v1 = this;
        const size = (v1.size).concat(v2.size)
        const dimNames = (v1.dimNames).concat(v2.dimNames)
        const coordNames = (v1.coordNames).concat(v2.coordNames)

        const values = (v1.values).flatMap((entry1: VectorEntry) =>
            (v2.values).map((entry2: VectorEntry) =>
                entry1.outer(entry2)
            )
        )

        return new Vector(values, size, dimNames, coordNames)
    } 

    toString(): string {

        const introStr = `Vector of size ${this.size} with dimensions ${this.dimNames}`
        const valueStr = this.values
            .map((entry) => {
                const coordStr = (entry.multiindex).map((i: number, dim: number) => this.coordNames[dim][i])
                return `(${entry.value.toString()}) |${coordStr}⟩`
            })
            .join(" + ")

        return `${introStr}\n${valueStr}`
    }

    static fromArray(arr: Complex[], size: number[], dimNames: string[], coordNames: string[][]): Vector {


        const sizeRev = [...size]
        sizeRev.reverse()

        const values : VectorEntry[] = arr
            .map((val: Complex, i: number) => [val, i])
            .filter((d: [Complex, number]) => !d[0].isZero())
            .map((d: [Complex, number]) => {
                const val = d[0]
                const multiindex : number[] = []
                let x : number = d[1] 
                sizeRev.forEach((d) => {
                    const r = x % d
                    multiindex.push(r)
                    x = (x - r) / d
                })
                return new VectorEntry(multiindex, val)
            })

        arr.forEach((v: Complex, i: number) => {

        })

        return new Vector(values, size, dimNames, coordNames)
    }


    // NOTE
    // index to multindex and vice versa
    // add
    // dot product
    // conjugate
    // permute

    // ""



}


/