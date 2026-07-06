/**
 * Coordinate: M' (kernel-bridge client)
 * Residency: Body/M/pratibimba-app/src/bridge
 * Actualises: the single upstream gateway subscription — one socket per app,
 *   the profile-tick spine every store derives from.
 * Public surface: GatewayClient, GatewayClientCallbacks, WebSocketLike.
 * Does NOT own: profile computation (portal-core), gateway lifecycle
 *   (src-tauri/supervisor.rs), store state (src/state/stores.ts).
 *
 * Ported 2026-07-02 from epi-theia kernel-bridge-backend-service.ts, shed of
 * Theia DI, then CORRECTED against the real gateway dialect (epi-s3-gateway
 * protocol.rs): requests are `{type:'req', id:u64, method, params}` with
 * `connect` required first; responses are `{type:'res', id, result|error}`.
 * (The warehouse client sent bare JSON-RPC 2.0 frames, which the gateway's
 * request loop cannot deserialize — that invoke path never worked live.)
 * tick/profile events feed onProfile; exponential reconnect 1500→20000ms.
 */

import {
    DEFAULT_GATEWAY_PORT,
    KERNEL_BRIDGE_SAFE_PROFILE_PRIVACY,
    KERNEL_BRIDGE_SOURCE,
    KernelBridgeCachedProfile,
    KernelBridgeCapabilityReceipt,
    KernelBridgeConnectionStatus,
    KernelBridgeRuntimeEvent,
    KernelBridgeSubscriptionProfile,
    M123_CHIME_EVENT_TYPE,
    M123ChimeFrameBoundary,
    PROTOCOL_VERSION,
    SPACETIME_PROJECTION_MODE_FULL,
    SPACETIME_PROJECTION_MODE_LITE
} from './types';

const RECONNECT_BASE_MS = 1500;
const RECONNECT_MAX_MS = 20000;

export interface WebSocketLike {
    readonly readyState: number;
    send(data: string): void;
    close(): void;
    addEventListener(type: 'open', listener: () => void): void;
    addEventListener(type: 'message', listener: (evt: { data: unknown }) => void): void;
    addEventListener(type: 'close', listener: (evt: { code: number; reason: string }) => void): void;
}

export type WebSocketFactory = (url: string) => WebSocketLike;

export interface GatewayClientCallbacks {
    onProfile?(profile: KernelBridgeCachedProfile): void;
    onStatus?(status: KernelBridgeConnectionStatus): void;
    onEvent?(event: KernelBridgeRuntimeEvent): void;
    /** The 1 Hz `m123.chime` tick event (bell spec §5) — the kernel's proof
     *  of what chimed at this tick. Routed here, never into the log ring. */
    onChime?(frame: M123ChimeFrameBoundary): void;
}

const WS_OPEN = 1;

