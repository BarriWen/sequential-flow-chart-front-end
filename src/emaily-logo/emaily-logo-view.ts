import { Dom } from '../core/dom';

export class MyIconView {
    public static create(parent: HTMLElement): MyIconView {
        const icon = Dom.svg('image', {
            href: './path/to/my-icon.svg',
            width: 30,
            height: 30,
        });

        parent.appendChild(icon);

        return new MyIconView(icon);
    }

    private constructor(private readonly icon: SVGElement) {}
}
