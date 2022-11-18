import { Sequence, Step, TaskStep } from '../../definition';
import { StepsConfiguration } from '../../designer-configuration';
import { StepComponent, StepComponentState } from '../component';
import { TaskStepComponentView } from './task-step-component-view';
export declare class TaskStepComponent implements StepComponent {
    readonly view: TaskStepComponentView;
    readonly step: Step;
    readonly parentSequence: Sequence;
    private readonly configuration;
    static create(parent: SVGElement, step: TaskStep, parentSequence: Sequence, configuration: StepsConfiguration): TaskStepComponent;
    private constructor();
    findByElement(element: Element): StepComponent | null;
    findById(stepId: string): StepComponent | null;
    getPlaceholders(): void;
    setIsDragging(isDragging: boolean): void;
    setState(state: StepComponentState): void;
    validate(): boolean;
}
