import { ToolboxGroupConfiguration } from '../designer-configuration';
import { DesignerContext } from '../designer-context';
export declare class ToolboxView {
    private readonly header;
    private readonly headerToggleIcon;
    private readonly body;
    private readonly filterInput;
    private readonly scrollboxView;
    private readonly context;
    static create(parent: HTMLElement, context: DesignerContext): ToolboxView;
    private constructor();
    bindToggleIsCollapsedClick(handler: () => void): void;
    bindFilterInputChange(handler: (value: string) => void): void;
    setIsCollapsed(isCollapsed: boolean): void;
    setGroups(groups: ToolboxGroupConfiguration[]): void;
    destroy(): void;
}
