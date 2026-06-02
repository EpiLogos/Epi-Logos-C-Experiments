/**
 * skill-entitlement.ts — HARD-GATE entitlement enforcement extension.
 *
 * Architecture truth:
 *   - Pleroma is the SKILL layer only: it publishes the universe U of skills
 *     (and the runtime publishes the universe of tools). It is NOT the
 *     authority for who may use them.
 *   - Pi agent definitions own skill/tool entitlement via their frontmatter
 *     allow/deny lists; teams.yaml carries team-level allow/deny.
 *   - Enforcement is a HARD-GATE: a skill/tool not in the resolved effective
 *     set is neither exposed nor invokable.
 *
 * Residency: the pure decision core (`computeAgentEntitlement`,
 * `enforceEntitlement`, `exposeEntitled`, and the EntitlementUniverse /
 * AgentEffectiveEntitlement / GateDecision types) now lives canonically in the
 * ta-onta sync tree (`ta-onta/shared/entitlement.ts`) and is re-exported here
 * via `../lib/entitlement.ts`. This file keeps ONLY the default pi-extension
 * wiring (staged/inert), plus the re-exports so existing import sites resolve.
 */

// Re-export the pure decision core + types from the canonical module so that
// `import { computeAgentEntitlement, ... } from ".../skill-entitlement.ts"`
// keeps resolving.
export {
	computeAgentEntitlement,
	enforceEntitlement,
	exposeEntitled,
} from "../lib/entitlement.ts";
export type {
	EntitlementUniverse,
	AgentEffectiveEntitlement,
	GateDecision,
} from "../lib/entitlement.ts";

import {
	enforceEntitlement,
	type AgentEffectiveEntitlement,
} from "../lib/entitlement.ts";

// ── Pi-runtime wiring (staged; activated when pi internals are available) ──
//
// The decision core is fully wired and tested in the canonical module. The
// pi-side glue below installs a PreToolUse-style hard gate using whatever the
// runtime exposes. It is written defensively (feature-detecting the API
// surface) so it is safe to load headless and degrades to a no-op when pi
// internals are absent.

type AnyExtensionAPI = {
	on?: (event: string, handler: (...args: any[]) => any) => void;
};

/**
 * Default export: pi extension entrypoint. Given the resolved effective
 * entitlement for the active agent, this refuses any non-entitled tool call at
 * the pi `tool_call` boundary (the same boundary-refusal shape agent-team.ts
 * uses for dispatch). The effective set itself is produced by
 * `computeAgentEntitlement` from the loaded agent contract/frontmatter + active
 * team layers, and is supplied to this gate via `__setActiveEntitlement`.
 *
 * The gate is INERT until the activation handshake calls
 * `(pi).__setActiveEntitlement(effective)` (see
 * `epii-entitlement-activation.ts`). Left null it never gates — so it can never
 * accidentally deny-all, and it is safe to load headless.
 *
 * Event wiring is defensive: pi (>=0.49) fires `tool_call` with a
 * `{ block, reason }` result; we register that. For backward-compatibility we
 * ALSO register a legacy `PreToolUse` listener (older/alt runtimes) using the
 * `{ decision: "block", reason }` shape. Both are guarded by `pi.on` being a
 * function and degrade to no-op when the event is never fired.
 */
export default function (pi: AnyExtensionAPI) {
	// The gate is installed only if the runtime exposes an event bus.
	if (typeof pi?.on !== "function") return;

	// The activation path is responsible for setting this from the active
	// agent's loaded entitlement. Left null until wired so the gate is inert
	// rather than accidentally deny-all.
	let active: AgentEffectiveEntitlement | null = null;

	(pi as any).__setActiveEntitlement = (e: AgentEffectiveEntitlement | null) => {
		active = e;
	};
	// Expose a read-side accessor so the activation module can verify the
	// handshake landed without reaching into closure state.
	(pi as any).__getActiveEntitlement = (): AgentEffectiveEntitlement | null => active;

	const decide = (toolName: string): { blocked: boolean; reason: string } => {
		if (!active) return { blocked: false, reason: "" }; // not wired => do not gate
		const decision = enforceEntitlement(active, "tool", toolName);
		if (decision.allowed) return { blocked: false, reason: "" };
		return {
			blocked: true,
			reason: `entitlement hard-gate: ${decision.reason} — ${toolName}`,
		};
	};

	// Real pi event (>=0.49): tool_call → { block?: boolean; reason?: string }
	try {
		pi.on!("tool_call", (event: any) => {
			const toolName: string = event?.toolName ?? event?.tool ?? "";
			const d = decide(toolName);
			if (d.blocked) return { block: true, reason: d.reason };
			return undefined;
		});
	} catch {
		// runtime rejected this event name — fall through to legacy listener
	}

	// Legacy/alt runtimes: PreToolUse → { decision: "block", reason }
	try {
		pi.on!("PreToolUse", (event: any) => {
			const toolName: string = event?.toolName ?? event?.tool ?? "";
			const d = decide(toolName);
			if (d.blocked) return { decision: "block", reason: d.reason };
			return undefined;
		});
	} catch {
		// event unsupported on this runtime — gate simply stays installed on
		// whichever events DID register; never throws into startup.
	}
}
