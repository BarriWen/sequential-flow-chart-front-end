import { BehaviorController } from "./behaviors/behavior-controller";
import { SimpleEvent } from "./core/simple-event";
import { Vector } from "./core/vector";
import { Definition, Sequence, Step } from "./definition";
import { DesignerConfiguration } from "./designer-configuration";
import { LayoutController } from "./layout-controller";
import { Placeholder, StepComponent } from "./workspace/component";
export interface DefinitionChangedEvent {
    rerender: boolean;
}
export declare class DesignerContext {
    readonly definition: Definition;
    readonly behaviorController: BehaviorController;
    readonly layoutController: LayoutController;
    readonly configuration: DesignerConfiguration;
    isToolboxCollapsed: boolean;
    isSmartEditorCollapsed: boolean;
    readonly onViewPortChanged: SimpleEvent<ViewPort>;
    readonly onSelectedStepChanged: SimpleEvent<Step | null>;
    readonly onIsReadonlyChanged: SimpleEvent<boolean>;
    readonly onIsDraggingChanged: SimpleEvent<boolean>;
    readonly onIsMoveModeEnabledChanged: SimpleEvent<boolean>;
    readonly onIsToolboxCollapsedChanged: SimpleEvent<boolean>;
    readonly onIsSmartEditorCollapsedChanged: SimpleEvent<boolean>;
    readonly onDefinitionChanged: SimpleEvent<DefinitionChangedEvent>;
    viewPort: ViewPort;
    selectedStep: Step | null;
    isReadonly: boolean;
    isDragging: boolean;
    isMoveModeEnabled: boolean;
    private viewPortAnimation?;
    provider?: DesignerComponentProvider;
    constructor(definition: Definition, behaviorController: BehaviorController, layoutController: LayoutController, configuration: DesignerConfiguration, isToolboxCollapsed: boolean, isSmartEditorCollapsed: boolean);
    setViewPort(position: Vector, scale: number): void;
    resetViewPort(): void;
    animateViewPort(position: Vector, scale: number): void;
    moveViewPortToStep(stepId: string): void;
    limitScale(scale: number): number;
    zoom(direction: boolean): void;
    setSelectedStep(step: Step | null): void;
    selectStepById(stepId: string): void;
    tryInsertStep(step: Step, targetSequence: Sequence, targetIndex: number): boolean;
    tryMoveStep(sourceSequence: Sequence, step: Step, targetSequence: Sequence, targetIndex: number): boolean;
    tryDeleteStep(step: Step): boolean;
    setIsReadonly(isReadonly: boolean): void;
    setIsDragging(isDragging: boolean): void;
    toggleIsMoveModeEnabled(): void;
    toggleIsToolboxCollapsed(): void;
    toggleIsSmartEditorCollapsed(): void;
    notifiyDefinitionChanged(rerender: boolean): void;
    getPlaceholders(): Placeholder[];
    setProvider(provider: DesignerComponentProvider): void;
    private getProvider;
}
export interface ViewPort {
    position: Vector;
    scale: number;
}
export interface DesignerComponentProvider {
    getPlaceholders(): Placeholder[];
    getComponentByStepId(stepId: string): StepComponent;
    resetViewPort(): void;
    zoom(direction: boolean): void;
    moveViewPortToStep(stepComponent: StepComponent): void;
    render(): void;
}
export declare function promptChoices(context: DesignerContext, component: StepComponent): void;
