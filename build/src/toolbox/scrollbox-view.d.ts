export declare class ScrollBoxView {
    private readonly root;
    private readonly viewport;
    static create(parent: HTMLElement, viewport: HTMLElement): ScrollBoxView;
    private readonly onResizeHandler;
    private readonly onMouseUpHandler;
    private content?;
    private scroll?;
    constructor(root: HTMLElement, viewport: HTMLElement);
    setContent(element: HTMLElement): void;
    refresh(): void;
    destroy(): void;
    private reload;
    private onResize;
    private onWheel;
    private onTouchStart;
    private onMouseDown;
    private onTouchMove;
    private onMouseMove;
    private onTouchEnd;
    private onMouseUp;
    private startScroll;
    private moveScroll;
    private stopScroll;
    private getScrollTop;
    private setScrollTop;
}
