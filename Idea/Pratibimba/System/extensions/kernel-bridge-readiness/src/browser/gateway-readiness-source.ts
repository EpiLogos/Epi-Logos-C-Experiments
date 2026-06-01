import { injectable } from '@theia/core/shared/inversify';
import {
    KernelBridgeReadinessSnapshot,
    KernelBridgeReadinessSource,
    KernelBridgeReadinessState
} from '../common/readiness-types';

/**
 * Reads readiness from the real `epi gate` gateway running on the local host.
 *
 * The gateway exposes a JSON status endpoint at `${baseUrl}/health` which
 * mirrors the shape returned by `epi graph doctor --json`. This source treats
 * the HTTP/JSON round-trip as the canonical signal — there is no mock branch.
 * When the gateway is unreachable the snapshot resolves to
 * `bridge_unavailable` with the underlying error in `reason`, never to a
 * fake "ready" state.
 */
@injectable()
export class GatewayReadinessSource implements KernelBridgeReadinessSource {
    constructor(
        private readonly baseUrl: string = 'http://127.0.0.1:1421',
        private readonly fetchImpl: typeof fetch = globalThis.fetch.bind(globalThis)
    ) {}

    describe(): string {
        return `epi gate at ${this.baseUrl}/health`;
    }

    async fetch(): Promise<KernelBridgeReadinessSnapshot> {
        const started = Date.now();
        try {
            const response = await this.fetchImpl(`${this.baseUrl}/health`, {
                method: 'GET',
                headers: { Accept: 'application/json' }
            });
            if (!response.ok) {
                return this.unavailable(
                    `gateway responded HTTP ${response.status} ${response.statusText}`,
                    started
                );
            }
            const payload = (await response.json()) as unknown;
            return this.parsePayload(payload, started);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return this.unavailable(`gateway unreachable: ${message}`, started);
        }
    }

    private parsePayload(payload: unknown, started: number): KernelBridgeReadinessSnapshot {
        if (typeof payload !== 'object' || payload === null) {
            return this.unavailable('gateway returned non-object payload', started);
        }
        const obj = payload as Record<string, unknown>;
        const stateCandidate = obj.state ?? obj.readiness;
        const state = this.coerceState(stateCandidate);
        const reason =
            typeof obj.reason === 'string'
                ? obj.reason
                : state === 'ready_public_current'
                  ? 'gateway reports ready_public_current'
                  : `gateway reports ${state}`;
        const profileGeneration =
            typeof obj.profile_generation === 'number'
                ? obj.profile_generation
                : typeof obj.profileGeneration === 'number'
                  ? obj.profileGeneration
                  : null;
        const blockerIds = Array.isArray(obj.blocker_ids)
            ? obj.blocker_ids.filter((x): x is string => typeof x === 'string')
            : Array.isArray(obj.blockerIds)
              ? obj.blockerIds.filter((x): x is string => typeof x === 'string')
              : [];
        return Object.freeze({
            fetchedAt: started,
            state,
            reason,
            profileGeneration,
            gatewayReachable: true,
            blockerIds: Object.freeze(blockerIds) as readonly string[]
        });
    }

    private coerceState(value: unknown): KernelBridgeReadinessState {
        const valid: readonly KernelBridgeReadinessState[] = [
            'bridge_unavailable',
            'profile_missing_field',
            's2_graph_blocked',
            's3_subscription_blocked',
            's5_review_blocked',
            'authority_payload_missing',
            'privacy_blocked',
            'degraded_but_readable',
            'ready_public_current'
        ];
        if (typeof value === 'string' && (valid as readonly string[]).includes(value)) {
            return value as KernelBridgeReadinessState;
        }
        return 'bridge_unavailable';
    }

    private unavailable(reason: string, started: number): KernelBridgeReadinessSnapshot {
        return Object.freeze({
            fetchedAt: started,
            state: 'bridge_unavailable',
            reason,
            profileGeneration: null,
            gatewayReachable: false,
            blockerIds: Object.freeze([]) as readonly string[]
        });
    }
}
