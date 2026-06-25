// ─────────────────────────────────────────────────────────────────────────────
// Coordinate Header (convention:coordinate-header:v1)
//   Coordinate:     #2 sacred-sonic Asma overlay (the 99+1 Asma al-Husna — the names
//                   partitioned Jalal/Kamal/Jamal with one Hidden name at index 99)
//   Residency:      Body/M/epi-theia/extensions/m2-parashakti (browser card)
//   Position (#3):  23.3 — Layer B, sacred-sonic card #5
//   Actualises:     the Asma reading for the live `address72`, read ONLY through
//                   `kernelBridge.m2.decodeAxisAt(address72, "asma")` → name + group
//                   (Jalal/Kamal/Jamal/Hidden via ASMA_HIDDEN_INDEX = 99) + digital
//                   root + mirror index + a 36-internal / 64-projective routing badge
//                   derived from the `m2_is_internal` / `m2_is_projective` masks the
//                   projection reports.
//   Public surface: AsmaCard, buildAsmaCardModel, the M2AsmaProjection /
//                   M2AsmaCardBridge typed contract, the AsmaCardModel view model,
//                   and the overlay invariants (ASMA_COUNT, ASMA_HIDDEN_INDEX).
//   Does NOT own:   the Asma law, the Jalal/Kamal/Jamal partition, or the
//                   internal/projective masks. The 99+1 overlay lives kernel-side and
//                   is surfaced through `decodeAxisAt`. This card NEVER recomputes the
//                   masks; it folds the published projection (overlay-not-axis, DR-M2-2).
//   Cross-links:    MantraCard (sibling overlay), ShemPairCard / MaqamModeCard
//                   (sacred-sonic siblings), correspondence tree Asma(99+1) sonic-overlay
//                   tab (23.5).
//   Contract:       kernelBridge.m2.decodeAxisAt(address72, "asma") →
//                   { address72, asmaIndex, name, group, digitalRoot, mirrorIndex,
//                     isInternal, isProjective }
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react';
import type { MExtensionReadinessSnapshot, MExtensionReadinessState } from '@pratibimba/m-extension-runtime';
import type { M2PrimeMeaningPacket } from '../../../common/meaning-packet';
import type { M2KleinFlipPhase } from '../../../common/composition';
import { ProvenanceBadge, type ProvenanceReadinessVariant } from '../ProvenanceBadge';

// ── Invariants (declared; never recomputed) ─────────────────────────────────

/** The Parashakti 72-Invariant — every Asma reading keys off a vibrational address. */
export const ASMA_ADDRESS_COUNT = 72;

/** The 99+1 Asma al-Husna (99 names + 1 Hidden). */
export const ASMA_COUNT = 100;

/** The Hidden name — the +1 beyond the 99. */
export const ASMA_HIDDEN_INDEX = 99;

/** The internal-routing cardinality (36 names route inward). */
export const ASMA_INTERNAL_COUNT = 36;

/** The projective-routing cardinality (64 names project outward). */
export const ASMA_PROJECTIVE_COUNT = 64;

/** Provenance source-field for the Asma payload (routes to the S2 authority). */
export const M2_ASMA_PROVENANCE_FIELD = 'sacredSonicFrame.asma';

/** The single Asma authority this card reads through — never a local computation. */
export const ASMA_SOURCE = 'kernelBridge.m2.decodeAxisAt(address72, "asma")' as const;

export type AsmaGroup = 'Jalal' | 'Kamal' | 'Jamal' | 'Hidden';

/** Group hue map — majesty / perfection / beauty / hidden. */
const GROUP_HUES: Readonly<Record<AsmaGroup, string>> = Object.freeze({
    Jalal: '#c5564b',
    Kamal: '#d6b15e',
    Jamal: '#5fa9b8',
    Hidden: '#7d4f9e'
});

// ── Bridge contract (the ONLY typed projection this card consumes) ────────────

