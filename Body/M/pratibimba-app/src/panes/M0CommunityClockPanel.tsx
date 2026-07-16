/**
 * Coordinate: M' M0-3' (community + active-now clock panel, 09.T9.6)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M0-3' active-carrier read surface
 * Actualises: a visibly separated synchronic S2 GDS community reading and
 *   diachronic kernel world-clock / public Graphiti-handle reading for the
 *   shared selected coordinate.
 * Public surface: M0CommunityClockPanel.
 * Does NOT own: GDS computation, graph writes, clock computation, a fifth
 *   state store, or Graphiti episode bodies.
 * Contract: [[M0'-SPEC]] + [[09-integrated-bimba-graph-reconciliation]] 09.T9.6.
 */

import { useEffect, useMemo, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { harmonicSnapshot } from '../engine/modulation/modulators';
import { useCoordinateStore, useProvenanceStore, useTickStore } from '../state/stores';
import { ProvenanceBadge } from '../ui/ProvenanceBadge';
import {
    buildM0CommunityClockOverlay,
    M0_GDS_TANGENT_OVERLAY_METHOD
} from './m0CommunityClockOverlay';

function record(value: unknown): Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};
}

function graphitiEpisodeRefs(profile: unknown): unknown {
    const root = record(profile);
    const hp = record(root.harmonicProfile);
    return (
        root.graphitiEpisodeRefs ??
        root.graphiti_episode_refs ??
        hp.graphitiEpisodeRefs ??
        hp.graphiti_episode_refs ??
        []
    );
}

export function M0CommunityClockPanel() {
    const selected = useCoordinateStore(state => state.selected);
    const connected = useProvenanceStore(state => state.connection.connected);
    const cached = useTickStore(state => state.profile);
    const [gdsOverlay, setGdsOverlay] = useState<unknown>(null);
    const [gdsError, setGdsError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!selected) {
            setGdsOverlay(null);
            setGdsError(null);
            setLoading(false);
            return;
        }
        if (!connected) {
            setGdsOverlay(null);
            setGdsError('gateway disconnected; S2 community overlay unavailable');
            setLoading(false);
            return;
        }

        let disposed = false;
        setGdsOverlay(null);
        setLoading(true);
        setGdsError(null);
        let invocation;
        try {
            invocation = gateway().invoke(M0_GDS_TANGENT_OVERLAY_METHOD, {
                coordinate: selected,
                topK: 12
            });
        } catch (error) {
            setGdsError(error instanceof Error ? error.message : String(error));
            setLoading(false);
            return;
        }
        invocation
            .then(receipt => {
                if (!disposed) {
                    setGdsOverlay(receipt.artifact);
                }
            })
            .catch(error => {
                if (!disposed) {
                    setGdsOverlay(null);
                    setGdsError(error instanceof Error ? error.message : String(error));
                }
            })
            .finally(() => {
                if (!disposed) {
                    setLoading(false);
                }
            });

        return () => {
            disposed = true;
        };
    }, [selected, connected, cached?.graphRevision]);

    const projection = useMemo(() => {
        const clock = harmonicSnapshot(cached?.profile);
        return buildM0CommunityClockOverlay({
            profile: {
                payload: {
                    active_now_clock: {
                        tick12: clock.tick12,
                        degreeNode360: clock.degree360
                    },
                    graphiti_episode_refs: graphitiEpisodeRefs(cached?.profile)
                }
            },
            gdsOverlay,
            gdsError
        });
    }, [cached, gdsOverlay, gdsError]);

    const overlayStatus = loading ? 'pending' : (projection.gdsOverlayStatus ?? 'blocked');

    return (
        <section
            className="m0-community-clock"
            data-testid="m0-community-clock-panel"
            data-coordinate={selected ?? 'none'}
            data-overlay-status={overlayStatus}
        >
            <header className="m0-community-clock-header">
                <div>
                    <span className="m0-community-clock-kicker">M0-3′</span>
                    <h3>Community / world clock</h3>
                </div>
                <ProvenanceBadge
                    state={loading ? 'pending' : projection.state}
                    reason={projection.gdsReason ?? undefined}
                />
            </header>

            <div className="m0-community-clock-columns">
                <section data-testid="m0-synchronic-community">
                    <h4>Synchronic · community</h4>
                    <p className="m0-community-clock-status">{overlayStatus}</p>
                    {projection.gdsTangentNodes.length > 0 ? (
                        <ol className="m0-community-list">
                            {projection.gdsTangentNodes.map(node => (
                                <li key={`${node.sourceAlgorithm}:${node.coordinate}`}>
                                    <span>{node.coordinate}</span>
                                    <span>{node.score.toFixed(3)}</span>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p>No derived communities returned.</p>
                    )}
                    {projection.gdsReason ? <p>{projection.gdsReason}</p> : null}
                    {projection.privacyBoundary ? (
                        <p className="m0-community-clock-boundary">{projection.privacyBoundary}</p>
                    ) : null}
                </section>

                <section
                    data-testid="m0-diachronic-clock"
                    data-clock-state={projection.activeNowClock.state}
                >
                    <h4>Diachronic · world clock</h4>
                    <p data-testid="m0-world-clock-tick" className="m0-world-clock-value">
                        {projection.activeNowClock.tick12 === null ||
                        projection.activeNowClock.degreeNode360 === null
                            ? 'No kernel world-clock reading emitted.'
                            : `tick ${projection.activeNowClock.tick12} · ${projection.activeNowClock.degreeNode360}°`}
                    </p>
                    <div data-testid="m0-graphiti-episodes">
                        {projection.graphitiEpisodeRefs.length > 0 ? (
                            <ul className="m0-community-list">
                                {projection.graphitiEpisodeRefs.map(ref => (
                                    <li key={ref} title="Protected-local Graphiti reference">
                                        {ref}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No public episode handles emitted.</p>
                        )}
                    </div>
                </section>
            </div>
        </section>
    );
}
