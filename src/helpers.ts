/* eslint-disable-next-line */
import _ from 'lodash'

/**
 * Turns an index into a multi-index, according to dimension sizes.
 * @note It uses little-endian,
 * https://chortle.ccsu.edu/AssemblyTutorial/Chapter-15/ass15_3.html.
 * @param index An integer
 * @param sizes Sizes of each dimension
 *
 * @returns Index in each dimension
 */
export function coordsFromIndex(index: number, sizes: number[]): number[] {
  let i = index
  const coords = sizes.map(dimSize => {
    const coord = i % dimSize
    i = (i - coord) / dimSize
    return coord
  })
  return coords
}

/**
 * Turns a multi-index into an index, inverse of {@link coordsFromIndex}
 * @note It uses little-endian,
 * https://chortle.ccsu.edu/AssemblyTutorial/Chapter-15/ass15_3.html.
 * @param coords Index in each dimension
 * @param sizes Sizes of each dimension
 *
 * @return Index
 */
export function coordsToIndex(coords: number[], sizes: number[]): number {
  if (coords.length !== sizes.length) {
    throw new Error(`Coordinates ${coords} and sizes ${sizes} are of different lengths}.`)
  }
  let factor = 1
  let res = 0
  coords.forEach((coord, dim) => {
    res += factor * coord
    factor *= sizes[dim]
  })
  return res
}

/**
 * Checks if a given array is a permuation, i.e. consisto of [0, 1, 2, ..., n - 1] in any order.
 * @param array Array to be tested
 * @param n Number of elements
 */
export function isPermutation(array: number[], n = array.length): boolean {
  if (array.length !== n) {
    return false
  }
  const counts = new Array(array.length).fill(0)
  array.forEach(x => (counts[x] += 1))
  return _.every(counts)
}

/**
 * Stolen from https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex
 * Alternatively: d3.hsl
 */
export function hslToHex(hParam: number, sParam: number, lParam: number): string {
  let h = hParam
  let s = sParam
  let l = lParam
  h /= 360
  s /= 100
  l /= 100
  let r
  let g
  let b
  if (s === 0) {
    r = l
    g = l
    b = l // achromatic
  } else {
    // eslint-disable-next-line
    const hue2rgb = (pParam: number, qParam: number, tParam: number) => {
      const p = pParam
      const q = qParam
      let t = tParam
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  // eslint-disable-next-line
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? `0${hex}` : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
