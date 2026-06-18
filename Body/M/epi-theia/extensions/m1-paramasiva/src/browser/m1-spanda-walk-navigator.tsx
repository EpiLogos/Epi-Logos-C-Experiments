import * as React from 'react';
import {
    MathemeHarmonicProfileBoundary,
    SharedBridgeAdapter
} from '@pratibimba/m-extension-runtime';
import type { M1ProfileClockModel } from '../common/clock-instrument';
import {
    KaprekarCommandExecutor,
    M1KaprekarInspector
} from './m1-kaprekar-inspector';

/**
 * SpandaWalkNavigator — a 12-position dial for the M1 Paramasiva spanda walk.
 *
 * M1 owns no harmonic law locally; every field is read from the bridge-owned
 * MathemeHarmonicProfileBoundary payload. The dial renders the 12-fold tick ring
 * (tick12), highlights the active position6 (0–5) on whichever helix strand is
 * live, and surfaces the sourceBinaryState the profile reports. When no profile
 * has arrived the navigator shows an awaiting-profile placeholder.
 */

const RING_POSITIONS = 12;
const HALF_RING = RING_POSITIONS / 2;

export interface SpandaWalkNavigatorProps {
    readonly profile: MathemeHarmonicProfileBoundary | null;
    readonly kaprekarModel?: Pick<M1ProfileClockModel, 'position6'> | null;
    readonly layoutMode?: string;
    readonly commands?: KaprekarCommandExecutor;
    readonly observabilityBridge?: Pick<SharedBridgeAdapter, 'onObservabilityEvent'>;
}

interface SpandaWalkReadout {
    readonly tick12: number | null;
    readonly helix: 0 | 1 | null;
    readonly position6: number | null;
    readonly sourceBinaryState: string | null;
}

export function SpandaWalkNavigator(props: SpandaWalkNavigatorProps): React.ReactElement {
    if (!props.profile) {
        return (
            <section className="mext-widget-detail" data-test="m1-spanda-walk-navigator" style={rootStyle}>
                <h3 style={headingStyle}>Spanda walk</h3>
                <p className="mext-widget-empty" style={placeholderStyle}>
                    Awaiting profile...
                </p>
            </section>
        );
    }

    const readout = readSpandaWalk(props.profile.payload);
    const activeIndex = activeRingIndex(readout);

    return (
        <section className="mext-widget-detail" data-test="m1-spanda-walk-navigator" style={rootStyle}>
            <h3 style={headingStyle}>Spanda walk</h3>

            <div style={summaryRowStyle}>
                <span data-test="m1-spanda-tick12" style={tagStyle}>
                    tick12 = {readout.tick12 === null ? '—' : readout.tick12}
                </span>
                <span data-test="m1-spanda-helix" style={tagStyle} title={`helix ${readout.helix ?? 'unset'}`}>
                    {helixGlyph(readout.helix)} helix {readout.helix === null ? '—' : readout.helix}
                </span>
                <span data-test="m1-spanda-position6" style={tagStyle}>
                    position6 = {readout.position6 === null ? '—' : readout.position6}
                </span>
            </div>

            <div style={dialStyle} role="img" aria-label="12-position spanda walk dial">
                {Array.from({ length: RING_POSITIONS }, (_, index) => {
                    const { left, top } = ringPoint(index);
                    const active = index === activeIndex;
                    const onActivePair = readout.position6 !== null && index % HALF_RING === readout.position6;
                    return (
                        <span
                            key={index}
                            data-test={active ? 'm1-spanda-active-position' : undefined}
                            data-active={active ? 'true' : 'false'}
                            style={ringDotStyle(active, onActivePair, left, top)}
                            title={`position ${index}`}
                        >
                            {index}
                        </span>
                    );
                })}
                <span style={dialHubStyle}>{helixGlyph(readout.helix)}</span>
            </div>

            <p data-test="m1-spanda-source-binary" style={sourceLineStyle}>
                sourceBinaryState: {readout.sourceBinaryState ?? 'blocked: profile field missing'}
            </p>

            <M1KaprekarInspector
                model={props.kaprekarModel ?? null}
                layoutMode={props.layoutMode}
                commands={props.commands}
                bridge={props.observabilityBridge}
            />
        </section>
    );
}

