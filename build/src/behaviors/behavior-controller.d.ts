import { Vector } from '../core/vector';
import { Behavior } from './behavior';
export declare class BehaviorController {
    private readonly onMouseMoveHandler;
    private readonly onMouseUpHandler;
    private readonly onTouchMoveHandler;
    private readonly onTouchEndHandler;
    private readonly onTouchStartHandler;
    private state?;
    start(startPosition: Vector, behavior: Behavior): void;
    private onMouseMove;
    private onTouchMove;
    private onMouseUp;
    private onTouchEnd;
    private onTouchStart;
    private move;
    private stop;
}
