import { Vector } from '../core/vector';
import { Sequence } from '../definition';
import { StepsConfiguration } from '../designer-configuration';
import { StartStopComponent } from './start-stop/start-stop-component';
export declare class WorkspaceView {
    private readonly workspace;
    private readonly canvas;
    private readonly gridPattern;
    private readonly gridPatternPath;
    private readonly foreground;
    private readonly configuration;
    static create(parent: HTMLElement, configuration: StepsConfiguration): WorkspaceView;
    private onResizeHandler;
    rootComponent?: StartStopComponent;
    private constructor();
    render(sequence: Sequence): void;
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
