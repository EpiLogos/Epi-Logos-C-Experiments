/**
 * Epi-Claw Gateway Client for Renderer
 *
 * Uses the shared main-process epiClaw transport instead of opening a second
 * WebSocket from renderer. This keeps handshake/auth 1:1 with the core app
 * connection path.
 */

// Types for JSON-RPC 2.0 protocol
export type GatewayEventFrame = {
  type: "event";
  event: string;
  payload?: unknown;
  seq?: number;
  stateVersion?: { presence: number; health: number };
};

export type GatewayHelloOk = {
  type: "hello-ok";
  protocol: number;
  features?: { methods?: string[]; events?: string[] };
  snapshot?: unknown;
  auth?: {
    deviceToken?: string;
    role?: string;
    scopes?: string[];
    issuedAtMs?: number;
  };
  policy?: { tickIntervalMs?: number };
};

export type GatewayClientOptions = {
  url: string;
  token?: string;
  password?: string;
  onHello?: (hello: GatewayHelloOk) => void;
  onEvent?: (evt: GatewayEventFrame) => void;
  onClose?: (info: { code: number; reason: string }) => void;
  onGap?: (info: { expected: number; received: number }) => void;
};

export class GatewayClient {
  private closed = false;
  private isConnectedFlag = false;
  private unsubscribers: Array<() => void> = [];
  private readonly lastSeqByEvent = new Map<string, number>();
  private readonly passthroughEvents = [
    "chat",
    "chat.delta",
    "chat.final",
    "chat.error",
    "chat.aborted",
    "agent",
    "device.pair.requested",
    "device.pair.resolved",
  ];
  private helloSent = false;

  constructor(private opts: GatewayClientOptions) {}

  start() {
    this.closed = false;
    this.helloSent = false;
    void this.startAsync();
  }

  stop() {
    this.closed = true;
    this.isConnectedFlag = false;
    this.helloSent = false;
    this.lastSeqByEvent.clear();
    for (const off of this.unsubscribers.splice(0)) {
      try {
        off();
      } catch {
        // ignore cleanup errors
      }
    }
  }

  get connected() {
    return this.isConnectedFlag;
  }

  private async startAsync() {
    // Keep main-process S3' gateway socket credentials aligned with UI input.
    try {
      await window.sPrime?.s3?.websocket?.configure?.({
        url: this.opts.url,
        token: this.opts.token ?? null,
        password: this.opts.password ?? null,
      });
    } catch (err) {
      // Continue initialization: the main S3' socket may already be connected,
      // and hard-failing here forces a manual reconnect.
      console.warn('[GatewayClient] s3.websocket.configure failed; continuing with existing connection', err);
    }

    const onConnected = window.sPrime?.epiClaw?.onConnected?.(() => {
      if (this.closed) return;
      this.isConnectedFlag = true;
      this.emitHelloOnce();
    });
    const onDisconnected = window.sPrime?.epiClaw?.onDisconnected?.(() => {
      if (this.closed) return;
      this.isConnectedFlag = false;
      this.opts.onClose?.({ code: 1000, reason: "disconnected" });
    });
    const onError = window.sPrime?.epiClaw?.onError?.((error) => {
      if (this.closed) return;
      this.opts.onClose?.({ code: 1011, reason: error });
    });
    if (onConnected) this.unsubscribers.push(onConnected);
    if (onDisconnected) this.unsubscribers.push(onDisconnected);
    if (onError) this.unsubscribers.push(onError);

    // Reconcile missed connected edges by polling for a short period.
    let checksRemaining = 24; // ~12s @ 500ms
    const edgePoll = window.setInterval(() => {
      if (this.closed || this.helloSent) {
        window.clearInterval(edgePoll);
        return;
      }
      checksRemaining -= 1;
      void window.sPrime?.epiClaw?.isConnected?.().then((connected) => {
        if (this.closed || this.helloSent) return;
        if (connected) {
          this.isConnectedFlag = true;
          this.emitHelloOnce();
          window.clearInterval(edgePoll);
          return;
        }
        if (checksRemaining <= 0) {
          window.clearInterval(edgePoll);
        }
      });
    }, 500);
    this.unsubscribers.push(() => window.clearInterval(edgePoll));

    for (const eventName of this.passthroughEvents) {
      const off = window.sPrime?.epiClaw?.subscribe?.(eventName, (incoming) => {
        if (this.closed) return;
        const evt = this.toEventFrame(eventName, incoming);
        this.maybeReportGap(evt);
        this.opts.onEvent?.(evt);
      });
      if (off) {
        this.unsubscribers.push(off);
      }
    }

    const connected = await window.sPrime?.epiClaw?.isConnected?.();
    if (connected) {
      this.isConnectedFlag = true;
      this.emitHelloOnce();
    }
  }

  private async emitHelloOnce() {
    if (this.closed || this.helloSent) return;
    this.helloSent = true;
    const summary = await this.requestUnknown("status.summary", {}).catch(() => null);
    const hello: GatewayHelloOk = {
      type: "hello-ok",
      protocol: 3,
      snapshot: summary ?? undefined,
      auth: {
        role: "operator",
        scopes: ["operator.admin", "operator.approvals", "operator.pairing"],
      },
      policy: { tickIntervalMs: 30000 },
    };
    this.opts.onHello?.(hello);
  }

  private toEventFrame(eventName: string, incoming: unknown): GatewayEventFrame {
    if (incoming && typeof incoming === "object") {
      const candidate = incoming as Partial<GatewayEventFrame>;
      if (candidate.type === "event" && typeof candidate.event === "string") {
        return {
          type: "event",
          event: candidate.event,
          payload: candidate.payload,
          seq: typeof candidate.seq === "number" ? candidate.seq : undefined,
          stateVersion: candidate.stateVersion,
        };
      }
    }
    return {
      type: "event",
      event: eventName,
      payload: incoming,
    };
  }

  private maybeReportGap(evt: GatewayEventFrame) {
    if (typeof evt.seq !== "number") return;

    const previous = this.lastSeqByEvent.get(evt.event);
    if (typeof previous === "number") {
      const expected = previous + 1;
      if (evt.seq > expected) {
        this.opts.onGap?.({ expected, received: evt.seq });
      }
    }

    this.lastSeqByEvent.set(evt.event, evt.seq);
  }

  request<T = unknown>(method: string, params?: unknown): Promise<T> {
    return this.requestUnknown(method, params).then((value) => value as T);
  }

  private async requestUnknown(method: string, params?: unknown): Promise<unknown> {
    if (this.closed) {
      throw new Error("gateway client stopped");
    }
    const res = await window.sPrime?.epiClaw?.request?.(method, params as Record<string, unknown> | undefined);
    if (!res?.success) {
      throw new Error(res?.error || "request failed");
    }
    return res.result;
  }
}

/**
 * Default gateway URL for Epi-Claw
 * Port 18794 — canonical S3' gateway port (epi gate)
 */
export const DEFAULT_GATEWAY_URL = "ws://localhost:18794";
