export interface Attributes {
    [name: string]: string | number;
}
export declare class Dom {
    static svg<K extends keyof SVGElementTagNameMap>(name: K, attributes?: Attributes): SVGElementTagNameMap[K];
    static translate(element: SVGElement, x: number, y: number): void;
    static attrs(element: Element, attributes: Attributes): void;
    static element<T extends keyof HTMLElementTagNameMap>(name: T, attributes?: Attributes): HTMLElementTagNameMap[T];
    static toggleClass(element: Element, isEnabled: boolean, className: string): void;
}
