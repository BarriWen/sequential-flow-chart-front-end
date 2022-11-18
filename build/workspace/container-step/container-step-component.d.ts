import { ContainerStep, Sequence, Step } from '../../definition';
import { StepsConfiguration } from '../../designer-configuration';
import { Placeholder, StepComponent, StepComponentState } from '../component';
import { ContainerStepComponentView } from './container-step-component-view';
export declare class ContainerStepComponent implements StepComponent {
    readonly view: ContainerStepComponentView;
    readonly step: Step;
    readonly parentSequence: Sequence;
    private readonly configuration;
    static create(parent: SVGElement, step: ContainerStep, parentSequence: Sequence, configuration: StepsConfiguration): ContainerStepComponent;
    private currentState;
    private constructor();
    findByElement(element: Element): StepComponent | null;
    findById(stepId: string): StepComponent | null;
    getPlaceholders(result: Placeholder[]): void;
    setState(state: StepComponentState): void;
    setIsDragging(isDragging: boolean): void;
    validate(): boolean;
}
