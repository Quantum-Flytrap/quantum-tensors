import Complex, {Cx} from "./Complex"
import Dimension from "./Dimension"
import Operator from "./Operator"
import {TAU} from "./Constants"
import * as ops from './Ops'

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

/**
 * 0: -, 1: /, 2: |, 3: \ 
*/ 
export function mirror(rotState: number) {
    const reflections: [string, string, Complex][][] = [
        [   // 0: -
            ['v', '^', Cx(1)],
            ['^', 'v', Cx(1)],
        ],
        [   // 1: /
            ['^', '>', Cx(1)],
            ['>', '^', Cx(1)],
            ['v', '<', Cx(1)],
            ['<', 'v', Cx(1)],
        ],
        [   // 2: |
            ['<', '>', Cx(1)],
            ['>', '<', Cx(1)],
        ],
        [   // 3: \
            ['v', '>', Cx(1)],
            ['>', 'v', Cx(1)],
            ['^', '<', Cx(1)],
            ['<', '^', Cx(1)],
        ]
    ]

    return Operator.outer([
        Operator.fromSparseCoordNames(reflections[rotState], [dimDir]),
        ops.reflectPhaseFromDenser()
    ])
}

export function beamSplitter(rotState: number) {
    const reflections: [string, string, Complex][][] = [
        [   // 0: -
            ['v', '^', Cx(1)],
            ['^', 'v', Cx(1)],
        ],
        [   // 1: /
            ['^', '>', Cx(1)],
            ['>', '^', Cx(1)],
            ['v', '<', Cx(1)],
            ['<', 'v', Cx(1)],
        ],
        [   // 2: |
            ['<', '>', Cx(1)],
            ['>', '<', Cx(1)],
        ],
        [   // 3: \
            ['v', '>', Cx(1)],
            ['>', 'v', Cx(1)],
            ['^', '<', Cx(1)],
            ['<', '^', Cx(1)],
        ]
    ]

    const passageDir = [
        Operator.fromSparseCoordNames([
            ['^', '^', Cx(1)],
            ['v', 'v', Cx(1)],
        ], [dimDir]),
        idDir,
        Operator.fromSparseCoordNames([
            ['>', '>', Cx(1)],
            ['<', '<', Cx(1)],
        ], [dimDir]),
        idDir
    ]

    return Operator
        .outer([
            Operator.fromSparseCoordNames(reflections[rotState], [dimDir]),
            ops.reflectPhaseFromDenser()
        ])
        .mulConstant(Cx(0, 1))  // TODO: check phase here
        .add(passageDir[rotState].outer(idPol))
        .mulConstant(ops.isqrt2)
}

export function cornerCube() {
    return Operator
        .outer([
            Operator.fromSparseCoordNames([
                ['<', '>', Cx(1)],
                ['v', '^', Cx(1)],
                ['>', '<', Cx(1)],
                ['^', 'v', Cx(1)],
            ], [dimDir]),
            idPol
        ])
}

// TODO: add projection in opts, on a subspace?
