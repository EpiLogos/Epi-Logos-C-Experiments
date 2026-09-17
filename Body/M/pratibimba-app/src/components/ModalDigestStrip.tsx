/**
 * Coordinate: M' M2' (modal-label + cymatic-digest strip — Tranche 49.4)
 * Residency: Body/M/pratibimba-app/src/components
 * Actualises: the carrier equivalent of the frozen
 *   `m2-parashakti/src/browser/components/AudioBusVisualiser.tsx` — a
 *   VISUAL-ONLY surface (`data-audio-output="none"`, no browser audio APIs)
 *   that renders the M2 meaning packet's compact face: the 8-carrier audio bus
 *   as a mantra-band strip, the graph-sourced MODAL LABELS (maqam / planetary
 *   mode), and the CYMATIC DIGEST (the byte-hash + nodal/antinode fractions of
 *   the real Chladni field). The active 72-address rides the live pentadic
 *   trace (kernel-verbatim); the modal labels are read through the same
 *   `s2.parashaktiCorrespondences` gateway seam the correspondence face uses —
 *   never a fixture, never synthesised locally.
 * Does NOT own: pitch or the octet (kernel Vimarśa bus), the cymatic solver
 *   (`engine/cymaticField`), the maqam / mode corpus (S2 graph), the packet law
 *   (`engine/m2MeaningPacket`), pane composition / wiring (App shell).
 */

import { useEffect, useMemo, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { buildPentadicOverlay } from '../engine/cosmicPentadicOverlay';
import {
    buildM2MeaningPacket,
    extractModalLabels,
    PENDING_MODAL_LABELS,
    type M2MeaningPacket,
    type M2ModalLabels
} from '../engine/m2MeaningPacket';
import { useProvenanceStore, useTickStore } from '../state/stores';

const BAND_GLYPHS = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8'] as const;

/** Canonical-absence renders as — (never a fabricated label). */
function show(value: string | null): string {
    return value && value.length > 0 ? value : '—';
}

export function ModalDigestStrip() {
    const cached = useTickStore(s => s.profile);
    const generation = useTickStore(s => s.generation);
    const connected = useProvenanceStore(s => s.connection.connected);
    const [labels, setLabels] = useState<M2ModalLabels>(PENDING_MODAL_LABELS);

    const harmonicProfile = useMemo(
        () =>
            (cached?.profile as { harmonicProfile?: Record<string, unknown> } | null)
                ?.harmonicProfile ?? null,
        [cached]
    );

    // active 72-address rides the live pentadic trace, kernel-verbatim (the
    // same address the correspondence face navigates).
    const overlay = useMemo(
        () => buildPentadicOverlay((cached?.profile as Record<string, unknown> | null) ?? {}),
        [cached]
    );
    const address72 = overlay.state === 'ready' && overlay.m2 ? overlay.m2.resonance72Index : null;

    // modal labels are S2 GRAPH writes — route them through the same gateway
    // seam the correspondence face uses; never synthesise them from the bus.
    // Only reach for labels when there is actually a bus to attach them to.
    useEffect(() => {
        if (address72 === null || !connected || !harmonicProfile) {
            setLabels(PENDING_MODAL_LABELS);
            return;
        }
        let disposed = false;
        gateway()
            .invoke('s2.parashaktiCorrespondences', { address72 })
            .then(receipt => {
                if (!disposed) {
                    setLabels(extractModalLabels(receipt.artifact));
                }
            })
            .catch(() => {
                if (!disposed) {
                    setLabels(PENDING_MODAL_LABELS);
                }
            });
        return () => {
            disposed = true;
        };
    }, [address72, connected, harmonicProfile]);

    const packet = useMemo<M2MeaningPacket | null>(() => {
        if (!harmonicProfile) {
            return null;
        }
        try {
            return buildM2MeaningPacket({
                generation: generation ?? cached?.generation ?? 0,
                harmonicProfile,
                modalLabels: labels
            });
        } catch {
            // an incomplete / malformed bus leaves the strip honestly empty —
            // it never fills the gap with an invented field or address.
            return null;
        }
    }, [harmonicProfile, generation, cached, labels]);

    if (!packet) {
        return (
            <section
                className="m2-modal-digest"
                data-testid="modal-digest-strip"
                data-audio-output="none"
                data-state="pending"
            >
                <div className="pane-message">awaiting the profile bus — no cymatic digest yet</div>
            </section>
        );
    }

    return (
        <section
            className="m2-modal-digest"
            data-testid="modal-digest-strip"
            data-audio-output="none"
            data-state={packet.packetReady ? 'ready' : 'partial'}
            data-address72={packet.address72}
            data-packet-hash={packet.packetHash}
        >
            <header className="m2-modal-digest__header">
                <span className="m2-modal-digest__address" data-testid="modal-address">
                    72:{packet.address72}
                </span>
                <span className="m2-modal-digest__maqam" data-testid="modal-maqam">
                    maqam {show(packet.modalLabels.maqam)}
                </span>
                <span className="m2-modal-digest__mode" data-testid="modal-mode">
                    mode {show(packet.modalLabels.planetaryMode)}
                </span>
            </header>

            <ol className="m2-modal-digest__bus" aria-label="Audio bus (visual only)">
                {packet.audioOctetHz.map((hz, index) => (
                    <li
                        key={index}
                        className="m2-modal-digest__channel"
                        data-channel-index={index}
                        data-hz={hz}
                        data-band-glyph={BAND_GLYPHS[index]}
                    >
                        <span className="m2-modal-digest__band">{BAND_GLYPHS[index]}</span>
                        <span className="m2-modal-digest__hz">{hz.toFixed(2)} Hz</span>
                    </li>
                ))}
            </ol>

            <footer className="m2-modal-digest__digest" data-testid="cymatic-digest">
                <span data-testid="digest-hash">χ {packet.cymaticDigest.digestHash}</span>
                <span data-testid="digest-nodal">
                    nodal {(packet.cymaticDigest.nodalFraction * 100).toFixed(1)}%
                </span>
                <span data-testid="digest-antinode">
                    antinode {(packet.cymaticDigest.antinodeFraction * 100).toFixed(1)}%
                </span>
                <span data-visual-only="true">visual representation only</span>
            </footer>
        </section>
    );
}
