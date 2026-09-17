/**
 * Coordinate: M' `/` membrane (M5-4' ACR — context-pack view — 51.T51.1)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Position (#n): a subordinate section of the omniDispatchTrace fold, which is
 *   what `agentic-control-room` resolves to in the cross-layout intent ledger.
 * Actualises: the USER half of 51.T51.1. `s4'.context.assemble` makes the
 *   ta-onta spine injection visible to the AGENT; this makes it visible to the
 *   operator — per carrier, with byte size, freshness, budget outcome, and the
 *   failures the old flat injection string could not carry at all. The pack is
 *   read from the live gateway; nothing here re-assembles or re-renders it, so
 *   what is shown is what the session was given.
 *
 *   32.T32.7: the `s4'.context.assemble` read is a runtime kernel-bridge call,
 *   so its refusal renders the 32.7 inline error surface (spec :227) with the
 *   retry this section already had the closure for — `refresh` — plus the
 *   Diagnostics deep-link and dismiss.
 * Public surface: ContextPackSection.
 * Does NOT own: assembly (Body/S/S4/ta-onta/spine/compositor.ts), the envelope
 *   parse (contextPack.ts), session authority (S3), or the error grammar
 *   (ui/errorUxGrammar + ui/InlineErrorSurface).
 */

import { useCallback, useEffect, useState } from 'react';
import { gateway } from '../../bridge/gatewayHolder';
import { useProvenanceStore } from '../../state/stores';
import { InlineErrorSurface } from '../../ui/InlineErrorSurface';
import { ReadinessBanner } from '../../ui/ReadinessBanner';
import {
    contextPackTotals,
    loadContextPackSnapshot,
    type ContextPackBlock,
    type ContextPackSnapshot
} from './contextPack';

const STATUS_LABEL: Readonly<Record<ContextPackBlock['status'], string>> = {
    included: 'injected',
    overflowed: 'over budget',
    'excluded-cold': 'cold',
    failed: 'failed'
};

function BlockRow({ block }: { readonly block: ContextPackBlock }) {
    return (
        <tr
            className={`context-pack-block context-pack-block-${block.status}`}
            data-testid={`context-pack-block-${block.coordinate}`}
            data-status={block.status}
        >
            <th scope="row">{block.coordinate}</th>
            <td>{block.cost}</td>
            <td data-testid={`context-pack-status-${block.coordinate}`}>
                {STATUS_LABEL[block.status]}
            </td>
            <td>{block.bytes} B</td>
            <td>
                {block.status === 'failed' ? (
                    <span className="context-pack-error">{block.error}</span>
                ) : block.status === 'overflowed' ? (
                    <code className="context-pack-vak-token">{block.vakToken}</code>
                ) : (
                    <span className="context-pack-fresh">
                        {new Date(block.producedAtMs).toISOString()}
                    </span>
                )}
            </td>
        </tr>
    );
}

export function ContextPackSection() {
    const connected = useProvenanceStore(s => s.connection.connected);
    const [snapshot, setSnapshot] = useState<ContextPackSnapshot | null>(null);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(() => {
        if (!connected) return;
        setError(null);
        loadContextPackSnapshot(gateway())
            .then(setSnapshot)
            .catch(err => {
                setSnapshot(null);
                setError(err instanceof Error ? err.message : String(err));
            });
    }, [connected]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    if (!connected) {
        return (
            <div className="context-pack" data-testid="context-pack">
                <ReadinessBanner
                    state="bridge_unavailable"
                    reason="the session context pack is served by the gateway"
                    testId="context-pack-disconnected"
                />
            </div>
        );
    }

    if (error !== null) {
        return (
            <div className="context-pack" data-testid="context-pack">
                <InlineErrorSurface
                    testId="context-pack-error"
                    surfaceId="omni.context-pack"
                    message={error}
                    onRetry={refresh}
                    onDismiss={() => setError(null)}
                />
            </div>
        );
    }

    if (snapshot === null) {
        return (
            <div className="context-pack" data-testid="context-pack">
                <p className="pane-message" data-testid="context-pack-loading">
                    reading the assembled session context…
                </p>
            </div>
        );
    }

    if (!snapshot.present || snapshot.pack === null) {
        return (
            <div className="context-pack" data-testid="context-pack">
                <p className="pane-message" data-testid="context-pack-absent">
                    No context pack published for <code>{snapshot.sessionKey}</code> —{' '}
                    {snapshot.reason ?? 'this session has not assembled one'}.
                </p>
                <p className="context-pack-provenance" data-testid="context-pack-provenance">
                    assembler <code>{snapshot.assembler}</code>
                </p>
            </div>
        );
    }

    const pack = snapshot.pack;
    const totals = contextPackTotals(pack);

    return (
        <div className="context-pack" data-testid="context-pack">
            <div className="context-pack-summary" data-testid="context-pack-summary">
                <span data-testid="context-pack-session">{pack.sessionKey}</span>
                <span data-testid="context-pack-carriers">{totals.carriers} carriers</span>
                <span data-testid="context-pack-injected">
                    {totals.included} injected · {totals.overflowed} over budget · {totals.failed}{' '}
                    failed
                </span>
                <span data-testid="context-pack-budget">
                    {pack.budget.usedChars}/{pack.budget.limitChars} chars
                </span>
            </div>

            <table className="context-pack-table" data-testid="context-pack-table">
                <thead>
                    <tr>
                        <th scope="col">Carrier</th>
                        <th scope="col">Cost</th>
                        <th scope="col">Outcome</th>
                        <th scope="col">Size</th>
                        <th scope="col">Freshness / note</th>
                    </tr>
                </thead>
                <tbody>
                    {pack.blocks.map(block => (
                        <BlockRow key={block.coordinate} block={block} />
                    ))}
                </tbody>
            </table>

            <details className="context-pack-injection">
                <summary data-testid="context-pack-injection-toggle">
                    Injected text ({totals.injectedBytes} B)
                </summary>
                <pre data-testid="context-pack-injection">{pack.injection}</pre>
            </details>

            <p className="context-pack-provenance" data-testid="context-pack-provenance">
                assembler <code>{snapshot.assembler}</code> · published{' '}
                <code>{snapshot.packPath}</code>
            </p>
        </div>
    );
}
