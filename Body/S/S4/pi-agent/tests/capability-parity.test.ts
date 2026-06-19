/**
 * capability-parity.test.ts — 12.T12.10 verification (Pi-runtime parity gate).
 *
 * Pi — NOT the ACR — owns the capability gate. At Pi startup the runtime queries
 * the gateway surface `s4'.mediation.capabilities.list` and asserts the
 * gateway-exposed mediation capability set is in PARITY with Pi's own local
 * capability-matrix view (membership AND entitlement class). That is how the
 * "no tool bypasses the entitlement contract" invariant (Tranche 12.32 —
 * [[no-tool-bypass.test.ts]]) stays live across the S0/S3/S4 boundary, not just
 * inside the TS core.
 *
 * This suite drives {@link assertGatewayCapabilityParityAtStartup} — the exact
 * function `composite-entry.ts` wires into `session_start` — with a gateway
 * fixture built INDEPENDENTLY from the S4 authority
 * (`plugins/pleroma/capability-matrix.json`) the way the S0 gateway adapter
 * (`gate/anima.rs::mediation_capabilities_list`) builds it: dispatch tools +
 * aletheia-mode-internal tools, deduped, each tagged with its entitlement class.
 * Two independently-built views being in parity is the contract under test.
 *
 *   1. parity_holds_at_startup — a faithful gateway list passes strict parity.
 *   2. drift fails hard — missing tool, extra tool, and class mismatch each
 *      throw CapabilityParityError under strict (the startup default would have
 *      thrown).
 *   3. an unreachable gateway (null / throwing fetcher) degrades to a no-op so a
 *      down gateway never breaks the load-bearing Pi launch.
 *   4. the method name Pi queries is the canonical surface string.
 *
 * Run: node --test --test-name-pattern 'parity'
 *      (spec-ahead: `pnpm --filter @epi-logos/pi-agent test --testNamePattern ...`)
 */
import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
	ALETHEIA_MODE_INTERNAL_CLASS,
	STANDARD_ENTITLEMENT_CLASS,
} from "../lib/entitlement.ts";
import {
	MEDIATION_CAPABILITIES_LIST_METHOD,
	CapabilityParityError,
	assertCapabilityParity,
	assertGatewayCapabilityParityAtStartup,
	type GatewayCapabilityEntry,
	type GatewayCapabilityList,
} from "../lib/capability-parity.ts";

const matrixPath = fileURLToPath(
	new URL("../../plugins/pleroma/capability-matrix.json", import.meta.url),
);
const matrix = JSON.parse(readFileSync(matrixPath, "utf8")) as {
	dispatch_tools?: { name: string }[];
	aletheia_mode_internal?: { tools?: { name: string }[] };
};

/**
 * Mirror of `gate/anima.rs::mediation_capabilities_list`: read the dispatch and
 * aletheia-mode-internal tool names from the matrix, dedupe (one tool appears in
 * both tables), and tag each with its entitlement class — aletheia membership
 * wins. This is the gateway's response shape, built here independently of the
 * library's `localCanonicalCapabilities`, so parity proves the two agree.
 */
function buildGatewayList(): GatewayCapabilityList {
	const dispatchTools = (matrix.dispatch_tools ?? []).map((t) => t.name);
	const aletheiaTools = (matrix.aletheia_mode_internal?.tools ?? []).map(
		(t) => t.name,
	);
	const aletheiaSet = new Set(aletheiaTools);
	const seen = new Set<string>();
	const capabilities: GatewayCapabilityEntry[] = [];
	for (const name of [...dispatchTools, ...aletheiaTools]) {
		if (seen.has(name)) continue;
		seen.add(name);
		capabilities.push({
			name,
			entitlementClass: aletheiaSet.has(name)
				? ALETHEIA_MODE_INTERNAL_CLASS
				: STANDARD_ENTITLEMENT_CLASS,
		});
	}
	return {
		capabilities,
		dispatchTools,
		aletheiaModeInternalTools: aletheiaTools,
	};
}

