export type DispatchGenealogyGateStatus = 'allowed' | 'blocked' | 'required' | 'unknown';

export interface DispatchGenealogyCapabilityGate {
    readonly id: string;
    readonly label: string;
    readonly status: DispatchGenealogyGateStatus;
    readonly reason?: string | null;
}

export interface DispatchGenealogyEvidenceRef {
    readonly id: string;
    readonly label?: string | null;
    readonly coordinate?: string | null;
    readonly artifactUri?: string | null;
    readonly reviewId?: string | null;
    readonly sourceAnchor?: string | null;
}

export interface DispatchGenealogySourceRef {
    readonly coordinate: string;
    readonly sourceAnchor: string;
    readonly label?: string | null;
}

export interface DispatchGenealogyProvenance {
    readonly sessionKey?: string | null;
    readonly dayId?: string | null;
    readonly nowPath?: string | null;
    readonly parentSessionKey?: string | null;
    readonly sourceSessionKey?: string | null;
    readonly sourceSessionKind?: string | null;
    readonly teamId?: string | null;
    readonly teamRole?: string | null;
    readonly orchestrationKind?: string | null;
    readonly profileGeneration?: number | null;
    readonly vakAddress?: unknown;
}

export interface DispatchGenealogyNode {
    readonly id: string;
    readonly parentId: string | null;
    readonly role: string;
    readonly agentId: string;
    readonly label: string;
    readonly status: string;
    readonly invocationId?: string | null;
    readonly toolName?: string | null;
    readonly startedAtMs: number | null;
    readonly endedAtMs?: number | null;
    readonly capabilityGates: readonly DispatchGenealogyCapabilityGate[];
    readonly provenance: DispatchGenealogyProvenance;
    readonly evidenceRef?: DispatchGenealogyEvidenceRef | null;
    readonly sourceRef?: DispatchGenealogySourceRef | null;
    readonly children: readonly DispatchGenealogyNode[];
}

export interface DispatchGenealogyEvent {
    readonly id: string;
    readonly nodeId: string;
    readonly dispatchNodeId?: string;
    readonly emittedAtMs: number | null;
    readonly kind: string;
    readonly tool: string;
    readonly label: string;
    readonly status: string;
    readonly actor?: string | null;
    readonly sessionKey?: string | null;
    readonly tickAtEmit?: number | null;
    readonly inputDigest?: string | null;
    readonly outputDigest?: string | null;
    readonly latencyMs?: number | null;
    readonly evidencePacketRef?: string | null;
    readonly privacyClass?: string | null;
    readonly args?: unknown;
    readonly result?: unknown;
    readonly error?: unknown;
    readonly provenance: DispatchGenealogyProvenance;
    readonly evidenceRef?: DispatchGenealogyEvidenceRef | null;
    readonly sourceRef?: DispatchGenealogySourceRef | null;
    readonly payload?: unknown;
}

export interface DispatchGenealogySnapshot {
    readonly id: string;
    readonly sessionKey: string | null;
    readonly rootIds: readonly string[];
    readonly nodes: readonly DispatchGenealogyNode[];
    readonly events: readonly DispatchGenealogyEvent[];
    readonly source: 'sessions.resolve' | 'explicit-dispatch-genealogy' | 'empty';
    readonly generatedAtMs: number;
}

export interface DispatchGenealogySelection {
    readonly node: DispatchGenealogyNode;
    readonly evidenceTabPayload: {
        readonly selectedEvidenceId: string | null;
        readonly selectedNodeId: string;
        readonly sessionKey: string | null;
    };
    readonly sourceCommand: DispatchGenealogySourceRef | null;
}

const EMPTY_SNAPSHOT: DispatchGenealogySnapshot = Object.freeze({
    id: 'dispatch-genealogy:empty',
    sessionKey: null,
    rootIds: Object.freeze([]),
    nodes: Object.freeze([]),
    events: Object.freeze([]),
    source: 'empty',
    generatedAtMs: 0
});

export function createEmptyDispatchGenealogySnapshot(): DispatchGenealogySnapshot {
    return EMPTY_SNAPSHOT;
}

