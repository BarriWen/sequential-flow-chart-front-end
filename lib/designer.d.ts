declare class SimpleEvent<T> {
    private readonly listeners;
    subscribe(listener: SimpleEventListener<T>): void;
    unsubscribe(listener: SimpleEventListener<T>): void;
    forward(value: T): void;
    count(): number;
}
type SimpleEventListener<T> = (value: T) => void;

interface Definition {
    sequence: Sequence;
    properties: Properties;
}
type Sequence = Step[];
interface Step {
    branches: any;
    id: string;
    componentType: ComponentType;
    type: string;
    name: string;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    properties: Properties;
}
declare enum ComponentType {
    task = "task",
    switch = "switch"
}
interface Properties {
    [name: string]: string | number;
}

interface DesignerConfiguration {
    theme?: string;
    isReadonly?: boolean;
    toolbox: ToolboxConfiguration;
    steps: StepsConfiguration;
    editors: EditorsConfiguration;
}
interface ToolboxConfiguration {
    isHidden?: boolean;
    groups: ToolboxGroupConfiguration[];
}
type StepDefinition = Omit<Step, 'id'>;
interface ToolboxGroupConfiguration {
    name: string;
    steps: StepDefinition[];
}
interface StepsConfiguration {
    canInsertStep?: (step: Step, targetSequence: Sequence, targetIndex: number) => boolean;
    canMoveStep?: (sourceSequence: Sequence, step: Step, targetSequence: Sequence, targetIndex: number) => boolean;
    canDeleteStep?: (step: Step, parentSequence: Sequence) => boolean;
    iconUrlProvider?: StepIconUrlProvider;
    validator?: StepValidator;
}
type StepIconUrlProvider = (componentType: ComponentType, type: string) => string | null;
type StepValidator = (step: Step) => boolean;
interface EditorsConfiguration {
    isHidden?: boolean;
    stepEditorProvider: StepEditorProvider;
    globalEditorProvider: GlobalEditorProvider;
}
interface StepEditorContext {
    notifyNameChanged(): void;
    notifyPropertiesChanged(): void;
}
type StepEditorProvider = (step: Step, context: StepEditorContext) => HTMLElement;
interface GlobalEditorContext {
    notifyPropertiesChanged(): void;
}
type GlobalEditorProvider = (definition: Definition, context: GlobalEditorContext) => HTMLElement;

type StepOrName = Step | string;
declare class StepsTranverser {
    static getParents(definition: Definition, needle: Sequence | Step): StepOrName[];
}

declare class Uid {
    static next(): string;
}

declare class Utils {
    static readonly nextId: typeof Uid.next;
    static readonly getParents: typeof StepsTranverser.getParents;
}

declare class Designer {
    private readonly view;
    private readonly context;
    static readonly utils: typeof Utils;
    static create(parent: HTMLElement, startDefinition: Definition, configuration: DesignerConfiguration): Designer;
    private constructor();
    readonly onDefinitionChanged: SimpleEvent<Definition>;
    getDefinition(): Definition;
    isValid(): boolean;
    isReadonly(): boolean;
    setIsReadonly(isReadonly: boolean): void;
    getSelectedStepId(): string | null;
    selectStepById(stepId: string): void;
    clearSelectedStep(): void;
    moveViewPortToStep(stepId: string): void;
    destroy(): void;
    private onKeyUp;
}

export { Designer as default };
