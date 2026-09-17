/**
 * Coordinate: M' `/` membrane (dispatch genealogy primitive — Track 15.T15.11)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Position: #4 — Context/Type (one genealogy dataset; the two foldings are its
 *   contexts — structural tree, temporal stream)
 * Actualises: dispatch genealogy as a first-class UI primitive (15.11,
 *   DR-FACE-7 face-gap): ONE flat provenance dataset
 *   (`DispatchGenealogyRecord` — Pi → Anima → subagent invocations with
 *   provenance, timing, capability-gate outcomes) with two PURE foldings over
 *   the 27.T27.0 run-model type-graph. The structural fold
 *   (`foldGenealogyTree`) yields `RunTreeNode` trees — the Dispatch Trace
 *   tab's shape. The temporal fold (`foldGenealogyStream`) yields time-ordered
 *   `DispatchStreamEvent` rows carrying the SAME node ids — the Tool Stream
 *   tab's shape. Deep-link descriptors (`deepLinksFor`) target the
 *   CHROME-CONTRACT §2 surface ids (`omniEvidence`, `backendStudio`); intent
 *   ROUTING is not owned here.
 * Public surface: DispatchGenealogyRecord, CapabilityGateOutcome,
 *   DispatchStreamEvent, DispatchDeepLink, DISPATCH_STREAM_KIND_INVOKED,
 *   DISPATCH_STREAM_KIND_SETTLED, foldGenealogyTree, foldGenealogyStream,
 *   genealogyIndex, deepLinksFor.
 * Does NOT own: the run-model type-graph (omnipanelRuntime.ts, 27.T27.0); the
 *   wire→record producer — the genealogy DATA arrives over the track-12
 *   agentic seams (`s4'.mediation.*`, ta-onta dispatch) and 27.3 owns folding
 *   the live feed into records; the tab bodies (27.3 Dispatch / 27.4 Tools);
 *   intent routing (commands/registry.ts spine, registration is 28.14's
 *   lane); evidence-packet shapes (26.10).
 */

import type {
    ActorIdentity,
    AletheiaFacetReturn,
    DispatchRoute,
    RunStatus,
    RunTreeNode,
    ToolStreamEvent
} from './omnipanelRuntime';
import type { AletheiaSubagentId, PsycheFacet } from './evidenceShapes';

/** Outcome of the capability gate the dispatch rode (parity via
 *  `isMediationCapabilityAllowed` against the 12.10 matrix — the PRODUCER
 *  evaluates; this record only carries the outcome). */
export interface CapabilityGateOutcome {
    readonly capability: string | null;
    readonly allowed: boolean;
}

/**
 * One dispatch in the genealogy — the flat canonical unit BOTH foldings
 * consume. `id` is the consistent node identity across the tree and the
 * stream (the 15.11 acceptance invariant). `parentId` names the dispatching
 * node (null = root, e.g. the Pi entry).
 */
export interface DispatchGenealogyRecord {
    readonly id: string;
    readonly parentId: string | null;
    readonly actor: ActorIdentity;
    readonly route: DispatchRoute;
    readonly status: RunStatus;
    readonly startedAtMs: number;
    readonly endedAtMs: number | null;
    readonly gate: CapabilityGateOutcome;
    readonly evidenceRef: string | null;
    /** Source anchor (Backend Studio deep-link, ide-deep only per 27.3). */
    readonly sourceRef: string | null;

    // 27.3 additions (optional — populated only from real feed data):
    readonly psycheFacet?: PsycheFacet;
    readonly aletheiaSubagent?: AletheiaSubagentId;
    readonly aletheiaCrystallisationIntent?: string;
    readonly aletheiaFacetReturn?: AletheiaFacetReturn;
    readonly tickAtInvoke?: number;
}

/** By-id lookup for the components (gate/source fields RunTreeNode omits). */
export function genealogyIndex(
    records: readonly DispatchGenealogyRecord[]
): ReadonlyMap<string, DispatchGenealogyRecord> {
    return new Map(records.map(record => [record.id, record]));
}

function toRunTreeNode(
    record: DispatchGenealogyRecord,
    childrenOf: ReadonlyMap<string, readonly DispatchGenealogyRecord[]>,
    built: Set<string>
): RunTreeNode {
    built.add(record.id);
    const children = (childrenOf.get(record.id) ?? [])
        .filter(child => !built.has(child.id))
        .map(child => toRunTreeNode(child, childrenOf, built));
    return {
        id: record.id,
        actor: record.actor,
        route: record.route,
        status: record.status,
        startedAtMs: record.startedAtMs,
        durationMs:
            record.endedAtMs === null ? null : Math.max(0, record.endedAtMs - record.startedAtMs),
        evidenceRef: record.evidenceRef,
        children,
        psycheFacet: record.psycheFacet,
        aletheiaSubagent: record.aletheiaSubagent,
        aletheiaCrystallisationIntent: record.aletheiaCrystallisationIntent,
        aletheiaFacetReturn: record.aletheiaFacetReturn,
        sessionKey: record.id,
        tickAtInvoke: record.tickAtInvoke
    };
}

