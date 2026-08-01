/**
 * Coordinate: M' M3' (hexagram body-dynamics service, 24.T24.16 + 24.T24.8)
 * Residency: Body/M/pratibimba-app/src/services/m3
 * Position (#n): protected scalar-reference read adapter.
 * Actualises: per-hexagram authority resolution through the shared S2 method —
 *   `resolve` returns the raw receipt, `lookup` parses it into the typed
 *   {@link HexagramBodyEntry} the 24.T24.8 viewer consumes.
 * Public surface: HexagramBodyDynamicsService, M3_HEXAGRAM_BODY_METHOD,
 *   HexagramBodyEntry, HexagramBodyPending, HEXAGRAM_BODY_PENDING,
 *   isResolvedHexagramBody.
 * Does NOT own: the 64-row body map, chakra LUTs, transport, or persistence.
 *   `HEXAGRAM_BODY_DYNAMICS[64]` and `CHAKRA_BODY_ZONES[8]` are substrate
 *   authority (`epi-cli::nara::oracle_identity` / `::medicine_frame`) read over
 *   the bridge; nothing here re-derives a chakra, a zone, or a dynamic.
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.16 + 24.8.
 */

import type { KernelBridgeCapabilityReceipt } from '../../bridge/types';
import { requireIntegerInRange, type M3GatewayPort } from './m3GatewayPort';

export const M3_HEXAGRAM_BODY_METHOD = 's2.codon.scalar_ref.read' as const;

/**
 * One row of `HEXAGRAM_BODY_DYNAMICS[64]`, as it crosses the bridge.
 *
 * `secondaryChakraIds` is a LIST because that is the consuming shape; the
 * dataset carries exactly ONE secondary chakra per hexagram, and a hexagram
 * whose secondary equals its primary is what the dataset says — not a
 * duplicate to collapse away.
 */
export interface HexagramBodyEntry {
    readonly hexagramId: number; // 1..64, King Wen
    readonly primaryChakraId: number; // 0..7 (0 = Earth/Ground, not a body chakra)
    readonly secondaryChakraIds: readonly number[];
    readonly bodyZones: readonly string[];
    readonly dynamic: string;
}

/** Honest-pending marker — the protected row has not resolved. */
export interface HexagramBodyPending {
    readonly pending: 's2-hexagram-body';
}

export const HEXAGRAM_BODY_PENDING: HexagramBodyPending = Object.freeze({
    pending: 's2-hexagram-body'
});

export function isResolvedHexagramBody(
    value: HexagramBodyEntry | HexagramBodyPending
): value is HexagramBodyEntry {
    return (value as HexagramBodyPending).pending !== 's2-hexagram-body';
}

export class HexagramBodyDynamicsService {
    constructor(private readonly bridge: M3GatewayPort) {}

    async resolve(hexagramId: number): Promise<KernelBridgeCapabilityReceipt> {
        return this.bridge.invoke(M3_HEXAGRAM_BODY_METHOD, {
            refKind: 'i-ching',
            scalarRef: requireIntegerInRange(hexagramId, 1, 64, 'hexagram id')
        });
    }

    /**
     * 24.T24.8 — the typed read. A partial or malformed row yields the pending
     * marker rather than a half-filled silhouette: a body map missing its zones
     * is not a body map, and lighting a chakra off a guess would be worse than
     * showing nothing.
     */
    async lookup(hexagramId: number): Promise<HexagramBodyEntry | HexagramBodyPending> {
        let receipt: KernelBridgeCapabilityReceipt;
        try {
            receipt = await this.resolve(hexagramId);
        } catch {
            return HEXAGRAM_BODY_PENDING;
        }
        return parseEntry(receipt.artifact) ?? HEXAGRAM_BODY_PENDING;
    }
}

// ============================================================================
// Defensive parser — the artifact is shaped by S2 and never trusted.
// ============================================================================

function parseEntry(artifact: unknown): HexagramBodyEntry | null {
    const outer = asRecord(artifact);
    if (!outer) {
        return null;
    }
    // The method answers `{ resolved, entry }`; older shapes nested under
    // `detail`. An explicit `resolved: false` is an ANSWER — honour it as
    // pending rather than trying to salvage fields from it.
    if (outer.resolved === false) {
        return null;
    }
    const record = asRecord(outer.entry) ?? asRecord(outer.detail) ?? outer;
    const hexagramId = readInt(record.hexagramId, 1, 64);
    const primaryChakraId = readInt(record.primaryChakraId, 0, 7);
    const secondaryChakraIds = readChakraList(record.secondaryChakraIds);
    const bodyZones = readStringArray(record.bodyZones);
    const dynamic = readString(record.dynamic);
    if (
        hexagramId === null ||
        primaryChakraId === null ||
        secondaryChakraIds === null ||
        bodyZones === null ||
        dynamic === null
    ) {
        return null;
    }
    return Object.freeze({
        hexagramId,
        primaryChakraId,
        secondaryChakraIds,
        bodyZones,
        dynamic
    });
}

function asRecord(value: unknown): Record<string, unknown> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function readInt(value: unknown, minimum: number, maximum: number): number | null {
    return typeof value === 'number' &&
        Number.isInteger(value) &&
        value >= minimum &&
        value <= maximum
        ? value
        : null;
}

function readChakraList(value: unknown): readonly number[] | null {
    if (!Array.isArray(value)) {
        return null;
    }
    const parsed = value.map(entry => readInt(entry, 0, 7));
    return parsed.every((entry): entry is number => entry !== null)
        ? Object.freeze(parsed)
        : null;
}

function readString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function readStringArray(value: unknown): readonly string[] | null {
    if (!Array.isArray(value) || value.length === 0) {
        return null;
    }
    const parts = value.filter(
        (entry): entry is string => typeof entry === 'string' && entry.length > 0
    );
    return parts.length === value.length ? Object.freeze([...parts]) : null;
}
