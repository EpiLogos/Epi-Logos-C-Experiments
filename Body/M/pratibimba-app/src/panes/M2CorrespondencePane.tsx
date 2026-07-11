/**
 * Coordinate: M' M2' (parashakti correspondence-as-navigable-face — Tranche 23.1)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the 1-2-3 cosmic-pole correspondence face per DR-FACE-7 §3
 *   (23.1 = fate A×2 + B×1). M2's cymatic aspect is carried (CymaticField) and
 *   its meaning-packet is carried (AsmaMirrorOverlay); the gap was the
 *   correspondence made navigable. This face reads the ACTIVE 72-fold address
 *   from the live pentadic trace (`resonance72Index`, kernel-verbatim) and
 *   invokes the real `s2.parashaktiCorrespondences` gateway method for that
 *   address — the same channel the meaning-packet names — then lets the reader
 *   navigate the conserved address's three correspondence faces: the decan face
 *   (zodiac · Chaldean ruler · body-part · tarot · herbs), the sacred sonic
 *   (Arabic name · translation · chakra · maqam · asma mirror), and the
 *   planetary-chakral (mode · vedic mantra · chakra). Every value is the
 *   kernel/S2 graph's verbatim write — no local correspondence table; absent
 *   fields render as canonical-absence (—), never fabricated.
 * Does NOT own: the correspondence dataset (S2 parashakti-deep graph), the
 *   72-address (the profile's pentadic trace), the cymatic surface or the asma
 *   overlay (their own faces), any clock (renders per profile tick).
 */

import { useEffect, useMemo, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { buildPentadicOverlay } from '../engine/cosmicPentadicOverlay';
import { useProvenanceStore, useTickStore } from '../state/stores';

type CorrespondenceFace = 'decan' | 'sonic' | 'planetary';

interface DecanFace {
    readonly name?: string | null;
    readonly zodiacSign?: string | null;
    readonly degreesRange?: string | null;
    readonly planetaryRuler?: string | null;
    readonly bodyPart?: string | null;
    readonly tarotCard?: string | null;
    readonly herbalismHerbs?: readonly string[] | null;
}
interface SacredSonic {
    readonly name?: string | null;
    readonly arabicText?: string | null;
    readonly englishTranslation?: string | null;
    readonly chakraCorrespondence?: string | null;
    readonly maqam?: { readonly name?: string | null; readonly spiritualFunction?: string | null } | null;
    readonly asma?: { readonly group_name?: string | null; readonly mirror_name?: string | null; readonly has_mirror?: boolean } | null;
}
interface PlanetaryChakral {
    readonly planetaryRuler?: string | null;
    readonly planetaryMode?: string | null;
    readonly vedicMantra?: string | null;
    readonly chakraName?: string | null;
    readonly chakraRole?: string | null;
}
interface CorrespondenceRecord {
    readonly address72: number;
    readonly decanFace?: DecanFace | null;
    readonly sacredSonic?: SacredSonic | null;
    readonly planetaryChakral?: PlanetaryChakral | null;
}

/** Canonical-absence renders as — (never a fabricated value). */
function show(value: string | null | undefined): string {
    return value && value.length > 0 ? value : '—';
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="corr-field">
            <span className="corr-field-label">{label}</span>
            <span className="corr-field-value">{value}</span>
        </div>
    );
}

const FACES: readonly { key: CorrespondenceFace; label: string }[] = [
    { key: 'decan', label: 'Decan Face' },
    { key: 'sonic', label: 'Sacred Name' },
    { key: 'planetary', label: 'Planetary-Chakral' }
];

