// COMPLEX NUMBER CLASS

export function Cx(re: number, im: number = 0): Complex {
    return new Complex(re, im)
}

export default class Complex {
    re : number
    im : number

    constructor(re : number, im: number = 0) {
        this.re = re
        this.im = im
    }

    abs2(): number {
        return Math.pow(this.re, 2) + Math.pow(this.im, 2)
    }

    abs(): number {
        return Math.sqrt(Math.pow(this.re, 2) + Math.pow(this.im, 2))
    }
    
    // Addition 
    add(z2: Complex): Complex {
        const z1 = this;
        return new Complex(z1.re + z2.re, z1.im + z2.im)
    }
    
    //  Multiply
    mul(z2: Complex): Complex {
        const z1 = this;
        return new Complex(z1.re * z2.re - z1.im * z2.im, z1.re * z2.im + z1.im * z2.re)
    }

    // Complex conjugate
    conj(): Complex {
        return new Complex(this.re, -this.im);
    }

    // Normalize
    normalize(): Complex {
        const r = this.abs()
        return new Complex(this.re / r, this.im / r)
    }

    // Equality checker
    equal(z2: Complex): boolean {
        return this.re === z2.re && this.im === z2.im
    }
    
    // Check for zero
    isZero(): boolean {
        return this.re === 0 && this.im === 0
    }
    
    // Override toString() method
    toString(): string {
        return `${this.re.toFixed(2)} ${this.im >= 0 ? "+" : ""}${this.im.toFixed(2)}i`
    }
}