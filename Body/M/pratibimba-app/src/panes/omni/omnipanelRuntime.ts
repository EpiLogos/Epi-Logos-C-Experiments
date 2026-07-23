/**
 * Coordinate: M' `/` membrane (omnipanel runtime foundation — Track 27.T27.0)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Actualises: the canonical OmniPanel runtime type-graph — the EIGHT-tab
 *   manifest (one substrate folded nine ways, DR-WC-OP-1 collapse map),
 *   the run-model types the fold panels share (`ActorIdentity`,
 *   `DispatchRoute`, `RunStatus`, `RunTreeNode`, `ToolStreamEvent`,
 *   `ReviewDecision`, `ReviewTransition`), the mediation-capability
 *   predicate, and the pure temporal fold from the gateway event ring to
 *   `ToolStreamEvent`s, including layout filtering against the persisted
 *   `epi-logos.layout.active` shell preference. Carrier translation of the frozen omnipanel-shell
 *   `omnipanel-runtime.ts` + `omnipanel-types.ts` rewrite: zustand stores
 *   replace Inversify services; the events ring IS `subscribeRunEvents`.
 * Does NOT own: the fold panels themselves (27.1..27.8 own each tab body),
 *   the gateway event ring (state/eventsStore.ts), the profile clock
 *   (state/stores.ts + state/useProfileTick.ts), evidence-packet shapes
 *   (26.10's lane).
 */

import { GatewayEventEntry } from '../../state/eventsStore';
import type { AletheiaSubagentId, PsycheFacet } from './evidenceShapes';

export type OmniPanelTabId =
    | 'pi-chat'
    | 'sessions'
    | 'dispatch-trace'
    | 'tool-stream'
    | 'evidence'
    | 'review'
    | 'gateway'
    | 'diagnostics'
    | 'tuning';

export type OmniPanelLayoutId = 'daily-0-1' | 'ide-deep';

export const OMNIPANEL_ACTIVE_LAYOUT_PREFERENCE_KEY = 'epi-logos.layout.active';

export interface OmniPanelTab {
    readonly id: OmniPanelTabId;
    readonly label: string;
    /** flexlayout factory component key (App.tsx::factory). */
    readonly component: string;
    /** The tranche that owns (or will land) this fold's panel body. */
    readonly owningTranche: string;
    /** False = the fold renders the honest pending pane until its tranche lands. */
    readonly landed: boolean;
    /** Shell layouts in which this fold is visible. Commands remain registered. */
    readonly availableInLayouts: readonly OmniPanelLayoutId[];
}

/**
 * The canonical 9-tab manifest (DR-WC-OP-1 collapse map, Tranche 27.0
 * type-level rewrite, extended by 38.T06.8). One substrate folded nine ways; all nine visible
 * in BOTH faces per 15.2 (the OmniPanel border is shared by the personal
 * and cosmic layouts). Legacy carrier tabs collapse as: `/ chat` →
 * `pi-chat`, `sessions` → `sessions`, `logs` → `tool-stream` (the logs
 * ring IS the temporal fold). DR-TS-4 / DR-MP-1 negative invariants: the
 * six operational-capacity views and the M5' EBM observatory are NOT tabs.
 */
export const OMNIPANEL_TABS: readonly OmniPanelTab[] = Object.freeze([
    { id: 'pi-chat', label: 'Pi', component: 'omniChat', owningTranche: '27.1', landed: true, availableInLayouts: ['daily-0-1', 'ide-deep'] },
    { id: 'sessions', label: 'Sessions', component: 'omniSessions', owningTranche: '27.2', landed: true, availableInLayouts: ['daily-0-1', 'ide-deep'] },
    { id: 'dispatch-trace', label: 'Dispatch', component: 'omniDispatchTrace', owningTranche: '27.3', landed: true, availableInLayouts: ['daily-0-1', 'ide-deep'] },
    { id: 'tool-stream', label: 'Tools', component: 'omniLogs', owningTranche: '27.4', landed: true, availableInLayouts: ['daily-0-1', 'ide-deep'] },
    { id: 'evidence', label: 'Evidence', component: 'omniEvidence', owningTranche: '27.5', landed: true, availableInLayouts: ['daily-0-1', 'ide-deep'] },
    { id: 'review', label: 'Review', component: 'omniReview', owningTranche: '27.6', landed: true, availableInLayouts: ['daily-0-1', 'ide-deep'] },
    { id: 'gateway', label: 'Gateway', component: 'omniGateway', owningTranche: '27.7', landed: false, availableInLayouts: ['daily-0-1', 'ide-deep'] },
    { id: 'diagnostics', label: 'Diagnostics', component: 'omniDiagnostics', owningTranche: '27.8', landed: false, availableInLayouts: ['daily-0-1', 'ide-deep'] },
    { id: 'tuning', label: 'Tuning', component: 'omniTuning', owningTranche: '38.T06.8', landed: true, availableInLayouts: ['daily-0-1', 'ide-deep'] }
] as const);

export function parseOmniPanelLayoutPreference(value: unknown): OmniPanelLayoutId {
    return value === 'ide-deep' ? 'ide-deep' : 'daily-0-1';
}

