export class Complex {
    re : number
    im : number

    constructor(re : number, im = 0.) {
        this.re = re
        this.im = im
    }

    abs2(): number {
        return Math.pow(this.re, 2) + Math.pow(this.im, 2)
    }

    abs(): number {
        return Math.sqrt(Math.pow(this.re, 2) + Math.pow(this.im, 2))
    }

    mul(z2: Complex): Complex {
        const z1 = this;
        return new Complex(z1.re * z2.re - z1.im * z2.im, z1.re * z2.im + z1.im * z2.re)
    }

    add(z2: Complex): Complex {
        const z1 = this;
        return new Complex(z1.re + z2.re, z1.im + z2.im)
    }

    conj(): Complex {
        return new Complex(this.re, -this.im);
    }

    normalize(): Complex {
        const r = this.abs()
        return new Complex(this.re / r, this.im /r)
    }

    toString(): string {
        // NOTE: we can tweak that if needed
        return `${this.re.toFixed(2) + this.im.toFixed(2)}`
    }

    isZero(): boolean {
        return (this.re === 0) && (this.im === 0)
    }

}