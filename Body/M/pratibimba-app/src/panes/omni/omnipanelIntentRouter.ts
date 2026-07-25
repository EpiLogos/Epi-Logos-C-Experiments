/**
 * Coordinate: M' `/` membrane (OmniPanel intent router — Track 27.T27.9)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Position (#n): the `/` fold-routing boundary — one CrossLayoutIntent to one
 *   OmniPanel fold activation.
 * Actualises: `OmniPanelIntentRouter`, the carrier translation of the frozen
 *   omnipanel-shell `omnipanel-intent-router.ts` (Inversify singleton → a plain
 *   routing table + pure resolvers; the zustand session store replaces the
 *   injected bridge/runtime/widget services). Maps a CHROME-CONTRACT
 *   `CrossLayoutIntent` (`requestedExtensionId` + `requestedContributionId`) to
 *   an `OmniPanelRoutingResult` — which fold to activate, the per-tab payload to
 *   apply, and whether the membrane should reveal. `applyOmniPanelRouting`
 *   commits the result to the shared 27.11 session store: `selectTab` +
 *   `patchTab` (which PRESERVES unrelated per-tab state per 15.7) + reveal by
 *   opening the FlexLayout border tab (the real, observable carrier reveal —
 *   App.tsx supplies `revealBorderTab`; there is no phantom "fullscreen" field).
 *   `fireOmniPanelRoute` is the live trigger a fold click-through calls to route
 *   through the command spine (or a store-only fallback when unmounted).
 * Public surface: OmniPanelRoutingResult, OmniPanelRoutingResolver,
 *   OMNIPANEL_DEFAULT_ROUTES, OmniPanelIntentRouter, omniPanelIntentRouter,
 *   OMNIPANEL_INTENT_ROUTE_COMMAND, applyOmniPanelRouting, fireOmniPanelRoute,
 *   omniPanelIntentRouteKey.
 * Does NOT own: the CrossLayoutIntent envelope (commands/crossLayoutIntent), the
 *   session-store shape (omnipanelSessionState), FlexLayout selection (App.tsx
 *   supplies `revealBorderTab`), or the intent telemetry log.
 * Contract: [[CHROME-CONTRACT]] / [[27-omnipanel-tabs-deep]] 27.9 / [[M'-SYSTEM-SPEC]].
 */

import { commands } from '../../commands/registry';
import type { CrossLayoutIntent } from '../../commands/crossLayoutIntent';
import type { OmniPanelTabId } from './omnipanelRuntime';
import {
    OmniPanelPerTabState,
    useOmniPanelSessionStore
} from './omnipanelSessionState';

/** The fold a route activates plus the state it induces. Per 27.9: `route()`
 *  resolvers are pure; the side effects live in `applyOmniPanelRouting`. */
export interface OmniPanelRoutingResult {
    readonly activateTab: OmniPanelTabId;
    /** A `Partial<OmniPanelPerTabState[activateTab]>` — the routing-induced
     *  state only (e.g. `{ selectedPacketId }`); unrelated fields survive. */
    readonly perTabPayload: unknown;
    readonly shouldRevealOmniPanel: boolean;
}

/** A pure `(intent) → OmniPanelRoutingResult`. Defaults handle the canonical
 *  cases; per-surface `register()` allows customisation. */
export type OmniPanelRoutingResolver = (intent: CrossLayoutIntent) => OmniPanelRoutingResult;

/** The routing key is `${requestedExtensionId}/${requestedContributionId}` —
 *  the fine-grained OmniPanel-internal namespace (distinct from the coarse
 *  layout-navigation `CROSS_LAYOUT_INTENT_TARGETS`). */
export function omniPanelIntentRouteKey(
    intent: Pick<CrossLayoutIntent, 'requestedExtensionId' | 'requestedContributionId'>
): string {
    return `${intent.requestedExtensionId}/${intent.requestedContributionId}`;
}

// ===================== pure resolvers =====================
// Each returns `shouldRevealOmniPanel: true` — an intent that routes into a fold
// wants the membrane visible; `applyOmniPanelRouting` only actually reveals when
// the membrane is not already fullscreen (15.5 lemniscate discipline).

const reveal = (
    activateTab: OmniPanelTabId,
    perTabPayload: unknown
): OmniPanelRoutingResult => Object.freeze({ activateTab, perTabPayload, shouldRevealOmniPanel: true });

const resolveDispatchTraceRoute: OmniPanelRoutingResolver = intent =>
    reveal('dispatch-trace', { selectedNodeId: intent.artifactUri });

/** Crystallisation-mode dispatch fan-out (logos-atelier invoke-aletheia) still
 *  lands on the Dispatch Trace fold — the tree IS where the fan-out reads. */
