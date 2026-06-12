import * as React from 'react';
import {
    CoordinateContext,
    MathemeHarmonicProfileBoundary,
    MExtensionReadinessSnapshot,
    MObservabilityEvent
} from '@pratibimba/m-extension-runtime';
import { buildM1KleinTopologyView } from '../common/clock-instrument';

/**
 * `m1.paramasiva.kleinTopology` view body. Renders the M1-5 single-torus
 * topology invariants (DOUBLE_COVER_DEG / TORUS_GENUS / Hopf / K² tritone)
 * sourced from the bridge profile payload, plus the live M1-origin Klein flip
 * signal. When the profile carries a `klein_flip = Some(...)` value, the view
 * emits the `m1.klein_flip.source` observability event on generation arrival.
 */
export function M1KleinTopologyView(props: {
    readonly profile: MathemeHarmonicProfileBoundary | null;
    readonly readiness: MExtensionReadinessSnapshot;
    readonly context: CoordinateContext;
    readonly emittedAt?: number;
    readonly onObservabilityEvent?: (event: MObservabilityEvent) => void;
}): React.ReactNode {
    const profile = props.profile;
    const emit = props.onObservabilityEvent;
    const view = profile
        ? buildM1KleinTopologyView({
              profile,
              context: props.context,
              emittedAt: props.emittedAt ?? profile.generation
          })
        : null;
    const generation = profile ? profile.generation : null;

    // Fire observability events on event arrival (per generation), never on
    // every render. Hooks stay unconditional to respect the rules of hooks.
    React.useEffect(() => {
        if (!emit || !view) {
            return;
        }
        for (const event of view.observabilityEvents) {
            emit(event);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [generation, emit]);

    if (!profile || !view) {
        return (
            <section className="mext-widget-detail">
                <h3>Klein topology</h3>
                <p className="mext-widget-empty">
                    No MathemeHarmonicProfile available yet. The Klein-flip signal and
                    torus invariants populate when the shared bridge delivers a
                    generation update; M1 renders only, never owns the topology genesis.
                </p>
            </section>
        );
    }

    return (
        <section className="mext-widget-detail" data-test="m1-klein-topology">
            <h3>Klein topology</h3>
            <dl>
                <dt>Single-torus invariants</dt>
                <dd data-test="m1-klein-double-cover">
                    DOUBLE_COVER_DEG={display(view.topology.doubleCoverDeg)} · TORUS_GENUS=
                    {display(view.topology.torusGenus)}
                </dd>
                <dt>Hopf / K²</dt>
                <dd>
                    {display(view.topology.hopfIdentity)} ·{' '}
                    {display(view.topology.k2TritoneCrossing)}
                </dd>
                <dt>M1-origin Klein flip</dt>
                <dd data-test="m1-klein-flip-source">
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

function display(value: string | number | null): string {
    return value === null ? 'blocked' : String(value);
}
