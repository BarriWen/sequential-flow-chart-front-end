import { Sequence } from '../../definition';
import { StepsConfiguration } from '../../designer-configuration';
import { Component, Placeholder, StepComponent } from '../component';
import { StopComponentView } from './stop-component-view';
export declare class StopComponent implements Component {
    view: StopComponentView;
    static create(parent: SVGElement, sequence: Sequence, configuration: StepsConfiguration): StopComponent;
    private constructor();
    findByElement(element: Element): StepComponent | null;
    findById(stepId: string): StepComponent | null;
    getPlaceholders(result: Placeholder[]): void;
    setIsDragging(isDragging: boolean): void;
    validate(): boolean;
}
