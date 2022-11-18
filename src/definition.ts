export interface Definition {
  sequence: Sequence;
  properties: Properties;
}

export type Sequence = Step[];

export interface Step {
  branches: any;
  id: string;
  componentType: ComponentType;
  type: string;
  name: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  properties: Properties;
}

export enum ComponentType {
  task = "task",
  switch = "switch",
  container = "container",
}

export interface TaskStep extends Step {
  componentType: ComponentType.task;
}

export interface SwitchStep extends Step {
  componentType: ComponentType.switch;
  branches: Branches;
}

export interface ContainerStep extends Step {
  componentType: ComponentType.container;
  sequence: Sequence;
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
