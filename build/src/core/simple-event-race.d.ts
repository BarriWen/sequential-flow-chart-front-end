import { SimpleEvent } from './simple-event';
export declare function race<A, B>(timeout: number, a: SimpleEvent<A>, b: SimpleEvent<B>): SimpleEvent<[A?, B?]>;
