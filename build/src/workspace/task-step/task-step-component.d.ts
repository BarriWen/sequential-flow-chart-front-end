import { Sequence, Step, TaskStep } from "../../definition";
import { StepsConfiguration } from "../../designer-configuration";
import { StepComponent, StepComponentState } from "../component";
import { TriggerComponentView } from "./trigger-component-view";
import { TimeDelayTaskStepComponentView } from "./time-delay-component-view";
import { TagComponentView } from "./tag-component-view";
import { TimeTriggerTaskStepComponentView } from "./time-trigger-component-view";
import { EmailComponentView } from "./email-component-view";
export declare class TaskStepComponent implements StepComponent {
    readonly view: EmailComponentView | TriggerComponentView | TimeDelayTaskStepComponentView | TagComponentView | TimeTriggerTaskStepComponentView;
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