/** The typed projection returned by `kernelBridge.m2.decodeAxisAt(address72, "asma")`. */
export interface M2AsmaProjection {
    readonly address72: number;
    readonly asmaIndex: number;
    readonly name: string;
    readonly group: AsmaGroup;
    readonly digitalRoot: number;
    readonly mirrorIndex: number;
    /** From the `m2_is_internal(idx)` mask — routes inward (36-internal). */
    readonly isInternal: boolean;
    /** From the `m2_is_projective(idx)` mask — projects outward (64-projective). */
    readonly isProjective: boolean;
}

/** A function decoding a 72-address along the Asma overlay. */
export type M2AsmaDecoder = (address72: number, axis: 'asma') => M2AsmaProjection;

/** The slice of the kernel-bridge this card depends on. */
export interface M2AsmaCardBridge {
    readonly m2: {
        readonly decodeAxisAt: M2AsmaDecoder;
    };
}

// ── View model ───────────────────────────────────────────────────────────────

export interface AsmaCardModel {
    readonly address72: number;
    readonly projection: M2AsmaProjection | null;
    readonly groupHue: string;
    readonly isHidden: boolean;
    /** Routing label derived from the internal/projective masks. */
    readonly routingLabel: string;
    readonly kleinFlipPhase: M2KleinFlipPhase;
    readonly bridgeReady: boolean;
}

export interface AsmaCardProps {
    /** The live vibrational address keying the Asma overlay. */
    readonly address72: number;
    /** The kernel-bridge slice. When absent the card renders a bridge-down state. */
    readonly kernelBridge?: M2AsmaCardBridge | null;
    /** Klein-flip phase (carried for parity; Asma routing is mask-driven). */
    readonly kleinFlipPhase?: M2KleinFlipPhase | null;
    /** Meaning packet for provenance badging. */
    readonly packet?: Pick<M2PrimeMeaningPacket, 'meaningPacketProvenanceFor'> | null;
    /** Readiness for provenance badge tone. */
    readonly readiness?: ProvenanceReadinessVariant | MExtensionReadinessState | MExtensionReadinessSnapshot;
    readonly className?: string;
}

// ── Model builder (pure; reads ONLY the injected bridge projection) ──────────

export function buildAsmaCardModel(input: {
    readonly address72: number;
    readonly kernelBridge?: M2AsmaCardBridge | null;
    readonly kleinFlipPhase?: M2KleinFlipPhase | null;
}): AsmaCardModel {
    const address72 = clampAddress72(input.address72);
    const kleinFlipPhase = normalizeKleinPhase(input.kleinFlipPhase);
    const decoder = input.kernelBridge?.m2?.decodeAxisAt ?? null;
    const projection = decoder ? safeDecode(decoder, address72) : null;

    const isHidden = projection ? projection.asmaIndex === ASMA_HIDDEN_INDEX || projection.group === 'Hidden' : false;
    const groupHue = projection ? GROUP_HUES[projection.group] ?? '#9aa6b2' : '#5a6472';
    const routingLabel = projection ? routingLabelFor(projection) : '—';

    return Object.freeze({
        address72,
        projection,
        groupHue,
        isHidden,
        routingLabel,
        kleinFlipPhase,
        bridgeReady: projection !== null
    });
}

// ── Component ────────────────────────────────────────────────────────────────

