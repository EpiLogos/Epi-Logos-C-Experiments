/**
 * Coordinate: M4' Dream Journal — the protected-local flow law (rerun 51.T51.6)
 * Residency: Body/M/pratibimba-app/src/panes/dreamJournal/dreamJournal.ts
 * Position (#n): #4 — Context: a lived-flow artifact in its day container.
 * Actualises: [[M4'-SPEC]]'s User-Facing Surface — "Daily Note, **Dream
 *   Journal**, Oracle, and Highlight surfaces over one protected local flow
 *   substrate." Daily Note, Oracle and Highlight were all built; Dream Journal
 *   was named in the same breath and scheduled nowhere, which is how it went
 *   missing.
 *
 *   IT IS THE SAME SUBSTRATE, NOT A PARALLEL ONE. `dream` is ALREADY a declared
 *   kind of `M4_DAY_CONTAINER_ARTIFACT_KINDS` — the day container has always
 *   known how to classify a dream artifact and nothing ever wrote one. So this
 *   module writes into the existing day container under the existing
 *   `c_4_artifact_role` law, and the classification is imported rather than
 *   restated: a dream is a dream because the day container says that role
 *   exists, not because this file asserts it.
 *
 *   THE PRIVACY LAW IS EGRESS, NOT DECORATION. Per M4', dream content is
 *   private local flow: it must not reach public graph surfaces, and playback
 *   may replay only safe profile handles. A tint on the pane is not that law —
 *   the law is that nothing carrying the BODY may leave. So the only thing
 *   this module will hand outward is a `DreamHandle` (path, day, session,
 *   created-at, title-length), and `containsDreamBody` exists so the guard can
 *   be asserted over a real outbound payload rather than trusted. The body has
 *   exactly one legitimate destination: the vault file itself, under the
 *   `Empty/Present/` write scope the S1 seam already enforces.
 * Public surface: DREAM_ARTIFACT_ROLE, DREAM_PRIVACY_CLASS,
 *   DREAM_HANDLE_PRIVACY_CLASS, DreamEntry, DreamHandle, dreamFileName,
 *   dreamPathFor, buildDreamDocument, parseDreamDocument, dreamHandleFor,
 *   containsDreamBody, isDreamPathInWriteScope.
 * Does NOT own: the day-container projection (`panes/m4DayContainer.ts` — the
 *   artifact-kind register is imported from there), the vault seam
 *   (`src-tauri/src/vault.rs` enforces the write scope), the privacy tint
 *   register (`ui/privacyChrome.ts`), or the rendering.
 * Contract: [[M4'-SPEC]] (User-Facing Surface + privacy law) · rerun tranche
 *   [[51.T51.6]].
 */

import { M4_DAY_CONTAINER_ARTIFACT_KINDS, type M4DayArtifactKind } from '../m4DayContainer';

/** The day-container role a dream artifact declares. Taken FROM the register
 *  so a dream cannot be a kind the container does not know. */
export const DREAM_ARTIFACT_ROLE: M4DayArtifactKind = (() => {
    const role = M4_DAY_CONTAINER_ARTIFACT_KINDS.find(kind => kind === 'dream');
    if (!role) {
        throw new Error('the day container declares no `dream` artifact kind');
    }
    return role;
})();

/** Dream content is private local flow. */
export const DREAM_PRIVACY_CLASS = 'protected_local' as const;

/** What a dream may be referred to as ANYWHERE else. */
export const DREAM_HANDLE_PRIVACY_CLASS = 'protected_local_handle_only' as const;

/** The S1 write scope (`src-tauri/src/vault.rs::WRITE_SCOPE_PREFIX`). */
const WRITE_SCOPE_PREFIX = 'Empty/Present/';

export interface DreamEntry {
    readonly path: string;
    readonly dayId: string;
    readonly sessionKey: string | null;
    readonly createdAt: string;
    readonly title: string;
    /** The dream itself. PRIVATE LOCAL FLOW — never leaves this surface. */
    readonly body: string;
}

/**
 * The ONLY shape of a dream that may cross out of the M4' surface. It carries
 * no body and no title text — a length, so a list can show that something is
 * there without saying what.
 */
export interface DreamHandle {
    readonly kind: 'dream-handle';
    readonly privacyClass: typeof DREAM_HANDLE_PRIVACY_CLASS;
    readonly path: string;
    readonly dayId: string;
    readonly sessionKey: string | null;
    readonly createdAt: string;
    readonly titleLength: number;
    readonly bodyLength: number;
}

/** `dream-HHmmss.md` — datetime-prefixed, no counters (the day-path law). */
export function dreamFileName(createdAt: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');
    return `dream-${pad(createdAt.getHours())}${pad(createdAt.getMinutes())}${pad(
        createdAt.getSeconds()
    )}.md`;
}

