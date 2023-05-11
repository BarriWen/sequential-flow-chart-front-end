import { DesignerConfiguration } from "./designer-configuration";
import { DesignerContext } from "./designer-context";
import { LayoutController } from "./layout-controller";
import { Toolbox } from "./toolbox/toolbox";
import { Workspace } from "./workspace/workspace";
export declare class DesignerView {
    private readonly root;
    private readonly layoutController;
    readonly workspace: Workspace;
    private readonly toolbox?;
    static create(parent: HTMLElement, context: DesignerContext, configuration: DesignerConfiguration): DesignerView;
    private readonly onResizeHandler;
    private readonly onKeyUpHandlers;
    constructor(root: HTMLElement, layoutController: LayoutController, workspace: Workspace, toolbox?: Toolbox | undefined);
    bindKeyUp(handler: KeyUpHandler): void;
    destroy(): void;
    private onResize;
    private reloadLayout;
}
export type KeyUpHandler = (e: KeyboardEvent) => void;
