import { MExtensionId, PrivacyClass } from '@pratibimba/m-extension-runtime';
import {
    IntegratedDeepLinkInspector,
    IntegratedDeepLinkPluginId
} from './integrated-deep-links';
import { EpiiReviewPanelMode } from './epii-review-state';

/**
 * Workspace persistence — 08.T7 deliverable 3.
 *
 * Theia workspace state must include enough state to restore the integrated
 * plugin layout but MUST NOT include protected bodies. The scrubber here
 * mirrors the privacy-scrubber's forbidden-field patterns so any payload
 * that drifts into workspace state is stripped at serialize time.
 *
 * 08.T7 verification 2: "Persistence tests reload Theia and prove protected
 * bodies are absent from workspace state while layout and readiness state
 * restore correctly."
 */
export interface IntegratedWorkspaceSnapshot {
    readonly activePluginId: IntegratedDeepLinkPluginId | null;
    readonly layoutId: 'cosmic-engine.integrated' | 'jiva-siva.integrated' | null;
    readonly miniInspectorOwners: readonly MExtensionId[];
    readonly selectedCoordinate: string | null;
    readonly visibleEvidencePanelIds: readonly string[];
    readonly lastEpiiReviewMode: EpiiReviewPanelMode;
    readonly lastIntendedInspector: IntegratedDeepLinkInspector | null;
    readonly lastPrivacyScope: PrivacyClass | null;
    readonly lastUpdatedAt: number;
    /**
     * A bag of arbitrary key/value state the plugin wants to persist. This
     * is the lane through which protected bodies most often leak; the scrub
     * function below strips known body patterns from this bag.
     */
    readonly extras: Readonly<Record<string, unknown>>;
}

export const EMPTY_WORKSPACE_SNAPSHOT: IntegratedWorkspaceSnapshot = Object.freeze({
    activePluginId: null,
    layoutId: null,
    miniInspectorOwners: Object.freeze([] as MExtensionId[]),
    selectedCoordinate: null,
    visibleEvidencePanelIds: Object.freeze([] as string[]),
    lastEpiiReviewMode: 'closed',
    lastIntendedInspector: null,
    lastPrivacyScope: null,
    lastUpdatedAt: 0,
    extras: Object.freeze({})
});

/**
 * Forbidden field patterns at workspace-state boundary. These are stricter
 * than the privacy-scrubber for envelopes because workspace state crosses
 * the persistence boundary into disk-backed storage (Theia user data).
 */
const WORKSPACE_FORBIDDEN_PATTERNS: readonly RegExp[] = [
    /^q_personal/i,
    /^q_nara/i,
    /^bioquaternion/i,
    /^nara_(body|raw|private|journal)/i,
    /^graphiti_(body|content|raw|episode_body)/i,
    /^m4_(protected|private|body|raw)/i,
    /^personal_field_(body|raw)/i,
    /^identity_quaternion_(internals|components|raw)/i,
    /^journal_/i
];

const WORKSPACE_FORBIDDEN_VALUE_PATTERNS: readonly RegExp[] = [
    /<protected:body>/,
    /<protected:journal>/,
    /<bioquaternion:raw:/
];

function isForbiddenKey(key: string): boolean {
    return WORKSPACE_FORBIDDEN_PATTERNS.some(re => re.test(key));
}

function scrubValue(value: unknown): unknown {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
        if (WORKSPACE_FORBIDDEN_VALUE_PATTERNS.some(re => re.test(value))) {
            return '<scrubbed>';
        }
        return value;
    }
    if (typeof value !== 'object') return value;
    if (Array.isArray(value)) {
        return value.map(scrubValue);
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        if (isForbiddenKey(k)) continue;
        out[k] = scrubValue(v);
    }
    return out;
}

export function scrubProtectedFromSnapshot(
    snapshot: IntegratedWorkspaceSnapshot
): IntegratedWorkspaceSnapshot {
    const cleanedExtras = scrubValue(snapshot.extras) as Record<string, unknown>;
    return Object.freeze({
        ...snapshot,
        extras: Object.freeze(cleanedExtras)
    });
}

