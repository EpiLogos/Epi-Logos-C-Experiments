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
 *   fields render as canonical-absence (—), never fabricated. The cymatic face
 *   reads the C-backed MonoPoly state and derives no local classification.
 * Does NOT own: the correspondence dataset (S2 parashakti-deep graph), the
 *   72-address (the profile's pentadic trace), any clock (renders per profile
 *   tick). The cymatic surface (CymaticField), the sonic/domain overlay
 *   (AsmaMirrorOverlay), the modal digest (ModalDigestStrip) and the six-axis
 *   decoder tree (SixAxisTree) are their OWN authored/tested faces — this pane
 *   only mounts them and feeds them the active 72-address it already reads.
 * Position (#n): M2' correspondence face.
 * Public surface: M2CorrespondencePane.
 */

import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { AsmaMirrorOverlay, type AsmaOverlayRecord } from '../components/AsmaMirrorOverlay';
import { CymaticField, type CymaticMonoPolyBehaviourState } from '../components/CymaticField';
import { CymaticSpheresSurface } from '../components/CymaticSpheresSurface';
import { CymaticTransport } from '../components/CymaticTransport';
import { EpogdoonBridgeEngine } from '../components/EpogdoonBridgeEngine';
import { EpogdoonProofOverlay } from '../components/EpogdoonProofOverlay';
import { MefGrid72Component } from '../components/MefGrid72Component';
import { ModalDigestStrip } from '../components/ModalDigestStrip';
import { ShadowDecanSurface, type ShadowDecanSurfaceProjection } from '../components/ShadowDecanSurface';
import { SixAxisTree, type CorrespondenceTreeProjection } from '../components/SixAxisTree';
import {
    SeventyTwoFoldBreadcrumb,
    type SeventyTwoFoldBridgeProjection
} from '../components/SeventyTwoFoldBreadcrumb';
import { buildPentadicOverlay } from '../engine/cosmicPentadicOverlay';
import { harmonicSnapshot } from '../engine/modulation/modulators';
import { useProvenanceStore, useTickStore } from '../state/stores';
import { BridgeReadinessBadge } from '../ui/BridgeReadinessBadge';
import { ProvenanceBadge } from '../ui/ProvenanceBadge';
import { useM2Surface } from './M2SurfaceContext';
import type { M2CorrespondenceFace } from './m2SurfaceState';

type CorrespondenceFace = M2CorrespondenceFace;

const CORRESPONDENCE_BINDING = 's2.parashaktiCorrespondences';

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
interface SixSonicCards {
    readonly decanFace?: {
        readonly face?: string | null;
        readonly tattva?: { readonly glyph?: string | null } | null;
        readonly tattvicThroughline?: readonly { readonly alchemical?: string | null; readonly tattvic?: string | null; readonly marker?: string | null }[] | null;
    } | null;
    readonly shemPair?: {
        readonly light?: SonicShemEntry | null;
        readonly shadow?: SonicShemEntry | null;
    } | null;
    readonly maqam?: {
        readonly family?: string | null;
        readonly modeInFamily?: number | null;
        readonly intervals?: readonly number[] | null;
        readonly planetRuler?: string | null;
    } | null;
    readonly mantra?: {
        readonly phoneme?: string | null;
        readonly frequencyHz?: number | null;
        readonly phase?: string | null;
        readonly element?: string | null;
    } | null;
    readonly asma?: {
        readonly group?: string | null;
        readonly mirror?: string | null;
        readonly maskRouting?: { readonly internal?: boolean | null; readonly projective?: boolean | null } | null;
    } | null;
    readonly planetaryChakral?: {
        readonly coustoHz?: number | null;
        readonly digitalRoot?: number | null;
        readonly chakra?: number | null;
        readonly element?: string | null;
        readonly keplerianVelocity?: number | null;
    } | null;
}
interface SonicShemEntry {
    readonly name?: string | null;
    readonly hebrew?: string | null;
    readonly meaning?: string | null;
    readonly choir?: number | null;
    readonly position?: number | null;
    readonly provenance?: string | null;
}
interface CorrespondenceRecord {
    readonly address72: number;
    readonly decanFace?: DecanFace | null;
    readonly shadowDecanSurface?: ShadowDecanSurfaceProjection | null;
    readonly sacredSonic?: SacredSonic | null;
    readonly planetaryChakral?: PlanetaryChakral | null;
    readonly sixSonicCards?: SixSonicCards | null;
    readonly correspondenceTree?: CorrespondenceTreeProjection | null;
    readonly bridge72?: SeventyTwoFoldBridgeProjection | null;
}

interface CymaticMonoPolyState {
    readonly behaviourState: CymaticMonoPolyBehaviourState;
    readonly activeToneCount: number;
    readonly mutualResonance: number;
    readonly projection64: number;
}

const CYMATIC_MONOPOLY_METHOD = 'kernelBridge.m2.cymaticMonoPolyState(address72)';
const CYMATIC_BEHAVIOUR_STATES: readonly CymaticMonoPolyBehaviourState[] = [
    'mono',
    'actually-many',
    'actualising-one',
    'monopoly'
];

/** Canonical-absence renders as — (never a fabricated value). */
function show(value: string | null | undefined): string {
    return value && value.length > 0 ? value : '—';
}

function numberOrNull(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
function stringOrNull(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function toCymaticMonoPolyState(value: unknown): CymaticMonoPolyState | null {
    if (!value || typeof value !== 'object') {
        return null;
    }
    const record = value as Record<string, unknown>;
    const behaviourState = stringOrNull(record.behaviourState);
    const activeToneCount = numberOrNull(record.activeToneCount);
    const mutualResonance = numberOrNull(record.mutualResonance);
    const projection64 = numberOrNull(record.projection64);
    if (
        !behaviourState ||
        !CYMATIC_BEHAVIOUR_STATES.includes(behaviourState as CymaticMonoPolyBehaviourState) ||
        activeToneCount === null ||
        mutualResonance === null ||
        projection64 === null
    ) {
        return null;
    }
    return {
        behaviourState: behaviourState as CymaticMonoPolyBehaviourState,
        activeToneCount,
        mutualResonance,
        projection64
    };
}

/**
 * Map the fetched `sacredSonic.asma` overlay object (kernel M2_ASMA_LUT algebra,
 * emitted snake_case by the s2.parashaktiCorrespondences gate — graph.rs
 * `asma_overlay_record`) onto the `AsmaOverlayRecord` the overlay component
 * consumes. The numeric asma identity (name/group/index) is the kernel LUT
 * write; absent it we pass NO record (honest — the overlay still renders the
 * conserved address + phase from the live tick), never a fabricated pair.
 */
function toAsmaOverlayRecord(asma: unknown): AsmaOverlayRecord | null {
    if (!asma || typeof asma !== 'object') {
        return null;
    }
    const raw = asma as Record<string, unknown>;
    const nameIdx = numberOrNull(raw.name_idx);
    const group = numberOrNull(raw.group);
    const indexInGroup = numberOrNull(raw.index_in_group);
    if (nameIdx === null || group === null || indexInGroup === null) {
        return null;
    }
    return {
        nameIdx,
        group,
        indexInGroup,
        mirrorIdx: numberOrNull(raw.mirror_idx) ?? 0xff,
        mirrorName: stringOrNull(raw.mirror_name),
        mirrorRelation: stringOrNull(raw.mirror_relation) ?? '',
        phaseLaw: stringOrNull(raw.phase_law) ?? ''
    };
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="corr-field">
            <span className="corr-field-label">{label}</span>
            <span className="corr-field-value">{value}</span>
        </div>
    );
}

function SonicCard({
    name,
    children
}: {
    readonly name: string;
    readonly children: ReactNode;
}) {
    return (
        <section className="corr-sonic-card" data-testid={`sonic-card-${name}`}>
            <h3>{name}</h3>
            <div className="corr-body">{children}</div>
        </section>
    );
}

/**
 * The active carrier has five rendered correspondence cards/faces. Each names
 * the S2 source at the datum and reads the shared per-binding readiness state;
 * the fetch result never promotes itself to "ready".
 */
function CorrespondenceCard({
    face,
    label,
    children
}: {
    readonly face: CorrespondenceFace;
    readonly label: string;
    readonly children: ReactNode;
}) {
    return (
        <section
            className="corr-card"
            data-testid={`corr-card-${face}`}
            data-provenance={CORRESPONDENCE_BINDING}
        >
            <BridgeReadinessBadge bindingKey={CORRESPONDENCE_BINDING}>
                <header className="corr-card-header">
                    <span>{label}</span>
                    <ProvenanceBadge
                        state="canonical"
                        reason="S2 parashakti correspondence projection"
                    />
                </header>
                {children}
            </BridgeReadinessBadge>
        </section>
    );
}

const FACES: readonly { key: CorrespondenceFace; label: string }[] = [
    { key: 'decan', label: 'Decan Face' },
    { key: 'sonic', label: 'Sacred Name' },
    { key: 'planetary', label: 'Planetary-Chakral' },
    { key: 'cymatic', label: 'Cymatic Surface' },
    { key: 'axes', label: 'Six Axes' },
    { key: 'bridge', label: '72-fold bridge' }
];

export function M2CorrespondencePane() {
    const cached = useTickStore(s => s.profile);
    const connected = useProvenanceStore(s => s.connection.connected);
    const [record, setRecord] = useState<CorrespondenceRecord | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cymaticMonoPolyState, setCymaticMonoPolyState] = useState<CymaticMonoPolyState | null>(null);
    const [shadowDecansExpanded, setShadowDecansExpanded] = useState(false);
    const { state: m2Surface, update: updateM2Surface } = useM2Surface();
    const face = m2Surface.activeFace;

    // the active 72-address rides the live pentadic trace, kernel-verbatim
    const overlay = useMemo(
        () => buildPentadicOverlay((cached?.profile as Record<string, unknown> | null) ?? {}),
        [cached]
    );
    const harmonic = useMemo(() => harmonicSnapshot(cached?.profile ?? null), [cached]);
    const address72 = overlay.state === 'ready' && overlay.m2 ? overlay.m2.resonance72Index : null;
    const shemQuantum = overlay.state === 'ready' && overlay.m2 ? overlay.m2.shemDegreeQuantum : null;

    // the asma overlay strip rides the SAME fetched correspondence record the
    // sonic face reads — the kernel M2_ASMA_LUT algebra beside the cymatic face.
    const asmaRecord = useMemo(() => toAsmaOverlayRecord(record?.sacredSonic?.asma), [record]);

    // The cymatic field renders a single kernel frame; its address-driven raster
    // and tattvic colour must be conserved WITH the frame the transport holds.
    // While the transport pauses/scrubs, the live pentadic address72 and the
    // live correspondence record keep advancing — so the field must instead read
    // the held frame's own address (and the element last shown live) or a held
    // frame is no longer pixel-static. Live playback is unchanged.
    const liveElement = record?.sixSonicCards?.planetaryChakral?.element ?? null;
    const lastLiveElementRef = useRef<string | null>(null);

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
        const params = shadowDecansExpanded ? { address72, includeShadowDecans: true } : { address72 };
        gateway()
            .invoke('s2.parashaktiCorrespondences', params)
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
    }, [address72, connected, shadowDecansExpanded]);

    useEffect(() => {
        if (face !== 'cymatic' || address72 === null || !connected) {
            setCymaticMonoPolyState(null);
            return;
        }
        let disposed = false;
        setCymaticMonoPolyState(null);
        gateway()
            .invoke(CYMATIC_MONOPOLY_METHOD, { address72 })
            .then(receipt => {
                if (!disposed) {
                    setCymaticMonoPolyState(toCymaticMonoPolyState(receipt.artifact));
                }
            })
            .catch(() => {
                if (!disposed) {
                    setCymaticMonoPolyState(null);
                }
            });
        return () => {
            disposed = true;
        };
    }, [address72, connected, face]);

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
                        onClick={() => updateM2Surface({ activeFace: f.key })}
                    >
                        {f.label}
                    </button>
                ))}
            </div>
            {face === 'cymatic' ? (
                <CorrespondenceCard face="cymatic" label="Cymatic surface">
                    <div className="corr-cymatic-face" data-testid="corr-cymatic">
                        <div
                            className="pane-toolbar m2-cymatic-variant-switcher"
                            role="tablist"
                            aria-label="cymatic surface"
                        >
                            {(['plate', 'torus', 'spheres'] as const).map(variant => (
                                <button
                                    key={variant}
                                    type="button"
                                    role="tab"
                                    data-testid={`cymatic-variant-${variant}`}
                                    data-active={
                                        m2Surface.layerCSurfaceVariant === variant
                                            ? 'true'
                                            : 'false'
                                    }
                                    aria-selected={
                                        m2Surface.layerCSurfaceVariant === variant
                                    }
                                    onClick={() =>
                                        updateM2Surface({
                                            layerCSurfaceVariant: variant
                                        })
                                    }
                                >
                                    {variant}
                                </button>
                            ))}
                        </div>
                        <div className="corr-cymatic-surface">
                            {/* the Chladni field (own clock: kernel generation) with the
                                asma domain-mirror strip overlaid on the SAME address */}
                            <CymaticTransport liveProfile={cached}>
                                {(snapshot, held) => {
                                    // The field renders THIS frame; its
                                    // address-driven raster + active-cell and its
                                    // tattvic colour must be conserved WITH the
                                    // frame — always read from snapshot.profile,
                                    // never the live pane address. Pause/scrub state
                                    // comes from the transport itself; consecutive
                                    // profile generations may legitimately share one
                                    // address, so address equality cannot identify a
                                    // held frame.
                                    const frameOverlay = buildPentadicOverlay(
                                        (snapshot.profile.profile as Record<string, unknown> | null) ?? {}
                                    );
                                    const frameAddress72 =
                                        frameOverlay.state === 'ready' && frameOverlay.m2
                                            ? frameOverlay.m2.resonance72Index
                                            : null;
                                    if (!held) {
                                        lastLiveElementRef.current = liveElement;
                                    }
                                    const frameElement = held ? lastLiveElementRef.current : liveElement;
                                    return m2Surface.layerCSurfaceVariant === 'spheres' ? (
                                        <CymaticSpheresSurface
                                            profile={
                                                (snapshot.profile.profile as Readonly<
                                                    Record<string, unknown>
                                                > | null) ?? null
                                            }
                                            generation={snapshot.profile.generation}
                                        />
                                    ) : (
                                        <CymaticField
                                            profile={snapshot.profile}
                                            // A held frame carries no LIVE behaviour
                                            // state: its CSS filter/`actualising-one`
                                            // infinite pulse would break the
                                            // pixel-static contract. The live state is
                                            // still read in the readout below.
                                            behaviourState={
                                                held ? null : cymaticMonoPolyState?.behaviourState ?? null
                                            }
                                            address72={frameAddress72}
                                            element={frameElement}
                                        />
                                    );
                                }}
                            </CymaticTransport>
                            <AsmaMirrorOverlay record={asmaRecord} />
                        </div>
                        <div
                            className="cymatic-monopoly-state"
                            data-testid="cymatic-monopoly-state"
                            data-behaviour-state={cymaticMonoPolyState?.behaviourState ?? 'pending'}
                            data-active-tone-count={cymaticMonoPolyState?.activeToneCount ?? ''}
                            data-mutual-resonance={cymaticMonoPolyState?.mutualResonance ?? ''}
                            data-projection64={cymaticMonoPolyState?.projection64 ?? ''}
                        >
                            <span>{cymaticMonoPolyState?.behaviourState ?? 'pending kernel state'}</span>
                            {cymaticMonoPolyState?.behaviourState === 'actualising-one' ? (
                                <span data-testid="cymatic-forced-lock-warning">forced lock</span>
                            ) : null}
                        </div>
                        <EpogdoonBridgeEngine
                            activeAddress72={address72}
                            generation={cached?.generation ?? null}
                            connected={connected}
                        />
                        {/* the visual-only modal/audio-bus digest of the same bus */}
                        <ModalDigestStrip />
                    </div>
                </CorrespondenceCard>
            ) : face === 'axes' ? (
                <CorrespondenceCard face="axes" label="Six axes">
                    <MefGrid72Component
                        activeMef={overlay.state === 'ready' ? overlay.m2?.axisViews.mef ?? null : null}
                        audioOctet={harmonic.audioOctet}
                        kleinFlip={harmonic.kleinFlip}
                    />
                    <SixAxisTree
                        address72={address72}
                        axes={m2Surface.correspondenceTreeAxisFilter}
                        overlay={m2Surface.correspondenceTreeSonicOverlay}
                        correspondenceTree={record?.correspondenceTree}
                        onAxesChange={correspondenceTreeAxisFilter =>
                            updateM2Surface({ correspondenceTreeAxisFilter })
                        }
                        onOverlayChange={correspondenceTreeSonicOverlay =>
                            updateM2Surface({ correspondenceTreeSonicOverlay })
                        }
                    />
                </CorrespondenceCard>
            ) : face === 'bridge' ? (
                <CorrespondenceCard face="bridge" label="72-fold bridge">
                    {record?.bridge72 ? (
                        <SeventyTwoFoldBreadcrumb
                            bridge={record.bridge72}
                            position6={overlay.state === 'ready' ? overlay.m1?.position6 ?? null : null}
                        />
                    ) : (
                        <div className="pane-message">awaiting the kernel-backed 72-fold bridge receipt</div>
                    )}
                </CorrespondenceCard>
            ) : error ? (
                <div className="chat-error" data-testid="corr-error">
                    correspondence unavailable: {error}
                </div>
            ) : !record ? (
                <div className="pane-message">reading the parashakti correspondence…</div>
            ) : face === 'decan' ? (
                <CorrespondenceCard face="decan" label="Decan face">
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
                    <button
                        type="button"
                        className="corr-shadow-decan-toggle"
                        data-testid="shadow-decan-reveal"
                        aria-expanded={shadowDecansExpanded}
                        onClick={() => setShadowDecansExpanded(expanded => !expanded)}
                    >
                        108 decans
                    </button>
                    {shadowDecansExpanded && (
                        <ShadowDecanSurface
                            selectedAddress72={address72}
                            projection={record.shadowDecanSurface}
                        />
                    )}
                </CorrespondenceCard>
            ) : face === 'sonic' ? (
                <CorrespondenceCard face="sonic" label="Sacred name">
                    <div className="corr-sonic-cards" data-testid="corr-sonic">
                        <SonicCard name="Decan face">
                            <Field label="name" value={show(record.decanFace?.name)} />
                            <Field label="face" value={show(record.sixSonicCards?.decanFace?.face)} />
                            <Field label="ruler" value={show(record.decanFace?.planetaryRuler)} />
                            <Field label="tattva" value={show(record.sixSonicCards?.decanFace?.tattva?.glyph)} />
                            <Field
                                label="prima to ultima"
                                value={
                                    record.sixSonicCards?.decanFace?.tattvicThroughline
                                        ?.map(entry => `${show(entry.alchemical)}:${show(entry.tattvic)}`)
                                        .join(' | ') ?? '—'
                                }
                            />
                        </SonicCard>
                        <SonicCard name="Shem pair">
                            <Field label="light" value={show(record.sixSonicCards?.shemPair?.light?.name)} />
                            <Field label="shadow" value={show(record.sixSonicCards?.shemPair?.shadow?.name)} />
                            <Field
                                label="light choir"
                                value={
                                    record.sixSonicCards?.shemPair?.light?.choir === undefined
                                        ? '—'
                                        : `${record.sixSonicCards.shemPair.light.choir}:${record.sixSonicCards.shemPair.light.position ?? '—'}`
                                }
                            />
                            <Field label="meaning" value={show(record.sixSonicCards?.shemPair?.light?.meaning)} />
                        </SonicCard>
                        <SonicCard name="Maqam">
                            <Field label="family" value={show(record.sixSonicCards?.maqam?.family)} />
                            <Field
                                label="mode"
                                value={
                                    record.sixSonicCards?.maqam?.modeInFamily === undefined
                                        ? '—'
                                        : String(record.sixSonicCards.maqam.modeInFamily)
                                }
                            />
                            <Field
                                label="24-TET"
                                value={record.sixSonicCards?.maqam?.intervals?.join(' · ') ?? '—'}
                            />
                            <Field label="planet" value={show(record.sixSonicCards?.maqam?.planetRuler)} />
                        </SonicCard>
                        <SonicCard name="Mantra">
                            <Field label="phoneme" value={show(record.sixSonicCards?.mantra?.phoneme)} />
                            <Field
                                label="frequency"
                                value={
                                    record.sixSonicCards?.mantra?.frequencyHz === undefined
                                        ? '—'
                                        : `${record.sixSonicCards.mantra.frequencyHz} Hz`
                                }
                            />
                            <Field label="phase" value={show(record.sixSonicCards?.mantra?.phase)} />
                            <Field label="element" value={show(record.sixSonicCards?.mantra?.element)} />
                        </SonicCard>
                        <SonicCard name="Asma">
                            <Field label="name" value={show(record.sacredSonic?.name)} />
                            <Field label="Arabic" value={show(record.sacredSonic?.arabicText)} />
                            <Field label="translation" value={show(record.sacredSonic?.englishTranslation)} />
                            <Field label="group" value={show(record.sixSonicCards?.asma?.group)} />
                            <Field label="mirror" value={show(record.sixSonicCards?.asma?.mirror)} />
                            <Field
                                label="routing"
                                value={
                                    record.sixSonicCards?.asma?.maskRouting
                                        ? `internal ${record.sixSonicCards.asma.maskRouting.internal ? 'yes' : 'no'} · projective ${record.sixSonicCards.asma.maskRouting.projective ? 'yes' : 'no'}`
                                        : '—'
                                }
                            />
                        </SonicCard>
                        <SonicCard name="Planetary-chakral">
                            <Field label="ruler" value={show(record.planetaryChakral?.planetaryRuler)} />
                            <Field
                                label="Cousto"
                                value={
                                    record.sixSonicCards?.planetaryChakral?.coustoHz === undefined
                                        ? '—'
                                        : `${record.sixSonicCards.planetaryChakral.coustoHz} Hz`
                                }
                            />
                            <Field label="element" value={show(record.sixSonicCards?.planetaryChakral?.element)} />
                            <Field
                                label="velocity"
                                value={
                                    record.sixSonicCards?.planetaryChakral?.keplerianVelocity === undefined
                                        ? '—'
                                        : `${record.sixSonicCards.planetaryChakral.keplerianVelocity} arcsec/day x10`
                                }
                            />
                        </SonicCard>
                    </div>
                </CorrespondenceCard>
            ) : (
                <CorrespondenceCard face="planetary" label="Planetary-chakral">
                    <div className="corr-body" data-testid="corr-planetary">
                        <div className="pane-toolbar" role="tablist" aria-label="planetary correspondence view">
                            <button type="button" role="tab" data-testid="planetary-view-vibrational" data-active={m2Surface.planetaryViewMode === 'vibrational' ? 'true' : 'false'} aria-selected={m2Surface.planetaryViewMode === 'vibrational'} onClick={() => updateM2Surface({ planetaryViewMode: 'vibrational' })}>Vibrational</button>
                            <button type="button" role="tab" data-testid="planetary-view-psychoid" data-active={m2Surface.planetaryViewMode === 'psychoid' ? 'true' : 'false'} aria-selected={m2Surface.planetaryViewMode === 'psychoid'} onClick={() => updateM2Surface({ planetaryViewMode: 'psychoid' })}>Psychoid</button>
                        </div>
                        {m2Surface.planetaryViewMode === 'vibrational' ? <>
                            <Field label="ruler" value={show(record.planetaryChakral?.planetaryRuler)} />
                            <Field label="mode" value={show(record.planetaryChakral?.planetaryMode)} />
                            <Field label="vedic mantra" value={show(record.planetaryChakral?.vedicMantra)} />
                            <Field label="chakra" value={show(record.planetaryChakral?.chakraName)} />
                            <Field label="chakra role" value={show(record.planetaryChakral?.chakraRole)} />
                        </> : record.correspondenceTree?.psychoidPlanetary?.find(entry => entry.planet === record.planetaryChakral?.planetaryRuler) ? (() => {
                            const entry = record.correspondenceTree!.psychoidPlanetary!.find(item => item.planet === record.planetaryChakral?.planetaryRuler)!;
                            return <><Field label="L0' position" value={String(entry.l0PrimePosition)} /><Field label="archetypal number" value={String(entry.archetypalNumber)} /><Field label="archetypal role" value={entry.archetypalRole} /></>;
                        })() : <div className="pane-message" data-testid="pending-psychoid-outer-planet">pending psychoid correspondence</div>}
                        <EpogdoonProofOverlay
                            address72={address72}
                            generation={cached?.generation ?? null}
                            developerMode={m2Surface.epogdoonProofMode}
                        />
                    </div>
                </CorrespondenceCard>
            )}
        </div>
    );
}
