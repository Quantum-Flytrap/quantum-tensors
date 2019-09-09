// DIMENSION CLASS
// See for autofocusing to reduce dimension max size limit[min ... max]

export default class Dimension {
    name: string
    size: number
    coordName: string[]

    constructor(name: string, size: number, coordName: string[]) {
        this.name = name
        this.size = size
        this.coordName = coordName
    }

}