/**
 * Coordinate: M' M3' (24.T24.14 I-Ching cast ribbon)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the governed `s5.oracle.iching.cast` receipt as a six-line M3' ribbon.
 * Public surface: IChingCastRibbonReceipt, parseIChingCastRibbonReceipt, M3IChingCastRibbon.
 * Does NOT own: entropy, hexagram derivation, oracle persistence, profile state, or timers.
 */

import type { MouseEventHandler } from 'react';
import { M3ReadinessBoundary, useM3Readiness } from './m3SurfaceContext';

export interface IChingCastRibbonReceipt {
    readonly castMethod: 'three-coin';
    readonly lines: readonly (6 | 7 | 8 | 9)[];
    readonly primaryHexagramId: number;
    readonly derivedHexagramId: number | null;
    readonly changingLineIndices: readonly number[];
    readonly castId: number;
    readonly provenance: 'epi-cli.nara.oracle.iching.three-coin';
}

export function parseIChingCastRibbonReceipt(value: unknown): IChingCastRibbonReceipt {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('I-Ching receipt must be an object');
    const root = value as Record<string, unknown>;
    if (root.cast_method !== 'three-coin') throw new Error('I-Ching receipt must use three-coin casting');
    if (!Array.isArray(root.lines) || root.lines.length !== 6 || !root.lines.every(line => line === 6 || line === 7 || line === 8 || line === 9)) {
        throw new Error('I-Ching receipt must contain exactly six 6/7/8/9 lines');
    }
    const integer = (field: string, min: number, max: number): number => {
        const candidate = root[field];
        if (!Number.isInteger(candidate) || (candidate as number) < min || (candidate as number) > max) throw new Error(`I-Ching receipt ${field} is invalid`);
        return candidate as number;
    };
    const derived = root.derived_hexagram_id;
    if (derived !== null && (!Number.isInteger(derived) || (derived as number) < 1 || (derived as number) > 64)) throw new Error('I-Ching receipt derived_hexagram_id is invalid');
    if (!Array.isArray(root.changing_line_indices) || !root.changing_line_indices.every(index => Number.isInteger(index) && (index as number) >= 0 && (index as number) <= 5)) throw new Error('I-Ching receipt changing_line_indices is invalid');
    if (root.provenance !== 'epi-cli.nara.oracle.iching.three-coin') throw new Error('I-Ching receipt provenance is invalid');
    return {
        castMethod: 'three-coin', lines: root.lines as (6 | 7 | 8 | 9)[],
        primaryHexagramId: integer('primary_hexagram_id', 1, 64), derivedHexagramId: derived as number | null,
        changingLineIndices: root.changing_line_indices as number[], castId: integer('cast_id', 1, Number.MAX_SAFE_INTEGER),
        provenance: 'epi-cli.nara.oracle.iching.three-coin'
    };
}

export function M3IChingCastRibbon({ receipt, pending, error, onCast }: {
    readonly receipt: IChingCastRibbonReceipt | null;
    readonly pending: boolean;
    readonly error: string | null;
    readonly onCast: MouseEventHandler<HTMLButtonElement>;
}) {
    const readiness = error
        ? { state: 'blocked' as const, reason: error }
        : pending
          ? { state: 'pending' as const, reason: 'cast-pending' }
          : { state: 'ready' as const, reason: receipt ? 'receipt-current' : 'cast-ready' };
    const binding = useM3Readiness('m3.iching-cast', readiness);

    return (
        <M3ReadinessBoundary bindingKey="m3.iching-cast" fallback={readiness}>
            <section className="m3-iching-ribbon" data-testid="m3-iching-cast-ribbon" data-state={pending ? 'pending' : receipt ? 'received' : 'idle'}>
                <button type="button" className="instrument-toggle" data-testid="m3-iching-cast" disabled={binding.state !== 'ready'} onClick={onCast}>Cast 3 coins</button>
                <p className="m3-iching-legend">A=6 Cups/Water · T=9 Wands/Fire · C=7 Pentacles/Earth · G=8 Swords/Air</p>
                {receipt ? <div data-testid="m3-iching-lines">{receipt.lines.map((line, index) => <span key={index} data-line={line} data-changing={receipt.changingLineIndices.includes(index)}>{index + 1}:{line}</span>)}<span>Hex {receipt.primaryHexagramId}{receipt.derivedHexagramId ? ` → ${receipt.derivedHexagramId}` : ''}</span></div> : null}
            </section>
        </M3ReadinessBoundary>
    );
}