/**
 * The six Aletheia subagent techne-guardians dispatched BY Anima during the
 * S4-5' crystallisation mode. They are the leaves of the canonical dispatch
 * genealogy: Pi (root harness) -> Anima (main dispatcher) -> these guardians.
 */
export const CANONICAL_ALETHEIA_GUARDIANS: readonly {
    readonly agentId: string;
    readonly label: string;
    readonly charge: string;
}[] = Object.freeze([
    Object.freeze({ agentId: 'anansi', label: 'Anansi', charge: 'weave / narrative trace' }),
    Object.freeze({ agentId: 'moirai', label: 'Moirai', charge: 'fate / night-pass promotion' }),
    Object.freeze({ agentId: 'janus', label: 'Janus', charge: 'threshold / boundary gate' }),
    Object.freeze({ agentId: 'mercurius', label: 'Mercurius', charge: 'kairos / signal carrier' }),
    Object.freeze({ agentId: 'agora', label: 'Agora', charge: 'exchange / world-return' }),
    Object.freeze({ agentId: 'zeithoven', label: 'Zeithoven', charge: 'tempo / temporal composition' })
]);

/**
 * Build the canonical Pi -> Anima -> 6 Aletheia techne-guardian dispatch tree.
 * Used as the reference topology shown in the Dispatch Trace tab when no live
 * session genealogy has resolved yet.
 */
export function buildCanonicalDispatchGenealogy(
    generatedAtMs: number = Date.now()
): DispatchGenealogySnapshot {
    const sessionKey = 'canonical';
    const baseProvenance: DispatchGenealogyProvenance = Object.freeze({
        sessionKey,
        dayId: null,
        nowPath: null,
        parentSessionKey: null,
        sourceSessionKey: null,
        sourceSessionKind: null,
        teamId: null,
        teamRole: null,
        orchestrationKind: 'canonical-scaffold',
        profileGeneration: null,
        vakAddress: null
    });

    const flat: DispatchGenealogyNode[] = [];

    const piId = stableNodeId(sessionKey, 'pi', 0);
    flat.push(scaffoldNode({
        id: piId,
        parentId: null,
        agentId: 'pi',
        status: 'running',
        toolName: 'vak_evaluate',
        provenance: baseProvenance,
        gateLabel: 'harness root',
        gateStatus: 'allowed',
        gateReason: 'Pi is the root harness surface'
    }));

    const animaId = stableNodeId(sessionKey, 'anima', 1);
    flat.push(scaffoldNode({
        id: animaId,
        parentId: piId,
        agentId: 'anima',
        status: 'running',
        toolName: 'anima_orchestrate',
        provenance: Object.freeze({ ...baseProvenance, teamRole: 'anima' }),
        gateLabel: 'main dispatcher',
        gateStatus: 'allowed',
        gateReason: 'Anima is the constitutional dispatcher'
    }));

    CANONICAL_ALETHEIA_GUARDIANS.forEach((guardian, index) => {
        flat.push(scaffoldNode({
            id: stableNodeId(sessionKey, guardian.agentId, 2 + index),
            parentId: animaId,
            agentId: guardian.agentId,
            label: guardian.label,
            role: 'Aletheia',
            status: 'idle',
            toolName: 'dispatch_agent',
            provenance: Object.freeze({ ...baseProvenance, teamId: 'aletheia', teamRole: guardian.agentId }),
            gateLabel: 'techne-guardian',
            gateStatus: 'required',
            gateReason: guardian.charge
        }));
    });

    const treeNodes = attachChildren(flat);
    const events = eventsFromNodes(treeNodes);
    return Object.freeze({
        id: 'dispatch-genealogy:canonical',
        sessionKey,
        rootIds: Object.freeze(treeNodes.filter(node => node.parentId === null).map(node => node.id)),
        nodes: Object.freeze(treeNodes),
        events: Object.freeze(events),
        source: 'explicit-dispatch-genealogy',
        generatedAtMs
    });
}

