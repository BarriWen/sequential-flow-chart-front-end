import { Vector } from '../../core/vector';
import { TaskStep } from '../../definition';
import { StepsConfiguration } from '../../designer-configuration';
import { ComponentView } from '../component';
export declare class TaskStepComponentView implements ComponentView {
    readonly g: SVGGElement;
    readonly width: number;
    readonly height: number;
    readonly joinX: number;
    private readonly rect;
    private readonly inputView;
    private readonly outputView;
    private readonly validationErrorView;
    static create(parent: SVGElement, step: TaskStep, configuration: StepsConfiguration): TaskStepComponentView;
    private constructor();
    getClientPosition(): Vector;
    containsElement(element: Element): boolean;
    setIsDragging(isDragging: boolean): void;
    setIsDisabled(isDisabled: boolean): void;
    setIsSelected(isSelected: boolean): void;
    setIsValid(isValid: boolean): void;
}
