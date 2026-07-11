/**
 * Coordinate: M' M1-3' (spanda walk navigator — 22.T22.1 per DR-FACE-7 + DR-M1-5)
 * Actualises: the matheme as a playable instrument (M1'-SPEC pedagogy; the
 *   22.1 contract re-sorted by M1-3-SPANDA-TRANSPORT-ARCHITECTURE §5). A FACE
 *   on the 1-2-3 pole: twelve epogdoon stops, the intra-tick fraction (the
 *   dissolved slerpFraction, derived locally from the shared anchor), the
 *   next-event preview (Klein-flip 5→6, Möbius-return 11→0), and the
 *   engine-walk buttons — hold/release, walk-to-stop, the two involutions
 *   NAMED apart (# reflect = 11−n, half-turn = n+6).
 * Owns NOTHING: no clock (renders per heartbeat + per transport response —
 *   evaluating the shared anchor is the one clock read locally; no rAF, no
 *   interval), no provenance vocabulary, no selection. Buttons render only
 *   when the anchor rides the bus — absence is the honest "transport pending"
 *   state, never a disabled placeholder.
 */

import { useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import {
    readSpandaAnchor,
    SpandaAnchorBoundary,
    spandaFractionAt
} from '../bridge/types';
import { useProvenanceStore, useTickStore } from '../state/stores';

const TWELVEFOLD = 12;

function nextEventLabel(tick12: number): string {
    if (tick12 === 5) {
        return 'Klein flip 5→6';
    }
    if (tick12 === 11) {
        return 'Möbius return 11→0';
    }
    return `step ${(tick12 + 1) % TWELVEFOLD}`;
}

export function SpandaNavigatorPane() {
    const connected = useProvenanceStore(s => s.connection.connected);
    const cachedProfile = useTickStore(s => s.profile);
    const generation = useTickStore(s => s.generation);
    // The transport RESPONSE carries the post-act anchor — rendering it
    // immediately beats waiting for the next heartbeat sample.
    const [acted, setActed] = useState<SpandaAnchorBoundary | null>(null);
    const [error, setError] = useState<string | null>(null);

    const streamAnchor = readSpandaAnchor(
        (cachedProfile?.profile as Record<string, unknown> | null) ?? null
    );
    // Prefer the freshest source: a transport response STRICTLY newer than
    // the last heartbeat sample wins until the stream catches up. On equal
    // epochs the stream wins — same anchor state, fresher tick12 readout
    // (the anchor's epoch only changes on acts, never between heartbeats).
    const anchor =
        acted && streamAnchor && acted.epochMs > streamAnchor.epochMs ? acted : streamAnchor;

    const act = async (method: string, params: Record<string, unknown> = {}) => {
        setError(null);
        try {
            const receipt = await gateway().invoke(method, params);
            const next = readSpandaAnchor(
                (receipt.artifact as Record<string, unknown> | null) ?? null
            );
            if (next) {
                setActed(next);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    if (!connected) {
        return <div className="pane-message">Gateway disconnected — the walk needs the pulse.</div>;
    }
    if (!anchor) {
        // Honest absence: the anchor is not riding the bus yet (older gateway
        // or no heartbeat sample received) — no fabricated transport.
        return (
            <div className="pane-message" data-testid="spanda-transport-pending">
                spanda anchor pending — transport appears when the anchor rides the bus.
            </div>
        );
    }

    const tick12 = anchor.tick12;
    const fraction = spandaFractionAt(anchor, Date.now());
    const held = anchor.mode === 'held' || anchor.mode === 'walking';

    return (
        <div className="spanda-navigator" data-testid="spanda-navigator" data-mode={anchor.mode}>
            <div className="pane-toolbar">
                <span data-testid="spanda-mode" title="transport mode of the one organism">
                    {anchor.mode}
                    {anchor.direction === 'reflected' ? ' ⋅ reflected' : ''}
                </span>
                <span data-testid="spanda-readout" title="tick12 readout ⋅ profile generation">
                    tick {tick12} / {TWELVEFOLD - 1} ⋅ gen {generation ?? '—'}
                </span>
                <span data-testid="spanda-next-event" title="what the traversal meets next">
                    next: {nextEventLabel(tick12)}
                </span>
            </div>
            <div className="spanda-stops" data-testid="spanda-stops">
                {Array.from({ length: TWELVEFOLD }, (_, stop) => (
                    <button
                        type="button"
                        key={stop}
                        data-testid={`spanda-stop-${stop}`}
                        data-active={stop === tick12 ? 'true' : 'false'}
                        title={`walk to epogdoon-step ${stop}`}
                        onClick={() => void act('m1.spanda.walk_to', { tick: stop })}
                    >
                        {stop}
                    </button>
                ))}
            </div>
            {/* The intra-tick fraction — the continuous phase the tick flowers
                from, evaluated locally from the shared anchor at render time.
                Refreshes per heartbeat/act; no face-local animation clock. */}
            <div className="spanda-fraction-rail" title="intra-tick fraction (anchor-derived)">
                <div
                    className="spanda-fraction"
                    data-testid="spanda-fraction"
                    data-fraction={fraction.toFixed(3)}
                    style={{ width: `${Math.round(fraction * 100)}%` }}
                />
            </div>
            <div className="spanda-transport" data-testid="spanda-transport">
                {held ? (
                    <button
                        type="button"
                        className="vault-node"
                        data-testid="spanda-release"
                        onClick={() => void act('m1.spanda.release')}
                    >
                        ▶ flow
                    </button>
                ) : (
                    <button
                        type="button"
                        className="vault-node"
                        data-testid="spanda-hold"
                        onClick={() => void act('m1.spanda.hold')}
                    >
                        ⏸ hold
                    </button>
                )}
                <button
                    type="button"
                    className="vault-node"
                    data-testid="spanda-step-back"
                    title="one epogdoon-step back"
                    onClick={() => void act('m1.spanda.step', { backward: true })}
                >
                    −1
                </button>
                <button
                    type="button"
                    className="vault-node"
                    data-testid="spanda-step-forward"
                    title="one epogdoon-step forward"
                    onClick={() => void act('m1.spanda.step')}
                >
                    +1
                </button>
                <button
                    type="button"
                    className="vault-node"
                    data-testid="spanda-reflect"
                    title="# as REFLECTION — 11−n, the traversal-reversal involution (SU(2) antipode)"
                    onClick={() => void act('m1.spanda.step', { reflect: true })}
                >
                    # reflect
                </button>
                <button
                    type="button"
                    className="vault-node"
                    data-testid="spanda-half-turn"
                    title="# as HALF-TURN — n+6 mod 12, the antiphase pole-swap involution"
                    onClick={() => void act('m1.spanda.half_turn')}
                >
                    ⇄ half-turn
                </button>
            </div>
            {error ? (
                <div className="chat-error" data-testid="spanda-error">
                    {error}
                </div>
            ) : null}
        </div>
    );
}
