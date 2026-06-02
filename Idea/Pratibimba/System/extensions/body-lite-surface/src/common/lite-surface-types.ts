/**
 * Body lite-surface contract types — Track 09 T9b.
 *
 * These shapes power the lightweight /body affordances in the 0/1 daily
 * layout. They are deliberately handle-only — no raw bodies, no protected
 * payloads, no journal/dream/oracle text — per the 09.T9 privacy contract.
 *
 * The pairing rule: every alert / handle / check-in card carries enough
 * context to deep-link into the deep IDE Agentic Control Room (Thread A
 * 05.T8) but NEVER the body of the artifact it refers to. The deep IDE
 * fetches the body via its own kernel-bridge capabilities once the cross-
 * layout intent fires.
 */

import type { ReviewDecision } from '@pratibimba/agentic-control-room';

/** Privacy classes safe to render in /body (mirrors ide-shell allow-list). */
export const LITE_SURFACE_ALLOWED_PRIVACY_CLASSES = [
    'public',
    'safe-public-current-kernel-tick',
    'public_current_with_graph_provenance',
    'safe-public'
] as const;

export type LiteSurfaceAllowedPrivacyClass =
    (typeof LITE_SURFACE_ALLOWED_PRIVACY_CLASSES)[number];

/**
 * Privacy classes that MUST NEVER appear on any lite-surface DOM, evidence
 * envelope, or deep-link intent payload. Mirrors the deep IDE forbidden set
 * so /body is the seventh surface in the privacy-audit matrix (Thread C
 * extensions/test/privacy-audit/forbidden-fields.test.mjs).
 */
export const LITE_SURFACE_FORBIDDEN_PRIVACY_CLASSES = [
    'private',
    'protected',
    'restricted-graphiti-body',
    'protected-nara-body',
    'private-journal',
    'private-birth-data',
    'private-quaternion',
    'private-profile'
] as const;

export type LiteSurfaceForbiddenPrivacyClass =
    (typeof LITE_SURFACE_FORBIDDEN_PRIVACY_CLASSES)[number];

export function isLiteSurfaceSafePrivacyClass(
    privacyClass: string | null | undefined
): boolean {
    if (privacyClass === null || privacyClass === undefined) {
        return true; // unset = public; gateway is the authority.
    }
    return !(LITE_SURFACE_FORBIDDEN_PRIVACY_CLASSES as readonly string[]).includes(
        privacyClass
    );
}

/**
 * Safe-handle for an S2 / S5 / Canon / Atelier touch.
 *
 * The handle carries ONLY what the lite surface needs to render and to
 * build a typed deep-link intent. No body, no raw text, no protected
 * graph fields. Tap-to-deeplink resolves the body via a deep-IDE
 * gateway capability call once the layout switch completes.
 */
export interface SafeSourceHandle {
    readonly handleId: string;
    readonly kind: 'graph-node' | 'review-candidate' | 'canon-file' | 'atelier-entry';
    /** Truncated, safe label for rendering (max 80 chars enforced). */
    readonly label: string;
    /** Bimba coordinate the handle anchors to (e.g. `#5.0.0`). */
    readonly coordinate: string | null;
    /** Theia artifact URI to open in the deep IDE. */
    readonly artifactUri: string | null;
    /** Linked S5 review id (when kind === 'review-candidate'). */
    readonly reviewId: string | null;
    /** Linked S5 improvement vector id (when present). */
    readonly improvementId: string | null;
    /** ms-epoch timestamp of the touch. */
    readonly touchedAtMs: number;
    /** Privacy class — must be a LITE_SURFACE_ALLOWED_PRIVACY_CLASS. */
    readonly privacyClass: string;
}

/**
 * Review-alert badge payload — what the badge widget renders from a single
 * S5 candidate whose `humanRequired === true`.
 */
export interface ReviewAlertBadge {
    readonly candidateId: string;
    /** Truncated title — safe handle only, max 60 chars. */
    readonly truncatedTitle: string;
    readonly coordinate: string | null;
    readonly reviewId: string | null;
    readonly humanRequired: boolean;
    /** Open transitions still allowed (defer always allowed; agent cannot approve). */
    readonly allowedDecisions: ReadonlyArray<ReviewDecision>;
    readonly raisedAtMs: number;
    readonly privacyClass: string;
}

