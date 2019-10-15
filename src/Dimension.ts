// DIMENSION CLASS
// See for autofocusing to reduce dimension max size limit[min ... max]
import * as _ from "lodash"

export default class Dimension {
  name: string
  size: number
  coordNames: string[]

  constructor(name: string, size: number, coordNames: string[]) {
    if (size !== coordNames.length) {
      throw new Error(`Coordinates [${coordNames}] array is of length ${coordNames.length}, not ${size}.`)
    }
    this.name = name
    this.coordNames = coordNames // later, we may make it optional
    this.size = size
  }

  /**
   * Create dimension for polarization
   * @returns polarisation dimension
   */
  static polarization(): Dimension {
    return new Dimension("polarisation", 2, ["H", "V"])
  }

  /**
   * Create dimension for direction
   * @returns direction dimensions
   */
  static direction(): Dimension {
    return new Dimension("direction", 4, [">", "^", "<", "v"])
  }

  /**
   * Create dimension for spin
   * @returns spin dimensions
   */
  static spin(): Dimension {
    return new Dimension("spin", 2, ["u", "d"])
  }

  /**
   *
   * @param size
   * @param name
   */
  static position(size: number, name = "x"): Dimension {
    const coordNames = _.range(size).map((i: number) => i.toString())
    return new Dimension(name, size, coordNames)
  }

  /**
   * Overrides toString() method
   * @returns formatted string
   */
  toString(): string {
    return `#Dimension [${this.name}] of size [${this.size.toString()}] has coordinates named: [${this.coordNames}]`
  }

  /**
   * @returns string with concat names
   */
  get coordString(): string {
    return this.coordNames.join("")
  }

  /**
   * Test equality between two dimensions
   * @param dim2
   * @returns dim1 === dim 2
   */
  isEqual(dim2: Dimension): boolean {
    const dim1 = this
    return dim1.name === dim2.name && dim1.size === dim2.size && _.isEqual(dim1.coordNames, dim2.coordNames)
  }

  /**
   * Retrieves a coordinates index from the coordinates list
   * @param coordName one coord bame
   * @returns error or the coord index
   */
  coordNameToIndex(coordName: string): number {
    const idx = this.coordNames.indexOf(coordName)
    if (idx < 0) {
      throw new Error(`${coordName} is not in [${this.coordNames}]`)
    } else {
      return idx
    }
  }

  /**
   * Concat the names od dimensions
   * @param dims Array of dimensions
   */
  static concatDimNames(dims: Dimension[]): string {
    let names = ""
    dims.forEach(dim => {
      names += dim.coordString
    })
    return names
  }

  /**
   * Check multiple dimensions for equality
   * Needs rewrite imo
   * @param dims1 First dimension instance
   * @param dims2 second dimension instance
   */
  static checkDimensions(dims1: Dimension[], dims2: Dimension[]): void {
    // Check for size
    if (dims1.length !== dims2.length) {
      console.error(
        `Dimensions with unequal number of components ${dims1.length} !== ${dims2.length}.\n
        Dimensions 1:\n${dims1.join("\n")}\n
        Dimensions 2:\n${dims2.join("\n")}`,
      )
      throw new Error("Dimensions array size mismatch...")
    }
    // Check for order
    _.range(dims1.length).forEach(i => {
      if (!dims1[i].isEqual(dims2[i])) {
        console.error(
          `Dimensions have the same number of components, but the component ${i} is\n${dims1[i]}\nvs\n${dims2[i]}.\n
          Dimensions 1:\n${dims1.join("\n")}\n
          Dimensions 2:\n${dims2.join("\n")}`,
        )
        throw new Error("Dimensions array order mismatch...")
      }
    })
  }

  // Also string[]?
  static stringToCoordIndices(s: string | string[], dimensions: Dimension[]): number[] {
    if (dimensions.length !== s.length) {
      throw `dimensions.length (${dimensions.length}) !== string.length (${s.length})`
    }
    return _.range(dimensions.length).map(i => dimensions[i].coordNameToIndex(s[i]))
  }
}
