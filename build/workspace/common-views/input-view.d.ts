export declare class InputView {
    private readonly root;
    static createRectInput(parent: SVGElement, x: number, y: number, iconUrl: string | null): InputView;
    static createRoundInput(parent: SVGElement, x: number, y: number): InputView;
    private constructor();
    setIsHidden(isHidden: boolean): void;
}
