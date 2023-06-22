export declare class rbButtonsBoxView {
    private readonly rbButton1;
    private readonly rbButton2;
    static create(parent: HTMLElement): rbButtonsBoxView;
    private constructor();
    bindRbButton1Click(handler: () => void): void;
    bindRbButton2Click(handler: () => void): void;
}
