export declare class OutputView {
    private readonly root;
    static create(parent: SVGElement, x: number, y: number): OutputView;
    constructor(root: SVGElement);
    setIsHidden(isHidden: boolean): void;
}
