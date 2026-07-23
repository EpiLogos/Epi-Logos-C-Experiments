/**
 * Coordinate: M' `/` membrane (dispatch-genealogy live feed — Track 27.T27.3)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Position (#n): the wire->record producer dispatchGenealogy.ts declares 27.3 owns.
 * Actualises: the ONE allowed agentic path — Pi -> subagent — folded from REAL
 *   session lineage. The gateway (Body/S/S3/gateway/src/subagents.rs) keys
 *   subagent sessions `agent:<parent>:subagent:<child>` and records `spawnedBy`
 *   + `subagent_lineage` (one level: subagents cannot spawn subagents). This
 *   fold projects those real sessions into `DispatchGenealogyRecord`s so the
 *   Dispatch tab renders the genealogy tree — subagents nested UNDER their
 *   dispatcher (DR-B-3), never top-level peers. Subagents are dispatched
 *   through `s4'.mediation.route` (the only allowed path); that IS their route
 *   method. Nothing is synthesised: unknown timing/status default honestly and
 *   evidence/source refs stay null until a real per-invocation feed lands.
 * Public surface: dispatchGenealogyFromSessions.
 * Does NOT own: the dataset foldings (dispatchGenealogy.ts), the tab body
 *   (DispatchTracePanel), or the gateway session authority (S3 SessionStore).
 */

import type { SessionRecord } from '../../bridge/sessionClient';
import type { ActorIdentity, ActorRole, AletheiaFacetReturn, RunStatus } from './omnipanelRuntime';
import type { AletheiaSubagentId } from './evidenceShapes';
import type { DispatchGenealogyRecord } from './dispatchGenealogy';
import { psycheFacetForAgent } from './psycheFacet';

const RUN_STATUSES: ReadonlySet<RunStatus> = new Set([
    'pending',
    'running',
    'succeeded',
    'failed',
    'refused'
]);

/** The canonical s4'.mediation.route method — the ONLY allowed dispatch path. */
const MEDIATION_ROUTE = "s4'.mediation.route";

/** The six Aletheia techne-guardian subagents (S4-5'). */
const ALETHEIA_SUBAGENTS: ReadonlySet<string> = new Set([
    'anansi',
    'janus',
    'moirai',
    'mercurius',
    'agora',
    'zeithoven'
]);

function readString(record: SessionRecord, keys: readonly string[]): string | null {
    for (const key of keys) {
        const value = record[key];
        if (typeof value === 'string' && value.length > 0) {
            return value;
        }
    }
    return null;
}

function readNumber(record: SessionRecord, keys: readonly string[]): number | null {
    for (const key of keys) {
        const value = record[key];
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }
    }
    return null;
}

/** Parse `agent:<id>[:subagent:<child>]` into the actor + its subagent id. */
function parseSessionKey(sessionKey: string): { actor: ActorIdentity; subagentId: string | null } {
    const parts = sessionKey.split(':');
    const subagentAt = parts.indexOf('subagent');
    if (subagentAt !== -1 && subagentAt + 1 < parts.length) {
        const child = parts[subagentAt + 1];
        return { actor: { actor: child, role: 'subagent' }, subagentId: child };
    }
    const agentId = parts[0] === 'agent' && parts.length > 1 ? parts[1] : parts[0] || sessionKey;
    const role: ActorRole = agentId === 'anima' ? 'anima' : 'pi';
    return { actor: { actor: agentId, role }, subagentId: null };
}

function readStatus(record: SessionRecord, endedAtMs: number | null): RunStatus {
    const raw = readString(record, ['status', 'state', 'lifecycle']);
    if (raw && RUN_STATUSES.has(raw as RunStatus)) {
        return raw as RunStatus;
    }
    // No real status field: a session with a close timestamp settled; an open
    // one is running. Never fabricate a richer verdict than the data supports.
    return endedAtMs === null ? 'running' : 'succeeded';
}

/** An Aletheia veto (12.19), read ONLY from real record fields — never faked. */
function readFacetReturn(record: SessionRecord): AletheiaFacetReturn | undefined {
    const reason = readString(record, ['vetoReason', 'veto_reason']);
    if (reason) {
        return {
            kind: 'veto',
            reason,
            whatIsMissed: readString(record, ['vetoMissed', 'veto_missed']) ?? ''
        };
    }
    return undefined;
}

/**
 * Fold real `sessions.list` records into the Pi -> subagent dispatch genealogy.
 * A subagent session (`spawnedBy` present, or an `:subagent:` key) nests under
 * its dispatcher; a root agent session (Pi/Anima) has `parentId: null`. Orphans
 * (parent absent from the list) keep their `parentId` and surface as visible
 * roots via `foldGenealogyTree` rather than being dropped.
 */
export function dispatchGenealogyFromSessions(
    sessions: readonly SessionRecord[]
): DispatchGenealogyRecord[] {
    return sessions.map(record => {
        const { actor, subagentId } = parseSessionKey(record.sessionKey);
        const parentId = readString(record, ['spawnedBy', 'spawned_by', 'parent']);
        const capability = subagentId ? `s4.subagent.${subagentId}` : null;
        const startedAtMs =
            readNumber(record, ['startedAtMs', 'createdAtMs', 'created_at_ms', 'openedAtMs']) ?? 0;
        const endedAtMs = readNumber(record, ['endedAtMs', 'closedAtMs', 'closed_at_ms']);
        const aletheiaSubagent =
            subagentId && ALETHEIA_SUBAGENTS.has(subagentId)
                ? (subagentId as AletheiaSubagentId)
                : undefined;
        return {
            id: record.sessionKey,
            parentId,
            actor,
            route: {
                // Subagents ride s4'.mediation.route (the only allowed path);
                // root agents surface their own session identity.
                method: subagentId ? MEDIATION_ROUTE : record.sessionKey,
                capability
            },
            status: readStatus(record, endedAtMs),
            startedAtMs,
            endedAtMs,
            // The session exists => its spawn passed the gate (subagents.rs
            // validates spawnedBy before the session materialises).
            gate: { capability, allowed: true },
            evidenceRef: readString(record, ['evidenceRef', 'evidence_ref']),
            sourceRef: readString(record, ['sourceRef', 'source_ref']),
            // 27.3 enrichment from real fields only:
            psycheFacet: psycheFacetForAgent(actor.actor),
            aletheiaSubagent,
            aletheiaCrystallisationIntent:
                readString(record, ['crystallisationIntent', 'crystallisation_intent']) ?? undefined,
            aletheiaFacetReturn: readFacetReturn(record),
            tickAtInvoke: readNumber(record, ['tickAtInvoke', 'tick_at_invoke']) ?? undefined
        };
    });
}
