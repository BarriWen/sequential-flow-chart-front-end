import { EditorView } from './editor';
export declare class SmartEditorView {
    private readonly root;
    private readonly toggle;
    private readonly toggleIcon;
    static create(parent: HTMLElement): SmartEditorView;
    private view?;
    private constructor();
    bindToggleIsCollapsedClick(handler: () => void): void;
    setIsCollapsed(isCollapsed: boolean): void;
    setView(view: EditorView): void;
}
