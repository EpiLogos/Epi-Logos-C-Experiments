/**
 * Coordinate: M' M4' (journal timeline read — Track 25.T25.3)
 * Residency: Body/M/pratibimba-app/src/panes/journalTimeline.ts
 * Actualises: the `nara.journal.timeline` consumer — a fail-closed parse of
 *   the NOW-inscription rows (day id, NOW timestamp, session key, artifact
 *   KINDS), the 8-char session-key short prefix, and the kind-icon glyphs.
 *   A mis-shaped reply refuses rather than inventing inscriptions; a kind
 *   outside the M4 day-container register renders as `unclassified` while
 *   keeping its declared name visible.
 * Public surface: JOURNAL_TIMELINE_METHOD, JOURNAL_TIMELINE_DAY_RANGE,
 *   JournalTimelineRow, JournalTimelineRead, parseJournalTimeline,
 *   shortSessionKey, journalKindIcon, sessionNowVaultPath.
 * Does NOT own: the timeline producer (epi-cli gate/nara.rs — the Present
 *   day law lives there); the day-container kind register (m4DayContainer).
 */

import { M4_DAY_CONTAINER_ARTIFACT_KINDS } from './m4DayContainer';

export const JOURNAL_TIMELINE_METHOD = 'nara.journal.timeline';
/** The spec's bound: last 30 days, enforced producer-side and named here. */
export const JOURNAL_TIMELINE_DAY_RANGE = 30;

export interface JournalTimelineRow {
    readonly day: string;
    readonly nowTimestamp: string;
    readonly sessionKey: string;
    readonly artifactKinds: readonly string[];
}

export type JournalTimelineRead =
    | { readonly kind: 'read'; readonly rows: readonly JournalTimelineRow[] }
    | { readonly kind: 'refused'; readonly reason: string };

const KIND_GLYYPH_FALLBACK = '·';

/** Kind → glyph, over the day-container register (declared kinds only). */
const KIND_GLYPHS: Readonly<Record<string, string>> = Object.freeze({
    now: '◉',
    journal: '✎',
    dream: '☾',
    oracle: '✦',
    reminder: '⌛',
    contemplative: '◈',
    'agent-chat': '⇄',
    unclassified: KIND_GLYYPH_FALLBACK
});

export function journalKindIcon(kind: string): string {
    const declared = (M4_DAY_CONTAINER_ARTIFACT_KINDS as readonly string[]).includes(kind)
        ? kind
        : 'unclassified';
    return KIND_GLYPHS[declared] ?? KIND_GLYYPH_FALLBACK;
}

/** The session-key short prefix the spec's row carries — 8-char tail (the
 *  random suffix), which is the discriminating part of a datetime-keyed id. */
export function shortSessionKey(sessionKey: string): string {
    return sessionKey.length <= 8 ? sessionKey : sessionKey.slice(-8);
}

/** The vault path a row's click opens — the session's own NOW inscription. */
export function sessionNowVaultPath(row: JournalTimelineRow): string {
    return `Empty/Present/${row.day}/${row.sessionKey}/now.md`;
}

function readRow(value: unknown): JournalTimelineRow | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return null;
    }
    const record = value as Record<string, unknown>;
    const day = typeof record.day === 'string' && record.day.length > 0 ? record.day : null;
    const nowTimestamp =
        typeof record.nowTimestamp === 'string' && record.nowTimestamp.length > 0
            ? record.nowTimestamp
            : null;
    const sessionKey =
        typeof record.sessionKey === 'string' && record.sessionKey.length > 0
            ? record.sessionKey
            : null;
    const kindsRaw = record.artifactKinds;
    const artifactKinds = Array.isArray(kindsRaw)
        ? kindsRaw.filter((k): k is string => typeof k === 'string' && k.length > 0)
        : null;
    if (
        day === null ||
        nowTimestamp === null ||
        sessionKey === null ||
        artifactKinds === null ||
        (Array.isArray(kindsRaw) && artifactKinds.length !== kindsRaw.length)
    ) {
        return null;
    }
    return Object.freeze({ day, nowTimestamp, sessionKey, artifactKinds: Object.freeze(artifactKinds) });
}

/**
 * Fail-closed parse of the `nara.journal.timeline` reply. The producer's
 * ordering (newest-first) is PRESERVED, never re-derived — the month-first
 * day id does not sort lexically and re-sorting here would silently disagree
 * with the one date-aware sort the producer owns.
 */
export function parseJournalTimeline(artifact: unknown): JournalTimelineRead {
    if (!artifact || typeof artifact !== 'object' || Array.isArray(artifact)) {
        return { kind: 'refused', reason: 'timeline reply is not an object' };
    }
    const record = artifact as Record<string, unknown>;
    if (!Array.isArray(record.rows)) {
        return { kind: 'refused', reason: 'timeline reply carries no rows list' };
    }
    const rows: JournalTimelineRow[] = [];
    for (const raw of record.rows) {
        const row = readRow(raw);
        if (row === null) {
            return { kind: 'refused', reason: 'a timeline row is mis-shaped' };
        }
        rows.push(row);
    }
    return { kind: 'read', rows: Object.freeze(rows) };
}
