declare const _exports: {
    new (view: any, context: any): {
        view: any;
        context: any;
        onDefinitionChanged: {
            listeners: any[];
            subscribe(listener: any): void;
            unsubscribe(listener: any): void;
            forward(value: any): void;
            count(): number;
        };
        getDefinition(): any;
        isValid(): any;
        isReadonly(): any;
        setIsReadonly(isReadonly: any): void;
        getSelectedStepId(): any;
        selectStepById(stepId: any): void;
        clearSelectedStep(): void;
        moveViewPortToStep(stepId: any): void;
        destroy(): void;
        onKeyUp(e: any): void;
    };
    create(parent: any, startDefinition: any, configuration: any): {
        view: any;
        context: any;
        onDefinitionChanged: {
            listeners: any[];
            subscribe(listener: any): void;
            unsubscribe(listener: any): void;
            forward(value: any): void;
            count(): number;
        };
        getDefinition(): any;
        isValid(): any;
        isReadonly(): any;
        setIsReadonly(isReadonly: any): void;
        getSelectedStepId(): any;
        selectStepById(stepId: any): void;
        clearSelectedStep(): void;
        moveViewPortToStep(stepId: any): void;
        destroy(): void;
        onKeyUp(e: any): void;
    };
    utils: {
        new (): {};
        nextId: () => string;
        getParents: (definition: any, needle: any) => any[];
    };
};
export = _exports;
