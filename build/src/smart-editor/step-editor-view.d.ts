import { EditorView } from './editor';
export declare class StepEditorView implements EditorView {
    readonly root: HTMLElement;
    static create(content: HTMLElement): StepEditorView;
    private constructor();
}
