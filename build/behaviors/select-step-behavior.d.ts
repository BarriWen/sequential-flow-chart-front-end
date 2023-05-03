import { Vector } from '../core/vector';
import { DesignerContext } from '../designer-context';
import { StepComponent } from '../workspace/component';
import { Behavior } from './behavior';
export declare class SelectStepBehavior implements Behavior {
    private readonly pressedStepComponent;
    private readonly context;
    static create(pressedStepComponent: StepComponent, context: DesignerContext): SelectStepBehavior;
    private constructor();
    onStart(): void;
    onMove(delta: Vector): Behavior | void;
    onEnd(interrupt: boolean): void;
}
