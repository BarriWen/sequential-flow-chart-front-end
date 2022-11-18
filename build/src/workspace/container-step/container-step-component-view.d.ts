import { Vector } from '../../core/vector';
import { ContainerStep } from '../../definition';
import { StepsConfiguration } from '../../designer-configuration';
import { ComponentView } from '../component';
import { SequenceComponent } from '../sequence/sequence-component';
export declare class ContainerStepComponentView implements ComponentView {
    readonly g: SVGGElement;
    readonly width: number;
    readonly height: number;
    readonly joinX: number;
    readonly sequenceComponent: SequenceComponent;
    private readonly inputView;
    private readonly regionView;
    private readonly validationErrorView;
    static create(parent: SVGElement, step: ContainerStep, configuration: StepsConfiguration): ContainerStepComponentView;
    private constructor();
    getClientPosition(): Vector;
    containsElement(element: Element): boolean;
    setIsDragging(isDragging: boolean): void;
    setIsSelected(isSelected: boolean): void;
    setIsDisabled(isDisabled: boolean): void;
    setIsValid(isHidden: boolean): void;
}
