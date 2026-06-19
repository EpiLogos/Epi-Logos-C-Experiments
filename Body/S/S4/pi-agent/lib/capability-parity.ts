/**
 * capability-parity.ts — 12.T12.10 capability-parity live-assertion (Pi runtime).
 *
 * Pi — NOT the ACR — owns the capability gate. At Pi startup the runtime queries
 * the gateway surface `s4'.mediation.capabilities.list` and asserts that the
 * gateway-exposed mediation capability set is in PARITY with Pi's own local
 * capability-matrix view. Any drift is a hard parity failure: that is how the
 * "no tool bypasses the entitlement contract" invariant (Tranche 12.32 —
 * [[no-tool-bypass.test.ts]]) stays live ACROSS the S0/S3/S4 boundary, not just
 * inside the TS core.
 *
 * The local truth is the union of:
 *   - `dispatch_tools[*].name` and `aletheia_mode_internal.tools[*].name` from
 *     `plugins/pleroma/capability-matrix.json` (the S4 authority), and
 *   - {@link ALETHEIA_MODE_INTERNAL_TOOLS} from the entitlement core (belt-and-
 *     braces — the canonical list the gate enforces).
 * Each name is tagged with its entitlement CLASS via {@link entitlementClassOf}
 * exactly as the gateway tags it, so parity covers both membership AND class.
 *
 * This module is dependency-free (node builtins only) so the parity check is
 * directly testable headless under `node --test`.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
	ALETHEIA_MODE_INTERNAL_TOOLS,
	ALETHEIA_MODE_INTERNAL_CLASS,
	STANDARD_ENTITLEMENT_CLASS,
	entitlementClassOf,
} from "./entitlement.ts";

/** The gateway method Pi queries at startup for the capability set. */
export const MEDIATION_CAPABILITIES_LIST_METHOD = "s4'.mediation.capabilities.list";

/** One capability row as returned by the gateway capabilities-list surface. */
export interface GatewayCapabilityEntry {
	name: string;
	entitlementClass: string;
}

/**
 * The shape of the `s4'.mediation.capabilities.list` response. The flat
 * `capabilities` array is the primary surface; the split `dispatchTools` /
 * `aletheiaModeInternalTools` arrays are tolerated for resilience.
 */
export interface GatewayCapabilityList {
	capabilities?: GatewayCapabilityEntry[];
	dispatchTools?: string[];
	aletheiaModeInternalTools?: string[];
	[key: string]: unknown;
}

/** A single class disagreement between local and gateway for one tool. */
export interface CapabilityClassMismatch {
	name: string;
	localClass: string;
	gatewayClass: string;
}

/** The structured verdict of a parity comparison. */
export interface CapabilityParityResult {
	ok: boolean;
	/** Local canonical names absent from the gateway list (a BYPASS risk). */
	missingFromGateway: string[];
	/** Gateway names absent from the local canonical view (drift the other way). */
	extraInGateway: string[];
	/** Names present on both sides but with disagreeing entitlement classes. */
	classMismatches: CapabilityClassMismatch[];
	/** Human-readable summary for logs / thrown errors. */
	reason: string;
}

const DEFAULT_MATRIX_URL = new URL(
	"../../plugins/pleroma/capability-matrix.json",
	import.meta.url,
);

interface CapabilityMatrixShape {
	dispatch_tools?: { name?: string }[];
	aletheia_mode_internal?: { tools?: { name?: string }[] };
}

/**
 * Build Pi's local canonical capability map — `name -> entitlement class` —
 * from the S4 capability matrix plus the canonical aletheia-mode-internal list.
 * The class is derived through {@link entitlementClassOf} so it matches the
 * gateway's classification rule exactly (no second classifier).
 */
export function localCanonicalCapabilities(matrixPath?: string): Map<string, string> {
	const path = matrixPath ?? fileURLToPath(DEFAULT_MATRIX_URL);
	const matrix = JSON.parse(readFileSync(path, "utf8")) as CapabilityMatrixShape;
	const map = new Map<string, string>();

	const add = (name: unknown): void => {
		if (typeof name !== "string") return;
		const trimmed = name.trim();
		if (trimmed.length === 0) return;
		map.set(trimmed, entitlementClassOf(trimmed));
	};

	for (const tool of matrix.dispatch_tools ?? []) add(tool?.name);
	for (const tool of matrix.aletheia_mode_internal?.tools ?? []) add(tool?.name);
	// Belt-and-braces: every canonical mediation-route tool must be represented
	// even if the matrix file drifts, since the gate enforces this exact list.
	for (const tool of ALETHEIA_MODE_INTERNAL_TOOLS) add(tool);

	return map;
}

/**
 * Normalise a gateway capabilities-list response into a `name -> class` map,
 * accepting either the flat `capabilities` array or the split tool arrays.
 */
