/**
 * Coordinate: M' M0' (six-layer rail, rerun 01.T1.1 + routing model 09.T9.1
 *   + per-layer S2 read-state chip 21.T21.1)
 * Actualises: the M0-X' layer discriminator as a visible surface on the M0'
 *   graph pane — local layers select the active read register (tab routes per
 *   the frozen m0-inspector law, cross-pane switching via `m0.layer.*`
 *   commands); bridged layers (M0-4' personal, M0-5' pedagogy) carry live
 *   deep-links scoped to the shared selected coordinate. Read-only affordance;
 *   no canon mutation.
 *   Per DR-FACE-7 §3 (21.1 fate A + small B): each LOCAL layer carries a
 *   provenance chip built with the EXISTING `ProvenanceBadge`/`ProvenanceState`
 *   primitive — no invented taxonomy. The chip shows the shared S2 node-read
 *   state only (canonical when the coordinate has a :Bimba node, canonical_absent
 *   when it does not, pending in flight, blocked on read error). Bridged-ness is
 *   NOT provenance: it is `placement: 'bridged'` on the layer model, so the
 *   spec's `bridged_local`/`bridged_public` states are absent and bridged layers
 *   carry no S2 chip (they route, they never read S2 here).
 * Does NOT own: per-layer field rendering (T1.5/T1.9 land those), the bridged
 *   M4'/M5' surfaces the links route into, any state store (four-store law —
 *   layer selection is pane-local, the S2 read is a transient render cache over
 *   the shared `s2.graph.node` channel, cross-pane intent is the command registry).
 */

import { useEffect, useState } from 'react';
import { commands } from '../commands/registry';
import { gateway } from '../bridge/gatewayHolder';
import { GraphClient } from '../bridge/graphClient';
import { ProvenanceBadge, ProvenanceState } from '../ui/ProvenanceBadge';
import { useCoordinateStore, useProvenanceStore } from '../state/stores';
import { bridgedLayerRoute, M0InspectorLayer, M0_LAYER_ROUTES } from './m0Layers';

export interface M0LayerRailProps {
    onLayerChange?: (layer: M0InspectorLayer) => void;
    requestedLayer?: M0InspectorLayer | null;
}

/** The shared S2 node-read state the local layers project (21.1). `null` = no
 *  coordinate selected yet, so there is nothing to provenance (honest absence,
 *  not a placeholder). */
interface S2ReadState {
    readonly state: ProvenanceState;
    readonly reason?: string;
}

export function M0LayerRail({ onLayerChange, requestedLayer = null }: M0LayerRailProps = {}) {
    const selected = useCoordinateStore(s => s.selected);
    const connected = useProvenanceStore(s => s.connection.connected);
    const [active, setActive] = useState<M0InspectorLayer>('lang');
    const [s2Read, setS2Read] = useState<S2ReadState | null>(null);

    useEffect(() => {
        if (!requestedLayer || requestedLayer === 'pers' || requestedLayer === 'pedag') {
            return;
        }
        setActive(requestedLayer);
        onLayerChange?.(requestedLayer);
    }, [requestedLayer, onLayerChange]);

    useEffect(() => {
        const disposers = M0_LAYER_ROUTES.filter(
            route => route.view.placement === 'local'
        ).map(route =>
            commands.register({
                id: route.commandId,
                title: `M0': ${route.view.label} layer`,
                run: () => {
                    setActive(route.layer);
                    onLayerChange?.(route.layer);
                }
            })
        );
        return () => disposers.forEach(dispose => dispose());
    }, [onLayerChange]);

    // 21.1 — read the shared S2 node for the selected coordinate and carry its
    // provenance to the local layer chips. The read rides the real `s2.graph.node`
    // channel (the ONE read every local layer shares, m0Layers.ts); the rail owns
    // no clock and no store — this is a transient render cache keyed on the
    // coordinate, cleared to honest absence when nothing is selected.
    useEffect(() => {
        if (!selected) {
            setS2Read(null);
            return;
        }
        if (!connected) {
            setS2Read({ state: 'pending', reason: 'gateway not connected — no S2 read yet' });
            return;
        }
        let disposed = false;
        const coordinate = selected;
        setS2Read({ state: 'pending', reason: `reading ${coordinate}` });
        let client: GraphClient;
        try {
            client = new GraphClient(gateway());
        } catch (err) {
            setS2Read({
                state: 'blocked',
                reason: err instanceof Error ? err.message : String(err)
            });
            return;
        }
        client
            .node(coordinate)
            .then(({ node }) => {
                if (disposed) {
                    return;
                }
                setS2Read(
                    node
                        ? { state: 'canonical' }
                        : {
                              state: 'canonical_absent',
                              reason: `no canonical :Bimba node at ${coordinate}`
                          }
                );
            })
            .catch(err => {
                if (disposed) {
                    return;
                }
                setS2Read({
                    state: 'blocked',
                    reason: err instanceof Error ? err.message : String(err)
                });
            });
        return () => {
            disposed = true;
        };
    }, [selected, connected]);

    return (
        <div className="pane-toolbar m0-layer-rail" data-testid="m0-layer-rail">
            {M0_LAYER_ROUTES.map(route =>
                route.view.placement === 'local' ? (
                    <button
                        key={route.layer}
                        data-testid={`m0-layer-${route.layerKey}`}
                        data-active={active === route.layer ? 'true' : 'false'}
                        data-route={route.routePath}
                        data-s2-read={s2Read?.state ?? 'none'}
                        title={`${route.view.label} — ${route.view.summary}`}
                        onClick={() => {
                            setActive(route.layer);
                            onLayerChange?.(route.layer);
                        }}
                    >
                        {route.view.id}
                        {s2Read ? <ProvenanceBadge state={s2Read.state} reason={s2Read.reason} /> : null}
                    </button>
                ) : (
                    <a
                        key={route.layer}
                        data-testid={`m0-layer-${route.layerKey}`}
                        data-route={route.routePath}
                        href={bridgedLayerRoute(route.view, selected) ?? undefined}
                        title={`${route.view.label} — ${route.view.summary}`}
                    >
                        {route.view.id} ↗
                    </a>
                )
            )}
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
