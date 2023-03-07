import { Vector } from '../../core/vector';
import { Sequence } from '../../definition';
import { StepsConfiguration } from '../../designer-configuration';
import { ComponentView } from '../component';
import { SequenceComponent } from '../sequence/sequence-component';
export declare class StopComponentView implements ComponentView {
    readonly g: SVGGElement;
    readonly width: number;
    readonly height: number;
    readonly joinX: number;
    readonly component: SequenceComponent;
    static create(parent: SVGElement, sequence: Sequence, configuration: StepsConfiguration): StopComponentView;
    private constructor();
    getClientPosition(): Vector;
    destroy(): void;
}