const resolveDispatchTraceRouteForCrystallisation: OmniPanelRoutingResolver = intent =>
    reveal('dispatch-trace', { selectedNodeId: intent.artifactUri });

const resolveToolStreamRoute: OmniPanelRoutingResolver = intent =>
    reveal('tool-stream', { selectedEventId: intent.artifactUri });

const resolveEvidenceRoute: OmniPanelRoutingResolver = intent =>
    reveal('evidence', { selectedPacketId: intent.artifactUri });

/** M0 verifier open-witness and M5 contemplation-object open both address the
 *  Evidence fold by the same packet identity. */
const resolveEvidenceRouteForWitness: OmniPanelRoutingResolver = intent =>
    reveal('evidence', { selectedPacketId: intent.artifactUri });

const resolveEvidenceRouteForContemplationObject: OmniPanelRoutingResolver = intent =>
    reveal('evidence', { selectedPacketId: intent.artifactUri });

const resolveReviewRoute: OmniPanelRoutingResolver = intent =>
    reveal('review', { selectedReviewId: intent.reviewId ?? intent.artifactUri });

const resolveGatewayRoute: OmniPanelRoutingResolver = intent =>
    reveal('gateway', { activeSubView: 'capabilities', selectedCapabilityName: intent.artifactUri });

/** gateway.open-bridge-readiness surfaces the Diagnostics kernel-bridge fold. */
const resolveDiagnosticsRoute: OmniPanelRoutingResolver = () =>
    reveal('diagnostics', { activeSubSection: 'kernel-bridge' });

const resolveSessionsRoute: OmniPanelRoutingResolver = intent =>
    reveal('sessions', { selectedSessionId: intent.sessionKey });

/**
 * The 27.9 routing table. Keys are `${extensionId}/${contributionId}`; each maps
 * a click-through source to the fold that owns the destination fold-state.
 *
 * The first 14 entries are the canonical spec table (27-omnipanel-tabs-deep.md
 * 27.9, lines 478-493) verbatim. The final entry — `tool-stream.open-evidence` —
 * is a carrier completion of a spec omission: the carrier's Tool Stream fold
 * surfaces the same Evidence chips as Dispatch Trace (shared `deepLinksFor` over
 * `evidenceRef`), so it needs the sibling of `dispatch-trace.open-evidence`. It
 * is added here (rather than via `register()`) so both source folds route
 * symmetrically in the app AND when rendered in isolation. Flagged for Architect
 * review as a proposed addition to the canonical table.
 */
export const OMNIPANEL_DEFAULT_ROUTES: ReadonlyMap<string, OmniPanelRoutingResolver> = Object.freeze(
    new Map<string, OmniPanelRoutingResolver>([
        // From ide-shell-m0-m5 widgets:
        ['ide-shell-m0-m5/agentic-control-room.select-run', resolveDispatchTraceRoute],
        ['ide-shell-m0-m5/evidence-pane.select-packet', resolveEvidenceRoute],
        ['ide-shell-m0-m5/review-pane.select-review', resolveReviewRoute],
        ['ide-shell-m0-m5/logos-atelier.invoke-aletheia', resolveDispatchTraceRouteForCrystallisation],
        // From per-Mn extensions (stage-1 21-26 cross-links):
        ['m0-anuttara/verifier.open-witness', resolveEvidenceRouteForWitness],
        ['m4-nara/highlight-service.inscribe-agent-mark', resolveSessionsRoute],
        ['m5-epii/contemplation-object-viewer.open', resolveEvidenceRouteForContemplationObject],
        // From OmniPanel internal click-through:
        ['omnipanel-shell/dispatch-trace.open-evidence', resolveEvidenceRoute],
        ['omnipanel-shell/dispatch-trace.open-tool-stream', resolveToolStreamRoute],
        ['omnipanel-shell/tool-stream.open-dispatch-trace', resolveDispatchTraceRoute],
        ['omnipanel-shell/evidence.open-review', resolveReviewRoute],
        ['omnipanel-shell/review.open-gateway-blocker', resolveGatewayRoute],
        ['omnipanel-shell/gateway.open-bridge-readiness', resolveDiagnosticsRoute],
        ['omnipanel-shell/pi-chat.dispatch-emitted', resolveDispatchTraceRoute],
        // Carrier completion (see table doc above):
        ['omnipanel-shell/tool-stream.open-evidence', resolveEvidenceRoute]
    ])
);

/**
 * The OmniPanel intent router. Pure `route()` — no side effects, no store reads;
 * resolution is a table lookup so the routing table is fully testable without a
 * mounted app. `register()` lets other surfaces add/override a route and returns
 * a disposer that removes exactly the resolver it added.
 */