function scaffoldNode(args: {
    readonly id: string;
    readonly parentId: string | null;
    readonly agentId: string;
    readonly status: string;
    readonly toolName: string;
    readonly provenance: DispatchGenealogyProvenance;
    readonly gateLabel: string;
    readonly gateStatus: DispatchGenealogyGateStatus;
    readonly gateReason: string;
    readonly label?: string;
    readonly role?: string;
}): DispatchGenealogyNode {
    return Object.freeze({
        id: args.id,
        parentId: args.parentId,
        role: args.role ?? roleForAgent(args.agentId),
        agentId: args.agentId,
        label: args.label ?? labelForAgent(args.agentId),
        status: args.status,
        invocationId: null,
        toolName: args.toolName,
        startedAtMs: null,
        endedAtMs: null,
        capabilityGates: Object.freeze([
            Object.freeze({
                id: 'role',
                label: args.gateLabel,
                status: args.gateStatus,
                reason: args.gateReason
            })
        ]),
        provenance: args.provenance,
        evidenceRef: null,
        sourceRef: null,
        children: Object.freeze([] as DispatchGenealogyNode[])
    });
}

export function normalizeDispatchGenealogy(
    value: unknown,
    fallbackSessionKey: string | null = null,
    generatedAtMs: number = Date.now()
): DispatchGenealogySnapshot {
    const record = asRecord(value);
    if (!record) {
        return createEmptyDispatchGenealogySnapshot();
    }

    const explicit = asRecord(record.dispatchGenealogy) ?? asRecord(record.dispatch_genealogy);
    if (explicit) {
        return normalizeExplicitSnapshot(explicit, fallbackSessionKey, generatedAtMs);
    }

    return buildDispatchGenealogyFromSession(record, fallbackSessionKey, generatedAtMs);
}

export function buildDispatchGenealogyFromSession(
    session: Record<string, unknown>,
    fallbackSessionKey: string | null = null,
    generatedAtMs: number = Date.now()
): DispatchGenealogySnapshot {
    const sessionKey =
        stringField(session, ['canonicalKey', 'sessionKey', 'key', 'sessionId']) ?? fallbackSessionKey;
    const activeAgentId = stringField(session, ['activeAgentId', 'teamRole']) ?? 'pi';
    const lineage = lineageFromSession(session, activeAgentId);
    const baseTime = numberField(session, ['updatedAtMs', 'updatedAt']) ?? generatedAtMs;
    const provenance = provenanceFromSession(session, sessionKey);
    const nodes = lineage.map((agentId, index) => {
        const role = roleForAgent(agentId);
        const nodeSessionKey = index === 0 ? sessionKey : sessionKey;
        const id = stableNodeId(sessionKey, agentId, index);
        const evidenceRef = evidenceRefFromSession(session, id, agentId);
        const sourceRef = sourceRefFromSession(session, evidenceRef);
        return {
            id,
            parentId: index === 0 ? null : stableNodeId(sessionKey, lineage[index - 1], index - 1),
            role,
            agentId,
            label: labelForAgent(agentId),
            status: index === lineage.length - 1 ? 'running' : 'completed',
            invocationId: stringField(session, ['lastRunId', 'runId']) ?? null,
            toolName: toolForIndex(index, agentId),
            startedAtMs: baseTime === null ? null : Math.max(0, baseTime - (lineage.length - index) * 1000),
            endedAtMs: index === lineage.length - 1 ? null : Math.max(0, baseTime - (lineage.length - index - 1) * 1000),
            capabilityGates: gatesFromSession(session, index, agentId),
            provenance: {
                ...provenance,
                sessionKey: nodeSessionKey
            },
            evidenceRef,
            sourceRef,
            children: Object.freeze([] as DispatchGenealogyNode[])
        } satisfies DispatchGenealogyNode;
    });

    const treeNodes = attachChildren(nodes);
    const events = eventsFromNodes(treeNodes);
    return Object.freeze({
        id: `dispatch-genealogy:${sessionKey ?? 'unknown'}`,
        sessionKey,
        rootIds: Object.freeze(treeNodes.filter(node => node.parentId === null).map(node => node.id)),
        nodes: Object.freeze(treeNodes),
        events: Object.freeze(events),
        source: 'sessions.resolve',
        generatedAtMs
    });
}

