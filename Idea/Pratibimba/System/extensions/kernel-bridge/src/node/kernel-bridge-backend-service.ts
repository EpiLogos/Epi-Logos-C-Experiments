import { injectable } from '@theia/core/shared/inversify';
import {
    DEFAULT_GATEWAY_PORT,
    KERNEL_BRIDGE_SAFE_PROFILE_PRIVACY,
    KERNEL_BRIDGE_SOURCE,
    KernelBridgeCachedProfile,
    KernelBridgeCapabilityReceipt,
    KernelBridgeCapabilityRequest,
    KernelBridgeConnectionStatus,
    KernelBridgeSubscriptionProfile,
    PROTOCOL_VERSION,
    SPACETIME_PROJECTION_MODE_FULL,
    SPACETIME_PROJECTION_MODE_LITE
} from '../common/types';
import {
    KernelBridgeBackendService,
    KernelBridgeFrontendClient
} from '../common/protocol';

const RECONNECT_BASE_MS = 1500;
const RECONNECT_MAX_MS = 20000;

@injectable()
export class KernelBridgeBackendServiceImpl implements KernelBridgeBackendService {
    private client: KernelBridgeFrontendClient | undefined;
    private socket: WebSocket | null = null;
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

    constructor(private readonly gatewayUrl: string = inferGatewayUrl()) {}

    setClient(client: KernelBridgeFrontendClient | undefined): void {
        this.client = client;
    }

    async start(mode: KernelBridgeSubscriptionProfile): Promise<void> {
        this.mode = mode;
        if (!this.disposed) {
            return;
        }
        this.disposed = false;
        this.openSocket();
    }

