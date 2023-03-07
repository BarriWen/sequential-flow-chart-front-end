export interface Animation {
    isAlive: boolean;
    stop(): void;
}
export declare function animate(interval: number, handler: (progress: number) => void): Animation;
