import { Vector } from '../../core/vector';
export declare class JoinView {
    static createStraightJoin(parent: SVGElement, start: Vector, height: number): void;
    static createJoins(parent: SVGElement, start: Vector, targets: Vector[]): void;
}
