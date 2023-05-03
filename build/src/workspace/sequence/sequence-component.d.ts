import { Sequence } from '../../definition';
import { StepsConfiguration } from '../../designer-configuration';
import { Component, Placeholder, StepComponent } from '../component';
import { SequenceComponentView } from './sequence-component-view';
export declare class SequenceComponent implements Component {
    readonly view: SequenceComponentView;
    private readonly sequence;
    static create(parent: SVGElement, sequence: Sequence, configuration: StepsConfiguration): SequenceComponent;
    private constructor();
    findByElement(element: Element): StepComponent | null;
    findById(stepId: string): StepComponent | null;
    getPlaceholders(result: Placeholder[]): void;
    setIsDragging(isDragging: boolean): void;
    validate(): boolean;
}
