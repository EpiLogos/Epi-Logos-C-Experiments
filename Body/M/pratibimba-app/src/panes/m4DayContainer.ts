/**
 * Coordinate: M' M4' (DayContainer per-session projection — rerun 25.T25.2)
 * Residency: Body/M/pratibimba-app/src/panes/m4DayContainer.ts
 * Position (#n): #3 — Process; a lived day, read back as the sessions that
 *   actually happened in it
 * Actualises: tranche 25.2's per-session breakdown, carrier-native. The brief
 *   extends a frozen `M4NaraWidget` whose `naraSurface.daySummary.nowLineage`
 *   the carrier has no equivalent of; the carrier's day IS the Present tree
 *   (`Idea/Empty/Present/{day_id}/{sessionId}/now.md`, DR-M4-1), so the lineage
 *   is READ off that tree rather than off a summary object that does not exist.
 *
 *   CHIP LAW, straight from the brief: every chip renders ONLY when its key is
 *   present in the session's own NOW frontmatter. `c_3_klein_weighting` is
 *   delegated to the existing Track-05 reader (one law, never a second parser);
 *   `c_3_briefing_emitted`, `c_3_tranche_mode` and `c_3_response_orbit` are read
 *   here. An absent key is absent — never a default, never a zero.
 *
 *   PRIVACY: this projection carries NAMES, ROLES and PATHS. It never carries a
 *   body, and per UX §6.5 it never carries `q_composed_at_now`, a resonance
 *   vector, or any quaternion field — the surface is a lean lineage, not a
 *   quaternion dump. The brief's `bodySha256` provenance handle came from a
 *   frozen artifact-meta RPC the carrier has no equivalent of; rather than hash
 *   a body this surface must not read, the artifact's own vault path is its
 *   handle, and `provenanceHandle` says which it is.
 * Public surface: M4_DAY_CONTAINER_ARTIFACT_KINDS, M4DayArtifactKind,
 *   M4DaySessionChips, M4DayArtifact, M4DaySession, M4DayContainer,
 *   sessionChipsFromNow, artifactRowFrom, buildDayContainer.
 * Does NOT own: the Klein-weighting law (m4NaraKleinWeighting.ts), the vault
 *   read (Tauri `vault_list` / `vault_read`), the calendar pivot
 *   (DayCalendarPane), or the editor the rows open into.
 * Contract: [[M4'-SPEC]] §6.5 + rerun tranche [[25.T25.2]].
 */

import {
    kleinWeightingFromNowContent,
    pendingKleinWeighting,
    type NaraKleinWeighting
} from './m4NaraKleinWeighting';

/** The kinds the brief names, plus the honest fallback for an unclassified file. */
export const M4_DAY_CONTAINER_ARTIFACT_KINDS = Object.freeze([
    'journal',
    'dream',
    'oracle',
    'reminder',
    'contemplative',
    'agent-chat',
    'now',
    'unclassified'
] as const);

export type M4DayArtifactKind = (typeof M4_DAY_CONTAINER_ARTIFACT_KINDS)[number];

export interface M4DaySessionChips {
    readonly kleinWeighting: NaraKleinWeighting;
    /** ISO stamp Tranche 5.18 writes; null when the key is absent. */
    readonly briefingEmitted: string | null;
    readonly trancheMode: string | null;
    readonly responseOrbit: string | null;
}

export interface M4DayArtifact {
    readonly name: string;
    /** Vault-relative path — also this row's provenance handle. */
    readonly path: string;
    readonly kind: M4DayArtifactKind;
    /** `c_4_artifact_role`, read from the artifact's own frontmatter. */
    readonly role: string | null;
    /** `t_4_kairos_context` chip, e.g. `[[Kairos]]`; null when absent. */
    readonly kairosContext: string | null;
    readonly provenanceHandle: 'vault-path';
}

export interface M4DaySession {
    readonly sessionKey: string;
    readonly nowPath: string;
    readonly chips: M4DaySessionChips;
    readonly artifacts: readonly M4DayArtifact[];
}

export interface M4DayContainer {
    readonly dayId: string;
    readonly sessions: readonly M4DaySession[];
    /** Files that live at the day root rather than inside a session. */
    readonly dayArtifacts: readonly M4DayArtifact[];
    /** Never true on this surface — asserted by the privacy invariant test. */
    readonly protectedBodiesRendered: false;
}

