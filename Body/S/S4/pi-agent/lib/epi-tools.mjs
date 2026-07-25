/**
 * epi-tools.mjs — the code-mode tool bridge, as seen from inside the program (50.T50.01).
 *
 * A copy of this module is materialised next to every emitted code-mode program.
 * The program imports `tools` from it and calls its entitled tools as ordinary
 * async functions:
 *
 *   import { tools } from "./epi-tools.mjs";
 *   const spec = await tools.read({ path: "CONTRACT.md" });
 *
 * There is no tool logic here. Each call is forwarded as one JSON line over a
 * unix socket to the parent, which is the sole authority on whether the call is
 * permitted — the spawn-time `--tools` allow-list, then `isEntitled()`. A
 * refused call rejects inside the program with the parent's reason, so a program
 * cannot reach past its entitlement by any route.
 *
 * Plain `.mjs` on purpose: it is copied into a temp run directory and must load
 * with zero build step and zero type-stripping considerations.
 *
 * Canon: [[S4-SPEC]] -> agent runtime tool dispatch.
 */

import { connect } from "node:net";

const SOCKET_ENV = "EPI_CODE_MODE_SOCKET";

/** Error thrown inside the program when the parent refuses or fails a call. */
export class ToolCallError extends Error {
	constructor(tool, message, refusalCode) {
		super(`tool "${tool}" failed: ${message}`);
		this.name = "ToolCallError";
		this.tool = tool;
		this.refusalCode = refusalCode;
	}
}

let connection = null;

function openConnection() {
	if (connection) return connection;

	const socketPath = process.env[SOCKET_ENV];
	if (!socketPath) {
		throw new Error(
			`code-mode bridge unavailable: ${SOCKET_ENV} is not set (this program must be run by runToolScript)`,
		);
	}

	const pending = new Map();
	let nextId = 1;
	let buffer = "";
	let fatal = null;

	const socket = connect(socketPath);
	socket.setEncoding("utf8");

	// The bridge must not keep the program alive. An open socket is an active
	// libuv handle, so a program that finished its work would hang forever
	// waiting on a channel nobody will write to again. Hold the event loop open
	// ONLY while a call is actually in flight.
	socket.unref();
	const holdEventLoop = () => {
		socket.ref();
	};
	const releaseEventLoop = () => {
		if (pending.size === 0) socket.unref();
	};

	const ready = new Promise((resolve, reject) => {
		socket.once("connect", resolve);
		socket.once("error", reject);
	});

	socket.on("data", (chunk) => {
		buffer += chunk;
		let index = buffer.indexOf("\n");
		while (index >= 0) {
			const line = buffer.slice(0, index);
			buffer = buffer.slice(index + 1);
			if (line.trim().length > 0) {
				let message;
				try {
					message = JSON.parse(line);
				} catch {
					message = null;
				}
				if (message && pending.has(message.id)) {
					const { resolve: settle } = pending.get(message.id);
					pending.delete(message.id);
					releaseEventLoop();
					settle(message);
				}
			}
			index = buffer.indexOf("\n");
		}
	});

	const fail = (err) => {
		fatal = err instanceof Error ? err : new Error(String(err));
		const waiting = [...pending.values()];
		pending.clear();
		releaseEventLoop();
		for (const { reject } of waiting) reject(fatal);
	};
	socket.on("error", fail);
	socket.on("close", () => {
		if (pending.size > 0) fail(new Error("code-mode bridge closed mid-call"));
	});

	connection = {
		async call(tool, params) {
			if (fatal) throw fatal;
			holdEventLoop();
			try {
				await ready;
			} catch (err) {
				releaseEventLoop();
				throw err;
			}
			const id = nextId++;
			const response = await new Promise((resolve, reject) => {
				pending.set(id, { resolve, reject });
				socket.write(`${JSON.stringify({ id, tool, params: params ?? {} })}\n`);
			});
			if (!response.ok) {
				throw new ToolCallError(tool, response.error ?? "unknown error", response.refusalCode);
			}
			return response.result;
		},
		close() {
			socket.end();
			connection = null;
		},
	};
	return connection;
}

/** Call one entitled tool by name. `tools.<name>(params)` routes here. */
export function callTool(tool, params) {
	return openConnection().call(tool, params);
}

/** Close the bridge. Optional — the socket closes with the process. */
export function closeTools() {
	if (connection) connection.close();
}

/**
 * The entitled tool surface. Any property is callable as an async function; the
 * parent decides whether the named tool is reachable, so this proxy never needs
 * to know the allow-list.
 */
export const tools = new Proxy(Object.create(null), {
	get(_target, property) {
		if (typeof property !== "string") return undefined;
		if (property === "then") return undefined; // not a thenable
		return (params) => callTool(property, params);
	},
	has() {
		return true;
	},
});

export default tools;
