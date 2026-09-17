import type { M2CymaticFrame } from './meaning-packet';

export type CymaticSurfaceVariant = 'plate';

export interface CymaticChladniSurfaceRenderInput {
    readonly frame: M2CymaticFrame;
    readonly width?: number;
    readonly height?: number;
    readonly surfaceVariant?: CymaticSurfaceVariant;
    readonly tick?: number | null;
}

export interface CymaticChladniSurfacePixels {
    readonly width: number;
    readonly height: number;
    readonly rgba: Uint8ClampedArray;
    readonly byteHash: string;
}

const DEFAULT_WIDTH = 144;
const DEFAULT_HEIGHT = 144;

export function renderCymaticChladniSurfacePixels(
    input: CymaticChladniSurfaceRenderInput
): CymaticChladniSurfacePixels {
    const width = positiveInt(input.width, DEFAULT_WIDTH);
    const height = positiveInt(input.height, DEFAULT_HEIGHT);
    const rgba = new Uint8ClampedArray(width * height * 4);
    const audioOctet = input.frame.audioOctetHz;
    const nodalQuartet = input.frame.nodalQuartet;
    const maxHz = Math.max(...audioOctet);

    for (let y = 0; y < height; y += 1) {
        const normalizedY = y / Math.max(1, height - 1);
        for (let x = 0; x < width; x += 1) {
            const normalizedX = x / Math.max(1, width - 1);
            const chi = evaluatePlateChi(audioOctet, nodalQuartet, input.frame.address72, maxHz, normalizedX, normalizedY);
            writePlatePixel(rgba, (y * width + x) * 4, chi, normalizedX, normalizedY);
        }
    }

    return Object.freeze({
        width,
        height,
        rgba,
        byteHash: stableRgbaHash(rgba)
    });
}

function evaluatePlateChi(
    audioOctet: readonly number[],
    nodalQuartet: readonly Readonly<Record<string, unknown>>[],
    address72: number,
    maxHz: number,
    x: number,
    y: number
): number {
    let amplitude = 0;
    for (let index = 0; index < audioOctet.length; index += 1) {
        const node = nodalQuartet[index % nodalQuartet.length];
        const m = numericNodeValue(node.m, 1);
        const n = numericNodeValue(node.n, 1);
        const phase = ((address72 + index + 1) * Math.PI) / 36;
        const normalisedHz = audioOctet[index] / maxHz;
        amplitude +=
            normalisedHz *
            (Math.sin(m * Math.PI * x + phase) * Math.sin(n * Math.PI * y) +
                Math.cos(n * Math.PI * x + phase / 2) * Math.cos(m * Math.PI * y));
    }
    return amplitude / Math.max(1, audioOctet.length);
}

function writePlatePixel(rgba: Uint8ClampedArray, index: number, chi: number, x: number, y: number): void {
    const nodalLine = Math.max(0, 1 - Math.min(1, Math.abs(chi) * 22));
    const interference = Math.min(1, Math.abs(chi) * 1.8);
    const radial = Math.hypot(x - 0.5, y - 0.5);
    const glow = Math.max(0, 1 - radial * 1.8);
    const warm = chi >= 0;

    rgba[index] = Math.round((warm ? 158 : 45) * interference + 16 + nodalLine * 218 + glow * 24);
    rgba[index + 1] = Math.round((warm ? 88 : 135) * interference + 18 + nodalLine * 210 + glow * 18);
    rgba[index + 2] = Math.round((warm ? 48 : 176) * interference + 24 + nodalLine * 205 + glow * 42);
    rgba[index + 3] = 255;
}

function numericNodeValue(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) ? Math.max(1, Math.trunc(value)) : fallback;
}

function positiveInt(value: number | undefined, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.trunc(value) : fallback;
}

function stableRgbaHash(rgba: Uint8ClampedArray): string {
    let hash = 0x811c9dc5;
    for (const byte of rgba) {
        hash ^= byte;
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, '0');
}
