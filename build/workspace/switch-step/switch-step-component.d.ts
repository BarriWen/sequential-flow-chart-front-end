import { Sequence, Step, SwitchStep } from '../../definition';
import { StepsConfiguration } from '../../designer-configuration';
import { Placeholder, StepComponent, StepComponentState } from '../component';
import { SwitchStepComponentView } from './switch-step-component-view';
export declare class SwitchStepComponent implements StepComponent {
    readonly view: SwitchStepComponentView;
    readonly step: Step;
    readonly parentSequence: Sequence;
    private readonly configuration;
    static create(parent: SVGElement, step: SwitchStep, parentSequence: Sequence, configuration: StepsConfiguration): SwitchStepComponent;
    private currentState;
    private constructor();
    findByElement(element: Element): StepComponent | null;
    findById(stepId: string): StepComponent | null;
    getPlaceholders(result: Placeholder[]): void;
    setIsDragging(isDragging: boolean): void;
    setState(state: StepComponentState): void;
    validate(): boolean;
}
