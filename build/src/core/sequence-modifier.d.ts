import { Sequence, Step } from "../definition";
export declare class SequenceModifier {
    static moveStep(sourceSequence: Sequence, step: Step, targetSequence: Sequence, targetIndex: number): void;
    static insertStep(step: Step, targetSequence: Sequence, targetIndex: number): void;
    static deleteStep(step: Step, parentSequence: Sequence, choice: string | number | undefined): void;
}
