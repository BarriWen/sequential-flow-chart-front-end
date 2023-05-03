import { Step } from '../definition';
import { DesignerContext } from '../designer-context';
import { Editor } from './editor';
import { StepEditorView } from './step-editor-view';
export declare class StepEditor implements Editor {
    readonly view: StepEditorView;
    static create(step: Step, context: DesignerContext): StepEditor;
    private constructor();
}
