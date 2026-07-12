/**
 * Coordinate: M' M4' (oracle envelope read-law — Track 05.T5.11)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: design-recon 05 §5.11 — the Nara oracle artifact envelope
 *   read-contract. Preserves (never drops, never fabricates) the §5.11
 *   envelope fields: oracle_frame_ref, symbolic_protein_ref, vak_address,
 *   deck_context (macro_deck_ref / session_deck_ref / deck_order_hash /
 *   entropy_mode), sequence_mode, packet refs, graph provenance, review state,
 *   scalar M3 refs, and the protected-interpretation HANDLE (the body is
 *   protected-local and never crosses into this module's outputs).
 * Laws:
 *   - DR-VAK-1 (VALIDATED): `OracleFrame.vak_address.cp[]` /
 *     `reading_frame.positions[]` is the authority for reading cardinality —
 *     spread labels NEVER determine cardinality (readingCardinality()).
 *   - §5.11 mutual projectability: Tarot and I-Ching artifacts are mutually
 *     projectable only where M3 provenance (an m3-codon scalar ref) exists
 *     (projectableSystems()). Scalar refs resolve without loading private
 *     bodies.
 *   - Absent/partial stamps resolve to `pending-envelope` — never fabricated.
 * Public surface: normalizeOracleEnvelopeStamp, readingCardinality,
 *   projectableSystems; NaraOracleEnvelopeStamp, NaraOracleEnvelopeIndicator,
 *   NaraDeckContextStamp.
 * Does NOT own: envelope authorship (portal-core src/nara/mod.rs writes/reads
 *   the Rust envelope), the pattern-packet wire edge (gateway-contract
 *   nara_pattern.rs), the deposition seam (src-tauri oracle.rs — does not
 *   stamp the envelope yet; absent stamps render pending), pane composition
 *   (OraclePane renders these values).
 * Provenance: field vocabulary read from the landed Rust substrate
 *   (portal-core nara/mod.rs snake_case wire) and the FROZEN reference
 *   `Body/M/epi-theia/extensions/m4-nara/src/common/oracle-frame.ts`
 *   (camelCase vocabulary) after verifying both against §5.11 — this module
 *   normalizes the two spellings; counts as new code per the rerun CHARTER
 *   retarget law.
 */

export interface NaraDeckContextStamp {
    readonly macroDeckRef: string | null;
    readonly sessionDeckRef: string | null;
    readonly deckOrderHash: string;
    readonly entropyMode: string;
}

export interface NaraOracleEnvelopeStamp {
    readonly state: 'resolved';
    readonly system: string | null;
    readonly oracleFrameRef: string | null;
    readonly symbolicProteinRef: string | null;
    /** DR-VAK-1 cardinality authority — vak_address.cp[] / positions[]. */
    readonly cpPositionRefs: readonly string[];
    /** CS direction as spelled on the wire ('Day' | "Night'"). */
    readonly csDirection: string | null;
    /** Decorative spread name — never consulted for cardinality. */
    readonly spreadLabel: string | null;
    readonly deckContext: NaraDeckContextStamp | null;
    readonly sequenceMode: string | null;
    readonly packetRefs: readonly string[];
    readonly graphProvenanceHandles: readonly string[];
    readonly reviewState: string | null;
    /** Scalar ref kinds present (e.g. 'm3-codon', 'tarot', 'i-ching'). */
    readonly scalarRefKinds: readonly string[];
    /** Handle only — the protected interpretation body never crosses. */
    readonly interpretationHandle: string | null;
}

export interface NaraOracleEnvelopePending {
    readonly state: 'pending-envelope';
    readonly label: 'pending-envelope';
}

export type NaraOracleEnvelopeIndicator = NaraOracleEnvelopeStamp | NaraOracleEnvelopePending;

const PENDING: NaraOracleEnvelopePending = Object.freeze({
    state: 'pending-envelope' as const,
    label: 'pending-envelope' as const
});