/**
 * Snapshot for the badge widget — aggregate across all active S5
 * candidates with human-required gates open.
 */
export interface ReviewAlertSnapshot {
    readonly pendingCount: number;
    /** Most recent alert (rendered as the badge's `latest` label). */
    readonly latest: ReviewAlertBadge | null;
    /** Up to 10 most recent — list view in the lite surface. */
    readonly recent: ReadonlyArray<ReviewAlertBadge>;
    readonly snapshotAtMs: number;
}

/**
 * Agent check-in card — compact view of who's running what now.
 *
 * Subscribes to the same `observability` kernel-bridge events the deep
 * Agentic Control Room consumes (Thread A 05.T8). Renders only when the
 * observability event's privacyClass is in the allowed set.
 */
export interface AgentCheckIn {
    readonly runId: string;
    readonly route: string; // dispatch_agent | run_chain | etc.
    readonly actor: string; // anima | aletheia | pi | sophia | etc.
    /** Capacity profile in flight (anuttara | parashakti | nara | epii). */
    readonly capacity: string | null;
    readonly startedAtMs: number;
    readonly privacyClass: string;
}

export interface AgentCheckInSnapshot {
    readonly activeRunCount: number;
    readonly runs: ReadonlyArray<AgentCheckIn>;
    readonly snapshotAtMs: number;
}

/** Lite-surface widget IDs — namespaced under `pratibimba.body.*`. */
export const BODY_LITE_WIDGET_IDS = {
    REVIEW_ALERT_BADGE: 'pratibimba.body.review-alert-badge',
    AGENT_CHECKIN: 'pratibimba.body.agent-checkin',
    SAFE_SOURCE_HANDLE_ROW: 'pratibimba.body.safe-source-handle-row'
} as const;

/**
 * Truncate a label to the safe rendering length. The lite surface never
 * shows raw bodies — even labels are clamped to avoid leaking sentence-
 * level content that would only make sense in the deep IDE context.
 */
export function truncateSafeLabel(label: string, max: number): string {
    if (label.length <= max) return label;
    return label.slice(0, Math.max(0, max - 1)).trimEnd() + '…';
}

/**
 * Validate a SafeSourceHandle — used by widget render code and tests.
 * Returns a list of violation reasons; empty list means the handle is
 * safe to surface.
 */
export function validateSafeSourceHandle(handle: SafeSourceHandle): string[] {
    const violations: string[] = [];
    if (!isLiteSurfaceSafePrivacyClass(handle.privacyClass)) {
        violations.push(
            `handle ${handle.handleId} carries forbidden privacy class "${handle.privacyClass}"`
        );
    }
    if (handle.label.length > 80) {
        violations.push(
            `handle ${handle.handleId} label exceeds 80 chars (got ${handle.label.length})`
        );
    }
    // Reject suspicious body-looking content in labels.
    if (/<protected:body>/.test(handle.label) || /\bjournal_body\b/.test(handle.label)) {
        violations.push(`handle ${handle.handleId} label contains protected-body markers`);
    }
    return violations;
}

export function validateReviewAlertBadge(badge: ReviewAlertBadge): string[] {
    const violations: string[] = [];
    if (!isLiteSurfaceSafePrivacyClass(badge.privacyClass)) {
        violations.push(
            `review alert ${badge.candidateId} carries forbidden privacy class "${badge.privacyClass}"`
        );
    }
    if (badge.truncatedTitle.length > 60) {
        violations.push(
            `review alert ${badge.candidateId} title exceeds 60 chars (got ${badge.truncatedTitle.length})`
        );
    }
    if (badge.humanRequired) {
        // human-required → agent may only defer; widget MUST reflect this.
        const allowed = new Set(badge.allowedDecisions);
        for (const forbidden of ['approve', 'reject', 'revise'] as const) {
            if (allowed.has(forbidden)) {
                violations.push(
                    `review alert ${badge.candidateId} is humanRequired but exposes "${forbidden}" decision`
                );
            }
        }
    }
    return violations;
}

export function validateAgentCheckIn(checkIn: AgentCheckIn): string[] {
    const violations: string[] = [];
    if (!isLiteSurfaceSafePrivacyClass(checkIn.privacyClass)) {
        violations.push(
            `agent check-in run ${checkIn.runId} carries forbidden privacy class "${checkIn.privacyClass}"`
        );
    }
    return violations;
}
