import { Dom } from '../../core/dom';
import { readMousePosition, readTouchPosition } from '../../core/event-readers';
import { Vector } from '../../core/vector';

export class ScrollBoxViewState {
	public static create(parent: SVGGElement, viewport: SVGElement): ScrollBoxViewState {
		const root = Dom.svg('svg', {
			class: 'sqd-scrollbox'
		});
		parent.appendChild(root);

		const view = new ScrollBoxViewState(root, viewport);
		window.addEventListener('resize', view.onResizeHandler, false);
		window.addEventListener('resize', view.onResizeHandler, false);
		root.addEventListener('wheel', e => view.onWheel(e), false);
		root.addEventListener('touchstart', e => view.onTouchStart(e), false);
		root.addEventListener('mousedown', e => view.onMouseDown(e), false);
		return view;
	}

	private readonly onResizeHandler = () => this.onResize();
	private readonly onTouchMoveHandler = (e: TouchEvent) => this.onTouchMove(e);
	private readonly onMouseMoveHandler = (e: MouseEvent) => this.onMouseMove(e);
	private readonly onTouchEndHandler = (e: TouchEvent) => this.onTouchEnd(e);
	private readonly onMouseUpHandler = (e: MouseEvent) => this.onMouseUp(e);

	private content?: {
		element: SVGGElement;
		height: number;
	};
	private scroll?: {
		startPositionY: number;
		startScrollTop: number;
	};

	public constructor(private readonly root: SVGGElement, private readonly viewport: SVGElement) {}

	public setContent(element: SVGGElement) {
		if (this.content) {
			this.root.removeChild(this.content.element);
		}
		element.classList.add('sqd-scrollbox-body');
		this.root.appendChild(element);
		this.reload(element);
	}

	public refresh() {
		if (this.content) {
			this.reload(this.content.element);
		}
	}

	public destroy() {
		window.removeEventListener('resize', this.onResizeHandler, false);
	}

	private reload(element: SVGGElement) {
		const maxHeightPercent = 0.7;
		const minDistance = 200;

		let height = Math.min(this.viewport.clientHeight * maxHeightPercent, element.clientHeight);
		height = Math.min(height, this.viewport.clientHeight - minDistance);

		// this.root.style.height = height + 'px';
		this.root.setAttribute("height", `${7000}`); 
		element.setAttribute("y", "0");
		// element.setAttribute("top", "0"); 

		this.content = {
			element,
			height
		};
	}

	private onResize() {
		this.refresh();
	}

	private onWheel(e: WheelEvent) {
		e.stopPropagation();

		if (this.content) {
			const delta = e.deltaY > 0 ? -25 : 25;
			const scrollTop = this.getScrollTop();
			this.setScrollTop(scrollTop + delta);
		}
	}

	private startScroll(startPosition: Vector) {
		if (!this.scroll) {
			window.addEventListener('touchmove', this.onTouchMoveHandler, false);
			window.addEventListener('mousemove', this.onMouseMoveHandler, false);
			window.addEventListener('touchend', this.onTouchEndHandler, false);
			window.addEventListener('mouseup', this.onMouseUpHandler, false);
		}

		this.scroll = {
			startPositionY: startPosition.y,
			startScrollTop: this.getScrollTop()
		};
	}

	private moveScroll(position: Vector) {
		if (this.scroll) {
			const delta = position.y - this.scroll.startPositionY;
			this.setScrollTop(this.scroll.startScrollTop + delta);
		}
	}

	private stopScroll() {
		if (this.scroll) {
			window.removeEventListener('touchmove', this.onTouchMoveHandler, false);
			window.removeEventListener('mousemove', this.onMouseMoveHandler, false);
			window.removeEventListener('touchend', this.onTouchEndHandler, false);
			window.removeEventListener('mouseup', this.onMouseUpHandler, false);
			this.scroll = undefined;
		}
	}

	private getScrollTop(): number {
		let posY: any; 
		if (this.content && this.content.element.hasAttribute("y")) {
			posY = this.content.element.getAttribute("y");
			console.log(posY); 
			return parseInt(posY); 
		}
		return 0;
	}

	private setScrollTop(scrollTop: number) {
		if (this.content) {
			const max = 1350;
			const limited = Math.max(Math.min(scrollTop, 0), -max);
			// this.content.element.style.top = limited + 'px';
			this.content.element.setAttribute("y", `${limited}`); 
			console.log("limited" + limited); 
		}
	}

	private onTouchStart(e: TouchEvent) {
		e.preventDefault();
		this.startScroll(readTouchPosition(e));
	}

	private onMouseDown(e: MouseEvent) {
		this.startScroll(readMousePosition(e));
	}

	private onTouchMove(e: TouchEvent) {
		e.preventDefault();
		this.moveScroll(readTouchPosition(e));
	}

	private onMouseMove(e: MouseEvent) {
		e.preventDefault();
		this.moveScroll(readMousePosition(e));
	}

	private onTouchEnd(e: TouchEvent) {
		e.preventDefault();
		this.stopScroll();
	}

	private onMouseUp(e: MouseEvent) {
		e.preventDefault();
		this.stopScroll();
	}
}
