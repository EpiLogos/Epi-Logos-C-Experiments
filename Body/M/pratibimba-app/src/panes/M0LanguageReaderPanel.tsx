/**
 * Coordinate: M' M0-0' (language-layer reader panel, rerun 21.T21.2)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M0-0' pre-math node-language read surface
 * Actualises: the M0-0' language layer as a real read of the selected
 *   coordinate's canonical c_1_* language fields (m0Layers.ts M0_LAYER_FIELDS.lang),
 *   ordered by the App-owned implicate/explicate phase without forking the S2 payload,
 *   over the shared s2.graph.node channel, plus the candidate-DR-M0-4 image-asset
 *   handle row (m0AssetHandles.ts). Missing fields are canonical-absence, never a
 *   placeholder; an unprefixed alias is surfaced as a `derived` reading (DR-M0-2);
 *   asset handles stay `review_pending` until the Architect ratifies DR-M0-4.
 * Public surface: M0LanguageReaderPanel.
 * Does NOT own: the field list (m0Layers.ts), the asset projection law
 *   (m0AssetHandles.ts), the S2 read transport (bridge/graphClient.ts), canon
 *   mutation (Hen/M5, DR-M0-1), or a state store (four-store law — the read is a
 *   transient render cache over the shared selected coordinate).
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.2.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { GraphClient } from '../bridge/graphClient';
import { ProvenanceBadge, ProvenanceState } from '../ui/ProvenanceBadge';
import { MExtensionEmptyState } from '../ui/mExtensionEmptyStates';
import { useCoordinateStore, useProvenanceStore, useTickStore } from '../state/stores';
import { M0_LAYER_FIELDS } from './m0Layers';
import type { M0Phase } from './m0SurfaceState';
import { M0_ASSET_KIND_FIELD, M0_ASSET_URI_FIELD, buildM0AssetHandles } from './m0AssetHandles';
import { M0ArchetypeRoutingPanel } from './M0ArchetypeRoutingPanel';
import { readM0ArchetypeRouting } from './m0ArchetypeRouting';
import { contemplationFromProfile } from './m0Contemplation';
import { readM0VirtueWitness } from './m0VirtueWitness';
import { inkDim } from '../ui/tokens';

/** The canonical language text fields — M0_LAYER_FIELDS.lang minus the asset
 *  slots (those feed the asset-handle row, not the `<dl>`). Bus-fed: the field
 *  list is owned by m0Layers.ts, never hand-copied here. */
const LANGUAGE_TEXT_FIELDS = M0_LAYER_FIELDS.lang.filter(
    field => field !== M0_ASSET_URI_FIELD && field !== M0_ASSET_KIND_FIELD
);

const PHASE_PRIORITY_FIELD: Readonly<Record<M0Phase, string>> = Object.freeze({
    implicate: 'c_1_form',
    explicate: 'c_1_complete_formulation'
});

interface FieldReading {
    readonly field: string;
    readonly value: string | null;
    readonly state: ProvenanceState;
}

interface NodeRead {
    readonly status: 'ready';
    readonly properties: Record<string, unknown>;
}

type ReadState =
    | { readonly status: 'idle' }
    | { readonly status: 'pending'; readonly reason: string }
    | { readonly status: 'blocked'; readonly reason: string }
    | NodeRead;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Render a canonical value honestly: strings verbatim, arrays joined, absent → null. */
