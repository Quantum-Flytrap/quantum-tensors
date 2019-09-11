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
    
}
