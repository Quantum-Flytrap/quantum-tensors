// DIMENSION CLASS
// See for autofocusing to reduce dimension max size limit[min ... max]
import * as _ from "lodash"

export default class Dimension {
    name: string
    size: number
    coordNames: string[]

    constructor(name: string, size: number, coordNames: string[]) {
        this.name = name
        this.coordNames = coordNames  // later, we may make it optional
        this.size = size
        if (this.size !== this.coordNames.length) {
            throw new Error(`Coordinates ${coordNames} array is of length ${coordNames.length} is not ${size}.`)
        }
    }
    
    static polarization(): Dimension {
        return new Dimension("polarisation", 2, ["H", "V"])
    }
    
    static direction(): Dimension {
        return new Dimension("direction", 4, [">", "^", "<", "v"])
    }
    
    static spin(): Dimension {
        return new Dimension("spin", 2, ["u", "d"])
    }
    
    static position(size: number, name = 'x'): Dimension {
        const coordNames = _.range(size).map((i: number) => i.toString())
        return new Dimension(name, size, coordNames)
    }
    
    toString() {
        return `#Dimension [${this.name}] of size [${this.size.toString()}] has coordinates named: [${this.coordNames}]`
    }

    isEqual(dim2: Dimension): boolean {
        const dim1 = this
        return dim1.name === dim2.name && dim1.size === dim2.size && _.isEqual(dim1.coordNames, dim2.coordNames)
    }

    coordNameToIndex(coordName: string): number {
        const idx = this.coordNames.indexOf(coordName)
        if (idx < 0) {
            throw `${coordName} not in ${this.coordNames}`
        } else {
            return idx
        }
    }

    static checkDimensions(dims1: Dimension[], dims2: Dimension[]): void {
        if (dims1.length !== dims2.length) {
            throw `Dimensions with unequal number of components ${dims1.length} !== ${dims2.length}.\n
            Dimensions 1:\n${dims1.join("\n")}\n
            Dimensions 2:\n${dims2.join("\n")}`
        } 

        _.range(dims1.length).forEach((i) => {
            if (!dims1[i].isEqual(dims2[i])) {
                throw `Dimensions have the same number of components, but the component ${i} is\n${dims1[i]}\nvs\n${dims2[i]}.\n
                Dimensions 1:\n${dims1.join("\n")}\n
                Dimensions 2:\n${dims2.join("\n")}`
            }
        })
        
    }
    
    // Also string[]?
    static stringToCoordIndices(s: string | string[], dimensions: Dimension[]): number[] {
        if (dimensions.length !== s.length) {
            throw `dimensions.length (${dimensions.length}) !== string.length (${s.length})`;   
        }
        return _.range(dimensions.length).map((i) =>
            dimensions[i].coordNameToIndex(s[i])
        )
    }

}
