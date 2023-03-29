declare function createTaskStep(id: any, type: any, name: any): {
    id: any;
    componentType: string;
    type: any;
    name: any;
    properties: {};
};
declare function createTaskStep(id: any, type: any, name: any): {
    id: any;
    componentType: string;
    type: any;
    name: any;
    properties: {};
};
declare function createIfStep(id: any, _true: any, _false: any): {
    id: any;
    componentType: string;
    type: string;
    name: string;
    branches: {
        True: any;
        False: any;
    };
    properties: {};
};
declare function createIfStep(id: any, _true: any, _false: any): {
    id: any;
    componentType: string;
    type: string;
    name: string;
    branches: {
        True: any;
        False: any;
    };
    properties: {};
};
declare function toolboxGroup(name: any): {
    name: any;
    steps: {
        id: any;
        componentType: string;
        type: any;
        name: any;
        properties: {};
    }[];
};
declare function toolboxGroup(name: any): {
    name: any;
    steps: {
        id: any;
        componentType: string;
        type: any;
        name: any;
        properties: {};
    }[];
};
declare function createStep(currElement: any): {
    id: any;
    componentType: string;
    type: any;
    name: any;
    properties: {};
};
declare function createStep(currElement: any): any;
declare function loadDefinition(input: any): {
    properties: {
        journeyName: any;
        createdAt: Date;
        createdBy: any;
        updatedAt: Date;
        updatedBy: any;
        description: any;
        journeyId: any;
    };
    sequence: any[];
};
declare function loadDefinition(input: any): {
    properties: {
        journeyName: any;
        createdAt: Date;
        createdBy: any;
        updatedAt: Date;
        updatedBy: any;
        description: any;
        journeyId: any;
    };
    sequence: any[];
};
declare function createDesinger(startDefinition: any): void;
declare function createDesinger(startDefinition: any): void;
declare function drawButtons(): void;
declare function drawButtons(): void;
declare function onActivateClicked(): void;
declare function onActivateClicked(): void;
declare function makeReq(method: any, target: any, data: any, returnCode: any): false | undefined;
declare function makeReq(method: any, target: any, data: any, returnCode: any): false | undefined;
declare function makeHandler(httpRequest: any, returnCode: any, method: any): () => void;
declare function makeHandler(httpRequest: any, returnCode: any, method: any): () => void;
declare function saver(): void;
declare function saver(): void;
declare let designer: any;
declare namespace configuration {
    namespace toolbox {
        const isHidden: boolean;
        const groups: {
            name: any;
            steps: {
                id: any;
                componentType: string;
                type: any;
                name: any;
                properties: {};
            }[];
        }[];
    }
    namespace steps {
        function iconUrlProvider(componentType: any, type: any): string;
        function validator(step: any): boolean;
    }
    namespace editors {
        const isHidden_1: boolean;
        export { isHidden_1 as isHidden };
        export function globalEditorProvider(definition: any): HTMLDivElement;
        export function stepEditorProvider(step: any, editorContext: any): HTMLDivElement;
    }
}
declare let timeoutID: any;
declare let timeout: number;
declare let startDefinition: any;
declare var url: string;
declare const journeyID: string;
