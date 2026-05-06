declare module 'js-yaml' {
  export function dump(value: unknown, options?: { lineWidth?: number }): string;
  export function load(text: string): unknown;
}
