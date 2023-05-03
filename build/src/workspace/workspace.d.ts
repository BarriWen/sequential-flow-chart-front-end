import { DesignerComponentProvider, DesignerContext } from "../designer-context";
import { Placeholder, StepComponent } from "./component";
export declare class Workspace implements DesignerComponentProvider {
    private readonly view;
    private readonly context;
    static create(parent: HTMLElement, context: DesignerContext): Workspace;
    isValid: boolean;
    private selectedStepComponent;
    private constructor();
    render(): void;
    getPlaceholders(): Placeholder[];
    getSelectedStepComponent(): StepComponent;
    getComponentByStepId(stepId: string): StepComponent;
    resetViewPort(): void;
    zoom(direction: boolean): void;
    moveViewPortToStep(stepComponent: StepComponent): void;
    destroy(): void;
    private revalidate;
    private onMouseOver;
    private onMouseDown;
    private onTouchStart;
    private onContextMenu;
    private startBehavior;
    private onWheel;
    private onIsDraggingChanged;
    private onIsSmartEditorCollapsedChanged;
    private onViewPortChanged;
    private onSelectedStepChanged;
    private trySelectStep;
    private getRootComponent;
}