export function AsmaCard(props: AsmaCardProps): React.ReactElement {
    const model = React.useMemo(
        () =>
            buildAsmaCardModel({
                address72: props.address72,
                kernelBridge: props.kernelBridge ?? null,
                kleinFlipPhase: props.kleinFlipPhase ?? null
            }),
        [props.address72, props.kernelBridge, props.kleinFlipPhase]
    );

    const className = ['m2-asma-card', 'm2-sacred-sonic-card', props.className].filter(Boolean).join(' ');
    const p = model.projection;

    return (
        <article
            className={className}
            data-asma-card
            data-sacred-sonic-card="asma"
            data-address72={model.address72}
            data-card-state={model.bridgeReady ? 'ready' : 'bridge-unavailable'}
            data-asma-hidden={model.isHidden ? 'true' : 'false'}
            data-klein-phase={model.kleinFlipPhase}
        >
            <header className="m2-asma-card__header">
                <h4>Asma al-Husna</h4>
                <span className="m2-asma-card__address">#2 · {model.address72}</span>
                {props.packet && (
                    <ProvenanceBadge
                        compact
                        field={M2_ASMA_PROVENANCE_FIELD}
                        readiness={props.readiness ?? (model.bridgeReady ? 'ready_public_current' : 'bridge_unavailable')}
                        provenance={props.packet.meaningPacketProvenanceFor(M2_ASMA_PROVENANCE_FIELD)}
                    />
                )}
            </header>

            {p ? (
                <>
                    <div className="m2-asma-card__name-row">
                        <strong className="m2-asma-card__name" lang="ar">
                            {p.name}
                        </strong>
                        <span
                            className="m2-asma-card__group"
                            data-asma-group={p.group}
                            style={{ borderColor: model.groupHue }}
                        >
                            {p.group}
                        </span>
                    </div>
                    <dl className="m2-asma-card__body">
                        <dt>Index</dt>
                        <dd>
                            #{p.asmaIndex}
                            {model.isHidden && <span className="m2-asma-card__hidden-tag"> (Hidden +1)</span>}
                        </dd>
                        <dt>Digital root</dt>
                        <dd>DR {p.digitalRoot}</dd>
                        <dt>Mirror</dt>
                        <dd>#{p.mirrorIndex}</dd>
                    </dl>
                    <RoutingBadge projection={p} label={model.routingLabel} />
                </>
            ) : (
                <p className="mext-widget-empty" data-pending-field={ASMA_SOURCE}>
                    The Asma reading is waiting for {ASMA_SOURCE}.
                </p>
            )}
        </article>
    );
}

// ── Sub-views ────────────────────────────────────────────────────────────────

function RoutingBadge({
    projection,
    label
}: {
    readonly projection: M2AsmaProjection;
    readonly label: string;
}): React.ReactElement {
    return (
        <p
            className="m2-asma-card__routing-badge"
            data-asma-routing-badge
            data-internal={projection.isInternal ? 'true' : 'false'}
            data-projective={projection.isProjective ? 'true' : 'false'}
            aria-label={`Asma routing: ${label}`}
        >
            <span className="m2-asma-card__routing-label">{label}</span>
            <span className="m2-asma-card__routing-cardinality" aria-hidden="true">
                {projection.isInternal ? `${ASMA_INTERNAL_COUNT}-internal` : `${ASMA_PROJECTIVE_COUNT}-projective`}
            </span>
        </p>
    );
}

// ── Normalisers (bounds + parity only; no Asma arithmetic) ───────────────────

function safeDecode(decoder: M2AsmaDecoder, address72: number): M2AsmaProjection | null {
    try {
        const projection = decoder(address72, 'asma');
        if (
            !projection ||
            typeof projection.address72 !== 'number' ||
            typeof projection.name !== 'string' ||
            typeof projection.asmaIndex !== 'number'
        ) {
            return null;
        }
        return Object.freeze({
            ...projection,
            group: normalizeGroup(projection.group),
            isInternal: projection.isInternal === true,
            isProjective: projection.isProjective === true
        });
    } catch {
        return null;
    }
}

function routingLabelFor(projection: M2AsmaProjection): string {
    if (projection.isInternal && projection.isProjective) {
        return 'internal + projective';
    }
    if (projection.isInternal) {
        return 'internal (36)';
    }
    if (projection.isProjective) {
        return 'projective (64)';
    }
    return 'unrouted';
}

function normalizeGroup(group: unknown): AsmaGroup {
    return group === 'Jalal' || group === 'Kamal' || group === 'Jamal' || group === 'Hidden' ? group : 'Jamal';
}

function normalizeKleinPhase(phase: M2KleinFlipPhase | null | undefined): M2KleinFlipPhase {
    return phase === 'inverted' || phase === 'transitioning' ? phase : 'primary';
}

function clampAddress72(value: number): number {
    const rounded = Math.trunc(Number.isFinite(value) ? value : 0);
    return ((rounded % ASMA_ADDRESS_COUNT) + ASMA_ADDRESS_COUNT) % ASMA_ADDRESS_COUNT;
}

export default AsmaCard;