function activeRingIndex(readout: SpandaWalkReadout): number | null {
    if (readout.tick12 !== null) {
        return ((readout.tick12 % RING_POSITIONS) + RING_POSITIONS) % RING_POSITIONS;
    }
    if (readout.position6 !== null) {
        const strandOffset = (readout.helix ?? 0) * HALF_RING;
        return (readout.position6 + strandOffset) % RING_POSITIONS;
    }
    return null;
}

function ringPoint(index: number): { left: number; top: number } {
    // Start at the top (−90°) and walk clockwise through the 12 ticks.
    const angle = (index / RING_POSITIONS) * 2 * Math.PI - Math.PI / 2;
    return {
        left: 50 + 42 * Math.cos(angle),
        top: 50 + 42 * Math.sin(angle)
    };
}

function helixGlyph(helix: 0 | 1 | null): string {
    if (helix === 0) return '⟳';
    if (helix === 1) return '⟲';
    return '∅';
}

function readSpandaWalk(payload: Readonly<Record<string, unknown>>): SpandaWalkReadout {
    return {
        tick12: clampedNumber(payload.tick12, 0, RING_POSITIONS - 1),
        helix: helixValue(payload.helix),
        position6: clampedNumber(payload.position6, 0, HALF_RING - 1),
        sourceBinaryState: scalarString(payload.sourceBinaryState)
    };
}

function helixValue(value: unknown): 0 | 1 | null {
    if (value === 0 || value === '0' || value === false) return 0;
    if (value === 1 || value === '1' || value === true) return 1;
    return null;
}

function clampedNumber(value: unknown, min: number, max: number): number | null {
    if (typeof value !== 'number' || !Number.isFinite(value)) return null;
    const rounded = Math.round(value);
    if (rounded < min || rounded > max) return null;
    return rounded;
}

function scalarString(value: unknown): string | null {
    if (typeof value === 'string' && value.length > 0) return value;
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    if (typeof value === 'boolean') return value ? '1' : '0';
    return null;
}

const rootStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
};

const headingStyle: React.CSSProperties = {
    margin: 0
};

const placeholderStyle: React.CSSProperties = {
    opacity: 0.6,
    fontStyle: 'italic'
};

const summaryRowStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem'
};

const tagStyle: React.CSSProperties = {
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    border: '1px solid var(--theia-editorWidget-border, #444)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: '0.85em'
};

const dialStyle: React.CSSProperties = {
    position: 'relative',
    width: '200px',
    height: '200px',
    margin: '0.25rem 0',
    borderRadius: '50%',
    border: '1px solid var(--theia-editorWidget-border, #444)'
};

function ringDotStyle(
    active: boolean,
    onActivePair: boolean,
    leftPct: number,
    topPct: number
): React.CSSProperties {
    return {
        position: 'absolute',
        left: `${leftPct}%`,
        top: `${topPct}%`,
        transform: 'translate(-50%, -50%)',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        fontSize: '0.7em',
        fontVariantNumeric: 'tabular-nums',
        border: '1px solid var(--theia-editorWidget-border, #444)',
        background: active
            ? 'var(--theia-focusBorder, #2f81f7)'
            : onActivePair
              ? 'var(--theia-editorWidget-background, #2a2a2a)'
              : 'transparent',
        color: active ? 'var(--theia-button-foreground, #fff)' : 'inherit',
        fontWeight: active ? 700 : 400,
        boxShadow: active ? '0 0 6px var(--theia-focusBorder, #2f81f7)' : 'none'
    };
}

const dialHubStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '1.4em',
    opacity: 0.8
};

const sourceLineStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '0.85em',
    fontVariantNumeric: 'tabular-nums'
};
