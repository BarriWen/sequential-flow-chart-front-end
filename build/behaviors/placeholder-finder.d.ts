import { Vector } from '../core/vector';
import { DesignerContext } from '../designer-context';
import { Placeholder } from '../workspace/component';
export declare class PlaceholderFinder {
    private readonly placeholders;
    private readonly context;
    static create(placeholders: Placeholder[], context: DesignerContext): PlaceholderFinder;
    private readonly clearCacheHandler;
    private cache?;
    private constructor();
    find(vLt: Vector, vWidth: number, vHeight: number): Placeholder | undefined;
    destroy(): void;
    private clearCache;
}