export class OmniPanelIntentRouter {
    private readonly defaultRoutes: Map<string, OmniPanelRoutingResolver>;

    constructor(seed: ReadonlyMap<string, OmniPanelRoutingResolver> = OMNIPANEL_DEFAULT_ROUTES) {
        this.defaultRoutes = new Map(seed);
    }

    register(key: string, resolver: OmniPanelRoutingResolver): () => void {
        this.defaultRoutes.set(key, resolver);
        return () => {
            if (this.defaultRoutes.get(key) === resolver) {
                this.defaultRoutes.delete(key);
            }
        };
    }

    /** Resolve an intent to its fold routing, or `null` when no route matches
     *  (the caller falls through to layout navigation). */
    route(intent: CrossLayoutIntent): OmniPanelRoutingResult | null {
        const resolver = this.defaultRoutes.get(omniPanelIntentRouteKey(intent));
        return resolver ? resolver(intent) : null;
    }

    routeKeys(): readonly string[] {
        return Object.freeze([...this.defaultRoutes.keys()]);
    }
}

/** The shell singleton — App.tsx routes through this instance. */
export const omniPanelIntentRouter = new OmniPanelIntentRouter();

/** The command App.tsx registers so any surface (or an e2e harness) can fire a
 *  CrossLayoutIntent at the OmniPanel folds by id. */
export const OMNIPANEL_INTENT_ROUTE_COMMAND = 'omnipanel.intent.route';

export interface ApplyOmniPanelRoutingDeps {
    /** App.tsx supplies the real FlexLayout border reveal (open + selectTab on
     *  the active face's model — an observable expansion). Omitted in unit tests
     *  and in the store-only fallback, where the fold still activates + carries
     *  its payload but nothing opens the (unmounted) border. */
    readonly revealBorderTab?: (tab: OmniPanelTabId) => void;
}

/**
 * Commit a routing result to the shared session store. Order per 27.9:
 * (1) activate the fold, (2) apply the per-tab payload via `patchTab` — a
 * shallow merge, so unrelated per-tab state (filters, scroll) survives (15.7),
 * (3) when the route asks to reveal, open the FlexLayout border tab via
 * `revealBorderTab` — the real, observable carrier reveal. `Actions.selectTab`
 * is idempotent on an already-open border, so revealing never collapses; there
 * is no separate monotonic "fullscreen" field to keep in sync.
 */
export function applyOmniPanelRouting(
    result: OmniPanelRoutingResult,
    deps: ApplyOmniPanelRoutingDeps = {}
): void {
    const store = useOmniPanelSessionStore.getState();
    store.selectTab(result.activateTab);
    if (result.perTabPayload && typeof result.perTabPayload === 'object' && !Array.isArray(result.perTabPayload)) {
        (store.patchTab as (tab: OmniPanelTabId, patch: Partial<OmniPanelPerTabState[OmniPanelTabId]>) => void)(
            result.activateTab,
            result.perTabPayload as Partial<OmniPanelPerTabState[OmniPanelTabId]>
        );
    }
    if (result.shouldRevealOmniPanel) {
        deps.revealBorderTab?.(result.activateTab);
    }
}

export interface OmniPanelRouteSeed {
    readonly requestedExtensionId: string;
    readonly requestedContributionId: string;
    readonly artifactUri?: string | null;
    readonly reviewId?: string | null;
    readonly sessionKey?: string | null;
}

/**
 * The LIVE trigger a fold click-through calls to route an OmniPanel-internal
 * intent (e.g. an Evidence chip in Dispatch Trace). Prefers the command spine —
 * `OMNIPANEL_INTENT_ROUTE_COMMAND`, wired in App.tsx with the real FlexLayout
 * reveal — and falls back to a store-only apply when the command is not
 * registered (a fold rendered in isolation), so the fold still activates and
 * carries its payload without a mounted shell.
 */
export function fireOmniPanelRoute(seed: OmniPanelRouteSeed): void {
    const intent: CrossLayoutIntent = Object.freeze({
        coordinate: null,
        artifactUri: seed.artifactUri ?? null,
        reviewId: seed.reviewId ?? null,
        dayNow: null,
        sessionKey: seed.sessionKey ?? null,
        profileGeneration: null,
        privacyClass: null,
        requestedExtensionId: seed.requestedExtensionId,
        requestedContributionId: seed.requestedContributionId
    });
    if (commands.has(OMNIPANEL_INTENT_ROUTE_COMMAND)) {
        void commands.execute(OMNIPANEL_INTENT_ROUTE_COMMAND, intent);
        return;
    }
    const result = omniPanelIntentRouter.route(intent);
    if (result) {
        applyOmniPanelRouting(result);
    }
}
