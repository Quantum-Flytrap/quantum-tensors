import _ from 'lodash'
import Complex, { Cx } from './Complex'
import Vector from "./Vector"
import Operator from "./Operator"
import Dimension from "./Dimension"
import {TAU} from "./Constants"

const dimPol = Dimension.polarization()
const dimDir = Dimension.direction()
const idPol = Operator.identity([dimPol])
const idDir = Operator.identity([dimDir])

const cos = (alpha: number) => Cx(Math.cos(alpha), 0)
const sin = (alpha: number) => Cx(Math.sin(alpha), 0)

// not as fast as this one: https://en.wikipedia.org/wiki/Fast_inverse_square_root
const isqrt2 = Cx(Math.SQRT1_2) 

// TODO: How to make sure dimensions are OK?

export function rotationMatrix(alpha: number, dimension: Dimension) {
    const array = [
        [cos(alpha), sin(-alpha)],
        [sin(alpha), cos(alpha)]
    ]
    return Operator.fromArray(array, [dimension], [dimension])
}

export function sugarSolution(rot: number) {
    return Operator.outer([
        idDir,
        rotationMatrix(rot * TAU, dimPol)
    ])
}

export function amplitudeIntensity(r: number, rot: number) {
    return Operator
        .outer([
            idDir,
            idPol
        ])
        .mulConstant(Complex.fromPolar(r, TAU * rot))
}