describe("Tranche 12.T12.10 — capability-parity live-assertion (Pi startup)", () => {
	it("parity_holds_at_startup — a faithful gateway list passes strict parity against Pi's local view", async () => {
		const gateway = buildGatewayList();

		// The pure comparator agrees: no drift in either direction, no class clash.
		const result = assertCapabilityParity(gateway);
		assert.equal(result.ok, true, result.reason);
		assert.deepEqual(result.missingFromGateway, []);
		assert.deepEqual(result.extraInGateway, []);
		assert.deepEqual(result.classMismatches, []);

		// And the startup gate Pi actually wires (strict) returns the ok result.
		const startup = await assertGatewayCapabilityParityAtStartup(
			() => gateway,
			{ strict: true },
		);
		assert.ok(startup);
		assert.equal(startup.ok, true, startup.reason);
	});

	it("parity_fails_hard — a tool missing from the gateway is a BYPASS risk and throws under strict", async () => {
		const gateway = buildGatewayList();
		gateway.capabilities = (gateway.capabilities ?? []).filter(
			(c) => c.name !== "aletheia_crystallise",
		);
		gateway.aletheiaModeInternalTools = (
			gateway.aletheiaModeInternalTools ?? []
		).filter((n) => n !== "aletheia_crystallise");

		await assert.rejects(
			() => assertGatewayCapabilityParityAtStartup(() => gateway, { strict: true }),
			(err: unknown) => {
				assert.ok(err instanceof CapabilityParityError);
				assert.ok(err.result.missingFromGateway.includes("aletheia_crystallise"));
				assert.match(err.message, /parity failed/);
				return true;
			},
		);
	});

	it("parity_fails_hard — a tool present only on the gateway (drift) throws under strict", async () => {
		const gateway = buildGatewayList();
		(gateway.capabilities ??= []).push({
			name: "ghost_tool_not_in_matrix",
			entitlementClass: STANDARD_ENTITLEMENT_CLASS,
		});

		const result = assertCapabilityParity(gateway);
		assert.equal(result.ok, false);
		assert.ok(result.extraInGateway.includes("ghost_tool_not_in_matrix"));

		await assert.rejects(
			() => assertGatewayCapabilityParityAtStartup(() => gateway, { strict: true }),
			CapabilityParityError,
		);
	});

	it("parity_fails_hard — an entitlement-class disagreement throws under strict", async () => {
		const gateway = buildGatewayList();
		// Mis-tag a known aletheia tool as standard: membership matches but class
		// drifts — the gate must still fail (no class-blind bypass).
		const entry = (gateway.capabilities ?? []).find(
			(c) => c.name === "aletheia_gnosis_query",
		);
		assert.ok(entry, "fixture must contain aletheia_gnosis_query");
		entry.entitlementClass = STANDARD_ENTITLEMENT_CLASS;
		// Keep the split arrays from re-classifying it back to aletheia.
		gateway.aletheiaModeInternalTools = (
			gateway.aletheiaModeInternalTools ?? []
		).filter((n) => n !== "aletheia_gnosis_query");

		const result = assertCapabilityParity(gateway);
		assert.equal(result.ok, false);
		assert.ok(
			result.classMismatches.some((m) => m.name === "aletheia_gnosis_query"),
			"class mismatch must be flagged",
		);

		await assert.rejects(
			() => assertGatewayCapabilityParityAtStartup(() => gateway, { strict: true }),
			CapabilityParityError,
		);
	});

	it("gateway_unreachable_is_a_noop — a null or throwing fetcher never breaks Pi startup", async () => {
		// Pi wires the gate as a parity check, NOT a liveness requirement: an
		// absent gateway defers rather than throwing, even under strict.
		const nullFetch = await assertGatewayCapabilityParityAtStartup(() => null, {
			strict: true,
		});
		assert.equal(nullFetch, null);

		const throwingFetch = await assertGatewayCapabilityParityAtStartup(
			() => {
				throw new Error("gateway not listening yet");
			},
			{ strict: true },
		);
		assert.equal(throwingFetch, null);
	});

	it("non_strict_drift_logs_and_continues — diagnostic mode returns the drift instead of throwing", async () => {
		const gateway = buildGatewayList();
		gateway.capabilities = (gateway.capabilities ?? []).filter(
			(c) => c.name !== "dispatch_agent",
		);
		gateway.dispatchTools = (gateway.dispatchTools ?? []).filter(
			(n) => n !== "dispatch_agent",
		);

		const logs: string[] = [];
		const result = await assertGatewayCapabilityParityAtStartup(() => gateway, {
			strict: false,
			log: (m) => logs.push(m),
		});
		assert.ok(result);
		assert.equal(result.ok, false);
		assert.ok(result.missingFromGateway.includes("dispatch_agent"));
		assert.ok(logs.some((l) => /DRIFT/.test(l)));
	});

	it("queries_the_canonical_surface — Pi asks the gateway by the contract method name", () => {
		assert.equal(
			MEDIATION_CAPABILITIES_LIST_METHOD,
			"s4'.mediation.capabilities.list",
		);
	});
});
