export declare class ControlBarView {
    private readonly zoomInButton;
    private readonly zoomPercentageElement;
    private readonly zoomOutButton;
    static create(parent: HTMLElement): ControlBarView;
    private constructor();
    bindZoomInButtonClick(handler: () => void): void;
    bindZoomOutButtonClick(handler: () => void): void;
    setZoomPercentage(percentage: number): void;
}
