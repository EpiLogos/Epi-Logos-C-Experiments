/**
 * Coordinate: M' `/` membrane (omnipanel runtime foundation — Track 27.T27.0)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Actualises: the canonical OmniPanel runtime type-graph — the EIGHT-tab
 *   manifest (one substrate folded eight ways, DR-WC-OP-1 collapse map),
 *   the run-model types the fold panels share (`ActorIdentity`,
 *   `DispatchRoute`, `RunStatus`, `RunTreeNode`, `ToolStreamEvent`,
 *   `ReviewDecision`, `ReviewTransition`), the mediation-capability
 *   predicate, and the pure temporal fold from the gateway event ring to
 *   `ToolStreamEvent`s. Carrier translation of the frozen omnipanel-shell
 *   `omnipanel-runtime.ts` + `omnipanel-types.ts` rewrite: zustand stores
 *   replace Inversify services; the events ring IS `subscribeRunEvents`.
 * Does NOT own: the fold panels themselves (27.1..27.8 own each tab body),
 *   the gateway event ring (state/eventsStore.ts), the profile clock
 *   (state/stores.ts + state/useProfileTick.ts), evidence-packet shapes
 *   (26.10's lane).
 */

import { GatewayEventEntry } from '../../state/eventsStore';

export type OmniPanelTabId =
    | 'pi-chat'
    | 'sessions'
    | 'dispatch-trace'
    | 'tool-stream'
    | 'evidence'
    | 'review'
    | 'gateway'
    | 'diagnostics';

export interface OmniPanelTab {
    readonly id: OmniPanelTabId;
    readonly label: string;
    /** flexlayout factory component key (App.tsx::factory). */
    readonly component: string;
    /** The tranche that owns (or will land) this fold's panel body. */
    readonly owningTranche: string;
    /** False = the fold renders the honest pending pane until its tranche lands. */
    readonly landed: boolean;
}

/**
 * The canonical 8-tab manifest (DR-WC-OP-1 collapse map, Tranche 27.0
 * type-level rewrite). One substrate folded eight ways; all eight visible
 * in BOTH faces per 15.2 (the OmniPanel border is shared by the personal
 * and cosmic layouts). Legacy carrier tabs collapse as: `/ chat` →
 * `pi-chat`, `sessions` → `sessions`, `logs` → `tool-stream` (the logs
 * ring IS the temporal fold). DR-TS-4 / DR-MP-1 negative invariants: the
 * six operational-capacity views and the M5' EBM observatory are NOT tabs.
 */
export const OMNIPANEL_TABS: readonly OmniPanelTab[] = Object.freeze([
    { id: 'pi-chat', label: 'Pi', component: 'omniChat', owningTranche: '27.1', landed: true },
    { id: 'sessions', label: 'Sessions', component: 'omniSessions', owningTranche: '27.2', landed: true },
    { id: 'dispatch-trace', label: 'Dispatch', component: 'omniDispatchTrace', owningTranche: '27.3', landed: false },
    { id: 'tool-stream', label: 'Tools', component: 'omniLogs', owningTranche: '27.4', landed: true },
    { id: 'evidence', label: 'Evidence', component: 'omniEvidence', owningTranche: '27.5', landed: false },
    { id: 'review', label: 'Review', component: 'omniReview', owningTranche: '27.6', landed: false },
    { id: 'gateway', label: 'Gateway', component: 'omniGateway', owningTranche: '27.7', landed: false },
    { id: 'diagnostics', label: 'Diagnostics', component: 'omniDiagnostics', owningTranche: '27.8', landed: false }
] as const);

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
