import { Sequence } from "../../definition";
import { Placeholder } from "../component";
export declare class SequencePlaceholder implements Placeholder {
    readonly element: Element;
    readonly parentSequence: Sequence;
    readonly index: number;
    constructor(element: Element, parentSequence: Sequence, index: number);
    setIsHover(isHover: boolean): void;
}
