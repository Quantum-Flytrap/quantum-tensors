import {createPhoton, propagatePhotonOp} from "./src/Step"
import Operator from "./src/Operator"
import Dimension from "./src/Dimension"

const photon = createPhoton(3, 3, 0, 2, '>', 'V')
console.log(photon.toString())

const propagator = propagatePhotonOp(3, 3)
console.log(propagator.toString())

console.log("Propagated:")
console.log(propagator.outer(Operator.identity([Dimension.polarization()])).mulVec(photon).toString())

// NOTE: dim checking is crucial