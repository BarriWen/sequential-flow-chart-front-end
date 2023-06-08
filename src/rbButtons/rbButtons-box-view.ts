import { Dom } from '../core/dom';

export class rbButtonsView {
    public static create(parent: HTMLElement): rbButtonsView {
        const root = Dom.element('div', {
            class: 'rb-buttons'
        });

        const rbButton1 = createButton("./assets/add-chat.svg", 'rbButton1');
        const rbButton2 = createButton("./assets/menu.svg", 'rbButton2');

        root.appendChild(rbButton1);
        root.appendChild(rbButton2);
        parent.appendChild(root);
        return new rbButtonsView(rbButton1, rbButton2);
    }

    private constructor(
        private readonly rbButton1: HTMLElement,
        private readonly rbButton2: HTMLElement,
    ) {}

    public bindRbButton1Click(handler: () => void) {
        bindClick(this.rbButton1, handler);
    }

    public bindRbButton2Click(handler: () => void) {
        bindClick(this.rbButton2, handler);
    }
}

function bindClick(element: HTMLElement, handler: () => void) {
    element.addEventListener(
        'click',
        e => {
            e.preventDefault();
            handler();
        },
        false
    );
}

function createButton(iconContent: string, title: string): HTMLElement {
    const button = Dom.element('div', {
        class: 'rb-buttons-button',
        title
    });
    const icon = Dom.svg('image', {
        href: iconContent,
    });
    button.appendChild(icon);
    return button;
}