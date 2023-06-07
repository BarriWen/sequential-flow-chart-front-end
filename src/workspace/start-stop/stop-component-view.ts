import { Dom } from '../../core/dom';
import { Vector } from '../../core/vector';
import { Sequence } from '../../definition';
import { StepsConfiguration } from '../../designer-configuration';
import { ComponentView } from '../component';
import { SequenceComponent } from '../sequence/sequence-component';

const SIZE = 30;

export class StopComponentView implements ComponentView {
	public static create(parent: SVGElement, sequence: Sequence, configuration: StepsConfiguration): StopComponentView {
		const g = Dom.svg('g');
		parent.appendChild(g);

		const sequenceComponent = SequenceComponent.create(g, sequence, configuration);
		const view = sequenceComponent.view;

		const endCircle = createCircle(false);
		Dom.translate(endCircle, view.joinX - SIZE / 2, SIZE + view.height);
		g.appendChild(endCircle);

		return new StopComponentView(g, view.width, view.height + SIZE * 2, view.joinX, sequenceComponent);
	}

	private constructor(
		public readonly g: SVGGElement,
		public readonly width: number,
		public readonly height: number,
		public readonly joinX: number,
		public readonly component: SequenceComponent
	) {}

	public getClientPosition(): Vector {
		throw new Error('Not supported');
	}

	public destroy() {
		this.g.parentNode?.removeChild(this.g);
	}
}

function createCircle(isStart: boolean): SVGGElement {
	const g = Dom.svg('g');
	const s = SIZE * 0.5;
	const m = (SIZE - s) / 2;

	if (isStart) {
		const start = Dom.svg('path', {
			class: 'sqd-start-stop-icon sqd-hidden',
			transform: `translate(${m}, ${m})`,
			d: `M ${s * 0.2} 0 L ${s} ${s / 2} L ${s * 0.2} ${s} Z`
		});
		g.appendChild(start);
	} else {
		const endAuto = Dom.svg("image", {
			class: "sqd-end-icon", 
			href: "./assets/end.svg", 
			width: 20, 
			height: 20, 
		}); 

		const endText = Dom.svg("text", {
			class: "sqd-end-text", 
			x: 10, 
			y: 10, 
		}); 
		endText.textContent = "End this automation"; 
		g.appendChild(endAuto);
		g.appendChild(endText); 
		createEndPoint(g);
	}
	return g;
}

// set a function to create more end points
function createEndPoint(g: SVGGElement){
	const circle = Dom.svg('circle', {
		class: 'sqd-start-stod',
		cx: SIZE / 2,
		cy: SIZE / 2,
		r: SIZE / 2
	});
	g.appendChild(circle);
	const s = SIZE * 0.5;
	const m = (SIZE - s) / 2;

	const endAuto = Dom.svg("image", {
        class: "sqd-end-icon", 
        href: "./assets/end.svg", 
        width: 20, 
        height: 20, 
    }); 
	
	function getStop(){
		return endAuto;
	}
	g.appendChild(endAuto);
}
