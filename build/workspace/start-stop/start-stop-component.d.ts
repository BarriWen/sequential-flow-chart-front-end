import { Sequence } from '../../definition';
import { StepsConfiguration } from '../../designer-configuration';
import { Component, Placeholder, StepComponent } from '../component';
import { StartStopComponentView } from './start-stop-component-view';
export declare class StartStopComponent implements Component {
    readonly view: StartStopComponentView;
    static create(parent: SVGElement, sequence: Sequence, configuration: StepsConfiguration): StartStopComponent;
    private constructor();
    findByElement(element: Element): StepComponent | null;
    findById(stepId: string): StepComponent | null;
    getPlaceholders(result: Placeholder[]): void;
    setIsDragging(isDragging: boolean): void;
    validate(): boolean;
}
