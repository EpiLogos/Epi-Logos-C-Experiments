/**
 * Coordinate: M' M1' (Klein-topology instrument body — Track 02.T2.3)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the `m1.paramasiva.kleinTopology` widget body — renders the M1-5
 *   single-torus invariants (DOUBLE_COVER_DEG / TORUS_GENUS / Hopf / torus-knot `(p,q)` / K² tritone)
 *   sourced from the live bridge profile's `m1Topology`, plus the M1-origin
 *   Klein-flip signal. Fires the `m1.klein_flip.source` observability event on
 *   generation arrival when the profile carries `kleinFlip = Some(..)`. The
 *   data-test hooks + text format are the frozen epi-theia contract surface
 *   (LAW); the plumbing (store subscription, flexlayout tab) is carrier-native.
 *   M1 renders only — it never owns the topology genesis (portal-core does).
 * Does NOT own: topology computation, gateway I/O, the profile cache.
 */

import { useEffect, useMemo } from 'react';
import { useTickStore } from '../state/stores';
import {
    buildM1KleinTopologyView,
    M1KleinTopologyViewModel,
    M1ObservabilityEvent
} from './m1KleinTopology';

function display(value: string | number | null): string {
    return value === null ? 'blocked' : String(value);
}

export function KleinTopologyPane(props: {
    readonly onObservabilityEvent?: (event: M1ObservabilityEvent) => void;
}) {
    const cached = useTickStore(s => s.profile);
    const generation = cached?.generation ?? null;
    const emit = props.onObservabilityEvent;

    const view: M1KleinTopologyViewModel | null = useMemo(() => {
        if (!cached) {
            return null;
        }
        const payload = (cached.profile as Record<string, unknown> | null) ?? {};
        return buildM1KleinTopologyView({
            payload,
            generation: cached.generation,
            emittedAt: cached.generation
        });
    }, [cached]);

    // Fire observability events on event arrival (per generation), never on
    // every render. The hook stays unconditional to respect the rules of hooks.
    useEffect(() => {
        if (!emit || !view) {
            return;
        }
        for (const event of view.observabilityEvents) {
            emit(event);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [generation, emit]);

    if (!cached || !view) {
        return (
            <section className="mext-widget-detail">
                <h3>Klein topology</h3>
                <p className="mext-widget-empty">
                    No MathemeHarmonicProfile available yet. The Klein-flip signal and
                    torus invariants populate when the kernel bridge delivers a
                    generation update; M1 renders only, never owns the topology genesis.
                </p>
            </section>
        );
    }

    return (
        <section className="mext-widget-detail" data-testid="m1-klein-topology">
            <h3>Klein topology</h3>
            <dl>
                <dt>Single-torus invariants</dt>
                <dd data-testid="m1-klein-double-cover">
                    DOUBLE_COVER_DEG={display(view.topology.doubleCoverDeg)} · TORUS_GENUS=
                    {display(view.topology.torusGenus)}
                </dd>
                <dt>Torus-knot phase</dt>
                <dd data-testid="m1-torus-knot-phase">
                    {view.topology.torusKnotPhase
                        ? `(p,q)=(${view.topology.torusKnotPhase.p},${view.topology.torusKnotPhase.q})`
                        : 'pending-m1-topology'}
                </dd>
                <dt>Hopf / K²</dt>
                <dd>
                    {display(view.topology.hopfIdentity)} · {display(view.topology.k2TritoneCrossing)}
                </dd>
                <dt>M1-origin Klein flip</dt>
                <dd data-testid="m1-klein-flip-source">
                    {view.kleinFlip.present
                        ? `${display(view.topology.m1OriginKleinFlip)} · flipAtTick=${view.kleinFlip.tickFlip}`
                        : 'klein_flip = None on current tick'}
                </dd>
                <dt>Attribution</dt>
                <dd>{view.topology.parentAttribution}</dd>
                <dt>Prior ground</dt>
                <dd>{view.topology.priorGround}</dd>
                <dt>Downstream boundary</dt>
                <dd>{view.topology.downstreamDoubleTorus}</dd>
                <dt>Source</dt>
                <dd>{view.topology.source}</dd>
            </dl>
        </section>
    );
}
