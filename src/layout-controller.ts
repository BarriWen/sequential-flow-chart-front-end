export class LayoutController {
	public constructor(private readonly parent: HTMLElement) {}

	public isMobile(): boolean {
		return this.parent.clientWidth < 400; // TODO
	}
	public getParent(): HTMLElement {
		return this.parent; // TODO
	}
}
