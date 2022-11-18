export declare class Vector {
    readonly x: number;
    readonly y: number;
    constructor(x: number, y: number);
    add(v: Vector): Vector;
    subtract(v: Vector): Vector;
    multiplyByScalar(s: number): Vector;
    divideByScalar(s: number): Vector;
    round(): Vector;
    distance(): number;
}
