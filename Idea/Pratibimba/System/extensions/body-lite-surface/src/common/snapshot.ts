/**
 * Pure-function snapshot synthesisers — Track 09 T9b.
 *
 * Given raw S5 candidate / observability event / touch-event arrays,
 * produce the snapshot shapes the lite widgets render. Pure functions
 * (no Theia DI, no kernel-bridge calls) so they're testable from
 * `node --test` without a renderer.
 *
 * Privacy discipline: every synthesiser drops any input whose
 * `privacyClass` is in `LITE_SURFACE_FORBIDDEN_PRIVACY_CLASSES` — the
 * source of the input is required to NOT send protected data, but this
 * layer is the final defensive filter before /body's DOM.
 */

import {
    type AgentCheckIn,
    type AgentCheckInSnapshot,
    type ReviewAlertBadge,
    type ReviewAlertSnapshot,
    type SafeSourceHandle,
    isLiteSurfaceSafePrivacyClass,
    truncateSafeLabel
} from './lite-surface-types';

/** Source row for synthesising a review-alert badge. */
export interface S5CandidateLiteRow {
    readonly candidateId: string;
    readonly title: string;
    readonly coordinate: string | null;
    readonly reviewId: string | null;
    readonly humanRequired: boolean;
    readonly raisedAtMs: number;
    readonly privacyClass: string;
}

export function synthReviewAlertSnapshot(
    rows: ReadonlyArray<S5CandidateLiteRow>,
    snapshotAtMs: number
): ReviewAlertSnapshot {
    const safe = rows.filter(r => isLiteSurfaceSafePrivacyClass(r.privacyClass));
    const sorted = [...safe].sort((a, b) => b.raisedAtMs - a.raisedAtMs);
    const badges: ReviewAlertBadge[] = sorted.map(r => {
        const allowed = r.humanRequired
            ? (['defer'] as const)
            : (['approve', 'reject', 'revise', 'defer'] as const);
        return {
            candidateId: r.candidateId,
            truncatedTitle: truncateSafeLabel(r.title, 60),
            coordinate: r.coordinate,
            reviewId: r.reviewId,
            humanRequired: r.humanRequired,
            allowedDecisions: allowed,
            raisedAtMs: r.raisedAtMs,
            privacyClass: r.privacyClass
        };
    });
    return {
        pendingCount: badges.length,
        latest: badges.length > 0 ? badges[0] : null,
        recent: badges.slice(0, 10),
        snapshotAtMs
    };
}

/** Source row for synthesising an agent check-in. */
export interface AgentObservabilityFrame {
    readonly runId: string;
    readonly route: string;
    readonly actor: string;
    readonly capacity: string | null;
    readonly startedAtMs: number;
    readonly endedAtMs: number | null;
    readonly privacyClass: string;
}

export function synthAgentCheckInSnapshot(
    frames: ReadonlyArray<AgentObservabilityFrame>,
    snapshotAtMs: number
): AgentCheckInSnapshot {
    const active = frames
        .filter(f => f.endedAtMs === null)
        .filter(f => isLiteSurfaceSafePrivacyClass(f.privacyClass));
    const sorted = [...active].sort((a, b) => b.startedAtMs - a.startedAtMs);
    const runs: AgentCheckIn[] = sorted.map(f => ({
        runId: f.runId,
        route: f.route,
        actor: f.actor,
        capacity: f.capacity,
        startedAtMs: f.startedAtMs,
        privacyClass: f.privacyClass
    }));
    return {
        activeRunCount: runs.length,
        runs,
        snapshotAtMs
    };
}

/** Source row for synthesising a safe-source-handle row. */
export interface TouchedItemRow {
    readonly handleId: string;
    readonly kind: SafeSourceHandle['kind'];
    readonly label: string;
    readonly coordinate: string | null;
    readonly artifactUri: string | null;
    readonly reviewId: string | null;
    readonly improvementId: string | null;
    readonly touchedAtMs: number;
    readonly privacyClass: string;
}

/**
 * Synthesise the "last N items touched" row. Drops forbidden privacy
 * classes; truncates labels to 80 chars; sorts most-recent-first.
 */
export function synthSafeSourceHandles(
    rows: ReadonlyArray<TouchedItemRow>,
    limit: number = 10
): ReadonlyArray<SafeSourceHandle> {
    const safe = rows.filter(r => isLiteSurfaceSafePrivacyClass(r.privacyClass));
    const sorted = [...safe].sort((a, b) => b.touchedAtMs - a.touchedAtMs);
    return sorted.slice(0, Math.max(0, limit)).map(r => ({
        handleId: r.handleId,
        kind: r.kind,
        label: truncateSafeLabel(r.label, 80),
        coordinate: r.coordinate,
        artifactUri: r.artifactUri,
        reviewId: r.reviewId,
        improvementId: r.improvementId,
        touchedAtMs: r.touchedAtMs,
        privacyClass: r.privacyClass
    }));
}
