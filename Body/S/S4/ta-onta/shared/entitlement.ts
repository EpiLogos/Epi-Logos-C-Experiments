/**
 * entitlement.ts — CANONICAL pure entitlement resolver (node-builtins only)
 *
 * Residency: this is the single source of truth for the entitlement core. It
 * lives in the ta-onta sync tree so that `agent-team.ts` (which may only import
 * within ta-onta) can consume it directly, and it survives deploy-sync. The
 * `pi-agent/lib/entitlement.ts` and `pi-agent/extensions/skill-entitlement.ts`
 * files are thin re-export shims over this module.
 *
 * Architecture truth:
 *   - Pleroma is the SKILL layer only (the universe U of published skills).
 *   - Pi agent definitions own agent dynamics AND skill/tool entitlement.
 *     Each agent `.md` frontmatter carries allow/deny lists; teams carry
 *     team-level allow/deny.
 *   - Enforcement is a HARD-GATE: a skill/tool that is not entitled is not
 *     exposed/invokable. Entitlement that does not gate is theater.
 *
 * This module is intentionally dependency-free (no @sinclair/typebox, no
 * @mariozechner/pi-coding-agent) so it can be imported directly by headless
 * `node --test` suites and reused for BOTH skills and tools (and for any
 * persona, e.g. the `epii` agent, namespace-agnostically).
 *
 * Resolution rule (applied identically for skills and tools):
 *   Given universe U, a team layer, and an agent layer:
 *     teamCeiling = team.allow non-empty ? (U ∩ team.allow) : U
 *     agentScope  = agent.allow non-empty ? (teamCeiling ∩ agent.allow) : teamCeiling
 *     effective   = agentScope − team.deny − agent.deny
 *   Empty allow = inherit the layer above (NOT deny-all). Deny beats allow.
 */

import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

/** Allow/deny pair for a single layer (team or agent). Empty/absent = inherit. */
export interface EntitlementLayer {
	/** Allowlist. Empty/absent => inherit the layer above (no restriction). */
	allow?: string[];
	/** Denylist. Always subtracted. Deny beats allow. */
	deny?: string[];
}

/** A resolved scope record, useful for diagnostics / explainability. */
export interface ResolvedEntitlement {
	/** Final entitled names (deterministic order: matches U's order). */
	effective: string[];
	/** Ceiling after applying the team layer (U ∩ team.allow, or U). */
	teamCeiling: string[];
	/** Scope after applying the agent allow within the team ceiling. */
	agentScope: string[];
}

function normalizeList(list: string[] | undefined): string[] {
	if (!Array.isArray(list)) return [];
	const out: string[] = [];
	const seen = new Set<string>();
	for (const raw of list) {
		if (typeof raw !== "string") continue;
		const v = raw.trim();
		if (v.length === 0 || seen.has(v)) continue;
		seen.add(v);
		out.push(v);
	}
	return out;
}

/**
 * Resolve effective entitlement for one universe + team layer + agent layer.
 *
 * Namespace-agnostic: names are treated as opaque strings, so `epi-logos:*`
 * names and bare persona names (`epii`, `anima`, …) gate identically.
 *
 * Determinism: `effective`, `teamCeiling`, and `agentScope` all preserve the
 * order in which names appear in `universe` (U), with duplicates removed.
 */
export function resolveEntitlement(
	universe: string[],
	team: EntitlementLayer | undefined,
	agent: EntitlementLayer | undefined,
): ResolvedEntitlement {
	const U = normalizeList(universe);

	const teamAllow = normalizeList(team?.allow);
	const teamDeny = new Set(normalizeList(team?.deny));
	const agentAllow = normalizeList(agent?.allow);
	const agentDeny = new Set(normalizeList(agent?.deny));

	// teamCeiling = team.allow non-empty ? (U ∩ team.allow) : U
	const teamAllowSet = new Set(teamAllow);
	const teamCeiling =
		teamAllow.length > 0 ? U.filter((n) => teamAllowSet.has(n)) : U.slice();

	// agentScope = agent.allow non-empty ? (teamCeiling ∩ agent.allow) : teamCeiling
	const agentAllowSet = new Set(agentAllow);
	const ceilingSet = new Set(teamCeiling);
	const agentScope =
		agentAllow.length > 0
			? teamCeiling.filter((n) => agentAllowSet.has(n))
			: teamCeiling.slice();

	// effective = agentScope − team.deny − agent.deny  (deny beats allow)
	const effective = agentScope.filter(
		(n) => !teamDeny.has(n) && !agentDeny.has(n),
	);

	// `ceilingSet` retained for clarity of the agentScope ⊆ teamCeiling invariant.
	void ceilingSet;

	return { effective, teamCeiling, agentScope };
}

/**
 * HARD-GATE predicate: is `name` entitled given U + team + agent layers?
 *
 * This is the single authority every enforcement site should consult before
 * exposing or invoking a skill/tool. If it returns false, the skill/tool must
 * be neither exposed nor invokable.
 */
export function isEntitled(
	name: string,
	universe: string[],
	team: EntitlementLayer | undefined,
	agent: EntitlementLayer | undefined,
): boolean {
	if (typeof name !== "string" || name.trim().length === 0) return false;
	const { effective } = resolveEntitlement(universe, team, agent);
	return effective.includes(name.trim());
}