export function serializeSnapshot(snapshot: IntegratedWorkspaceSnapshot): string {
    const safe = scrubProtectedFromSnapshot(snapshot);
    return JSON.stringify(safe);
}

export function deserializeSnapshot(raw: string): IntegratedWorkspaceSnapshot {
    const parsed = JSON.parse(raw) as Partial<IntegratedWorkspaceSnapshot>;
    return Object.freeze({
        activePluginId: parsed.activePluginId ?? null,
        layoutId: parsed.layoutId ?? null,
        miniInspectorOwners: Object.freeze([...(parsed.miniInspectorOwners ?? [])]),
        selectedCoordinate: parsed.selectedCoordinate ?? null,
        visibleEvidencePanelIds: Object.freeze([...(parsed.visibleEvidencePanelIds ?? [])]),
        lastEpiiReviewMode: parsed.lastEpiiReviewMode ?? 'closed',
        lastIntendedInspector: parsed.lastIntendedInspector ?? null,
        lastPrivacyScope: parsed.lastPrivacyScope ?? null,
        lastUpdatedAt: parsed.lastUpdatedAt ?? 0,
        extras: Object.freeze({ ...(parsed.extras ?? {}) })
    });
}

/**
 * Verify that a snapshot is free of any forbidden key before persistence.
 * Returns the list of violations; empty array means safe to write.
 */
export function detectProtectedKeysInSnapshot(
    snapshot: IntegratedWorkspaceSnapshot
): readonly string[] {
    const violations: string[] = [];
    function walk(value: unknown, path: string): void {
        if (value === null || value === undefined) return;
        if (typeof value === 'string') {
            for (const re of WORKSPACE_FORBIDDEN_VALUE_PATTERNS) {
                if (re.test(value)) {
                    violations.push(`${path} contains forbidden value marker`);
                }
            }
            return;
        }
        if (typeof value !== 'object') return;
        if (Array.isArray(value)) {
            value.forEach((v, i) => walk(v, `${path}[${i}]`));
            return;
        }
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
            if (isForbiddenKey(k)) {
                violations.push(`${path === '' ? k : `${path}.${k}`} matches forbidden key pattern`);
            }
            walk(v, path === '' ? k : `${path}.${k}`);
        }
    }
    walk(snapshot.extras, 'extras');
    return violations;
}

// ============================================================================
// Tranche 29.10 — Composition-state persistence + cross-layout state
// preservation.
//
// Composition state is deliberately smaller than the cross-layout CORE spine
// owned by the kernel-bridge DI singleton. These fields are the integrated
// composition extension that must survive layout, face, and process toggles.
// ============================================================================

/**
 * The cross-layout CORE spine per 15.7. Owned by the kernel-bridge DI
 * singleton, NOT by this extension — declared here as the typed contract the
 * composition state attaches to. It is deliberately layout-agnostic: a layout
 * or face toggle is an intra-process view change that never mutates this spine.
 */
export interface BimbaPratibimbaUiState {
    readonly coordinate: string | null;
    readonly lens: string | null;
    readonly mode: string | null;
    readonly profileGeneration: number;
    readonly sessionKey: string | null;
    readonly dayNow: string | null;
}

/** The field names of the cross-layout core spine — single source of truth. */
export const BIMBA_PRATIBIMBA_UI_STATE_SPINE_FIELDS: readonly (keyof BimbaPratibimbaUiState)[] =
    Object.freeze([
        'coordinate',
        'lens',
        'mode',
        'profileGeneration',
        'sessionKey',
        'dayNow'
    ]);

export interface IntegratedCompositionPersistedState {
    readonly compositionId: 'cosmic-engine.integrated' | 'jiva-siva.integrated';
    // Cosmic state
    readonly pinnedMatrixFamily: number | null; // Ananda_Matrix_Op 0..5
    readonly pinnedTorusView: 'k2-surface' | 'tick-choreography' | 'geodesic';
    readonly cosmicSelectedCoordinate: string | null;
    readonly cosmicKleinToPersonalHinge: boolean; // true = open to personal
    // Personal state
    readonly pinnedRecognitionSlot: '4' | '5' | '0' | null;
    readonly personalSelectedDayId: string | null;
    readonly personalReviewQueueFilter: 'all' | 'acknowledged' | 'unread';
    readonly personalKleinToCosmicHinge: boolean;
}

