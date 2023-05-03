import { SimpleEvent } from "./core/simple-event";
import { Definition } from "./definition";
import { DesignerConfiguration } from "./designer-configuration";
import { Utils } from "./utils";
export default class Designer {
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