    async stop(): Promise<void> {
        this.disposed = true;
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.socket && this.socket.readyState <= WebSocket.OPEN) {
            try {
                this.socket.close();
            } catch {
                /* no-op */
            }
        }
        this.socket = null;
        this.applyConnectionStatus({
            connected: false,
            state: 'disconnected',
            mode: this.mode,
            subscriptionMode: subscriptionModeFor(this.mode),
            reason: 'kernel-bridge backend service stopped',
            profileGeneration: this.profileGeneration
        });
        for (const [, pending] of this.pending) {
            pending.reject(new Error('kernel-bridge backend service stopped'));
        }
        this.pending.clear();
    }

    async requestSubscriptionMode(mode: KernelBridgeSubscriptionProfile): Promise<void> {
        this.mode = mode === 'full' ? 'full' : 'lite';
        this.applyConnectionStatus({
            connected: this.socket?.readyState === WebSocket.OPEN,
            state: this.socket?.readyState === WebSocket.OPEN ? 'connected' : 'reconnecting',
            mode: this.mode,
            subscriptionMode: subscriptionModeFor(this.mode),
            reason: `subscription mode requested by layout: ${this.mode}`,
            profileGeneration: this.profileGeneration
        });
    }

    async invokeCapability(
        request: KernelBridgeCapabilityRequest
    ): Promise<KernelBridgeCapabilityReceipt> {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            throw new Error(
                `kernel-bridge: cannot invoke "${request.method}" — gateway not connected`
            );
        }
        const id = this.nextRequestId++;
        const frame = {
            jsonrpc: '2.0',
            id,
            method: request.method,
            params: {
                sessionKey: request.sessionKey,
                profileGeneration: request.profileGeneration,
                provenanceHandles: request.provenanceHandles,
                vak: request.vak,
                ...((request.params as Record<string, unknown>) ?? {})
            }
        };
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
        this.applyConnectionStatus({
            connected: false,
            state: 'connecting',
            mode: this.mode,
            subscriptionMode: subscriptionModeFor(this.mode),
            reason: `backend dialing ${this.gatewayUrl}`,
            profileGeneration: this.profileGeneration
        });

        let socket: WebSocket;
        try {
            socket = createGatewayWebSocket(this.gatewayUrl);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.scheduleReconnect(`websocket constructor failed: ${message}`);
            return;
        }
        this.socket = socket;

        socket.addEventListener('open', () => {
            this.reconnectAttempt = 0;
            this.applyConnectionStatus({
                connected: true,
                state: 'connected',
                mode: this.mode,
                subscriptionMode: subscriptionModeFor(this.mode),
                reason: `protocol v${PROTOCOL_VERSION}`,
                profileGeneration: this.profileGeneration
            });
            this.sendRaw({
                jsonrpc: '2.0',
                method: 'health',
                params: {},
                id: this.nextRequestId++
            });
        });

        socket.addEventListener('message', evt => this.handleIncoming(evt.data));
        socket.addEventListener('close', evt => {
            if (this.disposed) {
                return;
            }
            const reason =
                evt.reason && evt.reason.length > 0
                    ? evt.reason
                    : `socket closed (code ${evt.code})`;
            this.scheduleReconnect(reason);
        });
    }

    private scheduleReconnect(reason: string): void {
        if (this.disposed) {
            return;
        }
        const delay = Math.min(
            RECONNECT_MAX_MS,
            RECONNECT_BASE_MS * Math.pow(2, this.reconnectAttempt)
        );
        this.reconnectAttempt += 1;
        this.applyConnectionStatus({
            connected: false,
            state: 'reconnecting',
            mode: this.mode,
            subscriptionMode: subscriptionModeFor(this.mode),
            reason: `${reason}; retrying in ${delay}ms (attempt ${this.reconnectAttempt})`,
            profileGeneration: this.profileGeneration
        });
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
            this.client?.notifyRuntimeEvent({
                kind: 'observability',
                emittedAtMs: Date.now(),
                source: KERNEL_BRIDGE_SOURCE,
                profileGeneration: this.profileGeneration,
                privacyClass: 'public',
                payload: { warning: 'invalid_json_frame', message }
            });
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
            pending.resolve(this.coerceCapabilityReceipt(parsed.result, parsed.method));
            return;
        }

        const eventName = parsed?.event ?? parsed?.method ?? null;
        if (eventName === 'health' || eventName === 'health.snapshot') {
            this.client?.notifyRuntimeEvent({
                kind: 'readiness',
                emittedAtMs: Date.now(),
                source: KERNEL_BRIDGE_SOURCE,
                profileGeneration: this.profileGeneration,
                privacyClass: 'public',
                payload: parsed?.payload ?? parsed?.params ?? parsed
            });
            return;
        }
        if (eventName === 'tick' || eventName === 'profile' || eventName === 'profile.update') {
            this.applyProfileEvent(parsed?.payload ?? parsed?.params ?? parsed);
            return;
        }
        this.client?.notifyRuntimeEvent({
            kind: 'observability',
            emittedAtMs: Date.now(),
            source: KERNEL_BRIDGE_SOURCE,
            profileGeneration: this.profileGeneration,
            privacyClass: 'public',
            payload: parsed
        });
    }

    private applyProfileEvent(payload: any): void {
        const generation =
            typeof payload?.generation === 'number'
                ? payload.generation
                : (this.profileGeneration ?? 0) + 1;
        const privacyClass =
            typeof payload?.privacyClass === 'string'
                ? payload.privacyClass
                : KERNEL_BRIDGE_SAFE_PROFILE_PRIVACY;
        this.profileGeneration = generation;
        const cached: KernelBridgeCachedProfile = {
            generation,
            cachedAtMs: Date.now(),
            stale: false,
            stalenessMs: 0,
            privacyClass,
            profile: payload
        };
        this.client?.notifyProfile(cached);
        this.applyConnectionStatus({
            connected: true,
            state: 'connected',
            mode: this.mode,
            subscriptionMode: subscriptionModeFor(this.mode),
            reason: `profile generation ${generation}`,
            profileGeneration: generation
        });
    }

    private sendRaw(frame: unknown): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            try {
                this.socket.send(JSON.stringify(frame));
            } catch {
                /* close handler will reconnect */
            }
        }
    }

    private coerceCapabilityReceipt(result: any, method: string): KernelBridgeCapabilityReceipt {
        return {
            method,
            gatewayMethod: result?.gatewayMethod ?? null,
            sessionKey: result?.sessionKey ?? '',
            profileGeneration: result?.profileGeneration ?? null,
            privacyClass: result?.privacyClass ?? 'public',
            provenanceHandles: Array.isArray(result?.provenanceHandles) ? result.provenanceHandles : [],
            vak: result?.vak ?? { vakAddress: emptyVakAddress(), routeLineage: [] },
            artifact: result?.artifact ?? result
        };
    }

    private applyConnectionStatus(status: KernelBridgeConnectionStatus): void {
        this.client?.notifyConnectionStatus(status);
    }
}
function inferGatewayUrl(): string {
    const env = process.env.EPI_GATEWAY_URL;
    if (env && env.length > 0) {
        return env;
    }
    return `ws://127.0.0.1:${DEFAULT_GATEWAY_PORT}`;
}

function subscriptionModeFor(mode: KernelBridgeSubscriptionProfile): string {
    return mode === 'full' ? SPACETIME_PROJECTION_MODE_FULL : SPACETIME_PROJECTION_MODE_LITE;
}

function createGatewayWebSocket(url: string): WebSocket {
    const globalCtor = (globalThis as { WebSocket?: typeof WebSocket }).WebSocket;
    if (globalCtor) {
        return new globalCtor(url);
    }
    // Theia's backend runtime carries `ws`; keep it lazy so browser bundles
    // never receive this dependency or a direct gateway consumer.
    const wsModule = require('ws') as { WebSocket?: typeof WebSocket } | typeof WebSocket;
    const Ctor =
        typeof wsModule === 'function'
            ? wsModule
            : (wsModule as { WebSocket?: typeof WebSocket }).WebSocket;
    if (!Ctor) {
        throw new Error('kernel-bridge backend cannot locate a WebSocket constructor');
    }
    return new Ctor(url);
}

function emptyVakAddress() {
    return { cpf: '', ct: '', cp: '', cf: '', cfp: '', cs: '' };
}