export const COMPOSITION_STATE_FIELDS: readonly (keyof IntegratedCompositionPersistedState)[] =
    Object.freeze([
        'compositionId',
        'pinnedMatrixFamily',
        'pinnedTorusView',
        'cosmicSelectedCoordinate',
        'cosmicKleinToPersonalHinge',
        'pinnedRecognitionSlot',
        'personalSelectedDayId',
        'personalReviewQueueFilter',
        'personalKleinToCosmicHinge'
    ]);

export type CompositionId = IntegratedCompositionPersistedState['compositionId'];
export type PinnedTorusView = IntegratedCompositionPersistedState['pinnedTorusView'];
export type PinnedRecognitionSlot = IntegratedCompositionPersistedState['pinnedRecognitionSlot'];
export type PersonalReviewQueueFilter =
    IntegratedCompositionPersistedState['personalReviewQueueFilter'];

export const COMPOSITION_IDS: readonly CompositionId[] = Object.freeze([
    'cosmic-engine.integrated',
    'jiva-siva.integrated'
]);

/**
 * The two toggle classes the composition state must survive (15.5 + 15.7). A
 * toggle is an intra-process view change — it never transforms persisted state.
 */
export const COMPOSITION_TOGGLE_CLASSES = Object.freeze([
    'layout:daily-0-1<->ide-deep',
    'face:cosmic<->personal-0/1'
] as const);

export type CompositionToggleClass = typeof COMPOSITION_TOGGLE_CLASSES[number];

export const PINNED_TORUS_VIEWS: readonly PinnedTorusView[] = Object.freeze([
    'k2-surface',
    'tick-choreography',
    'geodesic'
]);

export const PINNED_RECOGNITION_SLOTS: readonly Exclude<PinnedRecognitionSlot, null>[] =
    Object.freeze(['4', '5', '0']);

export const PERSONAL_REVIEW_QUEUE_FILTERS: readonly PersonalReviewQueueFilter[] =
    Object.freeze(['all', 'acknowledged', 'unread']);

export function emptyCompositionState(
    compositionId: CompositionId
): IntegratedCompositionPersistedState {
    return Object.freeze({
        compositionId,
        pinnedMatrixFamily: null,
        pinnedTorusView: 'k2-surface',
        cosmicSelectedCoordinate: null,
        cosmicKleinToPersonalHinge: false,
        pinnedRecognitionSlot: null,
        personalSelectedDayId: null,
        personalReviewQueueFilter: 'all',
        personalKleinToCosmicHinge: false
    });
}

function isPinnedTorusView(value: unknown): value is PinnedTorusView {
    return typeof value === 'string' && PINNED_TORUS_VIEWS.includes(value as PinnedTorusView);
}

function isPinnedRecognitionSlot(value: unknown): value is Exclude<PinnedRecognitionSlot, null> {
    return (
        typeof value === 'string' &&
        PINNED_RECOGNITION_SLOTS.includes(value as Exclude<PinnedRecognitionSlot, null>)
    );
}

function isPersonalReviewQueueFilter(value: unknown): value is PersonalReviewQueueFilter {
    return (
        typeof value === 'string' &&
        PERSONAL_REVIEW_QUEUE_FILTERS.includes(value as PersonalReviewQueueFilter)
    );
}

function normalizeMatrixFamily(value: unknown): number | null {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 5
        ? value
        : null;
}

