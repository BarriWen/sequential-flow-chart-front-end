import { Vector } from "../../core/vector";
import { TaskStep } from "../../definition";
import { StepsConfiguration } from "../../designer-configuration";
import { InputView } from "../common-views/input-view";
import { OutputView } from "../common-views/output-view";
import { ValidationErrorView } from "../common-views/validation-error-view";
import { ComponentView } from "../component";
export declare class TimeTriggerTaskStepComponentView implements ComponentView {
    g: SVGGElement;
    width: number;
    height: number;
    joinX: number;
    rect: SVGRectElement;
    readonly inputView: InputView;
    readonly outputView: OutputView;
    readonly validationErrorView: ValidationErrorView;
    private constructor();
    static create(parent: SVGElement, step: TaskStep, configuration: StepsConfiguration): TimeTriggerTaskStepComponentView;
    getClientPosition(): Vector;
    containsElement(element: Element): boolean;
    setIsDragging(isDragging: boolean): void;
    setIsDisabled(isDisabled: boolean): void;
    setIsSelected(isSelected: boolean): void;
    setIsValid(isValid: boolean): void;
}
