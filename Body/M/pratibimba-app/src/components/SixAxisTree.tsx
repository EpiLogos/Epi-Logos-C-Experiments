/**
 * Coordinate: M' M2' (six-axis correspondence tree/chips — Tranche 23.5)
 * Residency: Body/M/pratibimba-app/src/components
 * Actualises: the correspondence-tree surface that finally SURFACES the
 *   `engine/axisViews` decoder (Tranche 03.T3.3). ONE tree over the 72-invariant
 *   (TS-16 resolution — not six trees); six axis-filter chips (MEF·QL,
 *   tattva-phase, decan-face, Shem, maqam, DET-projection) each read their OWN
 *   wire field (`AXIS_SOURCE_FIELDS`) and decode the ACTIVE address through the
 *   portal-core-verbatim `decodeAxisAt`; two sonic-overlay tabs (Mantra 100,
 *   Asma 99+1) grey the axis chips because overlays are NOT a seventh axis
 *   (DR-M2-2). Arithmetic decode parts render verbatim from the decoder;
 *   LUT-owned fields render as kernel-sourced canonical-absence (—) — there is
 *   no renderer-local correspondence table, ever.
 * Does NOT own: the axis laws / LUTs (`engine/axisViews`, epi-lib m2, portal-core
 *   f_routing), the active 72-address (the pane's live pentadic trace), the S2
 *   overlay corpus (kernel payloads via s2.parashaktiCorrespondences).
 */

import { useState } from 'react';
import {
    AXIS_CARDINALITY,
    AXIS_ORDER,
    AXIS_SOURCE_FIELDS,
    OVERLAY_CARDINALITY,
    OVERLAY_ORDER,
    decodeAxisAt,
    type Axis72,
    type SonicOverlay
} from '../engine/axisViews';

const AXIS_LABELS: Readonly<Record<Axis72, string>> = {
    mef: 'MEF·QL',
    tattva: 'tattva-phase',
    decan: 'decan-face',
    shem: 'Shem',
    maqam: 'maqam',
    det: 'DET-projection'
};

const OVERLAY_LABELS: Readonly<Record<SonicOverlay, string>> = {
    mantra: 'Mantra',
    asma: 'Asma'
};

/** The compact leaf glyph for an axis at one address — the axis's most
 *  identifying decoded parts (real `decodeAxisAt` arithmetic, no local table). */
function leafGlyph(address72: number, axis: Axis72): string {
    const decode = decodeAxisAt(address72, axis);
    if (!decode) {
        return '—';
    }
    const p = decode.parts;
    switch (axis) {
        case 'mef':
            return `L${p.lens}·${p.position}`;
        case 'tattva':
            return `t${p.tattvaIndex}·${p.phase}`;
        case 'decan':
            return `d${p.decan36}·${p.face}`;
        case 'shem':
            return `c${p.choir}·${p.position}`;
        case 'maqam':
            return `m${p.index72}`;
        case 'det':
            return `${p.compressed64}`;
    }
}

