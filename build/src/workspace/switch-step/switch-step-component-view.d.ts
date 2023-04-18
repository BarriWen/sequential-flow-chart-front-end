import { Vector } from "../../core/vector";
import { SwitchStep } from "../../definition";
import { StepsConfiguration } from "../../designer-configuration";
import { ComponentView } from "../component";
import { SequenceComponent } from "../sequence/sequence-component";
export declare class SwitchStepComponentView implements ComponentView {
    readonly g: SVGGElement;
    readonly width: number;
    readonly height: number;
    readonly joinX: number;
    readonly sequenceComponents: SequenceComponent[];
    private readonly regionView;
    private readonly inputView;
    private readonly validationErrorView;
    private constructor();
    static create(parent: SVGElement, step: SwitchStep, configuration: StepsConfiguration): SwitchStepComponentView;
    getClientPosition(): Vector;
    containsElement(element: Element): boolean;
    setIsDragging(isDragging: boolean): void;
    setIsSelected(isSelected: boolean): void;
    setIsDisabled(isDisabled: boolean): void;
    setIsValid(isValid: boolean): void;
}
