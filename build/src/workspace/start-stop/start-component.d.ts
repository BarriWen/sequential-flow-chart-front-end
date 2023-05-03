import { Sequence } from "../../definition";
import { StepsConfiguration } from "../../designer-configuration";
import { Component, Placeholder, StepComponent } from "../component";
import { StartComponentView } from "./start-component-view";
export declare class StartComponent implements Component {
    readonly view: StartComponentView;
    static create(parent: SVGElement, sequence: Sequence, configuration: StepsConfiguration): StartComponent;
    private constructor();
    findByElement(element: Element): StepComponent | null;
    findById(stepId: string): StepComponent | null;
    getPlaceholders(result: Placeholder[]): void;
    setIsDragging(isDragging: boolean): void;
    validate(): boolean;
}
