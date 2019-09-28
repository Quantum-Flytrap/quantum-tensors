// create state
// loop of
// - make it pass through U
// - propagate
// - note detection ptobabilities


import Vector from "./Vector"
import Operator from "./Operator"
import Dimension from "./Dimension"



export function createPhoton (sizeX: number, sizeY: number,
                       posX: number, posY: number, dir: string, pol: string): Vector {

    const dimensions = [
        Dimension.position(sizeX, 'x'),
        Dimension.position(sizeY, 'y'),
        Dimension.direction(),
        Dimension.polarization()
    ]

    const state = [posX.toString(), posY.toString(), dir, pol]

    return Vector.indicator(dimensions, state)

}


export function actOnPhoton() {

}

export function propagatePhotonOp(sizeX: number, sizeY: number): Operator {
    const dir =  Dimension.direction()
    const dimX = Dimension.position(sizeX, 'x')
    const dimY = Dimension.position(sizeY, 'y')

    return Operator.add([
        Operator.outer([Operator.shift(dimX, +1), Operator.identity([dimY]), Operator.indicator([dir], ['>'])]),
        Operator.outer([Operator.shift(dimX, -1), Operator.identity([dimY]), Operator.indicator([dir], ['<'])]),
        Operator.outer([Operator.identity([dimX]), Operator.shift(dimY, +1), Operator.indicator([dir], ['v'])]),
        Operator.outer([Operator.identity([dimX]), Operator.shift(dimY, -1), Operator.indicator([dir], ['^'])]),
    ])

}



// export default class State {
//     vector: Vector

//     constructor(vector: Vector) {
//         this.vector = vector
//     }






// }

