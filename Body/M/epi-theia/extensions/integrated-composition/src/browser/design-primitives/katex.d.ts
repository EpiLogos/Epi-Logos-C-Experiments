declare module 'katex' {
    export interface KatexRenderOptions {
        readonly displayMode?: boolean;
        readonly throwOnError?: boolean;
        readonly strict?: boolean | 'ignore' | 'warn' | 'error';
        readonly output?: 'html' | 'mathml' | 'htmlAndMathml';
    }

    export function renderToString(tex: string, options?: KatexRenderOptions): string;
}
