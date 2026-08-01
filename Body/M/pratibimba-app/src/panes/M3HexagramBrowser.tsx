/**
 * Coordinate: M' M3' (64-hexagram dual Fu-Xi ↔ King Wen browser — Track 24.T24.5)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: `M3HexagramBrowser` — the 8×8 grid laid out and labelled in King
 *   Wen order (cells 1..64). The live gateway busses BOTH orderings on the M3
 *   mahamaya slice: `hexagramId` = the Fu-Xi `address64` (0..63,
 *   `upper<<3|lower`) AND `kingWen` = its King Wen ordinal (1..64). King Wen
 *   ordering is a DISTINCT permutation of the binary Fu-Xi order, so the
 *   translation is a kernel-owned LUT (`KING_WEN_FROM_ADDRESS64` in portal-core
 *   `src/luts/mahamaya.rs`) — the pane NEVER re-derives it. The active cell
 *   lights on the bussed `kingWen` (honestly King-Wen-keyed), fixing the prior
 *   bug that lit `kingWen === hexagramId` (Fu-Xi address) and so left address64
 *   0 lighting nothing while King Wen cell 64 stayed dead. The active hexagram's
 *   6-line glyph renders from the bussed `upperTrigram`/`lowerTrigram` (pure bit
 *   decomposition, bottom-to-top); a per-line changing-line toggle flips the
 *   visual line state and shows the resulting 6-bit pattern.
 *   LAW: the King Wen↔address64 NUMBER mapping is kernel-LUT-backed (bussed as
 *   `kingWen`), never a local table; the per-hexagram LINE pattern of the 63
 *   non-active cells stays kernel-owned (rendered as numbered slots); and the
 *   line-change DERIVED hexagram (the 384-graph resolution) is honest-pending,
 *   never fabricated locally.
 * Does NOT own: the King Wen→line-pattern table (kernel epi-lib m3 LUTs), the
 *   King Wen↔address64 number LUT (portal-core mahamaya.rs — bussed as `kingWen`,
 *   not local), the 384 line-change graph resolution, gateway I/O, the mahamaya
 *   view law (m3Inspectors.ts), the profile cache.
 */

import { useEffect, useMemo, useState } from 'react';
import { inkBright, inkDim, ringLit, wheelUnlit } from '../ui/tokens';
import { ProvenanceBadge } from '../ui/primitives';
import { M3HexagramBodyDynamicsViewer } from '../components/M3HexagramBodyDynamicsViewer';
import {
    HEXAGRAM_BODY_PENDING,
    type HexagramBodyEntry,
    type HexagramBodyPending
} from '../services/m3/HexagramBodyDynamicsService';
import { buildM3InspectorsView } from './m3Inspectors';
import { M3ReadinessBoundary, useM3ProfileTick } from './m3SurfaceContext';

const KING_WEN_COUNT = 64;
const GRID = 8;

/** A trigram value (0..7) → its three lines, bottom line first. bit0 = bottom.
 *  Pure decomposition of a bussed value; 1 = solid (yang), 0 = broken (yin). */
function trigramLines(trigram: number): readonly number[] {
    return [trigram & 1, (trigram >> 1) & 1, (trigram >> 2) & 1];
}

export interface M3HexagramBrowserProps {
    /**
     * 24.T24.8 — reads the per-hexagram body row over
     * `s2.codon.scalar_ref.read`. Injected rather than constructed here so the
     * browser stays a pure surface over one gateway port; the pane owns the
     * service registry.
     */
    readonly lookupBody?: (
        hexagramId: number
    ) => Promise<HexagramBodyEntry | HexagramBodyPending>;
    /** Suit-element halo for the body viewer, from the active codon's minor arcana. */
    readonly bodyHalo?: { readonly element: string; readonly colour: string } | null;
}

