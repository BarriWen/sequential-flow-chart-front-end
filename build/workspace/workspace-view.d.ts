import { Vector } from "../core/vector";
import { Sequence } from "../definition";
import { StepsConfiguration } from "../designer-configuration";
import { StartComponent } from "./start-stop/start-component";
export declare class WorkspaceView {
    private readonly workspace;
    private readonly canvas;
    private readonly gridPattern;
    private readonly gridPatternPath;
    private readonly foreground;
    private readonly configuration;
    static create(parent: HTMLElement, configuration: StepsConfiguration): WorkspaceView;
    private onResizeHandler;
    rootComponent?: StartComponent;
    private constructor();
    editStartComp(sequence: Sequence, journeyID: string): void;
    render(sequence: Sequence, journeyID: string): void;
    setPositionAndScale(position: Vector, scale: number): void;
    getClientPosition(): Vector;
    getClientSize(): Vector;
    bindMouseDown(handler: (position: Vector, target: Element, button: number) => void): void;
    bindTouchStart(handler: (position: Vector) => void): void;
    bindContextMenu(handler: (e: MouseEvent) => void): void;
    bindWheel(handler: (e: WheelEvent) => void): void;
    destroy(): void;
    refreshSize(): void;
    private onResize;
}
