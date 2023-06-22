import { DesignerContext } from '../designer-context';
import { rbButtonsBoxView } from './rbButtons-box-view';

export class rbButtonsBox {
    public static create(parent: HTMLElement, context: DesignerContext): rbButtonsBox {
        const view = rbButtonsBoxView.create(parent);
        const box = new rbButtonsBox(view, context);
        view.bindRbButton1Click(() => box.onRbButton1Clicked());
        view.bindRbButton2Click(() => box.onRbButton2Clicked());
        return box;
    }

    private constructor(private readonly view: rbButtonsBoxView, private readonly context: DesignerContext) {}

    private onRbButton1Clicked() {
        // function to be implemented
    }

    private onRbButton2Clicked() {
        // function to be implemented
    }
}