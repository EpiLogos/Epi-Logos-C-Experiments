/**
 * Coordinate: M' M2' (six-axis correspondence tree/chips — Tranche 23.5)
 * Residency: Body/M/pratibimba-app/src/components
 * Actualises: one tree over the 72-invariant, a reader-selectable intersection
 * of six decoded axes, and the two 100-entry kernel sonic overlays.
 * Public surface: SixAxisTree, CorrespondenceTreeProjection.
 * Does NOT own: axis law, sonic/planet LUTs, the active address, or S2 data.
 * Contract: [[M2'-SPEC]]; `s2.parashaktiCorrespondences.correspondenceTree`.
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

export interface CorrespondenceTreeProjection {
    readonly mantraOverlay?: readonly {
        readonly index: number;
        readonly frequencyHz: number;
        readonly phase: string;
        readonly element: string;
    }[];
    readonly asmaOverlay?: readonly {
        readonly index: number;
        readonly group: string;
        readonly maskRouting: { readonly internal: boolean; readonly projective: boolean };
    }[];
    readonly planetaryKeying?: readonly {
        readonly index: number;
        readonly name: string;
        readonly coustoHz: number;
        readonly element: string;
        readonly chakra: number;
        readonly isOuter: boolean;
    }[];
    readonly psychoidPlanetary?: readonly {
        readonly planetId: number;
        readonly planet: string;
        readonly l0PrimePosition: number;
        readonly archetypalNumber: number;
        readonly archetypalRole: string;
    }[];
}

function leafGlyph(address72: number, axes: readonly Axis72[]): string {
    return axes
        .map(axis => {
            const decode = decodeAxisAt(address72, axis);
            if (!decode) return '—';
            const p = decode.parts;
            switch (axis) {
                case 'mef': return `L${p.lens}·${p.position}`;
                case 'tattva': return `t${p.tattvaIndex}·${p.phase}`;
                case 'decan': return `d${p.decan36}·${p.face}`;
                case 'shem': return `c${p.choir}·${p.position}`;
                case 'maqam': return `m${p.index72}`;
                case 'det': return `${p.compressed64}`;
            }
        })
        .join(' · ');
}

export function SixAxisTree({
    address72,
    axes: controlledAxes,
    overlay: controlledOverlay,
    correspondenceTree,
    onAxesChange,
    onOverlayChange
}: {
    readonly address72: number | null;
    readonly axes?: readonly Axis72[];
    readonly overlay?: SonicOverlay | null;
    readonly correspondenceTree?: CorrespondenceTreeProjection | null;
    readonly onAxesChange?: (axes: readonly Axis72[]) => void;
    readonly onOverlayChange?: (overlay: SonicOverlay | null) => void;
}) {
    const [uncontrolledAxes, setUncontrolledAxes] = useState<readonly Axis72[]>(['mef']);
    const [uncontrolledOverlay, setUncontrolledOverlay] = useState<SonicOverlay | null>(null);
    const axes = controlledAxes && controlledAxes.length > 0 ? controlledAxes : uncontrolledAxes;
    const overlay = controlledOverlay === undefined ? uncontrolledOverlay : controlledOverlay;
    const active = address72 !== null && Number.isInteger(address72) && address72 >= 0 && address72 < AXIS_CARDINALITY
        ? address72
        : null;

    const selectAxis = (next: Axis72) => {
        const nextAxes = axes.includes(next)
            ? axes.length === 1 ? axes : axes.filter(axis => axis !== next)
            : [...axes, next];
        if (controlledAxes === undefined) setUncontrolledAxes(nextAxes);
        if (controlledOverlay === undefined) setUncontrolledOverlay(null);
        onAxesChange?.(nextAxes);
        onOverlayChange?.(null);
    };
    const selectOverlay = (next: SonicOverlay | null) => {
        if (controlledOverlay === undefined) setUncontrolledOverlay(next);
        onOverlayChange?.(next);
    };
    const overlayEntries = overlay === 'mantra' ? correspondenceTree?.mantraOverlay : correspondenceTree?.asmaOverlay;

    return (
        <div className="six-axis-tree" data-testid="six-axis-tree" data-mode={overlay ? `overlay-${overlay}` : `axes-${axes.join('-')}`} data-active-address={active ?? ''}>
            <div className="axis-chip-row" role="tablist" aria-label="six correspondence axes">
                {AXIS_ORDER.map(axis => (
                    <button key={axis} type="button" role="tab" className="axis-chip" data-testid={`axis-chip-${axis}`}
                        data-active={overlay === null && axes.includes(axis) ? 'true' : 'false'} data-greyed={overlay !== null ? 'true' : 'false'}
                        aria-selected={overlay === null && axes.includes(axis)} disabled={overlay !== null} onClick={() => selectAxis(axis)}>
                        {AXIS_LABELS[axis]}
                    </button>
                ))}
            </div>
            <div className="overlay-tab-row" role="tablist" aria-label="sonic overlays">
                {OVERLAY_ORDER.map(item => (
                    <button key={item} type="button" role="tab" className="overlay-tab" data-testid={`overlay-tab-${item}`}
                        data-active={overlay === item ? 'true' : 'false'} aria-selected={overlay === item}
                        onClick={() => selectOverlay(overlay === item ? null : item)}>
                        {`${OVERLAY_LABELS[item]} (${OVERLAY_CARDINALITY[item]})`}
                    </button>
                ))}
            </div>
            {overlay !== null ? (
                <>
                    <div className="axis-overlay-note" data-testid="axis-overlay-note">
                        <span className="axis-overlay-card" data-testid="overlay-cardinality">{OVERLAY_CARDINALITY[overlay]}</span>
                        <span className="axis-overlay-text">{OVERLAY_LABELS[overlay]} is a sonic overlay, not a seventh axis.</span>
                    </div>
                    <ol className="axis-leaves" data-testid="axis-overlay-leaves" aria-label={`${overlay} overlay leaves`}>
                        {(overlayEntries ?? []).map(entry => (
                            <li key={entry.index} className="axis-leaf" data-testid={`axis-overlay-leaf-${entry.index}`} data-active={active === entry.index ? 'true' : 'false'}>
                                <span className="axis-leaf-idx">{entry.index}</span>
                                {'phase' in entry ? <span className="axis-leaf-glyph">{entry.phase} · {entry.frequencyHz} Hz · {entry.element}</span> :
                                    <span className="axis-leaf-glyph">{entry.group} · {entry.maskRouting.internal ? 'internal' : 'projective'}</span>}
                            </li>
                        ))}
                    </ol>
                    {!overlayEntries ? <div className="pane-message">awaiting the kernel overlay projection</div> : null}
                </>
            ) : (
                <>
                    {axes.map(axis => {
                        const decode = active === null ? null : decodeAxisAt(active, axis);
                        return <div className="axis-view" data-testid="axis-view" key={axis}>
                            <div className="axis-source" data-testid="axis-source">{AXIS_SOURCE_FIELDS[axis]}</div>
                            {active === null ? <div className="pane-message">awaiting the pentadic trace — no active 72-address to decode</div> : decode ? <>
                                <div className="axis-parts" data-testid="axis-parts">{Object.entries(decode.parts).map(([key, value]) => <div key={key} className="axis-part"><span className="axis-part-label">{key}</span><span className="axis-part-value">{String(value)}</span></div>)}</div>
                                {decode.kernelSourced.length > 0 ? <div className="axis-kernel" data-testid="axis-kernel-sourced">{decode.kernelSourced.map(field => <div key={field} className="axis-part axis-part-kernel"><span className="axis-part-label">{field}</span><span className="axis-part-value">—</span></div>)}</div> : null}
                            </> : null}
                        </div>;
                    })}
                    <ol className="axis-leaves" data-testid="axis-leaves" aria-label="72-address leaves">
                        {Array.from({ length: AXIS_CARDINALITY }, (_, index) => <li key={index} className="axis-leaf" data-testid={`axis-leaf-${index}`} data-active={active === index ? 'true' : 'false'} data-address72={index}><span className="axis-leaf-idx">{index}</span><span className="axis-leaf-glyph">{leafGlyph(index, axes)}</span></li>)}
                    </ol>
                </>
            )}
            {correspondenceTree?.planetaryKeying ? <div className="planetary-keying" data-testid="planetary-keying">{correspondenceTree.planetaryKeying.map(planet => <div key={planet.index} className="planetary-key" data-testid={`planetary-key-${planet.index}`} data-outer={planet.isOuter ? 'true' : 'false'}><span>{planet.name}</span><span>{planet.coustoHz} Hz</span><span>{planet.element}</span><span>chakra {planet.chakra}</span></div>)}</div> : null}
        </div>
    );
}
