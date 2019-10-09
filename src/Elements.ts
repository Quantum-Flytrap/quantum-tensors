import * as ops from './Ops'
import Operator from "./Operator"
import Dimension from "./Dimension"
import {TAU} from "./Constants"

const dimPol = Dimension.polarization()
const dimDir = Dimension.direction()
const idPol = Operator.identity([dimPol])
const idDir = Operator.identity([dimDir])

export function sugarSolution(rot: number) {
    return Operator.outer([
        idDir,
        ops.rotationMatrix(rot * TAU, dimPol)
    ])
}

export function attenuator(r = Math.SQRT1_2) {
    return ops.amplitudeIntensity(r, 0)
}

export function vacuumJar() {
    return ops.amplitudeIntensity(0, -0.25)
}

export function glassSlab() {
    return ops.amplitudeIntensity(0, +0.25)
}



