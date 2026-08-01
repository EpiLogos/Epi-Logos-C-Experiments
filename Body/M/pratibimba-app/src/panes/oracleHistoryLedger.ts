/**
 * Coordinate: M' M4' (oracle cast-ledger projection — rerun 25.T25.9)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): #1 — the typed shape of the oracle history READ.
 * Actualises: the strict parse of what `nara.oracle.history` and
 *   `nara.oracle.hygiene` REALLY answer.
 *
 *   THE WIRE IS TEXT, AND THAT IS THE POINT OF PARSING IT HERE. Both methods
 *   route through `cli_to_rpc` (`Body/S/S0/epi-cli/src/gate/nara.rs:51`),
 *   which tries JSON and otherwise wraps the CLI's own stdout as
 *   `{result: "<text>"}`. `oracle_route::show_history` renders the LAST TEN
 *   entries, newest first, as `  #<castId> [<system>] <question…> — <hygiene>`;
 *   `show_hygiene` renders `Casts today: n/6` and, for the most recent cast
 *   only, `Last cast: n minutes ago`. Parsing is fail-closed: a line that does
 *   not match is not a row, and an unparseable reply is a refusal — a viewer
 *   that guessed would invent casts nobody made.
 *
 *   WHAT THIS WIRE CANNOT SAY, AND THEREFORE WHAT THE VIEWER MUST NOT CLAIM.
 *   The ledger carries no per-entry timestamp (`show_history` drops `cast_at`),
 *   so the 4h decay window is computable for the MOST RECENT cast only, from
 *   the hygiene line's minutes-ago. Every older row's decay state is `unknown`
 *   here, and the 5.17 `OracleSpreadPosition` aliveness join the brief asks
 *   for has no wire at all. Both are reported as absent rather than painted.
 * Public surface: ORACLE_DECAY_WINDOW_MINUTES, OracleLedgerRow,
 *   OracleLedgerRead, OracleHygieneRead, oracleModality, parseOracleHistory,
 *   parseOracleHygiene, decayStateFor.
 * Does NOT own: the ledger itself (epi-cli `nara/oracle_route.rs`), the cast
 *   (S3 `nara.oracle.cast`), or the day deposition (src-tauri/src/oracle.rs).
 * Contract: design-recon 25-m4-nara-frontend-deep.md §25.9.
 */

/** MEMORY.md M4 canonical: the oracle's aliveness window is 4 hours. */
export const ORACLE_DECAY_WINDOW_MINUTES = 240;

export type OracleModality = 'i-ching' | 'tarot';

/** What the ledger can honestly say about a row's aliveness. */
export type OracleDecayState = 'open' | 'closed' | 'unknown';

export interface OracleLedgerRow {
    readonly castId: number;
    /** The raw system token the CLI recorded (`iching`, `rws`, `thoth`, …). */
    readonly system: string;
    readonly modality: OracleModality;
    /** The CLI truncates to 40 chars — this is the user's own question, never
     *  an interpretation body. */
    readonly questionPrefix: string;
    readonly hygiene: string;
}

export type OracleLedgerRead =
    | { readonly kind: 'ledger'; readonly declaredCount: number; readonly rows: readonly OracleLedgerRow[] }
    | { readonly kind: 'empty' }
    | { readonly kind: 'refused'; readonly reason: string };

export interface OracleHygieneRead {
    readonly castsToday: number | null;
    readonly dailyLimit: number | null;
    /** Present only when the ledger has at least one cast. */
    readonly lastCastMinutesAgo: number | null;
}

/** The four tarot decks the CLI admits, plus i-ching (live probe 2026-07-02). */
const TAROT_SYSTEMS = new Set(['rws', 'thoth', 'marseille', 'ql']);

export function oracleModality(system: string): OracleModality {
    return system.startsWith('iching') ? 'i-ching' : 'tarot';
}

/** True when the recorded system is one the CLI actually casts. */
export function isKnownOracleSystem(system: string): boolean {
    return system.startsWith('iching') || TAROT_SYSTEMS.has(system);
}

function textOf(artifact: unknown): string | null {
    if (typeof artifact === 'string') {
        return artifact;
    }
    if (artifact && typeof artifact === 'object') {
        const result = (artifact as { result?: unknown }).result;
        if (typeof result === 'string') {
            return result;
        }
    }
    return null;
}

/** `  #4 [rws] what turns now? — clear` */
const ROW = /^\s*#(\d+)\s+\[([^\]]+)\]\s+(.*?)\s+—\s+(\S+)\s*$/;
const HEADER = /^Oracle History \((\d+) casts?\)/;

/**
 * Parse `nara.oracle.history`. The CLI already emits newest-first
 * (`entries.iter().rev().take(10)`), so row order is PRESERVED — re-sorting on
 * a cast_id the ledger might not order by would be the consumer inventing an
 * ordering law the producer never stated.
 */
export function parseOracleHistory(artifact: unknown): OracleLedgerRead {
    const text = textOf(artifact);
    if (text === null) {
        return { kind: 'refused', reason: 'nara.oracle.history answered with no text' };
    }
    const trimmed = text.trim();
    if (trimmed === 'No oracle history.') {
        return { kind: 'empty' };
    }
    const lines = trimmed.split('\n');
    const header = HEADER.exec(lines[0] ?? '');
    if (!header) {
        return {
            kind: 'refused',
            reason: `unrecognised ledger header: ${JSON.stringify((lines[0] ?? '').slice(0, 60))}`
        };
    }
    const rows: OracleLedgerRow[] = [];
    for (const line of lines.slice(1)) {
        if (!line.trim()) {
            continue;
        }
        const match = ROW.exec(line);
        if (!match) {
            return { kind: 'refused', reason: `unrecognised ledger row: ${JSON.stringify(line.slice(0, 60))}` };
        }
        const system = match[2];
        rows.push({
            castId: Number(match[1]),
            system,
            modality: oracleModality(system),
            questionPrefix: match[3],
            hygiene: match[4]
        });
    }
    return { kind: 'ledger', declaredCount: Number(header[1]), rows };
}

const CASTS_TODAY = /Casts today:\s*(\d+)\s*\/\s*(\d+)/;
const LAST_CAST = /Last cast:\s*(\d+)\s*minutes? ago/;

export function parseOracleHygiene(artifact: unknown): OracleHygieneRead {
    const text = textOf(artifact) ?? '';
    const today = CASTS_TODAY.exec(text);
    const last = LAST_CAST.exec(text);
    return {
        castsToday: today ? Number(today[1]) : null,
        dailyLimit: today ? Number(today[2]) : null,
        lastCastMinutesAgo: last ? Number(last[1]) : null
    };
}

/**
 * The decay state a row can HONESTLY carry.
 *
 * Only the newest row has a timestamp on this wire (the hygiene line's
 * minutes-ago), so only it resolves to open/closed. Everything older is
 * `unknown` — not `closed`, which would be a guess that happens to be right
 * most of the time and is therefore the worst kind of wrong.
 */
export function decayStateFor(
    rowIndex: number,
    hygiene: OracleHygieneRead
): OracleDecayState {
    if (rowIndex !== 0 || hygiene.lastCastMinutesAgo === null) {
        return 'unknown';
    }
    return hygiene.lastCastMinutesAgo < ORACLE_DECAY_WINDOW_MINUTES ? 'open' : 'closed';
}
