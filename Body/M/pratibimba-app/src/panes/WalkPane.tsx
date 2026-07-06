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
import { useCoordinateStore, useProvenanceStore } from '../state/stores';

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

export function WalkPane() {
    const connected = useProvenanceStore(s => s.connection.connected);
    const selected = useCoordinateStore(s => s.selected);
    const [seed, setSeed] = useState(isWalkableCoordinate(selected) ? selected : 'M1');
    const [node, setNode] = useState<GraphNode | null>(null);
    const [relations, setRelations] = useState<GraphRelation[] | null>(null);
    const [path, setPath] = useState<WalkStep[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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
