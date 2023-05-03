import { Definition } from '../definition';
import { DesignerContext } from '../designer-context';
import { Editor } from './editor';
import { GlobalEditorView } from './global-editor-view';
export declare class GlobalEditor implements Editor {
    readonly view: GlobalEditorView;
    static create(definition: Definition, context: DesignerContext): GlobalEditor;
    private constructor();
}