function displayValue(value: unknown): string | null {
    if (typeof value === 'string') {
        return value.length > 0 ? value : null;
    }
    if (Array.isArray(value)) {
        const parts = value.filter(v => v != null).map(String);
        return parts.length > 0 ? parts.join(', ') : null;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    return null;
}

/** Read one language field: canonical when the c_1_ slot is present, `derived`
 *  when only the unprefixed legacy alias is present (DR-M0-2), else absent. */
function readField(field: string, properties: Record<string, unknown>): FieldReading {
    const canonical = displayValue(properties[field]);
    if (canonical !== null) {
        return { field, value: canonical, state: 'canonical' };
    }
    const alias = field.startsWith('c_1_') ? field.slice('c_1_'.length) : null;
    const aliasValue = alias ? displayValue(properties[alias]) : null;
    if (aliasValue !== null) {
        return { field, value: aliasValue, state: 'derived' };
    }
    return { field, value: null, state: 'canonical_absent' };
}

export function M0LanguageReaderPanel({ phase = 'implicate' }: { readonly phase?: M0Phase }) {
    const selected = useCoordinateStore(s => s.selected);
    const connected = useProvenanceStore(s => s.connection.connected);
    const cachedProfile = useTickStore(s => s.profile);
    const [read, setRead] = useState<ReadState>({ status: 'idle' });

    useEffect(() => {
        if (!selected) {
            setRead({ status: 'idle' });
            return;
        }
        if (!connected) {
            setRead({ status: 'pending', reason: 'gateway not connected — no S2 read yet' });
            return;
        }
        let disposed = false;
        setRead({ status: 'pending', reason: `reading ${selected}` });
        let client: GraphClient;
        try {
            client = new GraphClient(gateway());
        } catch (err) {
            setRead({ status: 'blocked', reason: err instanceof Error ? err.message : String(err) });
            return;
        }
        client
            .node(selected)
            .then(({ node }) => {
                if (disposed) {
                    return;
                }
                setRead({
                    status: 'ready',
                    properties: isRecord(node?.properties) ? node.properties : {}
                });
            })
            .catch(err => {
                if (!disposed) {
                    setRead({
                        status: 'blocked',
                        reason: err instanceof Error ? err.message : String(err)
                    });
                }
            });
        return () => {
            disposed = true;
        };
    }, [selected, connected]);

    const fields = useMemo<readonly FieldReading[]>(
        () =>
            read.status === 'ready'
                ? [
                      PHASE_PRIORITY_FIELD[phase],
                      ...LANGUAGE_TEXT_FIELDS.filter(field => field !== PHASE_PRIORITY_FIELD[phase])
                  ].map(field => readField(field, read.properties))
                : [],
        [phase, read]
    );
    const assets = useMemo(
        () => buildM0AssetHandles(read.status === 'ready' ? { payload: read.properties } : null),
        [read]
    );
    const archetypeRouting = useMemo(
        () => readM0ArchetypeRouting(read.status === 'ready' ? read.properties : null, cachedProfile),
        [cachedProfile, read]
    );
    const contemplation = useMemo(() => contemplationFromProfile(cachedProfile), [cachedProfile]);
    const virtueWitness = useMemo(() => readM0VirtueWitness(cachedProfile), [cachedProfile]);
    const seekContemplation = useCallback(() => {
        document.getElementById('m0-contemplation-footer')?.scrollIntoView({ block: 'nearest' });
    }, []);

    if (read.status !== 'ready') {
        const reason = read.status === 'idle' ? undefined : read.reason;
        return (
            <section
                className="m0-language-reader m0-language-reader-status"
                data-testid="m0-language-reader"
                data-state={read.status}
            >
                <header className="m0-language-reader-header">
                    <span className="m0-language-reader-kicker">M0-0′</span>
                    <h3>Pre-math node language</h3>
                    {read.status === 'blocked' ? <ProvenanceBadge state="blocked" reason={reason} /> : null}
                </header>
                {read.status === 'idle' ? (
                    // 32.T32.6 — the M0 empty state comes from the registry, so
                    // the copy, the named contributors and the reasons table are
                    // the one registered grammar rather than a local sentence.
                    <MExtensionEmptyState extensionId="m0-anuttara" viewId="language" />
                ) : (
                    <p style={{ color: inkDim }}>
                        {read.status === 'blocked'
                            ? `S2 read blocked: ${reason}`
                            : 'Reading the canonical language fields…'}
                    </p>
                )}
            </section>
        );
    }

    return (
        <section
            className="m0-language-reader"
            data-testid="m0-language-reader"
            data-state="ready"
            data-phase={phase}
        >
            <header className="m0-language-reader-header">
                <span className="m0-language-reader-kicker">M0-0′</span>
                <h3>Pre-math node language</h3>
            </header>
            <dl className="m0-language-fields" data-testid="m0-language-fields">
                {fields.map(reading => (
                    <div
                        key={reading.field}
                        className="m0-language-field"
                        data-testid={`m0-language-field-${reading.field}`}
                        data-provenance={reading.state}
                    >
                        <dt>
                            {reading.field}
                            <ProvenanceBadge
                                state={reading.state}
                                reason={
                                    reading.state === 'derived'
                                        ? 'read from an unprefixed legacy alias (DR-M0-2)'
                                        : reading.state === 'canonical_absent'
                                          ? 'no canonical value emitted for this field'
                                          : undefined
                                }
                            />
                        </dt>
                        <dd>{reading.value ?? <span style={{ color: inkDim }}>—</span>}</dd>
                    </div>
                ))}
            </dl>
            <M0ArchetypeRoutingPanel
                projection={archetypeRouting}
                contemplationPrompt={contemplation.prompt}
                virtueWitness={virtueWitness}
                onSeekContemplation={seekContemplation}
            />
            <div
                className="m0-language-asset-row"
                data-testid="m0-language-asset-row"
                data-state={assets.state}
            >
                <span className="m0-language-asset-label">
                    Image assets
                    <ProvenanceBadge
                        state={assets.state}
                        reason={
                            assets.state === 'review_pending'
                                ? `${assets.drGate} — awaiting Architect ratification`
                                : 'no canonical asset handles emitted'
                        }
                    />
                </span>
                {assets.handles.length > 0 ? (
                    <ol className="m0-language-assets">
                        {assets.handles.map((handle, index) => (
                            <li
                                key={handle.uri}
                                data-testid={`m0-language-asset-${index}`}
                                data-kind={handle.kind ?? 'unknown'}
                            >
                                <span className="m0-language-asset-kind">
                                    {handle.kind ?? 'asset'}
                                </span>
                                <span className="m0-language-asset-uri">{handle.uri}</span>
                            </li>
                        ))}
                    </ol>
                ) : (
                    <p style={{ color: inkDim }}>No image-asset handles on this node.</p>
                )}
            </div>
        </section>
    );
}
