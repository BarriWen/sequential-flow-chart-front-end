import { DesignerContext } from '../designer-context';
export declare class ControlBar {
    private readonly view;
    private readonly context;
    static create(parent: HTMLElement, context: DesignerContext): ControlBar;
    private constructor();
    private onResetButtonClicked;
    private onZoomInButtonClicked;
    private onZoomOutButtonClicked;
    private onMoveButtonClicked;
    private onDeleteButtonClicked;
}
