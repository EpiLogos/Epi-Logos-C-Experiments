/**
 * Coordinate: M' M0' (Canon Studio reading model — 28.T28.4)
 * Residency: Body/M/pratibimba-app/src/panes/canonStudio.ts
 * Position (#n): pure text→mark/query model beneath the editor surface
 * Actualises: the Canon Studio deepening of the canonical READ half — the
 *   QL/bimba mark scan the editor decorates with, the `[[` completion context
 *   the Smart-Connections source answers, the S1 typology receipt the
 *   frontmatter fold discloses, and the PASU note identity that routes the
 *   governed identity write to its own wizard.
 * Public surface: CanonMark, scanCanonMarks, wikilinkContextAt,
 *   semanticCompletionOptions, parseCLayerTypology, isPasuNote, PASU_NOTE_PATH.
 * Does NOT own: semantic scoring or indexing (S1 Hen, `s1'.semantic.suggest_links`),
 *   the C-layer typology law (S1 Hen, `s1'.type.classify_c_layer`, DR-S1-5),
 *   frontmatter key law (S1 `hen-compiler-core::validate_frontmatter`),
 *   coordinate family/grade law (`ui/tokens.ts`), or any vault write.
 * Contract: [[S1-SPEC]] / [[M'-SYSTEM-SPEC]]; rerun tranche [[28.T28.4]];
 *   CHROME-CONTRACT §2 (`editor` = canon-studio read half) + §4 (governance flow).
 */

import { coordinateFamilyGrade } from '../ui/tokens';
import { isPrivacySafe } from '../ui/privacyGate';
import type { SemanticCandidate, SemanticConnectionsResponse } from './semanticConnections';

/** The two things a canonical note says structurally: where it sits (a
 *  coordinate) and what it reaches (a wikilink). Frontmatter keys are not a
 *  mark kind here — the carrier splits frontmatter out of the writing surface
 *  (`splitFrontmatter`), so key law is disclosed in the fold, not inline. */
export type CanonMarkKind = 'ql-coordinate' | 'bimba-wikilink';

export interface CanonMark {
    readonly kind: CanonMarkKind;
    /** Absolute offset of the first character of the mark. */
    readonly from: number;
    /** Absolute offset one past the last character of the mark. */
    readonly to: number;
    /** The matched source text (`[[Hen]]`, `M4-3`). */
    readonly text: string;
}

/** `[[Anything but a closing bracket]]`, including the brackets. */
const WIKILINK = /\[\[([^\[\]\n]*)\]\]/g;

/**
 * A canonical coordinate token: an UPPERCASE family letter, an archetype digit,
 * an optional inversion mark, then any number of `-`/`.` numeric branches (each
 * optionally inverted). Case is significant — `p0_grounds` is a frontmatter key,
 * not the P0 coordinate, and only the uppercase form is canonical.
 */
const COORDINATE = /[PSTMLC][0-5]'?(?:[-.][0-9]+'?)*/g;

/** True when `index` falls inside any [from,to) range. */
function within(ranges: readonly CanonMark[], index: number): boolean {
    return ranges.some(range => index >= range.from && index < range.to);
}

/**
 * Scan a document body for the marks the Canon Studio editor decorates.
 * Wikilinks win over coordinates: a coordinate inside `[[S1]]` is part of the
 * link, and CodeMirror rejects overlapping mark decorations. Marks come back
 * sorted by `from`, which is the order the decoration builder requires.
 */
export function scanCanonMarks(text: string): CanonMark[] {
    const links: CanonMark[] = [];
    WIKILINK.lastIndex = 0;
    for (let match = WIKILINK.exec(text); match !== null; match = WIKILINK.exec(text)) {
        links.push({
            kind: 'bimba-wikilink',
            from: match.index,
            to: match.index + match[0].length,
            text: match[0]
        });
    }

    const marks: CanonMark[] = [...links];
    COORDINATE.lastIndex = 0;
    for (let match = COORDINATE.exec(text); match !== null; match = COORDINATE.exec(text)) {
        if (within(links, match.index)) {
            continue;
        }
        // A coordinate token must not be glued to a surrounding word: `M4` in
        // `TM4x` is not a coordinate. The family/grade law itself stays in
        // ui/tokens.ts — this only decides where a token begins and ends.
        const before = match.index > 0 ? text[match.index - 1] : '';
        const after = text[match.index + match[0].length] ?? '';
        if (/[A-Za-z0-9_]/.test(before) || /[A-Za-z0-9_]/.test(after)) {
            continue;
        }
        if (!coordinateFamilyGrade(match[0])) {
            continue;
        }
        marks.push({
            kind: 'ql-coordinate',
            from: match.index,
            to: match.index + match[0].length,
            text: match[0]
        });
    }

    return marks.sort((left, right) => left.from - right.from);
}

