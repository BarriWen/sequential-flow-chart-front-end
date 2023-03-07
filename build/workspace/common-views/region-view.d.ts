import { Vector } from '../../core/vector';
export declare class RegionView {
    private readonly regions;
    static create(parent: SVGElement, widths: number[], height: number): RegionView;
    constructor(regions: SVGElement[]);
    getClientPosition(): Vector;
    setIsSelected(isSelected: boolean): void;
}
