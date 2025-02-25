import { Definition, Sequence, Step } from '../definition';
export type StepOrName = Step | string;
export declare class StepsTranverser {
    static getParents(definition: Definition, needle: Sequence | Step): StepOrName[];
}