export function SixAxisTree({
    address72,
    axis: controlledAxis,
    overlay: controlledOverlay,
    onAxisChange,
    onOverlayChange
}: {
    readonly address72: number | null;
    readonly axis?: Axis72;
    readonly overlay?: SonicOverlay | null;
    readonly onAxisChange?: (axis: Axis72) => void;
    readonly onOverlayChange?: (overlay: SonicOverlay | null) => void;
}) {
    const [uncontrolledAxis, setUncontrolledAxis] = useState<Axis72>('mef');
    const [uncontrolledOverlay, setUncontrolledOverlay] = useState<SonicOverlay | null>(null);
    const axis = controlledAxis ?? uncontrolledAxis;
    const overlay = controlledOverlay === undefined ? uncontrolledOverlay : controlledOverlay;

    const selectAxis = (next: Axis72) => {
        if (controlledAxis === undefined) {
            setUncontrolledAxis(next);
        }
        if (controlledOverlay === undefined) {
            setUncontrolledOverlay(null);
        }
        onAxisChange?.(next);
        onOverlayChange?.(null);
    };
    const selectOverlay = (next: SonicOverlay | null) => {
        if (controlledOverlay === undefined) {
            setUncontrolledOverlay(next);
        }
        onOverlayChange?.(next);
    };

    const active =
        address72 !== null &&
        Number.isInteger(address72) &&
        address72 >= 0 &&
        address72 < AXIS_CARDINALITY
            ? address72
            : null;
    const decode = active !== null && overlay === null ? decodeAxisAt(active, axis) : null;

    return (
        <div
            className="six-axis-tree"
            data-testid="six-axis-tree"
            data-mode={overlay ? `overlay-${overlay}` : `axis-${axis}`}
            data-active-address={active ?? ''}
        >
            <div className="axis-chip-row" role="tablist" aria-label="six correspondence axes">
                {AXIS_ORDER.map(a => (
                    <button
                        key={a}
                        type="button"
                        role="tab"
                        className="axis-chip"
                        data-testid={`axis-chip-${a}`}
                        data-active={overlay === null && axis === a ? 'true' : 'false'}
                        data-greyed={overlay !== null ? 'true' : 'false'}
                        aria-selected={overlay === null && axis === a}
                        disabled={overlay !== null}
                        onClick={() => selectAxis(a)}
                    >
                        {AXIS_LABELS[a]}
                    </button>
                ))}
            </div>

            <div className="overlay-tab-row" role="tablist" aria-label="sonic overlays">
                {OVERLAY_ORDER.map(o => (
                    <button
                        key={o}
                        type="button"
                        role="tab"
                        className="overlay-tab"
                        data-testid={`overlay-tab-${o}`}
                        data-active={overlay === o ? 'true' : 'false'}
                        aria-selected={overlay === o}
                        onClick={() => selectOverlay(overlay === o ? null : o)}
                    >
                        {`${OVERLAY_LABELS[o]} (${OVERLAY_CARDINALITY[o]})`}
                    </button>
                ))}
            </div>

            {overlay !== null ? (
                <div className="axis-overlay-note" data-testid="axis-overlay-note">
                    <span className="axis-overlay-card" data-testid="overlay-cardinality">
                        {OVERLAY_CARDINALITY[overlay]}
                    </span>
                    <span className="axis-overlay-text">
                        {OVERLAY_LABELS[overlay]} is a sonic overlay routed onto the 72-invariant —
                        not a seventh axis (DR-M2-2); its {OVERLAY_CARDINALITY[overlay]}-corpus values
                        route through kernel payloads, never a renderer-local table.
                    </span>
                </div>
            ) : (
                <div className="axis-view" data-testid="axis-view">
                    <div className="axis-source" data-testid="axis-source">
                        {AXIS_SOURCE_FIELDS[axis]}
                    </div>
                    {active === null ? (
                        <div className="pane-message">
                            awaiting the pentadic trace — no active 72-address to decode
                        </div>
                    ) : decode ? (
                        <>
                            <div className="axis-parts" data-testid="axis-parts">
                                {Object.entries(decode.parts).map(([key, value]) => (
                                    <div key={key} className="axis-part">
                                        <span className="axis-part-label">{key}</span>
                                        <span className="axis-part-value">{String(value)}</span>
                                    </div>
                                ))}
                            </div>
                            {decode.kernelSourced.length > 0 ? (
                                <div className="axis-kernel" data-testid="axis-kernel-sourced">
                                    {decode.kernelSourced.map(field => (
                                        <div key={field} className="axis-part axis-part-kernel">
                                            <span className="axis-part-label">{field}</span>
                                            {/* LUT-owned — canonical-absence until the
                                                kernel payload carries it (never fabricated). */}
                                            <span className="axis-part-value">—</span>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </>
                    ) : null}
                </div>
            )}

            <ol className="axis-leaves" data-testid="axis-leaves" aria-label="72-address leaves">
                {Array.from({ length: AXIS_CARDINALITY }, (_, i) => (
                    <li
                        key={i}
                        className="axis-leaf"
                        data-testid={`axis-leaf-${i}`}
                        data-active={active === i ? 'true' : 'false'}
                        data-greyed={overlay !== null ? 'true' : 'false'}
                        data-address72={i}
                    >
                        <span className="axis-leaf-idx">{i}</span>
                        <span className="axis-leaf-glyph">
                            {overlay === null ? leafGlyph(i, axis) : '·'}
                        </span>
                    </li>
                ))}
            </ol>
        </div>
    );
}
