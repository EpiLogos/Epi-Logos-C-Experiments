/**
 * Coordinate: M' M1' (walk-as-melody, Phase-2 opener)
 * Actualises: graph traversal as musical movement — the walked coordinate is
 *   the cell, the relation is the interval, the path is the phrase
 *   (M1'-SPEC). Steps traverse the REAL S2 pointer topology through the
 *   gateway and pulse a kernel-bus voice; nothing invents pitch, nothing
 *   walks a fake graph. Selection publishes to the shared coordinate store —
 *   every surface follows the walk.
 */

import { useEffect, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { GraphClient, GraphNode, GraphRelation } from '../bridge/graphClient';
import { instrument } from '../audio/instrument';
import { modulationEngine } from '../engine/modulation/engine';
import { useCoordinateStore, useProvenanceStore, useTickStore } from '../state/stores';

interface WalkStep {
    coordinate: string;
    relation: string | null;
}

function voiceIndexFor(coordinate: string): number {
    const digits = coordinate.match(/\d/g);
    return digits ? parseInt(digits[digits.length - 1], 10) % 8 : 0;
}

/** Only Bimba-coordinate-shaped addresses may seed a graph walk. Namespaced
 *  selection addresses (`planet:Venus` — the E5 provisional planet selection)
 *  are display/selection state, NOT graph nodes; auto-walking them would
 *  fabricate stub nodes. (E5 verifier finding, 2026-07-02.) */
export function isWalkableCoordinate(value: string | null | undefined): value is string {
    return typeof value === 'string' && value.length > 0 && !value.includes(':');
}

/** Track 02.T2.5 — invert(coordinate) → the X/X' partner. A pure involution
 *  (invert∘invert = identity): the prime marker toggles, so the walk can surface
 *  the reciprocal face WITHOUT fabricating a graph node (the reciprocal relation
 *  mapping itself is resolved in the substrate, M1'-SPEC §14). This is the
 *  single # operator "acting locally at that position". */
export function invertCoordinate(coordinate: string): string {
    return coordinate.endsWith("'") ? coordinate.slice(0, -1) : `${coordinate}'`;
}

/** The single session-held `#` (Inversion_Operator) handle carried on every
 *  profile (M1'-SPEC §14) — the SAME operator at every coordinate, never a
 *  per-coordinate fork. Returns null until the bridge delivers a profile. */
function sessionHeldInversionOperator(
    cached: { profile?: unknown } | null
): { operator: string; handle: string } | null {
    const payload = (cached?.profile as Record<string, unknown> | undefined) ?? undefined;
    const op = payload?.inversionOperator as Record<string, unknown> | undefined;
    if (!op || typeof op.handle !== 'string') {
        return null;
    }
    return { operator: typeof op.operator === 'string' ? op.operator : '', handle: op.handle };
}

export function WalkPane() {
    const connected = useProvenanceStore(s => s.connection.connected);
    const selected = useCoordinateStore(s => s.selected);
    const [seed, setSeed] = useState(isWalkableCoordinate(selected) ? selected : 'M1');
    const [node, setNode] = useState<GraphNode | null>(null);
    const [relations, setRelations] = useState<GraphRelation[] | null>(null);
    const [path, setPath] = useState<WalkStep[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    // T2.5 — the single session-held # operator (from the profile) + the local
    // invert toggle. `shownInvert` starts as the current coordinate and flips to
    // its X' partner on each invert, round-tripping.
    const cachedProfile = useTickStore(s => s.profile);
    const inversionOperator = sessionHeldInversionOperator(cachedProfile);
    const [invertedCoord, setInvertedCoord] = useState<string | null>(null);
    const currentCoordinate = node?.coordinate ?? null;

    const arrive = async (coordinate: string, relation: string | null) => {
        setLoading(true);
        setError(null);
        try {
            const client = new GraphClient(gateway());
            // s2.graph.node is the typed-relation authority; traverse is the
            // untyped fallback sweep (real contract per verifier live probe)
            const arrived = await client.node(coordinate);
            const relationsTyped =
                arrived.relations.length > 0 ? arrived.relations : await client.traverse(coordinate);
            setNode(arrived.node ?? { coordinate, label: null, properties: {} });
            setRelations(relationsTyped);
            setPath(prev => [...prev, { coordinate, relation }]);
            useCoordinateStore.getState().setSelected(coordinate);
            // E7: the walk's articulation rides the modulation graph — the
            // active temporal division gears the phrase length
            instrument.pulseVoice(voiceIndexFor(coordinate), modulationEngine.currentSubdivision());
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (connected && path.length === 0 && !loading && !node) {
            void arrive(seed, null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connected]);

    // The invert control resets to the current coordinate whenever the walk moves.
    useEffect(() => {
        setInvertedCoord(null);
    }, [currentCoordinate]);
    const shownInvert = invertedCoord ?? currentCoordinate;

    if (!connected) {
        return <div className="pane-message">Gateway disconnected — the walk needs the topology.</div>;
    }

    return (
        <div className="walk-pane" data-testid="walk-pane">
            <div className="pane-toolbar">
                <input
                    data-testid="walk-seed"
                    value={seed}
                    onChange={evt => setSeed(evt.target.value)}
                    onKeyDown={evt => {
                        if (evt.key === 'Enter') {
                            setPath([]);
                            setNode(null);
                            void arrive(seed.trim(), null);
                        }
                    }}
                />
                <span>{loading ? 'walking…' : node ? `at ${node.coordinate}` : ''}</span>
            </div>
            {error ? (
                <div className="chat-error" data-testid="walk-error">
                    {error}
                </div>
            ) : null}
            {path.length > 0 ? (
                <div className="walk-phrase" data-testid="walk-phrase">
                    {path.map((step, i) => (
                        <span key={i} className="walk-step">
                            {step.relation ? <em> —{step.relation}→ </em> : null}
                            {step.coordinate}
                        </span>
                    ))}
                </div>
            ) : null}
            {node ? (
                <div className="walk-node" data-testid="walk-node">
                    <h3>{node.coordinate}</h3>
                    {node.label ? <p>{node.label}</p> : null}
                </div>
            ) : null}
            {/* T2.5 — the single session-held # (Inversion_Operator) acting locally
                at the walked coordinate. Clicking toggles the X/X' reciprocal face
                (a pure involution, so it round-trips) WITHOUT walking — the invert
                surfaces the partner without fabricating a graph node. The operator
                handle is the SAME at every coordinate (M1'-SPEC §14), read off the
                profile bus, never per-coordinate forked. */}
            {node ? (
                <div className="walk-invert" data-testid="m1-invert-affordance">
                    <button
                        type="button"
                        className="vault-node"
                        data-testid="m1-invert-current-coordinate"
                        disabled={loading || !shownInvert}
                        onClick={() => {
                            if (shownInvert) {
                                setInvertedCoord(invertCoordinate(shownInvert));
                            }
                        }}
                    >
                        # invert
                    </button>
                    <span className="walk-invert-face" data-testid="m1-invert-face">
                        {shownInvert}
                    </span>
                    {inversionOperator ? (
                        <span className="walk-invert-op" data-testid="m1-inversion-operator">
                            {inversionOperator.handle}
                        </span>
                    ) : null}
                </div>
            ) : null}
            <ul className="walk-relations">
                {(relations ?? []).map((rel, i) => (
                    <li key={`${rel.target}-${i}`}>
                        <button
                            type="button"
                            className="vault-node"
                            data-testid={`walk-rel-${rel.target}`}
                            disabled={loading}
                            onClick={() => void arrive(rel.target, rel.type)}
                        >
                            <em>{rel.type}</em> → {rel.target}
                        </button>
                    </li>
                ))}
                {relations && relations.length === 0 ? (
                    <li className="pane-message">no outgoing relations from here</li>
                ) : null}
            </ul>
        </div>
    );
}
