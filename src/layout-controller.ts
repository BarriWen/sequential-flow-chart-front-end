export class LayoutController {
	public constructor(public readonly parent: HTMLElement) {}

	public isMobile(): boolean {
		return this.parent.clientWidth < 400; // TODO
	}
}
