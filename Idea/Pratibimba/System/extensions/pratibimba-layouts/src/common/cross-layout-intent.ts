/**
 * CrossLayoutIntent — Track 05 T5 deliverable.
 *
 * An in-process command payload that flows through Theia's CommandRegistry
 * carrying the context every downstream consumer needs (coordinate, artifact
 * URI, review id, DAY/NOW, session, profile generation, privacy class,
 * requested layout, requested extension/contribution).
 *
 * Routing rules:
 *   1. Intents are routed intra-process via Theia's CommandRegistry —
 *      `pratibimba.intent.dispatch` is the canonical entry-point.
 *   2. The requested layout is MATERIALISED (via PratibimbaLayoutSwitcher.switchTo)
 *      BEFORE the target contribution opens; the dispatcher awaits the
 *      `onLayoutChange` event before invoking the target command.
 *   3. Targets register handlers by `targetCommandId` — the intent's
 *      `requestedExtensionId` + `requestedContributionId` produce the
 *      command id `<extensionId>.<contributionId>.open`.
 *
 * The envelope is immutable per-dispatch; consumers should not mutate it.
 * State preservation across layout switches uses PreservedLayoutState (in
 * layout-switcher.ts) — separate concern from intent routing.
 */

import type { PratibimbaLayoutId } from './layout-types';

/** Privacy classification for the artifact carried in this intent. */
export type IntentPrivacyClass = 'public' | 'protected' | 'private';

/**
 * The well-known cross-layout intent shape. All fields nullable so callers
 * can fire incomplete intents (the receiving contribution decides what to do
 * with missing context — typically renders its empty state).
 */
export interface CrossLayoutIntent {
    /** Bimba coordinate the intent is anchored to (e.g. `#5.0.0` or `M0.subject`). */
    readonly coordinate: string | null;
    /** Theia file URI for an artifact this intent should open. */
    readonly artifactUri: string | null;
    /** S5 review record id, if the intent targets review material. */
    readonly reviewId: string | null;
    /** Active DAY/NOW context envelope (string handle from S3 world_clock). */
    readonly dayNow: string | null;
    /** Session key threaded through gateway state. */
    readonly sessionKey: string | null;
    /** Profile generation at intent-fire time, for staleness reasoning. */
    readonly profileGeneration: number | null;
    /** Privacy class on the carried artifact / coordinate. */
    readonly privacyClass: IntentPrivacyClass | null;
    /** Layout that should be active before the target contribution opens. */
    readonly requestedLayout: PratibimbaLayoutId;
    /** Extension id of the receiver (e.g. `m0-anuttara`, `m5-epii`). */
    readonly requestedExtensionId: string | null;
    /** Contribution id within the extension (e.g. `graph`, `review`, `journal`). */
    readonly requestedContributionId: string | null;
    /** Optional human-readable purpose for logs / observability. */
    readonly reason?: string;
}

/** Convenience: minimal intent that only switches layout. */
export function layoutOnlyIntent(layout: PratibimbaLayoutId, reason?: string): CrossLayoutIntent {
    return {
        coordinate: null,
        artifactUri: null,
        reviewId: null,
        dayNow: null,
        sessionKey: null,
        profileGeneration: null,
        privacyClass: null,
        requestedLayout: layout,
        requestedExtensionId: null,
        requestedContributionId: null,
        reason
    };
}

/** Convenience: build the canonical target-command id for an intent. */
export function intentTargetCommandId(intent: CrossLayoutIntent): string | null {
    if (!intent.requestedExtensionId || !intent.requestedContributionId) {
        return null;
    }
    return `pratibimba.${intent.requestedExtensionId}.${intent.requestedContributionId}.open`;
}

/**
 * Canonical intent kinds the OmniPanel and Electron menu surface. T5
 * verification line lists these explicitly: "Add cross-layout intent
 * routing for 'open deep IDE', 'return to daily layout', 'open review
 * item', 'open graph node', 'open Canon Studio file', 'start journal
 * entry', and 'deposit review evidence'."
 */
export const WELL_KNOWN_INTENT_KINDS = [
    'open-deep-ide',
    'return-to-daily-layout',
    'open-review-item',
    'open-graph-node',
    'open-canon-studio-file',
    'start-journal-entry',
    'deposit-review-evidence'
] as const;

export type WellKnownIntentKind = (typeof WELL_KNOWN_INTENT_KINDS)[number];
