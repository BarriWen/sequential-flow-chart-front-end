import { Vector } from '../core/vector';
import { DesignerContext } from '../designer-context';
import { Behavior } from './behavior';
export declare class MoveViewPortBehavior implements Behavior {
    private readonly startPosition;
    private readonly context;
    static create(context: DesignerContext): MoveViewPortBehavior;
    private constructor();
    onStart(): void;
    onMove(delta: Vector): void;
    onEnd(): void;
}
