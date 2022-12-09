import { DesignerContext } from '../designer-context';
export declare class Toolbox {
    private readonly view;
    private readonly context;
    static create(parent: HTMLElement, context: DesignerContext): Toolbox;
    private filter?;
    private constructor();
    destroy(): void;
    private render;
    private toggleIsCollapsedClick;
    private onIsToolboxCollapsedChanged;
    private onFilterInputChanged;
}
