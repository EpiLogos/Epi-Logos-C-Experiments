/**
 * no-tool-bypass.test.ts — Tranche 12.32 verification.
 *
 * Closes the GraphRAG/Aletheia side-door: every tool dispatched through
 * `s4'.mediation.route` must be a first-class entry in the capability-matrix
 * entitlement table and must route through the SAME `isEntitled()` contract as
 * any other tool. This suite asserts:
 *
 *   1. no_tool_bypasses_entitlement_contract — every canonical mediation-route
 *      tool has a declared entry (with the `aletheia-mode-internal` class) in
 *      `plugins/pleroma/capability-matrix.json`; none is dispatchable without an
 *      entitlement entry.
 *   2. the dispatch-time gate refuses an aletheia-mode-internal tool when the
 *      caller lacks `aletheia.mode.active` (or `anima.dispatcher`), proving the
 *      contract — not the tool's function — enforces the boundary.
 *   3. the routing is uniform: a standard tool and an aletheia tool both resolve
 *      through `isEntitled()`.
 *
 * Run: node --test --test-name-pattern 'no_tool_bypasses_entitlement_contract'
 *      (spec-ahead: `pnpm --filter @epi-logos/pi-agent test --testNamePattern ...`)
 */
import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
	ALETHEIA_MODE_INTERNAL_TOOLS,
	ALETHEIA_MODE_INTERNAL_CLASS,
	ANIMA_DISPATCHER_ROLE,
	auditNoToolBypass,
	enforceMediationRouteEntitlement,
	enumerateSkillUniverse,
	isAletheiaModeInternalTool,
	entitlementClassOf,
} from "../lib/entitlement.ts";

const matrixPath = fileURLToPath(
	new URL("../../plugins/pleroma/capability-matrix.json", import.meta.url),
);
const matrix = JSON.parse(readFileSync(matrixPath, "utf8")) as {
	entitlement_classes?: Record<string, string>;
	aletheia_mode_internal?: {
		entitlement_class?: string;
		tools?: { name: string; entitlement_class?: string }[];
	};
};

const declaredTools = (matrix.aletheia_mode_internal?.tools ?? []).map(
	(t) => t.name,
);

describe("Tranche 12.32 — uniform entitlement, no side-door", () => {
	it("no_tool_bypasses_entitlement_contract — every mediation-route tool has a capability-matrix entitlement entry", () => {
		// The matrix declares the aletheia-mode-internal entitlement class.
		assert.equal(
			matrix.aletheia_mode_internal?.entitlement_class,
			ALETHEIA_MODE_INTERNAL_CLASS,
			"matrix aletheia_mode_internal block declares the class",
		);
		assert.ok(
			matrix.entitlement_classes?.[ALETHEIA_MODE_INTERNAL_CLASS],
			"matrix documents the aletheia-mode-internal class",
		);

		// Every canonical mediation-route tool is in the declared table — i.e. no
		// tool is dispatchable without an entitlement entry.
		const missing = auditNoToolBypass(declaredTools);
		assert.deepEqual(
			missing,
			[],
			`these mediation-route tools bypass the entitlement table: ${missing.join(", ")}`,
		);

		// And the table declares each tool at the aletheia-mode-internal class.
		for (const entry of matrix.aletheia_mode_internal?.tools ?? []) {
			assert.equal(
				entry.entitlement_class,
				ALETHEIA_MODE_INTERNAL_CLASS,
				`${entry.name} must carry the aletheia-mode-internal class`,
			);
			assert.equal(
				entitlementClassOf(entry.name),
				ALETHEIA_MODE_INTERNAL_CLASS,
				`${entry.name} classifies as aletheia-mode-internal in the core`,
			);
		}

		// Belt-and-braces: the matrix table and the canonical list match exactly.
		assert.deepEqual(
			[...declaredTools].sort(),
			[...ALETHEIA_MODE_INTERNAL_TOOLS].sort(),
			"matrix table and canonical tool list are in parity",
		);
	});

	it("no_tool_bypasses_entitlement_contract — aletheia tools enumerate into the universe as first-class entries", () => {
		const universe = enumerateSkillUniverse([], {
			includeAletheiaModeInternal: true,
		});
		for (const tool of ALETHEIA_MODE_INTERNAL_TOOLS) {
			assert.ok(
				universe.includes(tool),
				`${tool} must be a first-class entry in the entitlement universe`,
			);
		}
	});

	it("no_tool_bypasses_entitlement_contract — gate refuses aletheia tool without aletheia.mode.active (contract, not function, enforces it)", () => {
		const universe = enumerateSkillUniverse([], {
			includeAletheiaModeInternal: true,
		});

		// Entitled in the universe, holds the dispatcher role, but mode is NOT
		// active → refused AT THE ENTITLEMENT GATE.
		const refused = enforceMediationRouteEntitlement("aletheia_crystallise", {
			universe,
			roles: [ANIMA_DISPATCHER_ROLE],
			session: { aletheiaModeActive: false },
		});
		assert.equal(refused.allowed, false);
		assert.equal(refused.entitlementClass, ALETHEIA_MODE_INTERNAL_CLASS);
		assert.match(refused.reason, /aletheia\.mode\.active/);

		// Missing the dispatcher role → also refused.
		const noRole = enforceMediationRouteEntitlement("aletheia_crystallise", {
			universe,
			roles: [],
			session: { aletheiaModeActive: true },
		});
		assert.equal(noRole.allowed, false);
		assert.match(noRole.reason, new RegExp(ANIMA_DISPATCHER_ROLE.replace(".", "\\.")));

		// Both conditions held → permitted.
		const ok = enforceMediationRouteEntitlement("aletheia_crystallise", {
			universe,
			roles: [ANIMA_DISPATCHER_ROLE],
			session: { aletheiaModeActive: true },
		});
		assert.equal(ok.allowed, true, ok.reason);
	});

	it("no_tool_bypasses_entitlement_contract — a tool absent from the universe is refused (uniform isEntitled, no bypass)", () => {
		// Universe WITHOUT the aletheia tools → even a dispatcher in active mode is
		// refused, because step-1 isEntitled() fails uniformly.
		const refused = enforceMediationRouteEntitlement("aletheia_gnosis_query", {
			universe: ["dispatch_agent", "khora_write"],
			roles: [ANIMA_DISPATCHER_ROLE],
			session: { aletheiaModeActive: true },
		});
		assert.equal(refused.allowed, false);
		assert.match(refused.reason, /not entitled/);

		// A standard tool routes through the same resolver.
		assert.equal(isAletheiaModeInternalTool("dispatch_agent"), false);
		const std = enforceMediationRouteEntitlement("dispatch_agent", {
			universe: ["dispatch_agent"],
		});
		assert.equal(std.allowed, true, std.reason);
		assert.equal(std.entitlementClass, "standard");
	});
});