export function flattenDispatchGenealogyEvents(snapshot: DispatchGenealogySnapshot): readonly DispatchGenealogyEvent[] {
    return Object.freeze(
        [...snapshot.events].sort((a, b) => {
            const at = a.emittedAtMs ?? Number.MAX_SAFE_INTEGER;
            const bt = b.emittedAtMs ?? Number.MAX_SAFE_INTEGER;
            return at - bt || a.id.localeCompare(b.id);
        })
    );
}

export function findDispatchGenealogyNode(
    snapshot: DispatchGenealogySnapshot,
    nodeId: string | null | undefined
): DispatchGenealogyNode | null {
    if (!nodeId) {
        return null;
    }
    const stack = [...snapshot.nodes];
    while (stack.length > 0) {
        const node = stack.shift();
        if (!node) {
            continue;
        }
        if (node.id === nodeId) {
            return node;
        }
        stack.push(...node.children);
    }
    return null;
}

export function selectDispatchGenealogyNode(
    snapshot: DispatchGenealogySnapshot,
    nodeId: string
): DispatchGenealogySelection | null {
    const node = findDispatchGenealogyNode(snapshot, nodeId);
    if (!node) {
        return null;
    }
    return Object.freeze({
        node,
        evidenceTabPayload: Object.freeze({
            selectedEvidenceId: node.evidenceRef?.id ?? null,
            selectedNodeId: node.id,
            sessionKey: node.provenance.sessionKey ?? snapshot.sessionKey
        }),
        sourceCommand: node.sourceRef ?? null
    });
}

function normalizeExplicitSnapshot(
    explicit: Record<string, unknown>,
    fallbackSessionKey: string | null,
    generatedAtMs: number
): DispatchGenealogySnapshot {
    const sessionKey = stringField(explicit, ['sessionKey', 'canonicalKey']) ?? fallbackSessionKey;
    const rawNodes = arrayField(explicit, ['nodes', 'tree', 'invocations']);
    const nodes = attachChildren(
        rawNodes.map((raw, index) => normalizeNode(raw, index, sessionKey)).filter(Boolean) as DispatchGenealogyNode[]
    );
    const explicitEvents = arrayField(explicit, ['events', 'toolStream', 'tool_stream'])
        .map((raw, index) => normalizeEvent(raw, index, nodes, sessionKey))
        .filter(Boolean) as DispatchGenealogyEvent[];
    const events = explicitEvents.length > 0 ? explicitEvents : eventsFromNodes(nodes);
    return Object.freeze({
        id: stringField(explicit, ['id']) ?? `dispatch-genealogy:${sessionKey ?? 'explicit'}`,
        sessionKey,
        rootIds: Object.freeze(nodes.filter(node => node.parentId === null).map(node => node.id)),
        nodes: Object.freeze(nodes),
        events: Object.freeze(events),
        source: 'explicit-dispatch-genealogy',
        generatedAtMs
    });
}

function normalizeNode(raw: unknown, index: number, sessionKey: string | null): DispatchGenealogyNode | null {
    const record = asRecord(raw);
    if (!record) {
        return null;
    }
    const agentId = stringField(record, ['agentId', 'agent', 'role']) ?? `agent-${index}`;
    const id = stringField(record, ['id', 'nodeId']) ?? stableNodeId(sessionKey, agentId, index);
    const parentId = stringField(record, ['parentId', 'parent_id']) ?? null;
    const evidenceRef = normalizeEvidenceRef(record.evidenceRef ?? record.evidence);
    const sourceRef = normalizeSourceRef(record.sourceRef ?? record.source, evidenceRef);
    const provenance = normalizeProvenance(record.provenance, sessionKey);
    return Object.freeze({
        id,
        parentId,
        role: stringField(record, ['role']) ?? roleForAgent(agentId),
        agentId,
        label: stringField(record, ['label']) ?? labelForAgent(agentId),
        status: stringField(record, ['status']) ?? 'running',
        invocationId: stringField(record, ['invocationId', 'runId']) ?? null,
        toolName: stringField(record, ['toolName', 'tool']) ?? toolForIndex(index, agentId),
        startedAtMs: numberField(record, ['startedAtMs', 'startedAt']) ?? null,
        endedAtMs: numberField(record, ['endedAtMs', 'endedAt']) ?? null,
        capabilityGates: Object.freeze(normalizeGates(record.capabilityGates ?? record.gates)),
        provenance,
        evidenceRef,
        sourceRef,
        children: Object.freeze([] as DispatchGenealogyNode[])
    });
}

