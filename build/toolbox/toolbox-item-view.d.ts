import { StepDefinition, StepsConfiguration } from '../designer-configuration';
export declare class ToolboxItemView {
    private readonly root;
    static create(parent: HTMLElement, step: StepDefinition, configuration: StepsConfiguration): ToolboxItemView;
    private constructor();
    bindMousedown(handler: (e: MouseEvent) => void): void;
    bindTouchstart(handler: (e: TouchEvent) => void): void;
    bindContextMenu(handler: (e: MouseEvent) => void): void;
}
