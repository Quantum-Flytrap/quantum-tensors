/**
 * Turns an index into a multiindex, according to dimension sizes
 * @param index An integer
 * @param sizes Sizes of each dimension
 *
 * @returns Index in each dimension
 *
 * @todo Check that values are good (also: small endian vs big endian )
 */
export function CoordsFromIndex(index: number, sizes: number[]): number[] {
  let i = index;
  const coords = sizes.map(dimSize => {
    const coord = i % dimSize;
    i = (i - coord) / dimSize;
    return coord;
  });
  return coords;
}