export function M3HexagramBrowser({ lookupBody, bodyHalo = null }: M3HexagramBrowserProps = {}) {
    const tick = useM3ProfileTick();
    const view = useMemo(() => {
        if (!tick.payload) {
            return null;
        }
        return buildM3InspectorsView({
            payload: tick.payload,
            generation: tick.generation ?? 0
        });
    }, [tick.payload, tick.generation]);

    const m = view?.mahamaya ?? null;
    // Fu-Xi binary address (0..63) — the raw bus value; drives the glyph and is
    // the pane's readiness gate. `activeKingWen` is its kernel-LUT King Wen
    // ordinal (1..64) — what the grid is laid out and lit on.
    const activeHexagramId = m?.hexagramId ?? null;
    const activeKingWen = m?.kingWen ?? null;

    // Changing-line set is keyed to the active hexagram; reset when it changes.
    const [changing, setChanging] = useState<ReadonlySet<number>>(new Set());
    const [lastHex, setLastHex] = useState<number | null>(activeHexagramId);
    if (activeHexagramId !== lastHex) {
        setLastHex(activeHexagramId);
        setChanging(new Set());
    }

    // 24.T24.8 — the body row for the ACTIVE King Wen hexagram. The read is
    // keyed to the King Wen ordinal because that is what `HEXAGRAM_BODY_DYNAMICS`
    // is indexed by; passing the Fu-Xi address would silently read the wrong row.
    const [bodyEntry, setBodyEntry] = useState<HexagramBodyEntry | HexagramBodyPending | null>(
        null
    );
    useEffect(() => {
        if (lookupBody === undefined || activeKingWen === null) {
            setBodyEntry(null);
            return;
        }
        let live = true;
        void lookupBody(activeKingWen)
            .then(resolved => {
                if (live) setBodyEntry(resolved);
            })
            .catch(() => {
                if (live) setBodyEntry(HEXAGRAM_BODY_PENDING);
            });
        return () => {
            live = false;
        };
    }, [lookupBody, activeKingWen]);

    if (!m || activeHexagramId === null) {
        return (
            <M3ReadinessBoundary
                bindingKey="m3.hexagram-browser"
                fallback={{ state: 'pending', reason: 'pending-mahamaya' }}
            >
                <section className="mext-widget-detail" data-testid="m3-hexagram-browser" data-state="pending-mahamaya">
                    <h3>64-hexagram browser</h3>
                    <p className="mext-widget-empty" data-testid="m3-hexagram-browser-pending">
                        <ProvenanceBadge state="pending" reason="pending-mahamaya" />
                        pending-mahamaya — the King Wen grid activates when the bus carries
                        the M3 mahamaya projection (Fu-Xi hexagramId + its kernel-LUT kingWen);
                        no local hexagram table here.
                    </p>
                </section>
            </M3ReadinessBoundary>
        );
    }

    // Bottom-to-top: lower trigram = lines 1-3, upper trigram = lines 4-6.
    const baseLines = [...trigramLines(m.lowerTrigram), ...trigramLines(m.upperTrigram)];
    const renderedLines = baseLines.map((bit, i) => (changing.has(i) ? bit ^ 1 : bit));
    const anyChanging = changing.size > 0;
    const renderedPattern = [...renderedLines].reverse().join(''); // top-to-bottom binary string

    const toggleLine = (i: number) => {
        setChanging(previous => {
            const next = new Set(previous);
            if (next.has(i)) {
                next.delete(i);
            } else {
                next.add(i);
            }
            return next;
        });
    };

    const cells = [];
    for (let idx = 0; idx < KING_WEN_COUNT; idx++) {
        const kingWen = idx + 1;
        // King-Wen honest: light the cell whose King Wen ordinal equals the
        // bussed `kingWen` (kernel LUT), NOT the Fu-Xi address64 (`hexagramId`).
        const active = kingWen === activeKingWen;
        cells.push(
            <div
                key={kingWen}
                className="m3-hexagram-cell"
                data-testid={`m3-hexagram-cell-${kingWen}`}
                data-active={active ? 'true' : 'false'}
                style={{
                    border: `1px solid ${active ? ringLit : wheelUnlit}`,
                    color: active ? inkBright : inkDim,
                    background: active ? wheelUnlit : 'transparent',
                    padding: '2px',
                    textAlign: 'center',
                    fontSize: 'var(--type-micro)'
                }}
            >
                {kingWen}
            </div>
        );
    }

    return (
        <M3ReadinessBoundary
            bindingKey="m3.hexagram-browser"
            fallback={{ state: 'ready', reason: 'profile-current' }}
        >
        <section
            className="mext-widget-detail"
            data-testid="m3-hexagram-browser"
            data-state="ready"
            data-active-king-wen={activeKingWen ?? ''}
            data-active-address64={activeHexagramId}
        >
            <h3>64-hexagram browser · King Wen ↔ Fu-Xi</h3>

            <div
                className="m3-hexagram-grid"
                data-testid="m3-hexagram-grid"
                style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID}, 1fr)`, gap: '2px' }}
            >
                {cells}
            </div>

            <p className="mext-widget-empty" data-testid="m3-hexagram-slots-pending">
                <ProvenanceBadge state="pending" reason="pending-king-wen-line-pattern" />
                per-hexagram line pattern: kernel-owned (pending-king-wen-line-pattern) — only the
                active hexagram's glyph renders from bussed trigrams.
            </p>

            {/* Active hexagram glyph — 6 clickable lines, bottom-to-top, from
                the bussed upper/lower trigrams. Clicking marks a changing line. */}
            <div className="m3-hexagram-active" data-testid="m3-hexagram-active">
                <h4>
                    King Wen {activeKingWen ?? '—'} · Fu-Xi #{activeHexagramId} ·
                    upper {m.upperTrigram} / lower {m.lowerTrigram}
                </h4>
                <div className="m3-hexagram-lines" data-testid="m3-hexagram-lines">
                    {[5, 4, 3, 2, 1, 0].map(i => {
                        const solid = renderedLines[i] === 1;
                        const isChanging = changing.has(i);
                        return (
                            <button
                                key={i}
                                type="button"
                                className="instrument-toggle m3-hexagram-line"
                                data-testid={`m3-hexagram-line-${i}`}
                                data-solid={solid ? 'true' : 'false'}
                                data-changing={isChanging ? 'true' : 'false'}
                                aria-pressed={isChanging}
                                onClick={() => toggleLine(i)}
                                style={{ display: 'block', color: isChanging ? ringLit : inkBright }}
                            >
                                {solid ? '━━━━━' : '━━ ━━'}{isChanging ? ' ✳ changing' : ''}
                            </button>
                        );
                    })}
                </div>
                <p data-testid="m3-hexagram-line-op">
                    line-change operator address {m.lineChangeOperatorAddress} · active line {m.lineIndex}
                </p>
                {anyChanging ? (
                    <p className="mext-widget-empty" data-testid="m3-hexagram-derived-pending">
                        <ProvenanceBadge state="pending" reason="pending-line-change-graph" />
                        changed pattern {renderedPattern} → derived hexagramId:
                        pending-line-change-graph — the 384 line-change graph (64×6) that resolves the
                        King Wen number of the derived hexagram is kernel-owned, not bussed.
                    </p>
                ) : null}
            </div>

            {/* 24.T24.8 — the body-dynamics sub-panel hangs off THIS browser,
                keyed to the same active King Wen hexagram the grid lights. */}
            {lookupBody !== undefined ? (
                <M3HexagramBodyDynamicsViewer
                    hexagramId={activeKingWen}
                    entry={bodyEntry}
                    halo={bodyHalo}
                />
            ) : null}
        </section>
        </M3ReadinessBoundary>
    );
}
