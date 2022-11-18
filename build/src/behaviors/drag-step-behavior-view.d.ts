import { Vector } from '../core/vector';
import { Step } from '../definition';
import { DesignerConfiguration } from '../designer-configuration';
export declare class DragStepView {
    readonly width: number;
    readonly height: number;
    private readonly layer;
    static create(step: Step, configuration: DesignerConfiguration): DragStepView;
    private constructor();
    setPosition(position: Vector): void;
    remove(): void;
}
