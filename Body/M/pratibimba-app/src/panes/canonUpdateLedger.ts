/**
 * Coordinate: M' S5' (canon-update ledger review — pure model, Tranche 40.T40.5)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the Track-40 CU-ledger review surface law — normalized
 *   `CanonUpdateRow` over the REAL `s5'.canon_update.*` contract
 *   (gateway-contract lib.rs: 7 categories, 8 forward-only lifecycle states
 *   on the surfaced→designed→reviewed→validated spine), status filtering,
 *   and per-row provenance/derivation/landing-site read-law. Reuses the
 *   Track-48 coordinate-keyed query-view posture (table over GatewayClient).
 * Does NOT own: the ledger runtime (Body/S/S3/gateway/src/canon_update.rs,
 *   driven by `epi bimba` — one substrate per DR-S5-ONE-1), the ws dispatch
 *   seam (the live gateway answers `unimplemented` for the family today —
 *   ratified CLI-side shape per epi-cli gate/parity.rs; the pane renders
 *   that honestly, mirroring the m4 arena pane precedent).
 */

export { classifyWireError, type ArenaWireState as CanonWireState } from './m4DialogicalArena';

export const CANON_LIST_RPC = "s5'.canon_update.list";
export const CANON_STATUS_RPC = "s5'.canon_update.status";

export const CANON_WIRE_PENDING_NOTE =
    "s5'.canon_update.* wire dispatch pending — the CU ledger lives CLI-side (epi bimba, 40.T40.1); this pane goes live when the ws seam lands";

/** Forward-only lifecycle spine + terminal states (gateway-contract lib.rs:512). */
export const CANON_UPDATE_STATES = Object.freeze([
    'surfaced',
    'designed',
    'reviewed',
    'validated',
    'landed',
    'refused',
    'deferred',
    'superseded'
] as const);
export type CanonUpdateState = (typeof CANON_UPDATE_STATES)[number];

/** CU categories (gateway-contract lib.rs:445). */
export const CANON_UPDATE_CATEGORIES = Object.freeze([
    'identity',
    'form',
    'entity',
    'rel',
    'vocab',
    'xref',
    'formExecTrace'
] as const);
export type CanonUpdateCategory = (typeof CANON_UPDATE_CATEGORIES)[number];

export interface CanonUpdateRow {
    readonly id: string;
    readonly category: CanonUpdateCategory | 'unknown';
    readonly status: CanonUpdateState;
    readonly claim: string;
    readonly targetLandingHint: string | null;
    readonly landedMarker: string | null;
    readonly refusalReason: string | null;
    readonly surfacedAtMs: number;
    readonly updatedAtMs: number;
}

const EMPTY_RECORD = Object.freeze({}) as Readonly<Record<string, unknown>>;

function objectRecord(value: unknown): Readonly<Record<string, unknown>> | undefined {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return undefined;
    }
    return value as Readonly<Record<string, unknown>>;
}

function stringValue(value: unknown, fallback: string): string;
function stringValue(value: unknown, fallback: null): string | null;
function stringValue(value: unknown, fallback: string | null): string | null {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function numberValue(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

/** Normalise one wire row (camelCase contract; snake accepted defensively). */
export function normalizeCanonUpdateRow(raw: unknown): CanonUpdateRow {
    const record = objectRecord(raw) ?? EMPTY_RECORD;
    const payload = objectRecord(record.payload) ?? record;
    const rawStatus = stringValue(payload.status, 'surfaced');
    const rawCategory = stringValue(payload.category, 'unknown');
    const marker = payload.landedMarker ?? payload.landed_marker;
    const markerRecord = objectRecord(marker);
    return Object.freeze({
        id: stringValue(payload.id, 'cu-row'),
        category: (CANON_UPDATE_CATEGORIES as readonly string[]).includes(rawCategory)
            ? (rawCategory as CanonUpdateCategory)
            : 'unknown',
        status: (CANON_UPDATE_STATES as readonly string[]).includes(rawStatus)
            ? (rawStatus as CanonUpdateState)
            : 'surfaced',
        claim: stringValue(payload.claim, ''),
        targetLandingHint: stringValue(payload.targetLandingHint ?? payload.target_landing_hint, null),
        landedMarker: markerRecord
            ? stringValue(markerRecord.marker ?? markerRecord.path ?? JSON.stringify(markerRecord), null)
            : stringValue(marker, null),
        refusalReason: stringValue(payload.refusalReason ?? payload.refusal_reason, null),
        surfacedAtMs: numberValue(payload.surfacedAtMs ?? payload.surfaced_at_ms),
        updatedAtMs: numberValue(payload.updatedAtMs ?? payload.updated_at_ms)
    });
}

export function normalizeCanonUpdateRows(raw: unknown): readonly CanonUpdateRow[] {
    const record = objectRecord(raw);
    const rows = Array.isArray(raw) ? raw : (record?.rows ?? record?.items ?? record?.payload);
    return Object.freeze((Array.isArray(rows) ? rows : []).map(normalizeCanonUpdateRow));
}

export function filterByStatus(
    rows: readonly CanonUpdateRow[],
    status: CanonUpdateState | 'all'
): readonly CanonUpdateRow[] {
    return status === 'all' ? rows : rows.filter(row => row.status === status);
}
