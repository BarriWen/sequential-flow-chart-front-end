import { Vector } from "../../core/vector";
import { Sequence } from "../../definition";
import { StepsConfiguration } from "../../designer-configuration";
import { Component, ComponentView } from "../component";
export declare class SequenceComponentView implements ComponentView {
    readonly g: SVGGElement;
    readonly width: number;
    readonly height: number;
    readonly joinX: number;
    readonly placeholders: SVGElement[];
    readonly components: Component[];
    static create(parent: SVGElement, sequence: Sequence, configuration: StepsConfiguration): SequenceComponentView;
    private constructor();
    getClientPosition(): Vector;
    setIsDragging(isDragging: boolean): void;
}
