import { Sequence, Step } from '../definition';
import { StepsConfiguration } from '../designer-configuration';
import { StepComponent } from './component';
export declare class StepComponentFactory {
    static create(parent: SVGElement, step: Step, parentSequence: Sequence, configuration: StepsConfiguration): StepComponent;
}
