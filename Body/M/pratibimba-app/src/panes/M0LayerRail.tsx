/**
 * Coordinate: M' M0' (six-layer rail, rerun 01.T1.1 + routing model 09.T9.1
 *   + per-layer provenance 21.T21.18)
 * Actualises: the M0-X' layer discriminator as a visible surface on the M0'
 *   graph pane — local layers select the active read register (tab routes per
 *   the frozen m0-inspector law, cross-pane switching via `m0.layer.*`
 *   commands); bridged layers (M0-4' personal, M0-5' pedagogy) carry live
 *   deep-links scoped to the shared selected coordinate. Read-only affordance;
 *   no canon mutation. Its active local layer can be controlled by the App's
 *   persisted M0 surface record across layout remounts.
 *   Each local layer receives its own provenance reading from the shared S2
 *   node-with-relations response; M0-4'/M0-5' render explicit bridged-local /
 *   bridged-public dispositions and never read the bridged payload here.
 * Does NOT own: per-layer field rendering (T1.5/T1.9 land those), the bridged
 *   M4'/M5' surfaces the links route into, any state store (four-store law —
 *   the App owns the persisted UI value while standalone embedding has a local
 *   fallback; the S2 read is a transient cache over `s2.graph.node`, and
 *   cross-pane intent is the command registry).
 */

import { useEffect, useState } from 'react';
import { commands } from '../commands/registry';
import { gateway } from '../bridge/gatewayHolder';
import { GraphClient } from '../bridge/graphClient';
import { useCoordinateStore, useProvenanceStore } from '../state/stores';
import { bridgedLayerRoute, M0InspectorLayer, M0_LAYER_ROUTES } from './m0Layers';
import {
    blockedM0LayerReadiness,
    buildM0LayerReadiness,
    M0LayerReadiness,
    M0ProvenanceState
} from './m0LayerReadiness';

export interface M0LayerRailProps {
    activeLayer?: M0InspectorLayer;
    onLayerChange?: (layer: M0InspectorLayer) => void;
    requestedLayer?: M0InspectorLayer | null;
}

const PROVENANCE_LABEL: Readonly<Record<M0ProvenanceState, string>> = Object.freeze({
    canonical: 'canonical',
    canonical_absent: 'canonical absent',
    derived: 'derived',
    inferred: 'inferred',
    review_pending: 'review pending',
    blocked: 'blocked',
    bridged_local: 'bridged local',
    bridged_public: 'bridged public'
});

function M0LayerProvenancePill({ state }: { readonly state: M0ProvenanceState }) {
    return (
        <span
            className={`m0-layer-provenance m0-layer-provenance-${state}`}
            data-testid={`m0-layer-provenance-${state}`}
            data-provenance-state={state}
        >
            {PROVENANCE_LABEL[state]}
        </span>
    );
}

export function M0LayerRail({
    activeLayer,
    onLayerChange,
    requestedLayer = null
}: M0LayerRailProps = {}) {
    const selected = useCoordinateStore(s => s.selected);
    const connected = useProvenanceStore(s => s.connection.connected);
    const [uncontrolledActive, setUncontrolledActive] = useState<M0InspectorLayer>('lang');
    const [layerReadiness, setLayerReadiness] = useState<M0LayerReadiness | null>(null);
    const active = activeLayer ?? uncontrolledActive;

    const selectLayer = (layer: M0InspectorLayer) => {
        if (activeLayer === undefined) {
            setUncontrolledActive(layer);
        }
        onLayerChange?.(layer);
    };

    useEffect(() => {
        if (!requestedLayer || requestedLayer === 'pers' || requestedLayer === 'pedag') {
            return;
        }
        selectLayer(requestedLayer);
    }, [requestedLayer, onLayerChange, activeLayer]);

    useEffect(() => {
        const disposers = M0_LAYER_ROUTES.filter(
            route => route.view.placement === 'local'
        ).map(route =>
            commands.register({
                id: route.commandId,
                title: `M0': ${route.view.label} layer`,
                run: () => {
                    selectLayer(route.layer);
                }
            })
        );
        return () => disposers.forEach(dispose => dispose());
    }, [onLayerChange, activeLayer]);

    // 21.1 — read the shared S2 node for the selected coordinate and carry its
    // provenance to the local layer chips. The read rides the real `s2.graph.node`
    // channel (the ONE read every local layer shares, m0Layers.ts); the rail owns
    // no clock and no store — this is a transient render cache keyed on the
    // coordinate, cleared to honest absence when nothing is selected.
    useEffect(() => {
        if (!selected) {
            setLayerReadiness(null);
            return;
        }
        if (!connected) {
            setLayerReadiness(blockedM0LayerReadiness());
            return;
        }
        let disposed = false;
        const coordinate = selected;
        setLayerReadiness(null);
        let client: GraphClient;
        try {
            client = new GraphClient(gateway());
        } catch (err) {
            setLayerReadiness(blockedM0LayerReadiness());
            return;
        }
        client
            .node(coordinate)
            .then(({ node, relations }) => {
                if (disposed) {
                    return;
                }
                setLayerReadiness(buildM0LayerReadiness({ node, relations }));
            })
            .catch(() => {
                if (disposed) {
                    return;
                }
                setLayerReadiness(blockedM0LayerReadiness());
            });
        return () => {
            disposed = true;
        };
    }, [selected, connected]);

    return (
        <div className="pane-toolbar m0-layer-rail" data-testid="m0-layer-rail">
            {M0_LAYER_ROUTES.map(route => {
                const provenance = route.view.placement === 'bridged'
                    ? (route.layerKey === 'personal' ? 'bridged_local' : 'bridged_public')
                    : layerReadiness?.[route.layerKey] ?? null;
                return route.view.placement === 'local' ? (
                    <button
                        key={route.layer}
                        data-testid={`m0-layer-${route.layerKey}`}
                        data-active={active === route.layer ? 'true' : 'false'}
                        data-route={route.routePath}
                        data-s2-read={provenance ?? 'none'}
                        data-m0-provenance={provenance ?? undefined}
                        title={`${route.view.label} — ${route.view.summary}`}
                        onClick={() => selectLayer(route.layer)}
                    >
                        {route.view.id}
                        {provenance ? <M0LayerProvenancePill state={provenance} /> : null}
                    </button>
                ) : (() => {
                    const bridgeProvenance: M0ProvenanceState =
                        route.layerKey === 'personal' ? 'bridged_local' : 'bridged_public';
                    return (
                        <a
                            key={route.layer}
                            data-testid={`m0-layer-${route.layerKey}`}
                            data-route={route.routePath}
                            data-m0-provenance={bridgeProvenance}
                            href={bridgedLayerRoute(route.view, selected) ?? undefined}
                            title={`${route.view.label} — ${route.view.summary}`}
                        >
                            {route.view.id} ↗
                            <M0LayerProvenancePill state={bridgeProvenance} />
                        </a>
                    );
                })()
            })}
            <a
                data-testid="m0-governed-proposal"
                href={
                    selected
                        ? `epi-logos://ide/m5-epii/review?coordinate=${encodeURIComponent(selected)}&intent=governed-promotion&source=m0-anuttara`
                        : undefined
                }
                title="Propose a governed graph change through M5 review"
            >
                Propose via M5
            </a>
        </div>
    );
}