function normalizeEvent(
    raw: unknown,
    index: number,
    nodes: readonly DispatchGenealogyNode[],
    sessionKey: string | null
): DispatchGenealogyEvent | null {
    const record = asRecord(raw);
    if (!record) {
        return null;
    }
    const nodeId = stringField(record, ['nodeId', 'dispatchNodeId']) ?? nodes[index]?.id;
    if (!nodeId) {
        return null;
    }
    const node = findNodeInList(nodes, nodeId);
    const evidenceRef = normalizeEvidenceRef(record.evidenceRef ?? record.evidence) ?? node?.evidenceRef ?? null;
    const sourceRef = normalizeSourceRef(record.sourceRef ?? record.source, evidenceRef) ?? node?.sourceRef ?? null;
    return Object.freeze({
        id: stringField(record, ['id']) ?? `${nodeId}:event:${index}`,
        nodeId,
        dispatchNodeId: stringField(record, ['dispatchNodeId', 'nodeId']) ?? nodeId,
        emittedAtMs: numberField(record, ['emittedAtMs', 'ts', 'timestamp']) ?? null,
        kind: stringField(record, ['kind', 'event']) ?? 'tool.end',
        tool: stringField(record, ['tool', 'toolName']) ?? node?.toolName ?? 'dispatch_agent',
        label: stringField(record, ['label']) ?? node?.label ?? nodeId,
        status: stringField(record, ['status']) ?? node?.status ?? 'completed',
        actor: stringField(record, ['actor', 'agentId']) ?? node?.agentId ?? null,
        sessionKey: stringField(record, ['sessionKey']) ?? sessionKey,
        tickAtEmit: numberField(record, ['tickAtEmit', 'profileGeneration']) ?? null,
        inputDigest: stringField(record, ['inputDigest']) ?? null,
        outputDigest: stringField(record, ['outputDigest']) ?? null,
        latencyMs: numberField(record, ['latencyMs']) ?? latencyFromNode(node),
        evidencePacketRef: stringField(record, ['evidencePacketRef']) ?? evidenceRef?.id ?? null,
        privacyClass: stringField(record, ['privacyClass']) ?? null,
        args: record.args ?? record.input,
        result: record.result ?? record.output ?? record.return,
        error: record.error,
        provenance: normalizeProvenance(record.provenance, sessionKey),
        evidenceRef,
        sourceRef,
        payload: record.payload
    });
}

function attachChildren(flatNodes: readonly DispatchGenealogyNode[]): readonly DispatchGenealogyNode[] {
    const byId = new Map(flatNodes.map(node => [node.id, { ...node, children: [] as DispatchGenealogyNode[] }]));
    for (const node of byId.values()) {
        if (node.parentId && byId.has(node.parentId)) {
            byId.get(node.parentId)?.children.push(node as DispatchGenealogyNode);
        }
    }
    return Object.freeze(
        [...byId.values()]
            .filter(node => node.parentId === null || !byId.has(node.parentId))
            .map(freezeNode)
    );
}

function freezeNode(node: DispatchGenealogyNode & { children: DispatchGenealogyNode[] }): DispatchGenealogyNode {
    return Object.freeze({
        ...node,
        children: Object.freeze(node.children.map(child => freezeNode(child as DispatchGenealogyNode & { children: DispatchGenealogyNode[] })))
    });
}

