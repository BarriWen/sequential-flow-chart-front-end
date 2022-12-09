import { StepDefinition } from '../designer-configuration';
import { DesignerContext } from '../designer-context';
export declare class ToolboxItem {
    private readonly step;
    private readonly context;
    static create(parent: HTMLElement, step: StepDefinition, context: DesignerContext): ToolboxItem;
    private constructor();
    private onTouchstart;
    private onMousedown;
    private onContextMenu;
    private startDrag;
}
