export declare class ControlBarView {
    private readonly resetButton;
    private readonly zoomInButton;
    private readonly zoomOutButton;
    private readonly moveButton;
    private readonly deleteButton;
    static create(parent: HTMLElement): ControlBarView;
    private constructor();
    bindResetButtonClick(handler: () => void): void;
    bindZoomInButtonClick(handler: () => void): void;
    bindZoomOutButtonClick(handler: () => void): void;
    bindMoveButtonClick(handler: () => void): void;
    bindDeleteButtonClick(handler: () => void): void;
    setIsDeleteButtonHidden(isHidden: boolean): void;
    setIsMoveButtonDisabled(isDisabled: boolean): void;
}
