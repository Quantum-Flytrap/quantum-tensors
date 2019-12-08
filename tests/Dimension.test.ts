import Dimension from '../src/Dimension'

describe('Dimension', () => {
  it('should create dimensions from static methods', () => {
    const polarization = Dimension.polarization()
    const direction = Dimension.direction()
    const spin = Dimension.spin()
    expect(polarization).toEqual({ coordNames: ['H', 'V'], name: 'polarisation', size: 2 })
    expect(direction).toEqual({ coordNames: ['>', '^', '<', 'v'], name: 'direction', size: 4 })
    expect(spin).toEqual({ coordNames: ['u', 'd'], name: 'spin', size: 2 })
  })

  it('should forbid creating dimensions with a mismatched length of element and size', () => {
    const error1 = {
      name: 'polarisation',
      size: 2,
      coordNames: ['H', 'V', 'WeaselDimension'],
    }
    const error2 = {
      name: 'polarisation',
      size: 3,
      coordNames: ['H', 'V'],
    }
    expect(() => new Dimension(error1.name, error1.size, error1.coordNames)).toThrowError(
      'Coordinates [H,V,WeaselDimension] array is of length 3, not 2.',
    )
    expect(() => new Dimension(error2.name, error2.size, error2.coordNames)).toThrowError(
      'Coordinates [H,V] array is of length 2, not 3.',
    )
  })

  it('should retrieve the index of a coordinate from the array of coordinates names', () => {
    const obj = {
      name: 'polarisation',
      size: 3,
      coordNames: ['H', 'V', 'WeaselDimension'],
    }
    const dim = new Dimension(obj.name, obj.size, obj.coordNames)
    expect(dim.coordNameToIndex('WeaselDimension')).toBe(2)
  })

  it('should error if provided a wrong coordinate name', () => {
    const obj = {
      name: 'polarisation',
      size: 3,
      coordNames: ['H', 'V', 'WeaselDimension'],
    }
    const dim = new Dimension(obj.name, obj.size, obj.coordNames)
    expect(() => dim.coordNameToIndex('OctopusDimension')).toThrowError(
      'OctopusDimension is not in [H,V,WeaselDimension]',
    )
  })

  it('should display errors related to dimension array size', () => {
    const obj1 = {
      name: 'polarisation',
      size: 3,
      coordNames: ['H', 'V', 'WeaselDimension'],
    }
    const dim1 = new Dimension(obj1.name, obj1.size, obj1.coordNames)
    const dim2 = Dimension.spin()
    const dim3 = Dimension.polarization()
    expect(() => Dimension.checkDimensions([dim1], [dim2, dim3])).toThrowError('Dimensions array size mismatch...')
  })

  it('should display errors related to dimension array order', () => {
    const obj1 = {
      name: 'polarisation',
      size: 3,
      coordNames: ['H', 'V', 'WeaselDimension'],
    }
    const dim1 = new Dimension(obj1.name, obj1.size, obj1.coordNames)
    const dim2 = Dimension.spin()
    const dim3 = Dimension.polarization()
    expect(() => Dimension.checkDimensions([dim1, dim2], [dim2, dim3])).toThrowError(
      'Dimensions array order mismatch...',
    )
  })
})
