/**
 * Coordinate: S4-5' (Aletheia night-pass gateway adapter)
 * Residency: Body/S/S4/ta-onta/S4-5p-aletheia/modules
 * Position (#n): #5 - crystallisation return
 * Actualises: the Chronos-triggered Aletheia night pass into the S5-owned
 * Q-review queue without constructing or supplying corpus data.
 * Public surface: runQReviewNightPass and qReviewNightPassRequest.
 * Does NOT own: temporal scheduling, graph reads, detector policy, queue
 * persistence, review decisions, or promotion.
 * Contract: [[S4-5'-SPEC]] / [[S5-SPEC]] / [[S5-ARCHITECTURE]]
 */

export const Q_REVIEW_NIGHT_PASS_METHOD = "s5'.improve.q_review.night_pass";

const CONNECT_METHOD = "connect";
const CONNECT_REQUEST_ID = 1;
const NIGHT_PASS_REQUEST_ID = 2;
const DEFAULT_GATEWAY_URL = "ws://127.0.0.1:18794";
const DEFAULT_TIMEOUT_MS = 30_000;

interface GatewaySocket {
  send(data: string): void;
  close(): void;
  addEventListener(type: "open", listener: () => void): void;
  addEventListener(type: "message", listener: (event: { data: unknown }) => void): void;
  addEventListener(type: "error", listener: () => void): void;
}

export interface QReviewNightPassReceipt {
  dayId: string;
  graphRevision: number;
  entryCount: number;
}

export interface QReviewNightPassOptions {
  gatewayUrl?: string;
  timeoutMs?: number;
  createSocket?: (url: string) => GatewaySocket;
}

export function qReviewNightPassRequest(dayId: string, lastReviewEpoch = 0) {
  const normalizedDayId = dayId.trim();
  if (!normalizedDayId || /[\\/]/.test(normalizedDayId)) {
    throw new Error("Q-review night pass requires a safe non-empty day_id");
  }
  if (!Number.isSafeInteger(lastReviewEpoch) || lastReviewEpoch < 0) {
    throw new Error("Q-review night pass last_review_epoch must be a non-negative integer");
  }
  return {
    type: "req" as const,
    id: NIGHT_PASS_REQUEST_ID,
    method: Q_REVIEW_NIGHT_PASS_METHOD,
    params: {
      day_id: normalizedDayId,
      last_review_epoch: lastReviewEpoch,
    },
  };
}

/**
 * Run the real S5 night-pass endpoint after Aletheia crystallisation.
 *
 * This adapter carries only temporal context. The endpoint opens the S2 graph
 * projection itself, which prevents Aletheia from smuggling a synthetic corpus
 * into S5 curation.
 */
export function runQReviewNightPass(
  dayId: string,
  lastReviewEpoch = 0,
  options: QReviewNightPassOptions = {},
): Promise<QReviewNightPassReceipt> {
  const request = qReviewNightPassRequest(dayId, lastReviewEpoch);
  const gatewayUrl = options.gatewayUrl ?? process.env.EPI_GATEWAY_URL ?? DEFAULT_GATEWAY_URL;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const createSocket = options.createSocket ?? ((url: string) => new WebSocket(url) as unknown as GatewaySocket);

  return new Promise((resolve, reject) => {
    let settled = false;
    let socket: GatewaySocket | null = null;
    const finish = (result: QReviewNightPassReceipt | Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      try {
        socket?.close();
      } catch {
        // The receipt/error is authoritative; close is best-effort cleanup.
      }
      if (result instanceof Error) reject(result);
      else resolve(result);
    };
    const timeout = setTimeout(
      () => finish(new Error(`Q-review night pass timed out after ${timeoutMs}ms`)),
      timeoutMs,
    );

    try {
      socket = createSocket(gatewayUrl);
    } catch (error) {
      finish(error instanceof Error ? error : new Error(String(error)));
      return;
    }
    const activeSocket = socket;

    activeSocket.addEventListener("open", () => {
      activeSocket.send(JSON.stringify({ type: "req", id: CONNECT_REQUEST_ID, method: CONNECT_METHOD, params: {} }));
    });
    activeSocket.addEventListener("error", () => {
      finish(new Error(`Q-review night pass could not connect to gateway at ${gatewayUrl}`));
    });
    activeSocket.addEventListener("message", (event) => {
      let frame: Record<string, unknown>;
      try {
        frame = JSON.parse(String(event.data)) as Record<string, unknown>;
      } catch {
        return;
      }
      if (frame.type !== "res") return;
      if (frame.id === CONNECT_REQUEST_ID) {
        if (frame.error) {
          finish(new Error(`Q-review night pass gateway handshake failed: ${errorMessage(frame.error)}`));
          return;
        }
        activeSocket.send(JSON.stringify(request));
        return;
      }
      if (frame.id !== NIGHT_PASS_REQUEST_ID) return;
      if (frame.error) {
        finish(new Error(`Q-review night pass failed: ${errorMessage(frame.error)}`));
        return;
      }
      const result = frame.result;
      if (!result || typeof result !== "object" || Array.isArray(result)) {
        finish(new Error("Q-review night pass returned no queue receipt"));
        return;
      }
      const queue = result as Record<string, unknown>;
      const graphRevision = queue.graph_revision;
      const entries = queue.entries;
      if (
        queue.day_id !== request.params.day_id ||
        !Number.isSafeInteger(graphRevision) ||
        !Array.isArray(entries)
      ) {
        finish(new Error("Q-review night pass returned an invalid queue receipt"));
        return;
      }
      finish({ dayId: request.params.day_id, graphRevision, entryCount: entries.length });
    });
  });
}

function errorMessage(value: unknown): string {
  if (value && typeof value === "object" && "message" in value && typeof value.message === "string") {
    return value.message;
  }
  return typeof value === "string" ? value : JSON.stringify(value);
}
