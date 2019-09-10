// DIMENSION CLASS
// See for autofocusing to reduce dimension max size limit[min ... max]
import * as _ from "lodash"

export default class Dimension {
    name: string
    length: number
    coordNames: string[]

    constructor(name: string, length: number, coordNames: string[]) {
        this.name = name
        this.coordNames = coordNames
        this.length = length
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

    static positionX(size: number): Dimension {
        const coordNames = _.range(size).map((i) => i.toString())
        return new Dimension("x", size, coordNames)
    }

}