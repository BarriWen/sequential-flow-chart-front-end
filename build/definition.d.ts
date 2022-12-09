export interface Definition {
    sequence: Sequence;
    properties: Properties;
}
export declare type Sequence = Step[];
export interface Step {
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
export declare enum ComponentType {
    task = "task",
    switch = "switch"
}
export interface TaskStep extends Step {
    componentType: ComponentType.task;
}
export interface SwitchStep extends Step {
    componentType: ComponentType.switch;
    branches: Branches;
}
export interface Branches {
    [branchName: string]: Sequence;
}
export interface Properties {
    [name: string]: string | number;
}
export interface journeyProperties {
    journeyName: string;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
    description: string;
    journeyId: string;
}