/** A `vault_list` row, narrowed to what the projection needs. */
export interface DayTreeEntry {
    readonly name: string;
    readonly path: string;
    readonly isDir: boolean;
}

function frontmatterBlock(content: unknown): string[] | null {
    if (typeof content !== 'string') {
        return null;
    }
    const lines = content.split(/\r?\n/);
    if (lines[0]?.trim() !== '---') {
        return null;
    }
    const end = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
    return end === -1 ? null : lines.slice(1, end);
}

/** Scalar read: `key: value`, quotes stripped. Absent stays absent. */
function scalar(lines: readonly string[] | null, key: string): string | null {
    if (!lines) {
        return null;
    }
    const pattern = new RegExp(`^${key}:\\s*(.*)$`);
    for (const line of lines) {
        const match = pattern.exec(line);
        if (!match) {
            continue;
        }
        const raw = match[1].trim().replace(/^["']|["']$/g, '');
        return raw.length > 0 ? raw : null;
    }
    return null;
}

/**
 * The per-session chips, read from that session's own now.md. Every chip is
 * independently optional: a session that never had a briefing emitted simply
 * has no briefing chip.
 */
export function sessionChipsFromNow(content: unknown, nowPath: string | null = null): M4DaySessionChips {
    const lines = frontmatterBlock(content);
    return Object.freeze({
        kleinWeighting:
            typeof content === 'string'
                ? kleinWeightingFromNowContent(content, nowPath)
                : pendingKleinWeighting(nowPath),
        briefingEmitted: scalar(lines, 'c_3_briefing_emitted'),
        trancheMode: scalar(lines, 'c_3_tranche_mode'),
        responseOrbit: scalar(lines, 'c_3_response_orbit')
    });
}

/**
 * Classify one artifact from its OWN frontmatter. The kind comes from
 * `c_4_artifact_role` when the file declares one; a file that declares nothing
 * is `unclassified` (a `now.md` is the one structural exception — the session
 * NOW is what it is by position in the tree, not by declaration). Nothing is
 * guessed from a filename: the vault names files freely and a guess here would
 * read as a claim about the artifact's role.
 */
export function artifactRowFrom(
    entry: DayTreeEntry,
    content: unknown = null
): M4DayArtifact {
    const lines = frontmatterBlock(content);
    const role = scalar(lines, 'c_4_artifact_role');
    const declared = role && (M4_DAY_CONTAINER_ARTIFACT_KINDS as readonly string[]).includes(role);
    const kind: M4DayArtifactKind = entry.name === 'now.md'
        ? 'now'
        : declared
          ? (role as M4DayArtifactKind)
          : 'unclassified';
    return Object.freeze({
        name: entry.name,
        path: entry.path,
        kind,
        role,
        kairosContext: scalar(lines, 't_4_kairos_context'),
        provenanceHandle: 'vault-path' as const
    });
}

export interface DaySessionSource {
    readonly sessionKey: string;
    readonly nowPath: string;
    readonly nowContent: unknown;
    readonly entries: readonly DayTreeEntry[];
    /** Artifact content by path, for the rows whose frontmatter was read. */
    readonly contentByPath?: Readonly<Record<string, unknown>>;
}

/**
 * Fold a lived day into its sessions. Session order is the tree's own
 * (datetime-prefixed session ids sort chronologically); artifacts keep the
 * order the vault listed them in.
 */
export function buildDayContainer(
    dayId: string,
    sessions: readonly DaySessionSource[],
    dayEntries: readonly DayTreeEntry[] = [],
    dayContentByPath: Readonly<Record<string, unknown>> = {}
): M4DayContainer {
    return Object.freeze({
        dayId,
        sessions: Object.freeze(
            [...sessions]
                .sort((a, b) => a.sessionKey.localeCompare(b.sessionKey))
                .map(session =>
                    Object.freeze({
                        sessionKey: session.sessionKey,
                        nowPath: session.nowPath,
                        chips: sessionChipsFromNow(session.nowContent, session.nowPath),
                        artifacts: Object.freeze(
                            session.entries
                                .filter(entry => !entry.isDir)
                                .map(entry =>
                                    artifactRowFrom(entry, session.contentByPath?.[entry.path] ?? null)
                                )
                        )
                    })
                )
        ),
        dayArtifacts: Object.freeze(
            dayEntries
                .filter(entry => !entry.isDir)
                .map(entry => artifactRowFrom(entry, dayContentByPath[entry.path] ?? null))
        ),
        protectedBodiesRendered: false as const
    });
}