function eventsFromNodes(nodes: readonly DispatchGenealogyNode[]): readonly DispatchGenealogyEvent[] {
    const out: DispatchGenealogyEvent[] = [];
    const visit = (node: DispatchGenealogyNode) => {
        out.push(Object.freeze({
            id: `${node.id}:event`,
            nodeId: node.id,
            dispatchNodeId: node.id,
            emittedAtMs: node.startedAtMs,
            kind: node.toolName === 'vak_evaluate' ? 'route.start' : 'tool.end',
            tool: node.toolName ?? 'dispatch_agent',
            label: node.label,
            status: node.status,
            actor: node.agentId,
            sessionKey: node.provenance.sessionKey ?? null,
            tickAtEmit: node.provenance.profileGeneration ?? node.startedAtMs,
            inputDigest: null,
            outputDigest: null,
            latencyMs: latencyFromNode(node),
            evidencePacketRef: node.evidenceRef?.id ?? null,
            privacyClass: null,
            provenance: node.provenance,
            evidenceRef: node.evidenceRef,
            sourceRef: node.sourceRef,
            args: {
                agentId: node.agentId,
                gates: node.capabilityGates.map(gate => ({
                    id: gate.id,
                    status: gate.status
                }))
            },
            payload: {
                agentId: node.agentId,
                gates: node.capabilityGates.map(gate => ({
                    id: gate.id,
                    status: gate.status
                }))
            }
        }));
        node.children.forEach(visit);
    };
    nodes.forEach(visit);
    return flattenDispatchGenealogyEvents({
        ...EMPTY_SNAPSHOT,
        events: out
    });
}

function lineageFromSession(session: Record<string, unknown>, activeAgentId: string): string[] {
    const rawLineage = arrayField(session, ['subagentLineage', 'subagent_lineage'])
        .map(item => (typeof item === 'string' ? item : null))
        .filter(Boolean) as string[];
    const candidates = [
        stringField(session, ['spawnedBy']) ?? 'pi',
        ...rawLineage,
        activeAgentId
    ].filter(Boolean) as string[];
    const normalized = candidates.map(normalizeAgentName).filter(Boolean);
    const withPi = normalized.includes('pi') ? normalized : ['pi', ...normalized];
    const withAnima = withPi.includes('anima') ? withPi : insertAfter(withPi, 'pi', 'anima');
    return unique(withAnima);
}

function normalizeAgentName(value: string): string {
    const normalized = value.trim().toLowerCase();
    if (!normalized || normalized === 'main') {
        return 'pi';
    }
    if (normalized.includes('anima')) {
        return 'anima';
    }
    if (normalized.includes('moirai')) {
        return 'moirai';
    }
    if (['klotho', 'lachesis', 'atropos'].includes(normalized)) {
        return normalized;
    }
    if (normalized.includes('pi')) {
        return 'pi';
    }
    return normalized.replace(/^agent:/, '');
}

function insertAfter(values: readonly string[], anchor: string, next: string): string[] {
    const index = values.indexOf(anchor);
    if (index < 0) {
        return [next, ...values];
    }
    return [...values.slice(0, index + 1), next, ...values.slice(index + 1)];
}

function unique(values: readonly string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const value of values) {
        if (seen.has(value)) {
            continue;
        }
        seen.add(value);
        out.push(value);
    }
    return out;
}

