import { Dom } from '../../core/dom';
import { Vector } from '../../core/vector';

export class JoinView {
	public static createStraightJoin(parent: SVGElement, start: Vector, height: number) {
		const join = Dom.svg('line', {
			class: 'sqd-join',
			x1: start.x,
			y1: start.y,
			x2: start.x,
			y2: start.y + height,
		});
		parent.insertBefore(join, parent.firstChild);
	}

	public static createJoins(parent: SVGElement, start: Vector, targets: Vector[]) {
		for (const target of targets) {
			const c = Math.abs(start.y - target.y) / 2; // size of a corner
			const l = Math.abs(start.x - target.x) - c * 2; // size of the line between corners

			const x = start.x > target.x ? -1 : 1;
			const y = start.y > target.y ? -1 : 1;

			const join = Dom.svg('path', {
				class: 'sqd-join',
				fill: 'none',
				d: `M ${start.x} ${start.y} q ${x * c * 0.3} ${y * c * 0.8} ${x * c} ${y * c} l ${x * l} 0 q ${x * c * 0.7} ${
					y * c * 0.2
				} ${x * c} ${y * c}`
				// M 224 58 q -2.4 6.4 -8 8 l -96 0 q -5.6 1.6 -8 8
				// "M 224 58 q 2.4 6.4 8 8 l 96 0 q 5.6 1.6 8 8"
			});
			parent.insertBefore(join, parent.firstChild);

			const endAuto = Dom.svg("image", {
				class: "sqd-end-icon",
				href: "./assets/end.svg",
				width: 20,
				height: 20,
				x: target.x - 10, // 112
				y: target.y + 50 + 89, // 124
			});
		
			const endText = Dom.svg("text", {
				class: "sqd-end-text",
				x: target.x - 57, // 102
				y: target.y + 50 + 126, // 134
			});
			endText.textContent = "End this automation";
			parent.appendChild(endAuto); 
			parent.appendChild(endText); 
		}
	}
}
