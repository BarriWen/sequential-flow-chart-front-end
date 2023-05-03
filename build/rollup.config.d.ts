declare const _default: ({
    input: string;
    plugins: import("rollup").Plugin[];
    output: {
        file: string;
        format: string;
        name: string;
    }[];
} | {
    input: string;
    output: {
        file: string;
        format: string;
    }[];
    plugins: import("rollup").Plugin[];
})[];
export default _default;
