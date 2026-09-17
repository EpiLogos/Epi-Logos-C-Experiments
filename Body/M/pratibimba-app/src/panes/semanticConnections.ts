/**
 * Coordinate: M' M0'/M5' (semantic-connections carrier - 28.T28.12)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): strict S1 semantic-response boundary
 * Actualises: typed neighbour, staleness, evidence, and privacy projection.
 * Public surface: parseSemanticConnectionsResponse and carrier types.
 * Does NOT own: semantic scoring, vault indexing, or canon writes.
 * Contract: [[S1-SPEC]] / [[M'-PORTAL-SPEC]].
 */

export const SEMANTIC_CONNECTIONS_METHOD = "s1'.semantic.suggest_links";

export type SemanticCandidateKind =
    | 'explicit-outlink'
    | 'semantic-source'
    | 'semantic-block';
export type SemanticStaleness = 'current' | 'stale' | 'no-index';
export type SemanticPrivacyClass = 'public' | 'protected';

export interface SemanticCandidate {
    readonly targetPath: string;
    readonly wikilinkTitle: string;
    readonly score: number;
    readonly kind: SemanticCandidateKind;
    readonly evidenceSourcePath: string;
    readonly evidenceLines: readonly [number, number] | null;
    readonly stale: boolean;
    readonly privacyClass: SemanticPrivacyClass;
}

export interface SemanticConnectionsResponse {
    readonly seedSources: readonly string[];
    readonly candidates: readonly SemanticCandidate[];
    readonly warnings: readonly string[];
    readonly staleness: SemanticStaleness;
    readonly smartEnvIndexPath: string | null;
}

const KINDS = new Set<SemanticCandidateKind>([
    'explicit-outlink',
    'semantic-source',
    'semantic-block'
]);
const STALENESS = new Set<SemanticStaleness>(['current', 'stale', 'no-index']);
const PRIVACY = new Set<SemanticPrivacyClass>(['public', 'protected']);

function record(value: unknown, label: string): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`${label} must be an object`);
    }
    return value as Record<string, unknown>;
}

function text(value: unknown, label: string): string {
    if (typeof value !== 'string' || value.length === 0) {
        throw new Error(`${label} must be a non-empty string`);
    }
    return value;
}

function stringList(value: unknown, label: string): readonly string[] {
    if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) {
        throw new Error(`${label} must be a string array`);
    }
    return Object.freeze([...value]);
}

function candidate(value: unknown, index: number): SemanticCandidate {
    const raw = record(value, `candidate ${index}`);
    if (typeof raw.score !== 'number' || !Number.isFinite(raw.score)) {
        throw new Error(`candidate ${index} score must be finite`);
    }
    if (typeof raw.stale !== 'boolean') {
        throw new Error(`candidate ${index} stale must be boolean`);
    }
    if (!KINDS.has(raw.kind as SemanticCandidateKind)) {
        throw new Error(`candidate ${index} kind is not canonical`);
    }
    if (!PRIVACY.has(raw.privacyClass as SemanticPrivacyClass)) {
        throw new Error(`candidate ${index} privacyClass is not canonical`);
    }
    let evidenceLines: readonly [number, number] | null = null;
    if (raw.evidenceLines !== null) {
        if (
            !Array.isArray(raw.evidenceLines) ||
            raw.evidenceLines.length !== 2 ||
            raw.evidenceLines.some(line => !Number.isInteger(line) || line < 1)
        ) {
            throw new Error(`candidate ${index} evidenceLines must be a positive line pair`);
        }
        evidenceLines = Object.freeze([
            raw.evidenceLines[0] as number,
            raw.evidenceLines[1] as number
        ]);
    }
    return Object.freeze({
        targetPath: text(raw.targetPath, `candidate ${index} targetPath`),
        wikilinkTitle: text(raw.wikilinkTitle, `candidate ${index} wikilinkTitle`),
        score: raw.score,
        kind: raw.kind as SemanticCandidateKind,
        evidenceSourcePath: text(raw.evidenceSourcePath, `candidate ${index} evidenceSourcePath`),
        evidenceLines,
        stale: raw.stale,
        privacyClass: raw.privacyClass as SemanticPrivacyClass
    });
}

export function parseSemanticConnectionsResponse(value: unknown): SemanticConnectionsResponse {
    const raw = record(value, 'Semantic connections response');
    if (!Array.isArray(raw.candidates)) {
        throw new Error('Semantic candidates must be an array');
    }
    if (!STALENESS.has(raw.staleness as SemanticStaleness)) {
        throw new Error('Semantic staleness is not canonical');
    }
    if (raw.smartEnvIndexPath !== null && typeof raw.smartEnvIndexPath !== 'string') {
        throw new Error('smartEnvIndexPath must be a string or null');
    }
    return Object.freeze({
        seedSources: stringList(raw.seedSources, 'seedSources'),
        candidates: Object.freeze(raw.candidates.map(candidate)),
        warnings: stringList(raw.warnings, 'warnings'),
        staleness: raw.staleness as SemanticStaleness,
        smartEnvIndexPath: raw.smartEnvIndexPath as string | null
    });
}