const byStartThenId = (a: DispatchGenealogyRecord, b: DispatchGenealogyRecord): number =>
    a.startedAtMs - b.startedAtMs || a.id.localeCompare(b.id);

/**
 * The structural fold: genealogy records → `RunTreeNode` invocation trees
 * (Dispatch Trace). Pure — never synthesises nodes. Records whose parent is
 * absent from the dataset surface as roots (orphans stay visible, never
 * dropped); cyclic parent references cannot recurse (each id builds once).
 */
export function foldGenealogyTree(
    records: readonly DispatchGenealogyRecord[]
): readonly RunTreeNode[] {
    const byId = genealogyIndex(records);
    const childrenOf = new Map<string, DispatchGenealogyRecord[]>();
    const roots: DispatchGenealogyRecord[] = [];
    for (const record of records) {
        if (record.parentId !== null && record.parentId !== record.id && byId.has(record.parentId)) {
            const siblings = childrenOf.get(record.parentId) ?? [];
            siblings.push(record);
            childrenOf.set(record.parentId, siblings);
        } else {
            roots.push(record);
        }
    }
    for (const siblings of childrenOf.values()) {
        siblings.sort(byStartThenId);
    }
    const built = new Set<string>();
    const trees = [...roots].sort(byStartThenId).map(root => toRunTreeNode(root, childrenOf, built));
    // Records unreachable from any root (mutual-parent cycles) still fold —
    // each surfaces its own tree rather than vanishing.
    for (const record of [...records].sort(byStartThenId)) {
        if (!built.has(record.id)) {
            trees.push(toRunTreeNode(record, childrenOf, built));
        }
    }
    return trees;
}

export const DISPATCH_STREAM_KIND_INVOKED = 'dispatch.invoked' as const;
export const DISPATCH_STREAM_KIND_SETTLED = 'dispatch.settled' as const;

/** One row of the temporal fold — a `ToolStreamEvent` (seq/time/kind/channel
 *  law) plus the genealogy identity that keeps ids consistent with the tree. */
export interface DispatchStreamEvent extends ToolStreamEvent {
    readonly nodeId: string;
    readonly actor: ActorIdentity;
    readonly status: RunStatus;
}

/**
 * The temporal fold: the SAME records → time-ordered `DispatchStreamEvent`s
 * (Tool Stream). Every record yields an `dispatch.invoked` row at its start;
 * a settled record (endedAtMs present) additionally yields a
 * `dispatch.settled` row. `kind` names the temporal moment; `status` is the
 * record's current status — no historical state is invented. `channel`
 * carries the gateway method (the events-ring channel convention).
 */
export function foldGenealogyStream(
    records: readonly DispatchGenealogyRecord[]
): readonly DispatchStreamEvent[] {
    const unsequenced: Omit<DispatchStreamEvent, 'seq'>[] = [];
    for (const record of records) {
        unsequenced.push({
            emittedAtMs: record.startedAtMs,
            kind: DISPATCH_STREAM_KIND_INVOKED,
            channel: record.route.method,
            nodeId: record.id,
            actor: record.actor,
            status: record.status
        });
        if (record.endedAtMs !== null) {
            unsequenced.push({
                emittedAtMs: Math.max(record.endedAtMs, record.startedAtMs),
                kind: DISPATCH_STREAM_KIND_SETTLED,
                channel: record.route.method,
                nodeId: record.id,
                actor: record.actor,
                status: record.status
            });
        }
    }
    unsequenced.sort(
        (a, b) =>
            a.emittedAtMs - b.emittedAtMs ||
            a.nodeId.localeCompare(b.nodeId) ||
            // invoked precedes settled at an identical instant
            (a.kind === b.kind ? 0 : a.kind === DISPATCH_STREAM_KIND_INVOKED ? -1 : 1)
    );
    return unsequenced.map((event, index) => ({ ...event, seq: index + 1 }));
}

/**
 * Deep-link descriptor — DATA, not navigation. Targets are CHROME-CONTRACT §2
 * surface ids; the consumer routes them through the command spine
 * (`commands/registry.ts`; intent-target registration is 28.14's lane).
 * `backendStudio` is a declared-pending surface — the descriptor names it
 * honestly; resolution waits for its landing (28.13).
 */
export type DispatchDeepLink =
    | { readonly target: 'omniEvidence'; readonly evidenceRef: string }
    | { readonly target: 'backendStudio'; readonly sourceRef: string };

/** The deep-links a node genuinely carries — never fabricated for refless nodes. */
export function deepLinksFor(record: DispatchGenealogyRecord): readonly DispatchDeepLink[] {
    const links: DispatchDeepLink[] = [];
    if (record.evidenceRef !== null) {
        links.push({ target: 'omniEvidence', evidenceRef: record.evidenceRef });
    }
    if (record.sourceRef !== null) {
        links.push({ target: 'backendStudio', sourceRef: record.sourceRef });
    }
    return links;
}
