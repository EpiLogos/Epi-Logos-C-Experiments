/**
 * Coordinate: M' M2' (the M2 meaning packet — Tranche 49.4)
 * Residency: Body/M/pratibimba-app/src/engine
 * Actualises: the carrier equivalent of the frozen
 *   `m2-parashakti/src/common/meaning-packet.ts` — the compact, deterministic
 *   M2 packet that bundles the ACTIVE 72-address, the exact 8+4 profile bus
 *   (audioOctet[8] + nodalQuartet[4] — the pitch/nodal authority), the kernel
 *   MODAL RESONATOR DIGEST (a verbatim ref, never a recompute), the CYMATIC
 *   DIGEST (a compact summary of the real Chladni field, `engine/cymaticField`
 *   `cymaticDigest`), and the graph-sourced MODAL LABELS (maqam / planetary
 *   mode). Per the bell kernel spec (49.4): the frame carries a digest/ref plus
 *   the exact bus, it never synthesises modal data locally, and its byte-hash
 *   moves iff the authoritative 8+4 bus or the declared modal digest moves —
 *   the descriptive graph labels (maqam/mode) do NOT move it.
 * Public surface: buildM2MeaningPacket, buildModalResonatorDigest,
 *   extractModalLabels, PENDING_MODAL_LABELS, the M2MeaningPacket /
 *   ModalResonatorDigest / M2ModalLabels shapes, M2_MEANING_PACKET_* constants.
 * Does NOT own: the pitch/octet or (m,n) constraints (kernel Vimarśa bus), the
 *   modal resonator projection (portal-core `modal_resonator.rs`, kernel), the
 *   cymatic solver (`engine/cymaticField` — this only summarises it), the maqam
 *   / mode corpus (S2 graph via `s2.parashaktiCorrespondences`), pane layout.
 */

import { extractBellRoles, type ModalResonatorBoundary } from '../bridge/types';
import type { NodalMN } from './cosmicMath';
import { cymaticDigest, type CymaticDigest } from './cymaticField';

export const M2_MEANING_PACKET_CONTRACT_VERSION = '2026-07-12.49-T49.4' as const;
export const M2_MEANING_PACKET_PRIVACY_CLASS = 'public-current-context' as const;

/** Keys that would carry a protected M4 personal field body — a serialised
 *  meaning packet must contain none of them (bell spec §5 / 49.7 boundary). The
 *  packet is structurally clean because it only reads the whitelisted bus /
 *  digest / label fields below; this list backs the guard test. */
export const PROTECTED_BODY_KEYS: readonly string[] = Object.freeze([
    'fieldBody',
    'rawField',
    'field_body',
    'raw_field',
    'personalField',
    'personal_field',
    'personalCymatic',
    'personal_cymatic',
    'natalChart',
    'natal_chart'
]);

/**
 * The graph's modal descriptors — maqam (name + spiritual function) and the
 * planetary mode. These are S2 graph writes routed through
 * `s2.parashaktiCorrespondences`; they are NEVER synthesised from the bus. When
 * the graph has no descriptor the labels read `pending` with null values —
 * canonical absence, never a fabricated maqam.
 */
export interface M2ModalLabels {
    readonly maqam: string | null;
    readonly maqamSpiritualFunction: string | null;
    readonly planetaryMode: string | null;
    readonly source: 'graph' | 'pending';
}

export const PENDING_MODAL_LABELS: M2ModalLabels = Object.freeze({
    maqam: null,
    maqamSpiritualFunction: null,
    planetaryMode: null,
    source: 'pending'
});

/**
 * A compact, VERBATIM digest of the kernel modal resonator — a reference, not a
 * recompute. Every value is copied straight off the boundary; the app never
 * derives pitch, lens-mode, or bell roles here. Null when the contract is
 * absent or malformed (a legacy gateway) — the honest "no modal contract" state.
 */
export interface ModalResonatorDigest {
    readonly schemaVersion: number;
    readonly lens: number | null;
    readonly mode: number | null;
    readonly lensModeIndex: number | null;
    readonly m2Address72: number | null;
    /** The eight live carrier Hz, verbatim from `modalResonator.liveOctet`. */
    readonly liveOctetHz: readonly number[];
    /** The eight bell-partial role labels in octet order, or null (kernel). */
    readonly bellPartialRoles: readonly string[] | null;
    /** The five structurally-still chromatic slots (7+5 partition). */
    readonly silentPitchClasses: readonly number[];
    readonly digestHash: string;
}

/** Build the verbatim modal digest, or null when the boundary is absent /
 *  malformed. Reuses `extractBellRoles` (the kernel-verbatim role helper) so the
 *  app never re-labels the partials. */
