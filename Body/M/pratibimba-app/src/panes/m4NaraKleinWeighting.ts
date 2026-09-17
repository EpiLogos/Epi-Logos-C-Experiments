/**
 * Coordinate: M' M4' (Klein weighting chip law — Track 05.T5.15)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: M4'-SPEC §6.5 Klein-weighting-chip clause — the
 *   prospective/retrospective weight read from `c_3_klein_weighting` in the
 *   session NOW frontmatter (canvas-spec §3.1: both senses in [0,1],
 *   prospective + retrospective = 1.0). Prospective = forward into what is
 *   forming; retrospective = backward across what has gathered; the two are
 *   senses of sight on every Klein point, `#` inversion is the sense-switch.
 *   Absent, empty, or malformed frontmatter NEVER fabricates a weighting —
 *   it resolves to the honest `pending-weighting` state (the default
 *   computation is Janus's law, canvas-spec §4.3, and enters only through
 *   the frontmatter it persists).
 * Public surface: kleinWeightingFromNowContent, latestSessionNowPath,
 *   pendingKleinWeighting; NaraKleinWeighting, SessionDirEntry.
 * Does NOT own: the weighting computation (Janus, S4-5'), NOW frontmatter
 *   authorship (Khora session law), vault IO (vault service),
 *   rendering (M4NaraResonanceSurface.tsx NaraKleinWeightingChip).
 */

export interface NaraKleinWeighting {
    readonly state: 'resolved' | 'pending-weighting';
    readonly prospective: number | null;
    readonly retrospective: number | null;
    /** Vault-relative path of the session now.md the weighting was read from. */
    readonly sourcePath: string | null;
    readonly label: string;
}

/** The vault_list entry subset the session-NOW locator needs. */
export interface SessionDirEntry {
    readonly name: string;
    readonly path: string;
    readonly isDir: boolean;
}

const PENDING: NaraKleinWeighting = Object.freeze({
    state: 'pending-weighting' as const,
    prospective: null,
    retrospective: null,
    sourcePath: null,
    label: 'pending-weighting'
});

export function pendingKleinWeighting(sourcePath: string | null = null): NaraKleinWeighting {
    return sourcePath === null ? PENDING : Object.freeze({ ...PENDING, sourcePath });
}

/** Session-NOW folders are datetime-prefixed `YYYYMMDD-HHmmss-{sessionId}`
 *  (day/NOW law) — lexicographic order IS chronological order. */
const SESSION_DIR_PATTERN = /^\d{8}-\d{6}-/;

/**
 * Locate the day's latest session `now.md` from the day folder's entries.
 * Returns null when no session folder exists — the honest no-session state.
 */
export function latestSessionNowPath(entries: readonly SessionDirEntry[]): string | null {
    const sessionDirs = entries
        .filter(entry => entry.isDir && SESSION_DIR_PATTERN.test(entry.name))
        .map(entry => entry.path)
        .sort();
    const latest = sessionDirs[sessionDirs.length - 1];
    return latest === undefined ? null : `${latest}/now.md`;
}

const WEIGHTING_TOLERANCE = 0.001;

function finiteUnitInterval(value: number | null): number | null {
    return value !== null && Number.isFinite(value) && value >= 0 && value <= 1 ? value : null;
}

function parseYamlNumber(raw: string): number | null {
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
        return null;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
}

/** Extract the frontmatter lines of a markdown document (between the leading
 *  `---` fence and its closing fence). Null when no frontmatter block opens
 *  the document. */
function frontmatterLines(content: string): readonly string[] | null {
    const lines = content.split(/\r?\n/);
    if (lines[0]?.trim() !== '---') {
        return null;
    }
    const body: string[] = [];
    for (const line of lines.slice(1)) {
        if (line.trim() === '---') {
            return body;
        }
        body.push(line);
    }
    return null; // unterminated fence — not a frontmatter block
}

/**
 * Frontmatter law: read `c_3_klein_weighting` (block mapping with
 * `prospective:` / `retrospective:` children, per the NOW template) out of a
 * session now.md's raw content. Partial, empty, out-of-range, or
 * non-complementary (sum ≠ 1.0) stamps resolve to `pending-weighting` —
 * a weighting is never fabricated.
 */
export function kleinWeightingFromNowContent(
    content: unknown,
    sourcePath: string | null = null
): NaraKleinWeighting {
    if (typeof content !== 'string') {
        return pendingKleinWeighting(sourcePath);
    }
    const lines = frontmatterLines(content);
    if (lines === null) {
        return pendingKleinWeighting(sourcePath);
    }
    const keyIndex = lines.findIndex(line => /^c_3_klein_weighting:\s*$/.test(line));
    if (keyIndex === -1) {
        return pendingKleinWeighting(sourcePath);
    }
    let prospective: number | null = null;
    let retrospective: number | null = null;
    for (const line of lines.slice(keyIndex + 1)) {
        if (!/^\s/.test(line)) {
            break; // next top-level key ends the block mapping
        }
        const child = line.match(/^\s+(prospective|retrospective):(.*)$/);
        if (!child) {
            continue;
        }
        const value = parseYamlNumber(child[2]);
        if (child[1] === 'prospective') {
            prospective = value;
        } else {
            retrospective = value;
        }
    }
    prospective = finiteUnitInterval(prospective);
    retrospective = finiteUnitInterval(retrospective);
    if (
        prospective === null ||
        retrospective === null ||
        Math.abs(prospective + retrospective - 1) > WEIGHTING_TOLERANCE
    ) {
        return pendingKleinWeighting(sourcePath);
    }
    return Object.freeze({
        state: 'resolved' as const,
        prospective,
        retrospective,
        sourcePath,
        label: `${Math.round(prospective * 100)}% prospective · ${Math.round(retrospective * 100)}% retrospective`
    });
}
