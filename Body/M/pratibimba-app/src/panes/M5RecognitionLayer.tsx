/**
 * Coordinate: M' M5' (personal composition recognition layer)
 * Residency: Body/M/pratibimba-app/src/panes/M5RecognitionLayer.tsx
 * Position (#n): #5 — Mahamaya recognition scoring inside the 4-5-0 surface.
 * Actualises: Track 26.T26.11.
 * Public surface: M5RecognitionLayer, readM5RecognitionLayer.
 * Does NOT own: canonical recognition production, quaternion composition,
 * EBM scoring, or session-close dispatch.
 * Composition role: Surface 3 (recognition-layer slot) of the three M5'
 *   surfaces — composes with the M4 journal + M0 cymatic into one personal
 *   face per contracts/m5-prime-surface-composition.md §1/§4.
 */

import { useMemo } from 'react';
import { useTickStore } from '../state/stores';
import { buildResonanceEbmSurface, type TritoneSquareReading } from './m5Ebm';

type RecordValue = Readonly<Record<string, unknown>>;

export interface M5RecognitionLayerReading {
    readonly state: 'ready' | 'pending-handle' | 'pending-anchor' | 'pending-strength' | 'pending-ebm';
    readonly recognitionStrength: number | null;
    readonly bimbaCoordinate: string | null;
    readonly activeSquare: string | null;
    readonly mobiusReturnReady: boolean;
}

function objectValue(value: unknown): RecordValue | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? (value as RecordValue)
        : null;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function strongestSquare(squares: readonly TritoneSquareReading[]): string | null {
    const scored = squares.filter(
        (square): square is TritoneSquareReading & { readonly coherenceScore: number } =>
            square.coherenceScore !== null
    );
    if (scored.length === 0) return null;
    return scored.reduce((strongest, candidate) =>
        candidate.coherenceScore > strongest.coherenceScore ? candidate : strongest
    ).squareLabel;
}

export function readM5RecognitionLayer(
    payload: unknown,
    generation: number
): M5RecognitionLayerReading {
    const outer = objectValue(payload);
    const root = objectValue(outer?.harmonicProfile) ?? outer;
    const personalPole = objectValue(root?.personalPole);
    const qComposed = objectValue(personalPole?.qComposedHandle);
    const qComposedHandle = stringValue(qComposed?.handle);
    const recognitionStrength = numberValue(objectValue(personalPole?.resonance)?.score);
    const stream = Array.isArray(root?.canonRecognitionStream) ? root.canonRecognitionStream : [];
    const latestAnchor = objectValue(stream.at(-1));
    const bimbaCoordinate = stringValue(latestAnchor?.bimbaCoordinate);
    const writeBackState = stringValue(latestAnchor?.writeBackState)?.toLowerCase();
    const ebm = buildResonanceEbmSurface({
        payload: (outer ?? {}) as Record<string, unknown>,
        generation
    });
    const activeSquare = strongestSquare(ebm.tritoneSquares);

    const state =
        qComposedHandle === null
            ? 'pending-handle'
            : bimbaCoordinate === null
                ? 'pending-anchor'
                : recognitionStrength === null
                    ? 'pending-strength'
                    : ebm.state !== 'ready'
                        ? 'pending-ebm'
                        : 'ready';

    return Object.freeze({
        state,
        recognitionStrength,
        bimbaCoordinate,
        activeSquare,
        mobiusReturnReady: state === 'ready' && writeBackState === 'applied'
    });
}

export function M5RecognitionLayer() {
    const cached = useTickStore(state => state.profile);
    const reading = useMemo(
        () => readM5RecognitionLayer(cached?.profile ?? null, cached?.generation ?? 0),
        [cached]
    );

    return (
        <section
            className="m5-recognition-layer"
            data-testid="m5-recognition-layer"
            data-state={reading.state}
        >
            <div className="m5-recognition-ring" aria-label="Tat tvam asi recognition relation">
                <span>personal</span>
                <span>bimba</span>
            </div>
            <p data-testid="m5-recognition-strength">
                recognition strength:{' '}
                {reading.recognitionStrength === null
                    ? 'pending'
                    : reading.recognitionStrength.toFixed(3)}
            </p>
            <p data-testid="m5-recognition-anchor">
                canonical anchor: {reading.bimbaCoordinate ?? 'pending'}
            </p>
            <p data-testid="m5-recognition-square">
                active V4 square: {reading.activeSquare ?? 'pending'}
            </p>
            <p data-testid="m5-recognition-return">
                {reading.mobiusReturnReady
                    ? 'Möbius return ready — wisdom_delta composing...'
                    : 'Möbius return pending canonical close-path evidence'}
            </p>
        </section>
    );
}
