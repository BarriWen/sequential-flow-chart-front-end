import { EditorView } from './editor';
export declare class GlobalEditorView implements EditorView {
    readonly root: HTMLElement;
    static create(content: HTMLElement): GlobalEditorView;
    private constructor();
}