export function buildModalResonatorDigest(
    modal: ModalResonatorBoundary | null | undefined
): ModalResonatorDigest | null {
    if (!modal || typeof modal.schemaVersion !== 'number') {
        return null;
    }
    const liveOctetHz = Array.isArray(modal.liveOctet)
        ? modal.liveOctet.map(carrier =>
              typeof carrier?.hz === 'number' && Number.isFinite(carrier.hz) ? carrier.hz : NaN
          )
        : [];
    if (liveOctetHz.length !== 8 || liveOctetHz.some(hz => Number.isNaN(hz))) {
        return null;
    }
    const bellPartialRoles = extractBellRoles(modal);
    const silentPitchClasses = Array.isArray(modal.silentComplement)
        ? modal.silentComplement
              .map(anchor => (typeof anchor?.pitchClass === 'number' ? anchor.pitchClass : null))
              .filter((pitchClass): pitchClass is number => pitchClass !== null)
        : [];
    const summary = {
        schemaVersion: modal.schemaVersion,
        lens: numberOrNull(modal.lensMode?.lens),
        mode: numberOrNull(modal.lensMode?.mode),
        lensModeIndex: numberOrNull(modal.lensMode?.lensModeIndex),
        m2Address72: numberOrNull(modal.m2Address72?.address72),
        liveOctetHz: Object.freeze([...liveOctetHz]),
        bellPartialRoles: bellPartialRoles ? Object.freeze([...bellPartialRoles]) : null,
        silentPitchClasses: Object.freeze([...silentPitchClasses])
    };
    return Object.freeze({ ...summary, digestHash: modalDigestHash(summary) });
}

/** Pull the modal labels VERBATIM from an `s2.parashaktiCorrespondences`
 *  artifact (the same seam `M2CorrespondencePane` reads). Missing / malformed →
 *  pending; there is no local maqam table and no fabrication. */
export function extractModalLabels(artifact: unknown): M2ModalLabels {
    const record = artifact as
        | {
              sacredSonic?: {
                  maqam?: { name?: unknown; spiritualFunction?: unknown } | null;
              } | null;
              planetaryChakral?: { planetaryMode?: unknown } | null;
          }
        | null
        | undefined;
    const maqam = stringOrNull(record?.sacredSonic?.maqam?.name);
    const maqamSpiritualFunction = stringOrNull(record?.sacredSonic?.maqam?.spiritualFunction);
    const planetaryMode = stringOrNull(record?.planetaryChakral?.planetaryMode);
    if (maqam === null && maqamSpiritualFunction === null && planetaryMode === null) {
        return PENDING_MODAL_LABELS;
    }
    return Object.freeze({ maqam, maqamSpiritualFunction, planetaryMode, source: 'graph' });
}

export interface M2MeaningPacket {
    readonly contractVersion: typeof M2_MEANING_PACKET_CONTRACT_VERSION;
    readonly subject: 'tick';
    readonly profileGeneration: number;
    readonly privacyClass: typeof M2_MEANING_PACKET_PRIVACY_CLASS;
    readonly address72: number;
    readonly exactProfileBus: true;
    /** The eight carrier Hz — exact profile authority, never re-derived. */
    readonly audioOctetHz: readonly number[];
    /** The four (m,n) nodal constraints — exact profile authority. */
    readonly nodalQuartet: readonly NodalMN[];
    readonly modalResonatorDigest: ModalResonatorDigest | null;
    readonly cymaticDigest: CymaticDigest;
    readonly modalLabels: M2ModalLabels;
    readonly pendingFields: readonly string[];
    readonly packetReady: boolean;
    /** FNV over the AUTHORITATIVE inputs only: the 8+4 bus + the declared modal
     *  digest. The graph labels (maqam / mode) are descriptive overlays and do
     *  NOT move this hash (bell spec: deterministic under bus + modal digest). */
    readonly packetHash: string;
}

export interface M2MeaningPacketInput {
    readonly generation: number;
    /** The profile's `harmonicProfile` bus object (audioOctet, nodalQuartet,
     *  resonance72, modalResonator, …). */
    readonly harmonicProfile: Readonly<Record<string, unknown>> | null | undefined;
    /** Graph-sourced labels; omit for the honest pending state. */
    readonly modalLabels?: M2ModalLabels;
    /** Cymatic phase used to summarise the field (default 0). */
    readonly theta?: number;
    /** Digest raster resolution (default 32). */
    readonly digestResolution?: number;
}

/**
 * Build the M2 meaning packet from a profile bus. THROWS when the bus is not the
 * exact 8+4 authority — the packet will not synthesise pitch/nodal state
 * locally (the carrier equivalent of the frozen `renderM2CymaticFrame` guard).
 * Modal labels are taken as given (graph) or default to pending; they are never
 * invented from the bus.
 */
