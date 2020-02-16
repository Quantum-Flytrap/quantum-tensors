import Complex, { Cx } from './Complex'
import Vector from './Vector'
import Operator from './Operator'
import Dimension from './Dimension'

const dimPol = Dimension.polarization()

const polVectorsValues = [
  { name: 'H', values: [Cx(1), Cx(0)] },
  { name: 'V', values: [Cx(0), Cx(1)] },
  { name: 'D', values: [Cx(1), Cx(1)] },
  { name: 'A', values: [Cx(-1), Cx(1)] },
  // below needs checking, as it is all +- left/right
  { name: 'L', values: [Cx(1), Cx(0, 1)] },
  { name: 'R', values: [Cx(1), Cx(0, -1)] },
]
const polVectors = new Map<string, Vector>()
polVectorsValues.forEach(d => {
  polVectors.set(d.name, Vector.fromArray(d.values, [dimPol]).normalize())
})

/**
 *
 * @param basisTo E.g. ['L', 'R']
 * @param basisFrom  E.g. ['H', 'V']
 */
export function basisChangeOp(basisTo: string[], basisFrom: string[]): Operator {
  const entries = basisTo.flatMap(toName =>
    basisFrom.map((fromName): [string, string, Complex] => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return [toName, fromName, polVectors.get(toName)!.inner(polVectors.get(fromName)!)]
    }),
  )
  return Operator.fromSparseCoordNames(
    entries,
    [Dimension.polarization([...basisTo])],
    [Dimension.polarization([...basisFrom])],
  )
}

/**
 *
 * @param basisTo E.g. ['L', 'R']
 * @param dims Dimensions for 'from' basis
 */
export function opThatChangesAllPolarizationBasesTo(basisTo: string[], dims: Dimension[]): Operator {
  const ops = dims.map(dim => {
    if (dim.name !== 'polarization') {
      return Operator.identity([dim])
    } else {
      return basisChangeOp(basisTo, dim.coordNames)
    }
  })
  return Operator.outer(ops)
}

/**
 * Turn a vector
 * @param vector Vector in question.
 * @param basisTo  Target basis, e.g. ['L', 'R']
 */
export function vectorAllPolarizationBasesTo(vector: Vector, basisTo: string[]): Vector {
  return opThatChangesAllPolarizationBasesTo(basisTo, vector.dimensions).mulVec(vector)
}

/**
 * Turn an operator
 * @param operator Operator in question.
 * @param basisTo  Target basis, e.g. ['L', 'R']
 */
export function operatorAllPolarizationBasesTo(operator: Operator, basisTo: string[]): Operator {
  const changeOut = opThatChangesAllPolarizationBasesTo(basisTo, operator.dimensionsOut)
  const changeIn = opThatChangesAllPolarizationBasesTo(basisTo, operator.dimensionsIn).dag()
  return changeOut.mulOp(operator).mulOp(changeIn)
}
