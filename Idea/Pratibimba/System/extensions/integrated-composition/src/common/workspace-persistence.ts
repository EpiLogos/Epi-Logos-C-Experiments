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