export function gatewayCapabilityMap(list: GatewayCapabilityList): Map<string, string> {
	const map = new Map<string, string>();
	if (Array.isArray(list?.capabilities)) {
		for (const entry of list.capabilities) {
			if (!entry || typeof entry.name !== "string") continue;
			const name = entry.name.trim();
			if (name.length === 0) continue;
			map.set(
				name,
				typeof entry.entitlementClass === "string" && entry.entitlementClass.length > 0
					? entry.entitlementClass
					: STANDARD_ENTITLEMENT_CLASS,
			);
		}
	}
	for (const name of list?.dispatchTools ?? []) {
		if (typeof name === "string" && name.trim().length > 0 && !map.has(name.trim())) {
			map.set(name.trim(), STANDARD_ENTITLEMENT_CLASS);
		}
	}
	for (const name of list?.aletheiaModeInternalTools ?? []) {
		if (typeof name === "string" && name.trim().length > 0) {
			map.set(name.trim(), ALETHEIA_MODE_INTERNAL_CLASS);
		}
	}
	return map;
}

/**
 * Compare the gateway-exposed capability set against Pi's local canonical view.
 * Returns a structured {@link CapabilityParityResult}; `ok` is true only when
 * membership AND entitlement classes agree on both sides.
 */
export function assertCapabilityParity(
	gateway: GatewayCapabilityList,
	opts?: { matrixPath?: string },
): CapabilityParityResult {
	const local = localCanonicalCapabilities(opts?.matrixPath);
	const remote = gatewayCapabilityMap(gateway);

	const missingFromGateway = [...local.keys()]
		.filter((name) => !remote.has(name))
		.sort();
	const extraInGateway = [...remote.keys()]
		.filter((name) => !local.has(name))
		.sort();
	const classMismatches: CapabilityClassMismatch[] = [...local.entries()]
		.filter(([name]) => remote.has(name))
		.filter(([name, localClass]) => remote.get(name) !== localClass)
		.map(([name, localClass]) => ({
			name,
			localClass,
			gatewayClass: remote.get(name) as string,
		}))
		.sort((a, b) => a.name.localeCompare(b.name));

	const ok =
		missingFromGateway.length === 0 &&
		extraInGateway.length === 0 &&
		classMismatches.length === 0;

	const reason = ok
		? `capability parity holds (${local.size} capabilities)`
		: [
				missingFromGateway.length > 0
					? `missing from gateway: ${missingFromGateway.join(", ")}`
					: "",
				extraInGateway.length > 0
					? `extra in gateway: ${extraInGateway.join(", ")}`
					: "",
				classMismatches.length > 0
					? `class mismatch: ${classMismatches
							.map((m) => `${m.name}(local=${m.localClass}/gateway=${m.gatewayClass})`)
							.join(", ")}`
					: "",
			]
				.filter(Boolean)
				.join("; ");

	return { ok, missingFromGateway, extraInGateway, classMismatches, reason };
}

/** Thrown when startup parity is enforced (`strict`) and the gateway drifts. */
export class CapabilityParityError extends Error {
	readonly result: CapabilityParityResult;
	constructor(result: CapabilityParityResult) {
		super(`s4'.mediation.capabilities.list parity failed: ${result.reason}`);
		this.name = "CapabilityParityError";
		this.result = result;
	}
}

/** Fetches the gateway capability list (injected so the check is testable). */
export type GatewayCapabilityFetcher = () =>
	| Promise<GatewayCapabilityList | null>
	| GatewayCapabilityList
	| null;

/** Options for {@link assertGatewayCapabilityParityAtStartup}. */
export interface StartupParityOptions {
	matrixPath?: string;
	/**
	 * When true (default) a parity failure THROWS {@link CapabilityParityError}.
	 * Set false to log-and-continue (diagnostic mode). A NULL fetch (gateway not
	 * reachable yet) always degrades to a no-op regardless of `strict` — the
	 * gate is a parity check, not a liveness requirement.
	 */
	strict?: boolean;
	/** Optional sink for diagnostics; defaults to a no-op. */
	log?: (message: string) => void;
}

/**
 * The Pi-startup capability gate. Fetches the gateway capability list and
 * asserts parity against Pi's local view. Pi owns this gate (it runs at Pi
 * startup, not ACR startup). Returns the parity result, or `null` when the
 * gateway is not reachable (fetch returned null/threw) so startup is never
 * broken by an absent gateway. A reachable-but-drifted gateway is a hard
 * failure under `strict` (the default).
 */
export async function assertGatewayCapabilityParityAtStartup(
	fetcher: GatewayCapabilityFetcher,
	opts?: StartupParityOptions,
): Promise<CapabilityParityResult | null> {
	const log = opts?.log ?? (() => {});
	let list: GatewayCapabilityList | null;
	try {
		list = await fetcher();
	} catch (err) {
		log(
			`[capability-parity] gateway unreachable; deferring parity check (${
				err instanceof Error ? err.message : String(err)
			})`,
		);
		return null;
	}
	if (!list) {
		log("[capability-parity] no gateway capability list available; deferring parity check");
		return null;
	}

	const result = assertCapabilityParity(list, { matrixPath: opts?.matrixPath });
	if (result.ok) {
		log(`[capability-parity] ${result.reason}`);
		return result;
	}

	if (opts?.strict === false) {
		log(`[capability-parity] DRIFT (non-strict): ${result.reason}`);
		return result;
	}
	throw new CapabilityParityError(result);
}
