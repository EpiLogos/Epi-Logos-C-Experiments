/**
 * gateway-call.ts — one way for an S4 carrier to call the S3 gateway.
 *
 * # Why this exists
 *
 * Three modules had grown independent copies of the same forty lines: open a
 * websocket, send `connect`, wait for the handshake response, send the real
 * request, match the response by id, unwrap `error`, close, and race the whole
 * thing against a timeout (`q-review-night-pass.ts`, then `vak-eval-emit.ts`,
 * then `orchestration-trace.ts`). Each copy re-derived the same frame protocol,
 * which means each could drift from it independently — and a protocol detail
 * fixed in one would stay broken in the other two.
 *
 * The carriers keep what is genuinely theirs: which method to call, what params
 * to build, what refusals to raise, and how to read the result. What they no
 * longer each own is the socket dance.
 *
 * # What it deliberately does not do
 *
 * No retries, no reconnection, no queueing. A gateway call that fails is a fact
 * the caller has to handle, not something to paper over — an S4 carrier that
 * silently retried a deposit could double-write a transcript record.
 *
 * Canon: [[S3-SPEC]] (gateway protocol) -> [[S4-SPEC]] (carrier dispatch).
 */

const CONNECT_METHOD = "connect";
const CONNECT_REQUEST_ID = 1;
const CALL_REQUEST_ID = 2;
const DEFAULT_GATEWAY_URL = "ws://127.0.0.1:18794";
const DEFAULT_TIMEOUT_MS = 30_000;

/** The minimal socket surface a gateway call needs. */
export interface GatewaySocket {
	send(data: string): void;
	close(): void;
	addEventListener(type: "open", listener: () => void): void;
	addEventListener(type: "message", listener: (event: { data: unknown }) => void): void;
	addEventListener(type: "error", listener: () => void): void;
}

export interface GatewayCallOptions {
	gatewayUrl?: string;
	timeoutMs?: number;
	/** Injectable so a test can drive the protocol without a network. */
	createSocket?: (url: string) => GatewaySocket;
}

/** A request frame, as the carriers build it. */
export interface GatewayRequest {
	readonly method: string;
	readonly params: Record<string, unknown>;
}

/** Raised when the gateway could not be reached, refused, or did not answer. */
export class GatewayCallError extends Error {
	readonly method: string;

	constructor(method: string, message: string) {
		super(message);
		this.name = "GatewayCallError";
		this.method = method;
	}
}

/** Build the id-tagged connect + call frames a gateway exchange needs. */
export function gatewayFrames(request: GatewayRequest) {
	return {
		connect: {
			type: "req" as const,
			id: CONNECT_REQUEST_ID,
			method: CONNECT_METHOD,
			params: {},
		},
		call: {
			type: "req" as const,
			id: CALL_REQUEST_ID,
			method: request.method,
			params: request.params,
		},
	};
}

/**
 * Call one gateway method and resolve its result object.
 *
 * Handshake first — the gateway requires `connect` before it will dispatch —
 * then the request, matched by id so an interleaved event frame cannot be
 * mistaken for the answer.
 */
export function callGateway(
	request: GatewayRequest,
	options: GatewayCallOptions = {},
): Promise<Record<string, unknown>> {
	const frames = gatewayFrames(request);
	const gatewayUrl = options.gatewayUrl ?? process.env.EPI_GATEWAY_URL ?? DEFAULT_GATEWAY_URL;
	const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
	const createSocket =
		options.createSocket ?? ((url: string) => new WebSocket(url) as unknown as GatewaySocket);

	return new Promise((resolve, reject) => {
		let settled = false;
		let socket: GatewaySocket | null = null;
		const finish = (result: Record<string, unknown> | Error) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			try {
				socket?.close();
			} catch {
				// The result/error is authoritative; close is best-effort cleanup.
			}
			if (result instanceof Error) reject(result);
			else resolve(result);
		};
		const timer = setTimeout(
			() =>
				finish(
					new GatewayCallError(request.method, `${request.method} timed out after ${timeoutMs}ms`),
				),
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
			activeSocket.send(JSON.stringify(frames.connect));
		});
		activeSocket.addEventListener("error", () => {
			finish(
				new GatewayCallError(
					request.method,
					`${request.method} could not reach the gateway at ${gatewayUrl}`,
				),
			);
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
					finish(
						new GatewayCallError(
							request.method,
							`${request.method} handshake failed: ${gatewayErrorMessage(frame.error)}`,
						),
					);
					return;
				}
				activeSocket.send(JSON.stringify(frames.call));
				return;
			}
			if (frame.id !== CALL_REQUEST_ID) return;
			if (frame.error) {
				finish(
					new GatewayCallError(
						request.method,
						`${request.method} refused: ${gatewayErrorMessage(frame.error)}`,
					),
				);
				return;
			}
			const result = frame.result;
			if (!result || typeof result !== "object" || Array.isArray(result)) {
				finish(new GatewayCallError(request.method, `${request.method} returned no result`));
				return;
			}
			finish(result as Record<string, unknown>);
		});
	});
}

/** Unwrap a gateway error frame's message without assuming its shape. */
export function gatewayErrorMessage(error: unknown): string {
	if (error && typeof error === "object" && "message" in error) {
		return String((error as { message: unknown }).message);
	}
	return String(error);
}
