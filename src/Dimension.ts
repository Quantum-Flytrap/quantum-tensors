// DIMENSION CLASS
// See for autofocusing to reduce dimension max size limit[min ... max]
import * as _ from "lodash"

export default class Dimension {
    name: string
    size: number[]
    coordNames: string[]

    constructor(name: string, size: number[], coordNames: string[]) {
        this.name = name
        this.coordNames = coordNames
        this.size = size
    }

    // Concatenate two dimensions
    concat(d2: Dimension): Dimension {
        const d1 = this
        const name = `${d1.name},${d2.name}`
        const size = d1.size.concat(d2.size)
        const coordNames = d1.coordNames.concat(d2.coordNames)
        return new Dimension(name, size, coordNames)
    }

    static polarization(): Dimension {
        return new Dimension("polarisation", [2], ["H", "V"])
    }

    static direction(): Dimension {
        return new Dimension("direction", [4], [">", "^", "<", "v"])
    }

    static spin(): Dimension {
        return new Dimension("spin", [2], ["u", "d"])
    }

    static positionX(size: number): Dimension {
        const coordNames = _.range(size).map((i: number) => i.toString())
        return new Dimension("x", [size], coordNames)
    }

}