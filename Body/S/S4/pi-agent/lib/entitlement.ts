/**
 * entitlement.ts — thin re-export shim + mediation-route gate wiring.
 *
 * The canonical pure entitlement core now lives in the ta-onta sync tree at
 * `../../ta-onta/shared/entitlement.ts` so that `agent-team.ts` (which may only
 * import within ta-onta) can consume it and it survives deploy-sync. This shim
 * keeps the historical `pi-agent/lib/entitlement.ts` import path resolving.
 *
 * Tranche 12.32 — VAK-uniform tool entitlement (close the GraphRAG side-door):
 * the entitlement check for `s4'.mediation.route` is NO LONGER bypassed. Tools
 * dispatched through Anima's mediation route — including the Aletheia/Gnosis/
 * GraphRAG family — now route through `isEntitled(tool, team, agent)` exactly
 * like every other tool. The Aletheia-mode-internal dispatches (Anima invoking
 * Anansi/Moirai during crystallisation) still operate at the
 * `aletheia-mode-internal` entitlement class, but that class is declared per
 * tool and checked at dispatch time — it is never ASSUMED by side-door.
 */
export * from "../../ta-onta/shared/entitlement.ts";

import {
	isEntitled,
	enforceMediationRouteEntitlement,
	isAletheiaModeInternalTool,
	entitlementClassOf,
	type MediationRouteContext,
	type MediationRouteDecision,
} from "../../ta-onta/shared/entitlement.ts";

/**
 * Gate a tool that is about to be dispatched through `s4'.mediation.route`.
 *
 * This is the single seam `computeAgentEntitlement`'s callers consult before a
 * mediation-route dispatch. It enforces the uniform contract: the tool is first
 * checked with the same `isEntitled()` resolver as any other tool (no bypass),
 * and Aletheia-mode-internal tools additionally require the `anima.dispatcher`
 * role plus an `aletheia.mode.active` session state. Returns the structured
 * decision (allow/deny + class + reason) for audit.
 *
 * The aletheia entitlement is therefore UNIFORM: `isEntitled` runs for the
 * aletheia tools exactly as it runs for `dispatch_agent`, `khora_write`, etc.
 */
export function gateMediationRoute(
	toolName: string,
	ctx: MediationRouteContext,
): MediationRouteDecision {
	// Uniform routing: every mediation-route tool — aletheia or otherwise —
	// resolves through isEntitled() inside enforceMediationRouteEntitlement.
	return enforceMediationRouteEntitlement(toolName, ctx);
}

/**
 * Convenience predicate mirroring the gate's step-1 for callers that only need
 * the uniform `isEntitled` verdict (e.g. exposure filtering) without the
 * aletheia-mode-internal session/role condition. Kept here so the no-bypass
 * routing is visible at the historical pi-agent import path.
 */
export function isMediationToolEntitled(
	toolName: string,
	ctx: Pick<MediationRouteContext, "universe" | "team" | "agent">,
): boolean {
	void isAletheiaModeInternalTool; // class is consulted inside the gate
	void entitlementClassOf;
	return isEntitled(toolName, ctx.universe, ctx.team, ctx.agent);
}
