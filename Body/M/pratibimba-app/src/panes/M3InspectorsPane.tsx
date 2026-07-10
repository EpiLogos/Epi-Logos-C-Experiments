/**
 * Coordinate: M' M3' (inspectors pane body — Track 04.T4.2)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the `m3.mahamaya.inspectors` surface — six SUMMONABLE
 *   inspectors (toggle chips; none open by default) + the four depth-view
 *   mode switch, every value verbatim from the view model's bus windows
 *   (m3Inspectors.ts). Pending chips are rendered, never hidden.
 * Does NOT own: inspector law (m3Inspectors.ts), the profile cache, flexlayout.
 */

import { useMemo, useState } from 'react';
import { useTickStore } from '../state/stores';
import {
    buildM3InspectorsView,
    M3_DEPTH_VIEW_ORDER,
    M3_INSPECTOR_ORDER,
    M3DepthView,
    M3InspectorId,
    SUIT_INTEGRAL_CITATION
} from './m3Inspectors';

const INSPECTOR_LABELS: Record<M3InspectorId, string> = {
    'dinucleotide-matrix': 'Dinucleotide matrix',
    'charge-quaternion': 'Charge quaternion',
    'spoke-ring-buffer': '24-spoke · ring buffer',
    'major-arcana': 'Major Arcana / chromosome',
    'dna-rna-phase': 'DNA/RNA phase',
    'suit-integral': 'Per-suit integral'
};

export function M3InspectorsPane() {
    const cached = useTickStore(s => s.profile);
    const [open, setOpen] = useState<ReadonlySet<M3InspectorId>>(new Set());
    const [depthView, setDepthView] = useState<M3DepthView>('flat-clock-debug');

    const view = useMemo(() => {
        if (!cached) {
            return null;
        }
        return buildM3InspectorsView({
            payload: (cached.profile as Record<string, unknown> | null) ?? {},
            generation: cached.generation
        });
    }, [cached]);

    const toggle = (id: M3InspectorId) => {
        setOpen(previous => {
            const next = new Set(previous);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const m = view?.mahamaya ?? null;

    return (
        <section
            className="mext-widget-detail"
            data-testid="m3-inspectors"
            data-state={view?.state ?? 'pending-mahamaya'}
            data-depth-view={depthView}
        >
            <h3>M3′ inspectors</h3>

            <div className="m3-inspector-summons" data-testid="m3-inspector-summons">
                {M3_INSPECTOR_ORDER.map(id => (
                    <button
                        key={id}
                        type="button"
                        className="instrument-toggle"
                        data-testid={`m3-summon-${id}`}
                        aria-pressed={open.has(id)}
                        onClick={() => toggle(id)}
                    >
                        {INSPECTOR_LABELS[id]}
                    </button>
                ))}
            </div>

            <div className="m3-depth-views" data-testid="m3-depth-views">
                {M3_DEPTH_VIEW_ORDER.map(mode => (
                    <button
                        key={mode}
                        type="button"
                        className="instrument-toggle"
                        data-testid={`m3-depth-${mode}`}
                        aria-pressed={depthView === mode}
                        onClick={() => setDepthView(mode)}
                    >
                        {mode}
                    </button>
                ))}
            </div>

            {view && m ? (
                <dl>
                    {open.has('dinucleotide-matrix') ? (
                        <>
                            <dt>Dinucleotide matrix</dt>
                            <dd data-testid="m3-dinucleotide">
                                codon {m.codon ?? m.codonId} · bits [{m.nucleotideBits.join(',')}] ·
                                trigrams {m.upperTrigram}/{m.lowerTrigram} · hexagram {m.hexagramId} ·
                                <em> full 16×16 labels: kernel-owned (pending)</em>
                            </dd>
                        </>
                    ) : null}
                    {open.has('charge-quaternion') ? (
                        <>
                            <dt>Charge quaternion</dt>
                            <dd data-testid="m3-charge-quaternion">
                                q_cosmic [{view.qCosmic ? view.qCosmic.map(v => v.toFixed(3)).join(', ') : '—'}]
                                · 4X audit: {view.fourXAudit}
                            </dd>
                        </>
                    ) : null}
                    {open.has('spoke-ring-buffer') ? (
                        <>
                            <dt>24-spoke · 12-deep ring</dt>
                            <dd data-testid="m3-spoke-ring">
                                spoke {view.activeSpoke ?? '—'}/24 · depth {view.ringDepth ?? '—'}/12 ·
                                history: {view.ringHistory}
                            </dd>
                        </>
                    ) : null}
                    {open.has('major-arcana') ? (
                        <>
                            <dt>Major Arcana / chromosome</dt>
                            <dd data-testid="m3-major-arcana">{view.majorArcana}</dd>
                        </>
                    ) : null}
                    {open.has('dna-rna-phase') ? (
                        <>
                            <dt>DNA/RNA phase</dt>
                            <dd data-testid="m3-dna-rna">
                                phase {m.dnaRnaPhase} · codon {m.codon ?? '—'} · line {m.lineIndex} ·
                                line-op {m.lineChangeOperatorAddress}
                                {m.evolutionaryGap ? ' · evolutionary-gap' : ''}
                            </dd>
                        </>
                    ) : null}
                    {open.has('suit-integral') ? (
                        <>
                            <dt>Per-suit integral</dt>
                            <dd data-testid="m3-suit-integral">
                                {SUIT_INTEGRAL_CITATION.label} · active suit {view.suitIndex ?? '—'}
                                <small> · {SUIT_INTEGRAL_CITATION.provenance}</small>
                            </dd>
                        </>
                    ) : null}

                    <dt>Depth view</dt>
                    <dd data-testid="m3-depth-readout">
                        {depthView === 'flat-clock-debug'
                            ? `spoke ${view.activeSpoke ?? '—'} · tick12 ${view.ringDepth ?? '—'} · lut ${m.datasetLutState ?? '—'}`
                            : depthView === 'lens-annulus'
                              ? view.lensMode
                                  ? `lens ${view.lensMode.lens} · mode ${view.lensMode.mode} · 472:${view.lensMode.surfaceIndex}`
                                  : 'pending-codon-rotation-projection'
                              : depthView === 'toroidal-world'
                                ? view.toroidal
                                    ? `degree720 ${view.toroidal.degree720} · sheet ${view.toroidal.helixSheet}`
                                    : 'pending-clock'
                                : view.toroidal
                                  ? `SU(2) sheet ${view.toroidal.helixSheet} — identity returns at 720°`
                                  : 'pending-clock'}
                    </dd>
                </dl>
            ) : (
                <p className="mext-widget-empty" data-testid="m3-inspectors-pending">
                    pending-mahamaya — the inspectors populate when the bus carries the
                    M3 binary projection; no local codon/hexagram/tarot tables exist here.
                </p>
            )}
        </section>
    );
}