/** Normalise an unknown parsed object into a fully-typed composition state. */
export function normalizeCompositionState(
    compositionId: CompositionId,
    parsed: Partial<IntegratedCompositionPersistedState> | null | undefined
): IntegratedCompositionPersistedState {
    const base = emptyCompositionState(compositionId);
    if (!parsed) {
        return base;
    }
    return Object.freeze({
        compositionId, // id is authoritative from the caller, not the file body
        pinnedMatrixFamily: normalizeMatrixFamily(parsed.pinnedMatrixFamily),
        pinnedTorusView: isPinnedTorusView(parsed.pinnedTorusView)
            ? parsed.pinnedTorusView
            : base.pinnedTorusView,
        cosmicSelectedCoordinate:
            typeof parsed.cosmicSelectedCoordinate === 'string'
                ? parsed.cosmicSelectedCoordinate
                : null,
        cosmicKleinToPersonalHinge: parsed.cosmicKleinToPersonalHinge === true,
        pinnedRecognitionSlot: isPinnedRecognitionSlot(parsed.pinnedRecognitionSlot)
            ? parsed.pinnedRecognitionSlot
            : null,
        personalSelectedDayId:
            typeof parsed.personalSelectedDayId === 'string'
                ? parsed.personalSelectedDayId
                : null,
        personalReviewQueueFilter: isPersonalReviewQueueFilter(parsed.personalReviewQueueFilter)
            ? parsed.personalReviewQueueFilter
            : base.personalReviewQueueFilter,
        personalKleinToCosmicHinge: parsed.personalKleinToCosmicHinge === true
    });
}

/** Pure serialise — normalises bounded fields before stringifying. */
export function serializeCompositionState(
    state: IntegratedCompositionPersistedState
): string {
    return JSON.stringify(normalizeCompositionState(state.compositionId, state));
}

/** Pure deserialise — re-applies normalisation so disk drift cannot widen types. */
export function deserializeCompositionState(
    compositionId: CompositionId,
    raw: string
): IntegratedCompositionPersistedState {
    const parsed = JSON.parse(raw) as Partial<IntegratedCompositionPersistedState>;
    return normalizeCompositionState(compositionId, parsed);
}

/**
 * Identity transform modelling a layout/face toggle. A toggle is an
 * intra-process view change; persistence must keep every named field intact.
 */
export function preserveCompositionStateAcrossToggle(
    state: IntegratedCompositionPersistedState,
    _toggle: CompositionToggleClass
): IntegratedCompositionPersistedState {
    // Round-trip through serialise/deserialise so the assertion exercises the
    // real persistence codec, not a bare object reference.
    return deserializeCompositionState(
        state.compositionId,
        serializeCompositionState(state)
    );
}

/**
 * Base directory for composition-state files. Defaults to `~/.epi-logos`; the
 * `EPI_LOGOS_HOME` env var overrides it (used by tests for a hermetic temp dir
 * and by alternate-home deployments). Mirrors the existing `~/.epi-logos/*`
 * runtime-state convention (config.toml, portal/workspace.json).
 */
async function compositionDir(): Promise<string> {
    const os = await import('node:os');
    const path = await import('node:path');
    const home = process.env.EPI_LOGOS_HOME ?? path.join(os.homedir(), '.epi-logos');
    return path.join(home, 'composition');
}

/** Absolute path of the JSON file backing a composition id. */
export async function compositionStatePath(compositionId: CompositionId): Promise<string> {
    const path = await import('node:path');
    return path.join(await compositionDir(), `${compositionId}.json`);
}

/**
 * Persist composition state to `~/.epi-logos/composition/{compositionId}.json`.
 */
export async function persistCompositionState(
    state: IntegratedCompositionPersistedState
): Promise<void> {
    const fs = await import('node:fs/promises');
    const dir = await compositionDir();
    const file = await compositionStatePath(state.compositionId);
    const serialized = serializeCompositionState(state);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(file, serialized, 'utf8');
}

/**
 * Read composition state back from disk. Returns `null` when no file exists
 * (first run); otherwise the normalised, fully-typed state. Survives restart by
 * re-reading the durable file.
 */
export async function readCompositionState(
    compositionId: CompositionId
): Promise<IntegratedCompositionPersistedState | null> {
    const fs = await import('node:fs/promises');
    const file = await compositionStatePath(compositionId);
    let raw: string;
    try {
        raw = await fs.readFile(file, 'utf8');
    } catch (err) {
        if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') {
            return null;
        }
        throw err;
    }
    return deserializeCompositionState(compositionId, raw);
}
