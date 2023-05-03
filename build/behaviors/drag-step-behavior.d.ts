import { Vector } from "../core/vector";
import { Step } from "../definition";
import { DesignerContext } from "../designer-context";
import { StepComponent } from "../workspace/component";
import { Behavior } from "./behavior";
export declare class DragStepBehavior implements Behavior {
    private readonly view;
    private readonly context;
    private readonly step;
    private readonly movingStepComponent?;
    static create(context: DesignerContext, step: Step, movingStepComponent?: StepComponent): DragStepBehavior;
    private state?;
    private currentPlaceholder?;
    private constructor();
    onStart(position: Vector): void;
    onMove(delta: Vector): void;
    onEnd(interrupt: boolean): void;
}
