import * as React from 'react';
import type { MathemeHarmonicProfileBoundary } from '@pratibimba/m-extension-runtime';

export const M1_KLEIN_FLIP_EVENT_STRIP_VIEW_ID = 'm1.paramasiva.kleinFlipEventStrip';
const MAX_EVENT_COUNT = 32;
const FUTURE_TICK_COUNT = 3;

export interface M1KleinFlipEventBar {
    readonly eventKey: string;
    readonly timestampLabel: string;
    readonly tick12: number | null;
    readonly position6: number | null;
    readonly flippedFrom: string;
    readonly flippedTo: string;
    readonly dipyramidFaceFlip: string;
    readonly torusGenus: string;
    readonly step720: string;
    readonly triggerSource: string;
}

interface KleinFlipReadout {
    readonly tick12: number | null;
    readonly position6: number | null;
    readonly activeAtThisTick: boolean;
}

export function M1KleinFlipEventStrip(props: {
    readonly profile: MathemeHarmonicProfileBoundary | null;
    readonly events?: readonly M1KleinFlipEventBar[];
}): React.ReactElement {
    const readout = props.profile ? profileReadout(props.profile.payload) : null;
    const eventFromProfile = props.profile
        ? kleinFlipEventFromProfile(props.profile, props.events?.length ?? 0)
        : null;
    const events = mergeKleinFlipEventTrail(props.events ?? [], eventFromProfile);

    return (
        <section
            className="mext-widget-detail"
            data-test="m1-klein-flip-event-strip"
            style={rootStyle}
        >
            <h3 style={headingStyle}>Klein-flip event strip</h3>
            <div data-test="m1-klein-flip-current-tick" style={summaryStyle}>
                tick12={displayNumber(readout?.tick12)} · position6={displayNumber(readout?.position6)} ·
                source=bridge.payload.ananda_vortex.kleinFlipAtThisTick
            </div>
            <div
                data-test="m1-klein-flip-scroll-strip"
                style={stripStyle}
                role="list"
                aria-label="Klein-flip event arrivals over time"
            >
                <div data-test="m1-klein-flip-time-axis" style={axisStyle}>
                    <span>past</span>
                    <span>current</span>
                    <span>future-projected</span>
                </div>
                <div style={eventRailStyle}>
                    {events.length > 0 ? (
                        events.map((event, index) => {
                            const active =
                                readout?.activeAtThisTick === true &&
                                event.position6 !== null &&
                                event.position6 === readout.position6;
                            return (
                                <div
                                    key={event.eventKey}
                                    role="listitem"
                                    data-test="m1-klein-flip-event-bar"
                                    data-active={active ? 'true' : 'false'}
                                    style={eventBarStyle(active, index)}
                                    title={eventDetailTitle(event)}
                                >
                                    <span data-test="m1-klein-flip-timestamp" style={timestampStyle}>
                                        {event.timestampLabel}
                                    </span>
                                    <span data-test="m1-klein-flip-tick-index" style={tickStyle}>
                                        tick {displayNumber(event.tick12)}
                                    </span>
                                    <span data-test="m1-klein-flip-from-to" style={transitionStyle}>
                                        {event.flippedFrom} -&gt; {event.flippedTo}
                                    </span>
                                </div>
                            );
                        })
                    ) : (
                        <div data-test="m1-klein-flip-empty" style={emptyStyle}>
                            Awaiting klein_flip event arrival from the shared profile stream.
                        </div>
                    )}
                    {futureTicks(readout?.tick12 ?? null).map(tick => (
                        <span
                            key={`future-${tick}`}
                            data-test="m1-klein-flip-future-tick"
                            style={futureTickStyle}
                        >
                            +tick {tick}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function kleinFlipEventFromProfile(
    profile: MathemeHarmonicProfileBoundary,
    ordinal: number,
    emittedAt: number = profile.generation
): M1KleinFlipEventBar | null {
    const payload = profile.payload;
    const readout = profileReadout(payload);
    if (!readout.activeAtThisTick) {
        return null;
    }

    const kleinFlip = recordValue(payload.kleinFlip ?? payload.klein_flip);
    const topology = recordValue(payload.m1Topology ?? payload.topology);
    const ananda = anandaVortex(payload);
    const degree720 = numberValue(payload.degree720 ?? recordValue(payload.tickAddress)?.degree720);
    const doubleCoverDeg = numberValue(topology?.doubleCoverDeg ?? topology?.DOUBLE_COVER_DEG);
    const fromTo = flippedLabels(kleinFlip, readout.position6);
    const dipyramid = dipyramidFaceFlip(kleinFlip, ananda, readout.position6);
    const source =
        stringValue(kleinFlip?.triggerSource ?? kleinFlip?.trigger_source ?? kleinFlip?.reasonCode) ??
        stringValue(kleinFlip?.kind) ??
        'profile.ananda_vortex.kleinFlipAtThisTick';

    return Object.freeze({
        eventKey: [
            profile.generation,
            readout.tick12 ?? 'tick?',
            readout.position6 ?? 'pos?',
            source,
            ordinal
        ].join(':'),
        timestampLabel: timestampLabel(emittedAt),
        tick12: readout.tick12,
        position6: readout.position6,
        flippedFrom: fromTo.from,
        flippedTo: fromTo.to,
        dipyramidFaceFlip: dipyramid,
        torusGenus: displayValue(topology?.torusGenus ?? topology?.TORUS_GENUS, 'profile.m1Topology.torusGenus'),
        step720: `${displayValue(doubleCoverDeg, 'profile.m1Topology.doubleCoverDeg')} -> ${displayValue(degree720, 'profile.degree720')}`,
        triggerSource: source
    });
}

function profileReadout(payload: Readonly<Record<string, unknown>>): KleinFlipReadout {
    const ananda = anandaVortex(payload);
    return Object.freeze({
        tick12: numberValue(payload.tick12 ?? recordValue(payload.tickAddress)?.tick12),
        position6: numberValue(payload.position6),
        activeAtThisTick:
            ananda?.kleinFlipAtThisTick === true ||
            ananda?.klein_flip_at_this_tick === true
    });
}

function anandaVortex(
    payload: Readonly<Record<string, unknown>>
): Readonly<Record<string, unknown>> | undefined {
    return recordValue(payload.ananda_vortex ?? payload.anandaVortex);
}

export function mergeKleinFlipEventTrail(
    events: readonly M1KleinFlipEventBar[],
    nextEvent: M1KleinFlipEventBar | null
): M1KleinFlipEventBar[] {
    if (!nextEvent) {
        return [...events];
    }
    if (events.some(event => event.eventKey === nextEvent.eventKey)) {
        return [...events];
    }
    return [...events, nextEvent];
}

function flippedLabels(
    kleinFlip: Readonly<Record<string, unknown>> | undefined,
    position6: number | null
): { from: string; to: string } {
    const lensPair = arrayValue(kleinFlip?.lensPair ?? kleinFlip?.lens_pair);
    const from =
        scalarLabel(kleinFlip?.fromLens ?? kleinFlip?.from_lens ?? lensPair[0]) ??
        scalarLabel(kleinFlip?.valenceBefore ?? kleinFlip?.valence_before) ??
        scalarLabel(kleinFlip?.codonBefore ?? kleinFlip?.codon_before) ??
        (position6 === null ? 'position unknown' : `position ${position6}`);
    const to =
        scalarLabel(kleinFlip?.toLens ?? kleinFlip?.to_lens ?? lensPair[1]) ??
        scalarLabel(kleinFlip?.valenceAfter ?? kleinFlip?.valence_after) ??
        scalarLabel(kleinFlip?.codonAfter ?? kleinFlip?.codon_after) ??
        (position6 === null ? 'tritone mate unknown' : `position ${(position6 + 3) % 6}`);
    return { from: prefixLabel(from, kleinFlip), to: prefixLabel(to, kleinFlip) };
}

function prefixLabel(label: string, kleinFlip: Readonly<Record<string, unknown>> | undefined): string {
    const kind = stringValue(kleinFlip?.kind);
    if (!kind || /^(lens|codon|valence|position)\b/i.test(label)) {
        return label;
    }
    if (kind === 'm1TritoneCrossing') {
        return `lens ${label}`;
    }
    if (kind === 'm2CymaticValenceInvert') {
        return `valence ${label}`;
    }
    if (kind === 'm3CodonRotationCross') {
        return `codon ${label}`;
    }
    return label;
}

function dipyramidFaceFlip(
    kleinFlip: Readonly<Record<string, unknown>> | undefined,
    ananda: Readonly<Record<string, unknown>> | undefined,
    position6: number | null
): string {
    const from = numberValue(
        kleinFlip?.dipyramidFaceFrom ??
            kleinFlip?.dipyramid_face_from ??
            recordValue(ananda?.active_cell_value)?.position_p ??
            recordValue(ananda?.activeCellValue)?.positionP ??
            position6
    );
    const to = numberValue(
        kleinFlip?.dipyramidFaceTo ??
            kleinFlip?.dipyramid_face_to ??
            (from === null ? null : (from + 3) % 6)
    );
    return `dipyramid-face ${displayNumber(from)} -> ${displayNumber(to)}`;
}

function eventDetailTitle(event: M1KleinFlipEventBar): string {
    return [
        event.dipyramidFaceFlip,
        `torus_genus=${event.torusGenus}`,
        `720-step=${event.step720}`,
        `trigger=${event.triggerSource}`
    ].join(' | ');
}

function futureTicks(tick12: number | null): number[] {
    if (tick12 === null) {
        return [];
    }
    return Array.from({ length: FUTURE_TICK_COUNT }, (_, index) => (tick12 + index + 1) % 12);
}

function timestampLabel(value: number): string {
    if (value > 1_000_000_000_000) {
        return new Date(value).toISOString();
    }
    return `generation ${value}`;
}

function recordValue(value: unknown): Readonly<Record<string, unknown>> | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Readonly<Record<string, unknown>>)
        : undefined;
}

function arrayValue(value: unknown): readonly unknown[] {
    return Array.isArray(value) ? value : [];
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function scalarLabel(value: unknown): string | null {
    if (typeof value === 'string' && value.length > 0) {
        return value;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
    }
    if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
    }
    return null;
}

function displayValue(value: unknown, fallback: string): string {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
    }
    if (typeof value === 'string' && value.length > 0) {
        return value;
    }
    return fallback;
}

function displayNumber(value: number | null | undefined): string {
    return value === null || value === undefined ? 'blocked' : String(value);
}

const rootStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem'
};

const headingStyle: React.CSSProperties = {
    margin: 0
};

const summaryStyle: React.CSSProperties = {
    fontSize: '0.85em',
    fontVariantNumeric: 'tabular-nums',
    opacity: 0.82
};

const stripStyle: React.CSSProperties = {
    overflowX: 'auto',
    border: '1px solid var(--theia-editorWidget-border, #444)',
    borderRadius: '6px',
    padding: '0.65rem',
    minHeight: '116px'
};

const axisStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    minWidth: '520px',
    borderBottom: '1px solid var(--theia-editorWidget-border, #444)',
    paddingBottom: '0.35rem',
    fontSize: '0.78em',
    textTransform: 'uppercase',
    letterSpacing: 0,
    opacity: 0.72
};

const eventRailStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'stretch',
    gap: '0.5rem',
    minWidth: '520px',
    paddingTop: '0.7rem'
};

function eventBarStyle(active: boolean, index: number): React.CSSProperties {
    return {
        display: 'grid',
        gridTemplateRows: 'auto auto auto',
        gap: '0.2rem',
        minWidth: '132px',
        maxWidth: '156px',
        padding: '0.45rem 0.5rem',
        borderRadius: '5px',
        border: active
            ? '2px solid var(--theia-focusBorder, #2f81f7)'
            : '1px solid var(--theia-editorWidget-border, #444)',
        background: active
            ? 'var(--theia-list-activeSelectionBackground, #264f78)'
            : index % 2 === 0
              ? 'var(--theia-editorWidget-background, #252526)'
              : 'var(--theia-sideBar-background, #1f1f1f)',
        color: active ? 'var(--theia-list-activeSelectionForeground, #fff)' : 'inherit',
        boxShadow: active ? '0 0 0 1px var(--theia-focusBorder, #2f81f7)' : 'none',
        fontVariantNumeric: 'tabular-nums'
    };
}

const timestampStyle: React.CSSProperties = {
    fontSize: '0.76em',
    opacity: 0.78,
    whiteSpace: 'nowrap'
};

const tickStyle: React.CSSProperties = {
    fontWeight: 700
};

const transitionStyle: React.CSSProperties = {
    fontSize: '0.82em',
    whiteSpace: 'normal',
    overflowWrap: 'anywhere'
};

const emptyStyle: React.CSSProperties = {
    minWidth: '300px',
    opacity: 0.68,
    fontStyle: 'italic'
};

const futureTickStyle: React.CSSProperties = {
    minWidth: '86px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px dashed var(--theia-editorWidget-border, #444)',
    borderRadius: '5px',
    opacity: 0.58,
    fontSize: '0.78em',
    fontVariantNumeric: 'tabular-nums'
};