/**
 * Filter an arbitrary candidate list down to the entitled subset, preserving
 * the candidates' own order. Useful when the live registry order (not U's
 * order) is what should be exposed to the runtime.
 */
export function filterEntitled(
	candidates: string[],
	universe: string[],
	team: EntitlementLayer | undefined,
	agent: EntitlementLayer | undefined,
): string[] {
	const { effective } = resolveEntitlement(universe, team, agent);
	const allowed = new Set(effective);
	return normalizeList(candidates).filter((n) => allowed.has(n));
}

/** Parse a comma-separated frontmatter field (e.g. `tools:`) into a list. */
export function parseCommaList(field: string | undefined | null): string[] {
	if (typeof field !== "string") return [];
	return normalizeList(field.split(","));
}

/**
 * Enumerate the live SKILL universe across one or more skill directories.
 *
 * For each `dir`, reads its immediate subdirectories and keeps each `<name>`
 * for which `<dir>/<name>/SKILL.md` exists. Results are deduped by name in
 * first-seen order (dirs are scanned in the order given). Missing directories
 * are tolerated (skipped), so callers may pass speculative paths.
 */
export function enumerateSkillUniverse(dirs: string[]): string[] {
	const out: string[] = [];
	const seen = new Set<string>();
	for (const dir of Array.isArray(dirs) ? dirs : []) {
		if (typeof dir !== "string" || dir.length === 0) continue;
		if (!existsSync(dir)) continue;
		let entries: string[];
		try {
			entries = readdirSync(dir);
		} catch {
			continue;
		}
		for (const name of entries) {
			if (seen.has(name)) continue;
			if (!existsSync(join(dir, name, "SKILL.md"))) continue;
			seen.add(name);
			out.push(name);
		}
	}
	return out;
}

// ── Pure decision core (testable headless) ───────────────────────────────

/** The two universes the runtime exposes: published skills, available tools. */
export interface EntitlementUniverse {
	skills: string[];
	tools: string[];
}

/** The fully-resolved effective entitlement for an agent on a team. */
export interface AgentEffectiveEntitlement {
	skills: ResolvedEntitlement;
	tools: ResolvedEntitlement;
}

/** A single hard-gate decision plus the reason, for diagnostics/audit. */
export interface GateDecision {
	allowed: boolean;
	kind: "skill" | "tool";
	name: string;
	reason: string;
}

/**
 * Resolve the effective skill + tool entitlement for an agent activated within
 * a team, applying the Resolution rule independently to each universe.
 *
 * `team` may be undefined (agent activated outside any team => team layer is
 * empty => ceiling is the full universe). `agent` may be undefined too
 * (=> inherit the team ceiling unchanged).
 *
 * Layers are passed positionally as `{ skills, tools }` records of
 * EntitlementLayer, matching the shape produced by the loaders.
 */
export function computeAgentEntitlement(
	universe: EntitlementUniverse,
	team: { skills: EntitlementLayer; tools: EntitlementLayer } | undefined,
	agent: { skills: EntitlementLayer; tools: EntitlementLayer } | undefined,
): AgentEffectiveEntitlement {
	const teamSkills: EntitlementLayer | undefined = team?.skills;
	const teamTools: EntitlementLayer | undefined = team?.tools;
	const agentSkills: EntitlementLayer | undefined = agent?.skills;
	const agentTools: EntitlementLayer | undefined = agent?.tools;

	return {
		skills: resolveEntitlement(universe.skills, teamSkills, agentSkills),
		tools: resolveEntitlement(universe.tools, teamTools, agentTools),
	};
}

/**
 * HARD-GATE: decide whether a skill/tool invocation is permitted against an
 * already-resolved effective entitlement. This is the single function every
 * enforcement site (skill loading, tool exposure, tool invocation) consults.
 *
 * A name absent from the effective set is REFUSED — never silently allowed.
 */
export function enforceEntitlement(
	effective: AgentEffectiveEntitlement,
	kind: "skill" | "tool",
	name: string,
): GateDecision {
	const set =
		kind === "skill" ? effective.skills.effective : effective.tools.effective;
	const candidate = typeof name === "string" ? name.trim() : "";
	if (candidate.length === 0) {
		return { allowed: false, kind, name, reason: `empty ${kind} name` };
	}
	if (set.includes(candidate)) {
		return { allowed: true, kind, name: candidate, reason: "entitled" };
	}
	return {
		allowed: false,
		kind,
		name: candidate,
		reason: `${kind} not entitled (not in effective set)`,
	};
}

/**
 * Convenience: filter a live candidate list down to the entitled subset,
 * preserving the candidates' order. Used to decide which skills/tools to
 * actually expose to the runtime at activation.
 */
export function exposeEntitled(
	effective: AgentEffectiveEntitlement,
	kind: "skill" | "tool",
	candidates: string[],
): string[] {
	const set = new Set(
		kind === "skill" ? effective.skills.effective : effective.tools.effective,
	);
	return (Array.isArray(candidates) ? candidates : []).filter(
		(n) => typeof n === "string" && set.has(n.trim()),
	);
}