function asRecord(value: unknown): Readonly<Record<string, unknown>> | null {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? (value as Readonly<Record<string, unknown>>)
        : null;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function stringArray(value: unknown): readonly string[] {
    return Array.isArray(value)
        ? value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
        : [];
}

/** Dual-spelling accessor: the Rust edges write snake_case, the frozen TS
 *  vocabulary is camelCase — both resolve, neither is fabricated. */
function field(record: Readonly<Record<string, unknown>> | null, snake: string, camel: string): unknown {
    if (!record) {
        return undefined;
    }
    return record[snake] !== undefined ? record[snake] : record[camel];
}

/**
 * DR-VAK-1 extraction: the positions authority. Accepts, in order of
 * precedence: `cp_position_refs[]` (Rust envelope), `vakAddress.cp[]`
 * (frozen TS array form), `vak_address.cp` (Rust joined-string form).
 */
function extractCpPositionRefs(record: Readonly<Record<string, unknown>>): readonly string[] {
    const direct = stringArray(field(record, 'cp_position_refs', 'cpPositionRefs'));
    if (direct.length > 0) {
        return direct;
    }
    const vak = asRecord(field(record, 'vak_address', 'vakAddress'));
    const cp = vak?.cp;
    if (Array.isArray(cp)) {
        return stringArray(cp);
    }
    const joined = stringValue(cp);
    if (joined) {
        return joined.split(',').map(ref => ref.trim()).filter(ref => ref.length > 0);
    }
    return [];
}

function extractCsDirection(record: Readonly<Record<string, unknown>>): string | null {
    const vak = asRecord(field(record, 'vak_address', 'vakAddress'));
    const cs = vak?.cs;
    const csRecord = asRecord(cs);
    if (csRecord) {
        return stringValue(csRecord.direction);
    }
    return stringValue(cs);
}

function extractDeckContext(record: Readonly<Record<string, unknown>>): NaraDeckContextStamp | null {
    const deck = asRecord(field(record, 'deck_context', 'deckContext'));
    if (!deck) {
        return null;
    }
    const deckOrderHash = stringValue(field(deck, 'deck_order_hash', 'deckOrderHash'));
    const entropyMode = stringValue(field(deck, 'entropy_mode', 'entropyMode'));
    // A deck context without its two required scalars is not a deck context —
    // partial stamps resolve to null, never to fabricated values.
    if (!deckOrderHash || !entropyMode) {
        return null;
    }
    return Object.freeze({
        macroDeckRef: stringValue(field(deck, 'macro_deck_ref', 'macroDeckRef')),
        sessionDeckRef: stringValue(field(deck, 'session_deck_ref', 'sessionDeckRef')),
        deckOrderHash,
        entropyMode
    });
}

function extractScalarRefKinds(record: Readonly<Record<string, unknown>>): readonly string[] {
    const refs = field(record, 'scalar_refs', 'scalarRefs');
    if (!Array.isArray(refs)) {
        return [];
    }
    const kinds: string[] = [];
    for (const entry of refs) {
        const scalar = asRecord(entry);
        const kind = stringValue(field(scalar, 'ref_kind', 'refKind'));
        if (kind && !kinds.includes(kind)) {
            kinds.push(kind);
        }
    }
    return kinds;
}

function extractInterpretationHandle(record: Readonly<Record<string, unknown>>): string | null {
    const interpretation = asRecord(record.interpretation);
    // Handle-only law: only the handle is read. A raw body field is never
    // surfaced, whatever the producer wrote.
    return stringValue(interpretation?.handle);
}

/**
 * Envelope read-law: unknown payload → indicator. Resolves only when the
 * DR-VAK-1 positions authority is present and non-empty (an envelope without
 * reading positions is unreadable); everything else is preserved when stamped
 * and null/empty when absent — never fabricated.
 */
export function normalizeOracleEnvelopeStamp(input: unknown): NaraOracleEnvelopeIndicator {
    const record = asRecord(input);
    if (!record) {
        return PENDING;
    }
    const cpPositionRefs = extractCpPositionRefs(record);
    if (cpPositionRefs.length === 0) {
        return PENDING;
    }
    return Object.freeze({
        state: 'resolved' as const,
        system: stringValue(record.system),
        oracleFrameRef: stringValue(field(record, 'oracle_frame_ref', 'oracleFrameRef')),
        symbolicProteinRef: stringValue(field(record, 'symbolic_protein_ref', 'symbolicProteinRef')),
        cpPositionRefs,
        csDirection: extractCsDirection(record),
        spreadLabel: stringValue(field(record, 'spread_label', 'spreadLabel')),
        deckContext: extractDeckContext(record),
        sequenceMode: stringValue(field(record, 'sequence_mode', 'sequenceMode')),
        packetRefs: stringArray(field(record, 'packet_refs', 'packetRefs')),
        graphProvenanceHandles: stringArray(
            field(record, 'graph_provenance_handles', 'graphProvenanceHandles')
        ),
        reviewState: stringValue(field(record, 'review_state', 'reviewState')),
        scalarRefKinds: extractScalarRefKinds(record),
        interpretationHandle: extractInterpretationHandle(record)
    });
}

/**
 * DR-VAK-1: reading cardinality comes from the positions authority alone.
 * The spread label is decorative — a stamp labelled `sixfold-ql-traverse`
 * over two positions reads cardinality 2.
 */
export function readingCardinality(stamp: NaraOracleEnvelopeStamp): number {
    return stamp.cpPositionRefs.length;
}

/**
 * §5.11 mutual projectability: which oracle systems this artifact projects
 * into. Requires M3 provenance (an `m3-codon` scalar ref) — without it the
 * artifact projects nowhere. With it, Tarot and I-Ching are mutually legible.
 */
export function projectableSystems(stamp: NaraOracleEnvelopeStamp): readonly string[] {
    if (!stamp.scalarRefKinds.includes('m3-codon')) {
        return [];
    }
    return ['tarot', 'i-ching'];
}