export function M2CorrespondencePane() {
    const cached = useTickStore(s => s.profile);
    const connected = useProvenanceStore(s => s.connection.connected);
    const [record, setRecord] = useState<CorrespondenceRecord | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [face, setFace] = useState<CorrespondenceFace>('decan');

    // the active 72-address rides the live pentadic trace, kernel-verbatim
    const overlay = useMemo(
        () => buildPentadicOverlay((cached?.profile as Record<string, unknown> | null) ?? {}),
        [cached]
    );
    const address72 = overlay.state === 'ready' && overlay.m2 ? overlay.m2.resonance72Index : null;
    const shemQuantum = overlay.state === 'ready' && overlay.m2 ? overlay.m2.shemDegreeQuantum : null;

    useEffect(() => {
        if (address72 === null) {
            setRecord(null);
            setError(null);
            return;
        }
        if (!connected) {
            return;
        }
        let disposed = false;
        setError(null);
        gateway()
            .invoke('s2.parashaktiCorrespondences', { address72 })
            .then(receipt => {
                if (disposed) {
                    return;
                }
                setRecord((receipt.artifact as CorrespondenceRecord | null) ?? null);
            })
            .catch(err => {
                if (!disposed) {
                    setError(err instanceof Error ? err.message : String(err));
                    setRecord(null);
                }
            });
        return () => {
            disposed = true;
        };
    }, [address72, connected]);

    const state = error ? 'error' : address72 === null ? 'pending' : record ? 'ready' : 'loading';

    if (address72 === null) {
        return (
            <div className="m2-correspondence" data-testid="m2-correspondence" data-state="pending">
                <div className="pane-message">
                    awaiting the pentadic trace — no active 72-address on the bus yet
                </div>
            </div>
        );
    }

    return (
        <div className="m2-correspondence" data-testid="m2-correspondence" data-state={state}>
            <div className="corr-header" data-testid="corr-header">
                <span className="corr-address" data-testid="corr-address">
                    72:{address72}
                </span>
                <span className="corr-shem">Shem {shemQuantum}°</span>
            </div>
            <div className="pane-toolbar corr-nav" role="tablist">
                {FACES.map(f => (
                    <button
                        key={f.key}
                        type="button"
                        role="tab"
                        data-testid={`corr-nav-${f.key}`}
                        data-active={face === f.key ? 'true' : 'false'}
                        aria-selected={face === f.key}
                        onClick={() => setFace(f.key)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>
            {error ? (
                <div className="chat-error" data-testid="corr-error">
                    correspondence unavailable: {error}
                </div>
            ) : !record ? (
                <div className="pane-message">reading the parashakti correspondence…</div>
            ) : face === 'decan' ? (
                <div className="corr-body" data-testid="corr-decan">
                    <Field label="name" value={show(record.decanFace?.name)} />
                    <Field label="zodiac" value={show(record.decanFace?.zodiacSign)} />
                    <Field label="degrees" value={show(record.decanFace?.degreesRange)} />
                    <Field label="Chaldean ruler" value={show(record.decanFace?.planetaryRuler)} />
                    <Field label="body part" value={show(record.decanFace?.bodyPart)} />
                    <Field label="tarot" value={show(record.decanFace?.tarotCard)} />
                    <Field
                        label="herbs"
                        value={
                            record.decanFace?.herbalismHerbs && record.decanFace.herbalismHerbs.length > 0
                                ? record.decanFace.herbalismHerbs.join(', ')
                                : '—'
                        }
                    />
                </div>
            ) : face === 'sonic' ? (
                <div className="corr-body" data-testid="corr-sonic">
                    <Field label="name" value={show(record.sacredSonic?.name)} />
                    <Field label="Arabic" value={show(record.sacredSonic?.arabicText)} />
                    <Field label="translation" value={show(record.sacredSonic?.englishTranslation)} />
                    <Field label="chakra" value={show(record.sacredSonic?.chakraCorrespondence)} />
                    <Field label="maqam" value={show(record.sacredSonic?.maqam?.name)} />
                    <Field label="function" value={show(record.sacredSonic?.maqam?.spiritualFunction)} />
                    <Field label="asma group" value={show(record.sacredSonic?.asma?.group_name)} />
                    <Field
                        label="asma mirror"
                        value={
                            record.sacredSonic?.asma?.has_mirror
                                ? show(record.sacredSonic?.asma?.mirror_name)
                                : 'no domain mirror'
                        }
                    />
                </div>
            ) : (
                <div className="corr-body" data-testid="corr-planetary">
                    <Field label="ruler" value={show(record.planetaryChakral?.planetaryRuler)} />
                    <Field label="mode" value={show(record.planetaryChakral?.planetaryMode)} />
                    <Field label="vedic mantra" value={show(record.planetaryChakral?.vedicMantra)} />
                    <Field label="chakra" value={show(record.planetaryChakral?.chakraName)} />
                    <Field label="chakra role" value={show(record.planetaryChakral?.chakraRole)} />
                </div>
            )}
        </div>
    );
}
