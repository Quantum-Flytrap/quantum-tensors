/* eslint-disable-next-line */
import _ from 'lodash'

const identityMap = new Map<string, symbol>()

/**
 * Dimension class, e.g.
 * - "polarization" with coordinates ["H", "V"]
 * - "direction" with coordinates [">", "^", "<", "v"]
 * Vide: http://nlp.seas.harvard.edu/NamedTensor and http://nlp.seas.harvard.edu/NamedTensor2
 */
export default class Dimension {
  /** A symbol used for Dimension comparison */
  private readonly identity: symbol
  name: string
  size: number
  coordNames: string[]

  /**
   * Creates a dimentions - to be used in a Vector or Operator object
   * @param name Name of a dimension (e.g. "qubit", "spin", "x", etc)
   * @param size Size of a dimension
   * @param coordNames Name of each coordinate
   */
  constructor(name: string, size: number, coordNames: string[]) {
    if (size !== coordNames.length) {
      throw new Error(`Coordinates [${coordNames}] array is of length ${coordNames.length}, not ${size}.`)
    }
    this.name = name
    this.coordNames = coordNames // later, we may make it optional
    this.size = size

    const hashKey = this.hashKey()
    let identity = identityMap.get(hashKey)
    if (identity == null) {
      identity = Symbol(name)
      identityMap.set(hashKey, identity)
    }
    this.identity = identity
  }

  /**
   * A string used for dimension equality test.
   *
   * @remark do not assume any particular format. The only important quality of this
   * value is that it fully encodes all relevant dimension data and can be used as a hash key
   *
   * @returns identification string
   */
  private hashKey(): string {
    return `${this.name}-${this.size}-${this.coordNames.length}-${this.coordNames
      .map((n, i) => `#${i}-${n}`)
      .join('-')}`
  }

  /**
   * Create dimension for polarization
   * @param basis denote basis, ['H', 'V'], ['D', 'A'] or ['L', 'R']
   * @returns polarization dimension
   */
  static polarization(basis = ['H', 'V']): Dimension {
    return new Dimension('polarization', 2, basis)
  }

  /**
   * Create dimension for direction
   * @returns direction dimensions
   */
  static direction(): Dimension {
    return new Dimension('direction', 4, ['>', '^', '<', 'v'])
  }

  /**
   * Create dimension for spin
   * @param basis denote basis, ['u', 'd'], ['ux', 'dx'] or ['dy', 'dy']
   * @returns spin dimensions
   */
  static spin(basis = ['u', 'd']): Dimension {
    return new Dimension('spin', 2, basis)
  }

  /**
   * Creates a dimension with positions from 0 to size-1
   * @param size A positive integer - size of steps.
   * @param name Dimension name, e.g. 'x', 'y' or 'z'.
   */
  static position(size: number, name = 'x'): Dimension {
    const coordNames = _.range(size).map((i: number) => i.toString())
    return new Dimension(name, size, coordNames)
  }

  /**
   * Create dimension for qubit (an abstract two-level system)
   * @note Equivalent to {@link Dimension.position}(2, 'qubit')
   * @param basis denote basis, ['0', '1'], ['+', '-'] or ['+i', '-i']
   * @returns qubit dimension
   */
  static qubit(basis = ['0', '1']): Dimension {
    return new Dimension('qubit', 2, basis)
  }

  /**
   * Create dimensions for n qubits.
   * @param n Number of qubits.
   * @returns Qubit dimensions.
   */
  static qubits(n: number): Dimension[] {
    return _.range(n).map(() => Dimension.qubit())
  }

  /**
   * Creates a copy with different coord names.
   * Used in operators that change basis.
   * @param coordNames
   */
  reassignCoordNames(coordNames: string[]): Dimension {
    return new Dimension(this.name, this.size, coordNames)
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
    return this.coordNames.join('')
  }

  /**
   * Test equality between two dimensions
   * @param dim2
   * @returns dim1 === dim 2
   */
  isEqual(dim2: Dimension): boolean {
    return this.identity === dim2.identity
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
    let names = ''
    dims.forEach((dim) => {
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
        Dimensions 1:\n${dims1.join('\n')}\n
        Dimensions 2:\n${dims2.join('\n')}`,
      )
      throw new Error('Dimensions array size mismatch...')
    }
    // Check for order
    for (let i = 0; i < dims1.length; i++) {
      if (!dims1[i].isEqual(dims2[i])) {
        console.error(
          `Dimensions have the same number of components, but the component ${i} is\n${dims1[i]}\nvs\n${dims2[i]}.\n
          Dimensions 1:\n${dims1.join('\n')}\n
          Dimensions 2:\n${dims2.join('\n')}`,
        )
        throw new Error('Dimensions array order mismatch...')
      }
    }
  }

  /**
   *
   * @param s string, such as "udH" or ['u', 'd', 'H']
   * @param dimensions  Dimensions to be used
   *
   * @returns
   */
  static stringToCoordIndices(s: string | string[], dimensions: Dimension[]): number[] {
    if (dimensions.length !== s.length) {
      throw `dimensions.length (${dimensions.length}) !== string.length (${s.length})`
    }
    return _.range(dimensions.length).map((i) => dimensions[i].coordNameToIndex(s[i]))
  }
}