/** The vault path of a dream inside its day container (session folder when a
 *  session is live, day root otherwise). Always inside the S1 write scope. */
export function dreamPathFor(
    dayId: string,
    sessionKey: string | null,
    fileName: string
): string {
    const base = `${WRITE_SCOPE_PREFIX}${dayId}`;
    return sessionKey ? `${base}/${sessionKey}/${fileName}` : `${base}/${fileName}`;
}

/** The write seam refuses anything outside `Empty/Present/`; assert it here so
 *  a bad path fails in this module rather than as a sidecar error string. */
export function isDreamPathInWriteScope(path: string): boolean {
    return path.startsWith(WRITE_SCOPE_PREFIX) && !path.includes('..');
}

function escapeScalar(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ');
}

/**
 * The dream document: `c_n_*` frontmatter under the C-family law the sibling
 * surfaces use (C2 = Entity/session, C3 = Process/time, C4 = Type/role,
 * C5 = Integration/privacy), plus the one surviving non-C key the day
 * container already reads (`t_4_kairos_context`).
 */
export function buildDreamDocument(input: {
    readonly dayId: string;
    readonly sessionKey: string | null;
    readonly createdAt: string;
    readonly title: string;
    readonly body: string;
}): string {
    const lines = [
        '---',
        `c_4_artifact_role: ${DREAM_ARTIFACT_ROLE}`,
        `c_3_day_id: "${escapeScalar(input.dayId)}"`,
        `c_3_created_at: "${escapeScalar(input.createdAt)}"`,
        ...(input.sessionKey ? [`c_2_session_id: "${escapeScalar(input.sessionKey)}"`] : []),
        `c_5_privacy_class: ${DREAM_PRIVACY_CLASS}`,
        't_4_kairos_context: "[[Kairos]]"',
        '---',
        '',
        `# ${input.title || 'Dream'}`,
        '',
        input.body.trimEnd(),
        ''
    ];
    return lines.join('\n');
}

function frontmatterScalar(block: string, key: string): string | null {
    const match = new RegExp(`^${key}:\\s*(?:"([^"]*)"|(.*))$`, 'm').exec(block);
    if (!match) {
        return null;
    }
    const value = (match[1] ?? match[2] ?? '').trim();
    return value.length > 0 ? value : null;
}

/** Read a dream document back. Returns null when the file is not a dream —
 *  the role is the discriminator, never the filename. */
export function parseDreamDocument(
    path: string,
    content: string
): DreamEntry | null {
    const match = /^---\n([\s\S]*?)\n---\n?/.exec(content);
    if (!match) {
        return null;
    }
    const block = match[1];
    if (frontmatterScalar(block, 'c_4_artifact_role') !== DREAM_ARTIFACT_ROLE) {
        return null;
    }
    const rest = content.slice(match[0].length);
    const heading = /^#\s+(.*)$/m.exec(rest);
    const body = heading ? rest.slice(rest.indexOf(heading[0]) + heading[0].length) : rest;
    return Object.freeze({
        path,
        dayId: frontmatterScalar(block, 'c_3_day_id') ?? '',
        sessionKey: frontmatterScalar(block, 'c_2_session_id'),
        createdAt: frontmatterScalar(block, 'c_3_created_at') ?? '',
        title: heading ? heading[1].trim() : 'Dream',
        body: body.trim()
    });
}

/**
 * The handle — the only representation of a dream permitted to leave the
 * surface. Deliberately constructed field-by-field rather than by omitting
 * keys from a spread: a spread that gained a field later would leak it.
 */
export function dreamHandleFor(entry: DreamEntry): DreamHandle {
    return Object.freeze({
        kind: 'dream-handle' as const,
        privacyClass: DREAM_HANDLE_PRIVACY_CLASS,
        path: entry.path,
        dayId: entry.dayId,
        sessionKey: entry.sessionKey,
        createdAt: entry.createdAt,
        titleLength: entry.title.length,
        bodyLength: entry.body.length
    });
}

/**
 * True when `candidate` carries any of the dream's private text. The guard the
 * privacy law is actually made of: a test (or a caller about to emit) can run
 * a real outbound payload through this instead of trusting that nothing leaks.
 * Word-level rather than whole-string, because a partial quotation of a dream
 * is still the dream.
 */
export function containsDreamBody(candidate: unknown, entry: DreamEntry): boolean {
    const haystack = typeof candidate === 'string' ? candidate : JSON.stringify(candidate ?? '');
    if (!haystack) {
        return false;
    }
    const needles = [entry.body, entry.title]
        .join(' ')
        .split(/\s+/)
        .map(word => word.replace(/[^\p{L}\p{N}_-]/gu, ''))
        // Short tokens are not evidence of a leak — they collide with ordinary
        // protocol vocabulary and would make the guard cry wolf.
        .filter(word => word.length >= 6);
    return needles.some(word => haystack.includes(word));
}