export function buildM2MeaningPacket(input: M2MeaningPacketInput): M2MeaningPacket {
    const bus = input.harmonicProfile ?? {};
    const audioOctetHz = readOctet(bus.audioOctet ?? bus.audio_octet);
    const nodalQuartet = readQuartet(bus.nodalQuartet ?? bus.nodal_quartet);
    if (!audioOctetHz || !nodalQuartet) {
        throw new Error(
            'm2 meaning packet requires exact profile audioOctet[8] and nodalQuartet[4] — the bus is the pitch/nodal authority, never synthesised locally'
        );
    }

    const address72 = readAddress72(bus);
    const theta =
        typeof input.theta === 'number' && Number.isFinite(input.theta) ? input.theta : 0;
    const digest = cymaticDigest(audioOctetHz, nodalQuartet, theta, input.digestResolution ?? 32);
    const modalResonatorDigest = buildModalResonatorDigest(readModal(bus));
    const modalLabels = input.modalLabels ?? PENDING_MODAL_LABELS;

    const pendingFields: string[] = [];
    if (!modalResonatorDigest) {
        pendingFields.push('profile.modalResonator');
    }
    if (modalLabels.source === 'pending') {
        pendingFields.push('s2.parashaktiCorrespondences.modalLabels');
    }

    return Object.freeze({
        contractVersion: M2_MEANING_PACKET_CONTRACT_VERSION,
        subject: 'tick',
        profileGeneration: input.generation,
        privacyClass: M2_MEANING_PACKET_PRIVACY_CLASS,
        address72,
        exactProfileBus: true,
        audioOctetHz: Object.freeze([...audioOctetHz]),
        nodalQuartet: Object.freeze(nodalQuartet.map(node => Object.freeze({ ...node }))),
        modalResonatorDigest,
        cymaticDigest: digest,
        modalLabels,
        pendingFields: Object.freeze(pendingFields),
        packetReady: pendingFields.length === 0,
        packetHash: packetHashOf(audioOctetHz, nodalQuartet, modalResonatorDigest)
    });
}

// ── bus / address readers (verbatim, never derived) ─────────────────────────

function readOctet(value: unknown): readonly number[] | null {
    if (!Array.isArray(value) || value.length !== 8) {
        return null;
    }
    const octet = value.map(entry =>
        typeof entry === 'number' && Number.isFinite(entry) ? entry : NaN
    );
    return octet.some(hz => Number.isNaN(hz)) ? null : Object.freeze(octet);
}

function readQuartet(value: unknown): readonly NodalMN[] | null {
    if (!Array.isArray(value) || value.length !== 4) {
        return null;
    }
    const quartet: NodalMN[] = [];
    for (const entry of value) {
        const node = entry as { m?: unknown; n?: unknown } | null | undefined;
        if (
            typeof node?.m !== 'number' ||
            !Number.isFinite(node.m) ||
            typeof node?.n !== 'number' ||
            !Number.isFinite(node.n)
        ) {
            return null;
        }
        quartet.push({ m: node.m, n: node.n });
    }
    return Object.freeze(quartet);
}

function readAddress72(bus: Readonly<Record<string, unknown>>): number {
    const resonance72 = objectValue(bus.resonance72);
    const primary = numberOrNull(resonance72?.lensAnchorIndex);
    const fromModal = numberOrNull(objectValue(objectValue(bus.modalResonator)?.m2Address72)?.address72);
    const address = primary ?? fromModal;
    if (address === null) {
        throw new Error(
            'm2 meaning packet requires the active 72-address (resonance72.lensAnchorIndex or modalResonator.m2Address72)'
        );
    }
    return ((Math.trunc(address) % 72) + 72) % 72;
}

function readModal(bus: Readonly<Record<string, unknown>>): ModalResonatorBoundary | null {
    const modal = objectValue(bus.modalResonator);
    return (modal as ModalResonatorBoundary | undefined) ?? null;
}

// ── hashes ──────────────────────────────────────────────────────────────────

function packetHashOf(
    audioOctetHz: readonly number[],
    nodalQuartet: readonly NodalMN[],
    modalResonatorDigest: ModalResonatorDigest | null
): string {
    const canonical = [
        'octet',
        ...audioOctetHz.map(hz => Math.round(hz * 1_000_000)),
        'quartet',
        ...nodalQuartet.flatMap(node => [node.m, node.n]),
        'modal',
        modalResonatorDigest ? modalResonatorDigest.digestHash : 'no-modal'
    ].join('|');
    return fnv1a(canonical);
}

function modalDigestHash(summary: {
    readonly schemaVersion: number;
    readonly lens: number | null;
    readonly mode: number | null;
    readonly lensModeIndex: number | null;
    readonly m2Address72: number | null;
    readonly liveOctetHz: readonly number[];
    readonly bellPartialRoles: readonly string[] | null;
    readonly silentPitchClasses: readonly number[];
}): string {
    const canonical = [
        summary.schemaVersion,
        summary.lens ?? '-',
        summary.mode ?? '-',
        summary.lensModeIndex ?? '-',
        summary.m2Address72 ?? '-',
        summary.liveOctetHz.map(hz => Math.round(hz * 1_000_000)).join(','),
        (summary.bellPartialRoles ?? ['-']).join(','),
        summary.silentPitchClasses.join(',')
    ].join('|');
    return fnv1a(canonical);
}

function fnv1a(canonical: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < canonical.length; i++) {
        hash ^= canonical.charCodeAt(i) & 0xff;
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, '0');
}

// ── narrow value helpers ─────────────────────────────────────────────────────

function objectValue(value: unknown): Readonly<Record<string, unknown>> | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Readonly<Record<string, unknown>>)
        : undefined;
}

function numberOrNull(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringOrNull(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
}
