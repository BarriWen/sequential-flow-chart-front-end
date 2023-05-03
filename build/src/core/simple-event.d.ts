export declare class SimpleEvent<T> {
    private readonly listeners;
    subscribe(listener: SimpleEventListener<T>): void;
    unsubscribe(listener: SimpleEventListener<T>): void;
    forward(value: T): void;
    count(): number;
}
export type SimpleEventListener<T> = (value: T) => void;