export interface WikilinkContext {
    /** Text typed after `[[`, possibly empty. */
    readonly query: string;
    /** Offset where the replacement begins (just after `[[`). */
    readonly from: number;
    /** Offset where the replacement ends (the cursor). */
    readonly to: number;
}

/**
 * The completion context at `pos`: an unclosed `[[` on the same line with the
 * cursor inside it. Returns null anywhere else — Smart Connections answers
 * wikilink authoring, not every keystroke.
 */
export function wikilinkContextAt(text: string, pos: number): WikilinkContext | null {
    const lineStart = text.lastIndexOf('\n', pos - 1) + 1;
    const prefix = text.slice(lineStart, pos);
    const open = prefix.lastIndexOf('[[');
    if (open === -1) {
        return null;
    }
    const query = prefix.slice(open + 2);
    if (query.includes(']]') || query.includes('[')) {
        return null;
    }
    return { query, from: lineStart + open + 2, to: pos };
}

export interface CanonCompletionOption {
    readonly label: string;
    readonly detail: string;
    readonly info: string;
    /** Score as returned by S1 — carried so the editor orders by S1's ranking. */
    readonly boost: number;
}

/**
 * Project an `s1'.semantic.suggest_links` response into completion options for
 * the `[[` context. Two gates, both S1's own words: a candidate whose privacy
 * class is not safe never reaches the DOM, and only candidates whose wikilink
 * title carries the typed query are offered. Ordering is S1's score.
 */
export function semanticCompletionOptions(
    response: SemanticConnectionsResponse,
    query: string
): CanonCompletionOption[] {
    const needle = query.trim().toLowerCase();
    return response.candidates
        .filter((candidate: SemanticCandidate) => isPrivacySafe(candidate.privacyClass))
        .filter(candidate => needle.length === 0 || candidate.wikilinkTitle.toLowerCase().includes(needle))
        .sort((left, right) => right.score - left.score)
        .map(candidate => ({
            label: candidate.wikilinkTitle,
            detail: candidate.stale ? `${candidate.kind} · stale` : candidate.kind,
            info: candidate.targetPath,
            boost: candidate.score
        }));
}

/**
 * The C-layer typology receipt (`s1'.type.classify_c_layer`) — the read-only
 * C-family authority DR-S1-5 ratified. The carrier renders it; it never
 * derives it.
 */
export interface CLayerTypology {
    readonly sourcePath: string;
    readonly typeFamily: string;
    readonly typePath: string;
    readonly typeCoordinate: string;
    readonly semanticAuthority: string;
    readonly crystallisationState: string;
    readonly evidenceKind: string;
    readonly classificationSource: string;
}

export const CLAYER_TYPOLOGY_METHOD = "s1'.type.classify_c_layer";

function requiredText(raw: Record<string, unknown>, key: string): string {
    const value = raw[key];
    if (typeof value !== 'string' || value.length === 0) {
        throw new Error(`C-layer typology ${key} must be a non-empty string`);
    }
    return value;
}

export function parseCLayerTypology(value: unknown): CLayerTypology {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('C-layer typology receipt must be an object');
    }
    const raw = value as Record<string, unknown>;
    return Object.freeze({
        sourcePath: requiredText(raw, 'sourcePath'),
        typeFamily: requiredText(raw, 'typeFamily'),
        typePath: requiredText(raw, 'typePath'),
        typeCoordinate: requiredText(raw, 'typeCoordinate'),
        semanticAuthority: requiredText(raw, 'semanticAuthority'),
        crystallisationState: requiredText(raw, 'crystallisationState'),
        evidenceKind: requiredText(raw, 'evidenceKind'),
        classificationSource: requiredText(raw, 'classificationSource')
    });
}

/** The one identity note (25-m4 PASU contract). Vault-relative, as the carrier
 *  addresses files. */
export const PASU_NOTE_PATH = 'Pratibimba/Self/PASU.md';

/**
 * True for the identity note in either addressing the carrier may hand us — the
 * vault-relative path or a repo-relative one carrying the `Idea/` prefix.
 */
export function isPasuNote(path: string): boolean {
    const normalised = path.replace(/^\.?\//, '').replace(/^Idea\//, '');
    return normalised === PASU_NOTE_PATH;
}
