import { DesignerContext } from '../designer-context';
export declare class SmartEditor {
    private readonly view;
    private readonly context;
    static create(parent: HTMLElement, context: DesignerContext): SmartEditor;
    private currentStep?;
    private constructor();
    toggleIsCollapsedClick(): void;
    private onSelectedStepChanged;
    private onDefinitionChanged;
    private tryRender;
}