function roleForAgent(agentId: string): string {
    const normalized = normalizeAgentName(agentId);
    if (normalized === 'pi') {
        return 'Pi';
    }
    if (normalized === 'anima') {
        return 'Anima';
    }
    if (['moirai', 'klotho', 'lachesis', 'atropos'].includes(normalized)) {
        return 'Moirai';
    }
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function labelForAgent(agentId: string): string {
    const role = roleForAgent(agentId);
    const normalized = normalizeAgentName(agentId);
    if (role === 'Moirai' && normalized !== 'moirai') {
        return `Moirai / ${normalized}`;
    }
    return role;
}

function toolForIndex(index: number, agentId: string): string {
    const normalized = normalizeAgentName(agentId);
    if (index === 0 || normalized === 'pi') {
        return 'vak_evaluate';
    }
    if (normalized === 'anima') {
        return 'anima_orchestrate';
    }
    if (['moirai', 'klotho', 'lachesis', 'atropos'].includes(normalized)) {
        return 'dispatch_moirai_night_pass';
    }
    return 'dispatch_agent';
}

function latencyFromNode(node: DispatchGenealogyNode | null | undefined): number | null {
    if (!node?.startedAtMs || !node.endedAtMs) {
        return null;
    }
    return Math.max(0, node.endedAtMs - node.startedAtMs);
}

function stableNodeId(sessionKey: string | null, agentId: string, index: number): string {
    return `dispatch-genealogy:${slug(sessionKey ?? 'unknown')}:${index}:${slug(normalizeAgentName(agentId))}`;
}

function gatesFromSession(
    session: Record<string, unknown>,
    index: number,
    agentId: string
): readonly DispatchGenealogyCapabilityGate[] {
    const hasVak = Boolean(session.vakAddress ?? session.vak_address);
    const hasGateway = Boolean(stringField(session, ['canonicalKey', 'sessionKey', 'key']));
    const isDispatch = index > 0;
    const tool = toolForIndex(index, agentId);
    return Object.freeze([
        {
            id: 'vak-address',
            label: 'VAK address',
            status: hasVak || index === 0 ? 'allowed' : 'unknown',
            reason: hasVak ? 'sessions.resolve carried vakAddress' : 'derived from session lineage'
        },
        {
            id: 'capability-tool',
            label: tool,
            status: isDispatch ? 'required' : 'allowed',
            reason: isDispatch ? 'dispatch requires upstream VAK gate' : 'route origin'
        },
        {
            id: 'gateway-session',
            label: 'S3 session surface',
            status: hasGateway ? 'allowed' : 'unknown',
            reason: hasGateway ? 'canonical session key resolved' : 'session key missing'
        }
    ]);
}

function normalizeGates(value: unknown): readonly DispatchGenealogyCapabilityGate[] {
    const items = Array.isArray(value) ? value : [];
    return Object.freeze(items.map((item, index) => {
        const record = asRecord(item) ?? {};
        return {
            id: stringField(record, ['id']) ?? `gate-${index}`,
            label: stringField(record, ['label', 'name']) ?? `Gate ${index + 1}`,
            status: normalizeGateStatus(stringField(record, ['status']) ?? 'unknown'),
            reason: stringField(record, ['reason']) ?? null
        };
    }));
}

function normalizeGateStatus(value: string): DispatchGenealogyGateStatus {
    if (value === 'allowed' || value === 'blocked' || value === 'required' || value === 'unknown') {
        return value;
    }
    return 'unknown';
}

function provenanceFromSession(
    session: Record<string, unknown>,
    sessionKey: string | null
): DispatchGenealogyProvenance {
    return Object.freeze({
        sessionKey,
        dayId: stringField(session, ['dayId']) ?? null,
        nowPath: stringField(session, ['vaultNowPath', 'nowPath']) ?? null,
        parentSessionKey: stringField(session, ['parentSessionKey']) ?? null,
        sourceSessionKey: stringField(session, ['sourceSessionKey']) ?? null,
        sourceSessionKind: stringField(session, ['sourceSessionKind']) ?? null,
        teamId: stringField(session, ['teamId']) ?? null,
        teamRole: stringField(session, ['teamRole']) ?? null,
        orchestrationKind: stringField(session, ['orchestrationKind']) ?? null,
        profileGeneration: numberField(session, ['profileGeneration']) ?? null,
        vakAddress: session.vakAddress ?? session.vak_address ?? null
    });
}

function normalizeProvenance(value: unknown, sessionKey: string | null): DispatchGenealogyProvenance {
    const record = asRecord(value) ?? {};
    return Object.freeze({
        sessionKey: stringField(record, ['sessionKey', 'canonicalKey']) ?? sessionKey,
        dayId: stringField(record, ['dayId']) ?? null,
        nowPath: stringField(record, ['nowPath', 'vaultNowPath']) ?? null,
        parentSessionKey: stringField(record, ['parentSessionKey']) ?? null,
        sourceSessionKey: stringField(record, ['sourceSessionKey']) ?? null,
        sourceSessionKind: stringField(record, ['sourceSessionKind']) ?? null,
        teamId: stringField(record, ['teamId']) ?? null,
        teamRole: stringField(record, ['teamRole']) ?? null,
        orchestrationKind: stringField(record, ['orchestrationKind']) ?? null,
        profileGeneration: numberField(record, ['profileGeneration']) ?? null,
        vakAddress: record.vakAddress ?? null
    });
}

function evidenceRefFromSession(
    session: Record<string, unknown>,
    nodeId: string,
    agentId: string
): DispatchGenealogyEvidenceRef {
    const coordinate = stringField(session, ['coordinate', 'sourceCoordinate']) ?? null;
    const sourceAnchor = stringField(session, ['sourceAnchor', 'codeAnchor']) ?? stringField(session, ['runtimeCwd']);
    return Object.freeze({
        id: stringField(session, ['evidenceId', 'reviewId']) ?? `${nodeId}:evidence`,
        label: `${labelForAgent(agentId)} evidence`,
        coordinate,
        artifactUri: stringField(session, ['vaultNowPath', 'artifactUri']) ?? null,
        reviewId: stringField(session, ['reviewId']) ?? null,
        sourceAnchor
    });
}

function sourceRefFromSession(
    session: Record<string, unknown>,
    evidenceRef: DispatchGenealogyEvidenceRef | null
): DispatchGenealogySourceRef | null {
    const sourceAnchor =
        evidenceRef?.sourceAnchor ??
        stringField(session, ['sourceAnchor', 'codeAnchor', 'runtimeCwd', 'vaultNowPath']);
    if (!sourceAnchor) {
        return null;
    }
    return Object.freeze({
        coordinate: evidenceRef?.coordinate ?? stringField(session, ['coordinate', 'activeAgentId']) ?? 'S3.session',
        sourceAnchor,
        label: 'Open source'
    });
}

function normalizeEvidenceRef(value: unknown): DispatchGenealogyEvidenceRef | null {
    const record = asRecord(value);
    if (!record) {
        return null;
    }
    const id = stringField(record, ['id', 'evidenceId', 'handle']);
    if (!id) {
        return null;
    }
    return Object.freeze({
        id,
        label: stringField(record, ['label']) ?? null,
        coordinate: stringField(record, ['coordinate']) ?? null,
        artifactUri: stringField(record, ['artifactUri', 'uri']) ?? null,
        reviewId: stringField(record, ['reviewId']) ?? null,
        sourceAnchor: stringField(record, ['sourceAnchor', 'codeAnchor']) ?? null
    });
}

function normalizeSourceRef(
    value: unknown,
    evidenceRef: DispatchGenealogyEvidenceRef | null
): DispatchGenealogySourceRef | null {
    const record = asRecord(value);
    const coordinate = record
        ? stringField(record, ['coordinate']) ?? evidenceRef?.coordinate
        : evidenceRef?.coordinate;
    const sourceAnchor = record
        ? stringField(record, ['sourceAnchor', 'anchor', 'uri', 'path']) ?? evidenceRef?.sourceAnchor
        : evidenceRef?.sourceAnchor;
    if (!coordinate || !sourceAnchor) {
        return null;
    }
    return Object.freeze({
        coordinate,
        sourceAnchor,
        label: record ? stringField(record, ['label']) ?? null : null
    });
}

function findNodeInList(nodes: readonly DispatchGenealogyNode[], nodeId: string): DispatchGenealogyNode | null {
    for (const node of nodes) {
        if (node.id === nodeId) {
            return node;
        }
        const child = findNodeInList(node.children, nodeId);
        if (child) {
            return child;
        }
    }
    return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown>
        : null;
}

function stringField(record: Record<string, unknown>, keys: readonly string[]): string | null {
    for (const key of keys) {
        const value = record[key];
        if (typeof value === 'string' && value.trim().length > 0) {
            return value;
        }
    }
    return null;
}

function numberField(record: Record<string, unknown>, keys: readonly string[]): number | null {
    for (const key of keys) {
        const value = record[key];
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }
        if (typeof value === 'string' && value.trim().length > 0) {
            const parsed = Number(value);
            if (Number.isFinite(parsed)) {
                return parsed;
            }
        }
    }
    return null;
}

function arrayField(record: Record<string, unknown>, keys: readonly string[]): unknown[] {
    for (const key of keys) {
        const value = record[key];
        if (Array.isArray(value)) {
            return value;
        }
    }
    return [];
}

function slug(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9._:-]+/g, '-').replace(/^-+|-+$/g, '') || 'unknown';
}
