import { Dom } from '../../core/dom';

const LABEL_HEIGHT = 22;
const LABEL_PADDING_X = 10;
const MIN_LABEL_WIDTH = 50;

export class LabelView {
	public static create(parent: SVGElement, x: number, y: number, text: string, theme?: string) {
		const nameText = Dom.svg('text', {
			x,
			y: y + LABEL_HEIGHT / 2, 
			class: "sqd-label-text"
		});
		nameText.textContent = text;
		if (nameText.textContent == "YES") {
			nameText.setAttribute("class", "sqd-label-text-yes sqd-label-text"); 
		} if (nameText.textContent == "NO") {
			nameText.setAttribute("class", "sqd-label-text-no sqd-label-text"); 
		}
		parent.appendChild(nameText);
		const nameWidth = Math.max(nameText.getBBox().width + LABEL_PADDING_X * 2, MIN_LABEL_WIDTH);

		const nameRect = Dom.svg('rect', {
			class: 'sqd-label-rect',
			width: nameWidth,
			height: LABEL_HEIGHT,
			x: x - nameWidth / 2,
			y,
			rx: 10,
			ry: 10
		});
		if (theme) {
			nameRect.classList.add(`sqd-label-${theme}`);
		}
		// parent.insertBefore(nameRect, nameText);
	}
}