export function filterOmniPanelTabsForLayout(
    declaredTabs: readonly OmniPanelTab[],
    activeLayout: OmniPanelLayoutId
): readonly OmniPanelTab[] {
    return Object.freeze(declaredTabs.filter(tab => tab.availableInLayouts.includes(activeLayout)));
}

export function omniPanelTabForComponent(componentKey: string): OmniPanelTab | undefined {
    return OMNIPANEL_TABS.find(tab => tab.component === componentKey);
}

// ===================== run-model type-graph =====================

export type RunStatus = 'pending' | 'running' | 'succeeded' | 'failed' | 'refused';

export type ActorRole = 'user' | 'pi' | 'anima' | 'subagent' | 'gateway';

export interface ActorIdentity {
    readonly actor: string;
    readonly role: ActorRole;
}

export interface DispatchRoute {
    /** Gateway method name (e.g. `s4.pi.chat.stream`). */
    readonly method: string;
    /** Capability id the route rides (parity-checked against the matrix). */
    readonly capability: string | null;
}

/**
 * An Aletheia facet return (12.T12.19). A `disclosure` carries the angle the
 * subagent surfaced; a `veto` blocks the synthesis and names what was missed —
 * it fires a non-blocking red banner, it does NOT block the human gate.
 */
export type AletheiaFacetReturn =
    | { readonly kind: 'disclosure'; readonly angle: string; readonly evidenceRefs: readonly string[] }
    | { readonly kind: 'veto'; readonly reason: string; readonly whatIsMissed: string };

/** One node of the Pi → Anima → subagent invocation tree (Dispatch Trace
 *  fold; per-node fields per the Per-Tab role table — 27.3 extends). */
export interface RunTreeNode {
    readonly id: string;
    readonly actor: ActorIdentity;
    readonly route: DispatchRoute;
    readonly status: RunStatus;
    readonly startedAtMs: number;
    readonly durationMs: number | null;
    readonly evidenceRef: string | null;
    readonly children: readonly RunTreeNode[];

    // 27.3 additions (all optional — the fold populates what the real feed
    // carries; nothing is synthesised when the datum is absent):
    /** The constitutional register this dispatch speaks in (Anima's authorial
     *  choice per DR-M5-1) — never a separate dispatch authority. */
    readonly psycheFacet?: PsycheFacet;
    /** The Aletheia subagent identity when `actor.role === 'subagent'`. */
    readonly aletheiaSubagent?: AletheiaSubagentId;
    /** Present only when Anima dispatches this fan-out in crystallisation-mode. */
    readonly aletheiaCrystallisationIntent?: string;
    /** A subagent's disclosure or veto (12.19). */
    readonly aletheiaFacetReturn?: AletheiaFacetReturn;
    /** The session key the dispatch ran under. */
    readonly sessionKey?: string;
    /** The profile tick at invocation (per 26.10 DispatchTraceNode contract). */
    readonly tickAtInvoke?: number;
}

/** One row of the time-ordered fold (Tool Stream; 27.4 extends). */
export interface ToolStreamEvent {
    readonly seq: number;
    readonly emittedAtMs: number;
    readonly kind: string;
    readonly channel: string | null;
}

export interface ToolStreamFilter {
    readonly kind?: string;
    readonly channel?: string;
    readonly sinceMs?: number;
}

export type ReviewDecision = 'approve' | 'reject' | 'defer' | 'annotate';

export interface ReviewTransition {
    readonly from: RunStatus;
    readonly decision: ReviewDecision;
    readonly to: RunStatus;
}

/**
 * Mediation-capability predicate: exact id or `prefix.*` wildcard match
 * against a PERMITTED list the caller supplies (the pi-permitted actions
 * come from the capability matrix once `s4'.mediation.capabilities.list`
 * lands — 12.10; no hidden registry lives here).
 */
export function isMediationCapabilityAllowed(
    capability: string,
    permitted: readonly string[]
): boolean {
    const normalized = capability.trim();
    if (normalized.length === 0) {
        return false;
    }
    return permitted.some(entry =>
        entry.endsWith('.*')
            ? normalized === entry.slice(0, -2) || normalized.startsWith(entry.slice(0, -1))
            : normalized === entry
    );
}

/**
 * The temporal fold: gateway event ring → time-ordered ToolStreamEvents.
 * Pure — the ring already carries only real events (liveness pulses never
 * enter it); this fold orders and filters, it never synthesises.
 */
export function toToolStreamEvents(
    entries: readonly GatewayEventEntry[],
    filter?: ToolStreamFilter
): readonly ToolStreamEvent[] {
    return entries
        .filter(entry => {
            if (filter?.kind && entry.kind !== filter.kind) {
                return false;
            }
            if (filter?.channel && entry.channel !== filter.channel) {
                return false;
            }
            if (filter?.sinceMs !== undefined && entry.emittedAtMs < filter.sinceMs) {
                return false;
            }
            return true;
        })
        .map(entry => ({
            seq: entry.seq,
            emittedAtMs: entry.emittedAtMs,
            kind: entry.kind,
            channel: entry.channel
        }))
        .sort((a, b) => a.emittedAtMs - b.emittedAtMs || a.seq - b.seq);
}
