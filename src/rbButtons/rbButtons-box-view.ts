import { Dom } from '../core/dom';

export class rbButtonsBoxView {
    public static create(parent: HTMLElement): rbButtonsBoxView {
        const root = Dom.element('div', {
            class: 'rb-buttons-box'
        });

        const rbButton1 = createButton("../assets/round-bg.svg", "../assets/add-chat.svg", 'rbButton1');
        const rbButton2 = createButton("../assets/round-bg.svg", "../assets/menu.svg", 'rbButton2');

        root.appendChild(rbButton1);
        root.appendChild(rbButton2);
        parent.appendChild(root);
        return new rbButtonsBoxView(rbButton1, rbButton2);
    }

    private constructor(
        private readonly rbButton1: SVGSVGElement,
        private readonly rbButton2: SVGSVGElement,
    ) {}

    public bindRbButton1Click(handler: () => void) {
        bindClick(this.rbButton1, handler);
    }

    public bindRbButton2Click(handler: () => void) {
        bindClick(this.rbButton2, handler);
    }
}

function bindClick(element: SVGSVGElement, handler: () => void) {
    element.addEventListener(
        'click',
        e => {
            e.preventDefault();
            handler();
        },
        false
    );
}

function createButton(bgPath: string, mainPath: string, title: string): SVGSVGElement {
    const button = Dom.svg('svg', {
        class: 'rb-buttons-box-button',
        viewBox: '0 0 65 65',
        title
    });
    const bg = Dom.svg('image', {
        href: bgPath,
        x: 3,
        y: 3,
    });
    const main = Dom.svg('image', {
        href: mainPath,
        x: 19,
        y: 18,
    })
    button.appendChild(bg);
    button.appendChild(main);
    return button;
}