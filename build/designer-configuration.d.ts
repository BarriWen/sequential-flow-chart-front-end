import { ComponentType, Definition, Sequence, Step } from './definition';
export interface DesignerConfiguration {
    theme?: string;
    isReadonly?: boolean;
    toolbox: ToolboxConfiguration;
    steps: StepsConfiguration;
    editors: EditorsConfiguration;
}
export interface ToolboxConfiguration {
    isHidden?: boolean;
    groups: ToolboxGroupConfiguration[];
}
export declare type StepDefinition = Omit<Step, 'id'>;
export interface ToolboxGroupConfiguration {
    name: string;
    steps: StepDefinition[];
}
export interface StepsConfiguration {
    canInsertStep?: (step: Step, targetSequence: Sequence, targetIndex: number) => boolean;
    canMoveStep?: (sourceSequence: Sequence, step: Step, targetSequence: Sequence, targetIndex: number) => boolean;
    canDeleteStep?: (step: Step, parentSequence: Sequence) => boolean;
    iconUrlProvider?: StepIconUrlProvider;
    validator?: StepValidator;
}
export declare type StepIconUrlProvider = (componentType: ComponentType, type: string) => string | null;
export declare type StepValidator = (step: Step) => boolean;
export interface EditorsConfiguration {
    isHidden?: boolean;
    stepEditorProvider: StepEditorProvider;
    globalEditorProvider: GlobalEditorProvider;
}
export interface StepEditorContext {
    notifyNameChanged(): void;
    notifyPropertiesChanged(): void;
}
export declare type StepEditorProvider = (step: Step, context: StepEditorContext) => HTMLElement;
export interface GlobalEditorContext {
    notifyPropertiesChanged(): void;
}
export declare type GlobalEditorProvider = (definition: Definition, context: GlobalEditorContext) => HTMLElement;