export function defaultGatewayUrl(): string {
    // Dev/e2e-only seam: the Playwright real-UI gate runs the face against a
    // dedicated spawned gateway (not 18794). Vite only exposes VITE_-prefixed
    // vars, and only builds driven with this env set ever carry an override;
    // production/Tauri builds fall through to the canonical port.
    const override =
        typeof import.meta !== 'undefined'
            ? (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_EPI_GATEWAY_URL
            : undefined;
    return override || `ws://127.0.0.1:${DEFAULT_GATEWAY_PORT}`;
}

export class GatewayClient {
    private socket: WebSocketLike | null = null;
    private mode: KernelBridgeSubscriptionProfile = 'lite';
    private reconnectAttempt = 0;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private nextRequestId = 1;
    private disposed = true;
    private profileGeneration: number | null = null;
    private readonly pending = new Map<
        number,
        { resolve: (receipt: KernelBridgeCapabilityReceipt) => void; reject: (err: Error) => void }
    >();

    constructor(
        private readonly url: string = defaultGatewayUrl(),
        private readonly callbacks: GatewayClientCallbacks = {},
        private readonly createSocket: WebSocketFactory = u => new WebSocket(u) as unknown as WebSocketLike
    ) {}

    start(mode: KernelBridgeSubscriptionProfile = 'lite'): void {
        this.mode = mode;
        if (!this.disposed) {
            return;
        }
        this.disposed = false;
        this.openSocket();
    }

    dispose(): void {
        this.disposed = true;
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.socket && this.socket.readyState <= WS_OPEN) {
            try {
                this.socket.close();
            } catch {
                /* no-op */
            }
        }
        this.socket = null;
        this.emitStatus('disconnected', false, 'gateway client disposed');
        for (const [, pending] of this.pending) {
            pending.reject(new Error('gateway client disposed'));
        }
        this.pending.clear();
    }

    get connected(): boolean {
        return this.socket?.readyState === WS_OPEN;
    }

    invoke(method: string, params: Record<string, unknown> = {}): Promise<KernelBridgeCapabilityReceipt> {
        if (!this.socket || this.socket.readyState !== WS_OPEN) {
            return Promise.reject(new Error(`gateway: cannot invoke "${method}" — not connected`));
        }
        const id = this.nextRequestId++;
        const frame = { type: 'req', id, method, params };
        return new Promise<KernelBridgeCapabilityReceipt>((resolve, reject) => {
            this.pending.set(id, { resolve, reject });
            try {
                this.socket!.send(JSON.stringify(frame));
            } catch (err) {
                this.pending.delete(id);
                reject(err instanceof Error ? err : new Error(String(err)));
            }
        });
    }

    private openSocket(): void {
        if (this.disposed) {
            return;
        }
        this.emitStatus('connecting', false, `dialing ${this.url}`);
        let socket: WebSocketLike;
        try {
            socket = this.createSocket(this.url);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.scheduleReconnect(`websocket constructor failed: ${message}`);
            return;
        }
        this.socket = socket;

        socket.addEventListener('open', () => {
            this.reconnectAttempt = 0;
            this.emitStatus('connecting', false, 'socket open; connect handshake in flight');
            void this.invoke('connect', {})
                .then(() => {
                    this.emitStatus('connected', true, `protocol v${PROTOCOL_VERSION} connect-ok`);
                    return this.invoke('health', {});
                })
                .catch(err => {
                    const message = err instanceof Error ? err.message : String(err);
                    this.emitStatus('degraded', false, `connect handshake failed: ${message}`);
                });
        });
        socket.addEventListener('message', evt => this.handleIncoming(evt.data));
        socket.addEventListener('close', evt => {
            if (this.disposed) {
                return;
            }
            const reason = evt.reason && evt.reason.length > 0 ? evt.reason : `socket closed (code ${evt.code})`;
            this.scheduleReconnect(reason);
        });
    }

    private scheduleReconnect(reason: string): void {
        if (this.disposed) {
            return;
        }
        const delay = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * Math.pow(2, this.reconnectAttempt));
        this.reconnectAttempt += 1;
        this.emitStatus('reconnecting', false, `${reason}; retrying in ${delay}ms (attempt ${this.reconnectAttempt})`);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.openSocket();
        }, delay);
    }

    private handleIncoming(data: unknown): void {
        let parsed: any;
        try {
            parsed = typeof data === 'string' ? JSON.parse(data) : data;
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.emitEvent('observability', { warning: 'invalid_json_frame', message });
            return;
        }

        if (parsed && typeof parsed === 'object' && 'id' in parsed && this.pending.has(parsed.id)) {
            const pending = this.pending.get(parsed.id)!;
            this.pending.delete(parsed.id);
            if (parsed.error) {
                pending.reject(
                    new Error(
                        typeof parsed.error === 'object' && parsed.error.message
                            ? parsed.error.message
                            : JSON.stringify(parsed.error)
                    )
                );
                return;
            }
            pending.resolve(this.coerceReceipt(parsed.result, parsed.method ?? ''));
            return;
        }

        const eventName = parsed?.event ?? parsed?.method ?? null;
        if (eventName === 'health' || eventName === 'health.snapshot') {
            this.emitEvent('readiness', parsed?.payload ?? parsed?.params ?? parsed);
            return;
        }
        // Only profile events feed the tick store. The gateway's bare `tick`
        // event is a `{seq, ts}` liveness pulse, NOT a profile carrier — the
        // warehouse client conflated them, corrupting the profile cache.
        if (eventName === 'profile' || eventName === 'profile.update') {
            this.applyProfileEvent(parsed?.payload ?? parsed?.params ?? parsed);
            return;
        }
        // The chime frame is a 1 Hz kernel tick event (bell spec §5) — it
        // routes to its consumer, never into the observability log ring.
        if (eventName === M123_CHIME_EVENT_TYPE) {
            const frame = (parsed?.payload ?? parsed?.params ?? null) as M123ChimeFrameBoundary | null;
            if (frame && typeof frame.sourceProfileGeneration === 'number') {
                this.callbacks.onChime?.(frame);
                return;
            }
        }
        this.emitEvent('observability', parsed);
    }

    private applyProfileEvent(payload: any): void {
        const generation =
            typeof payload?.generation === 'number' ? payload.generation : (this.profileGeneration ?? 0) + 1;
        const privacyClass =
            typeof payload?.privacyClass === 'string' ? payload.privacyClass : KERNEL_BRIDGE_SAFE_PROFILE_PRIVACY;
        this.profileGeneration = generation;
        this.callbacks.onProfile?.({
            generation,
            cachedAtMs: Date.now(),
            stale: false,
            stalenessMs: 0,
            privacyClass,
            profile: payload
        });
        this.emitStatus('connected', true, `profile generation ${generation}`);
    }

    private emitStatus(
        state: KernelBridgeConnectionStatus['state'],
        connected: boolean,
        reason: string
    ): void {
        this.callbacks.onStatus?.({
            connected,
            state,
            mode: this.mode,
            subscriptionMode: this.mode === 'full' ? SPACETIME_PROJECTION_MODE_FULL : SPACETIME_PROJECTION_MODE_LITE,
            reason,
            profileGeneration: this.profileGeneration
        });
    }

    private emitEvent(kind: KernelBridgeRuntimeEvent['kind'], payload: unknown): void {
        this.callbacks.onEvent?.({
            kind,
            emittedAtMs: Date.now(),
            source: KERNEL_BRIDGE_SOURCE,
            profileGeneration: this.profileGeneration,
            privacyClass: 'public',
            payload
        });
    }

    private coerceReceipt(result: any, method: string): KernelBridgeCapabilityReceipt {
        return {
            method,
            gatewayMethod: result?.gatewayMethod ?? null,
            sessionKey: result?.sessionKey ?? '',
            profileGeneration: result?.profileGeneration ?? null,
            privacyClass: result?.privacyClass ?? 'public',
            provenanceHandles: Array.isArray(result?.provenanceHandles) ? result.provenanceHandles : [],
            vak: result?.vak ?? { vakAddress: { cpf: '', ct: '', cp: '', cf: '', cfp: '', cs: '' }, routeLineage: [] },
            artifact: result?.artifact ?? result
        };
    }
}
