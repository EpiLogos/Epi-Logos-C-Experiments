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
 * This module is intentionally dependency-free (no typebox, no
 * @earendil-works/pi-coding-agent) so it can be imported directly by headless
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

// ── Uniform entitlement classes (no side-door) ───────────────────────────
//
// Tranche 12.32 — VAK-uniform tool entitlement. Closes the GraphRAG/Aletheia
// side-door whereby tools dispatched through Anima's `s4'.mediation.route` were
// (intentionally, per wave-2 scout 1) bypassing the formal entitlement-contract
// check. That standing is rejected: modular gating applies UNIFORMLY. Every
// tool — including the Aletheia-internal crystallisation/GraphRAG tools — is a
// first-class entry in the canonical skill/tool universe and routes through the
// same `isEntitled()` resolver. What varies is the entitlement CLASS, not the
// routing. See DR-S5-ONE-1 (uniform routing through the gateway).

/** The default entitlement class: user-/agent-facing peer tools. */
export const STANDARD_ENTITLEMENT_CLASS = "standard";

/**
 * The entitlement class for tools invoked by Anima during
 * Aletheia-crystallisation-mode. These are NOT user-facing peer tools (per
 * DR-M5-1, DR-B-3); they remain dispatched-through-Anima. The class enforces
 * that boundary at the CONTRACT level rather than via a side-door: a tool in
 * this class is still enumerated in the universe and still routes through
 * `isEntitled()`, and additionally requires the caller to hold the
 * `anima.dispatcher` role AND an `aletheia.mode.active` session state.
 */
export const ALETHEIA_MODE_INTERNAL_CLASS = "aletheia-mode-internal";

/**
 * The canonical set of Aletheia-mode-internal tools — every tool dispatched
 * through `s4'.mediation.route` (the Gnosis/GraphRAG/crystallisation/episodic
 * family plus the Moirai night-pass dispatch). Each becomes a first-class
 * entitlement entry; none is allowed to bypass the contract by side-door.
 *
 * Kept in sync with the tools registered in `S4-5p-aletheia/extension.ts` and
 * the `aletheia_mode_internal` table in `plugins/pleroma/capability-matrix.json`
 * (the `no_tool_bypasses_entitlement_contract` test asserts that parity).
 */
export const ALETHEIA_MODE_INTERNAL_TOOLS: readonly string[] = [
	"aletheia_crystallise",
	"aletheia_episodic_arc_open",
	"aletheia_episodic_arc_close",
	"aletheia_episodic_arc_status",
	"aletheia_episodic_ingest_thoughts",
	"aletheia_episodic_logos_stage",
	"aletheia_episodic_mobius_arc",
	"aletheia_episodic_oracle_arc",
	"aletheia_episodic_record",
	"aletheia_episodic_search",
	"aletheia_gnosis_enrich",
	"aletheia_gnosis_ingest",
	"aletheia_gnosis_notebook_create",
	"aletheia_gnosis_query",
	"aletheia_gnosis_status",
	"aletheia_ingest",
	"aletheia_seed_refresh",
	"aletheia_session_promote",
	"aletheia_thought_route",
	"dispatch_moirai_night_pass",
	"moirai_arena_distill",
];

const ALETHEIA_MODE_INTERNAL_SET = new Set<string>(ALETHEIA_MODE_INTERNAL_TOOLS);

/** True iff `name` is an Aletheia-mode-internal tool (routes via mediation). */
export function isAletheiaModeInternalTool(name: string): boolean {
	return typeof name === "string" && ALETHEIA_MODE_INTERNAL_SET.has(name.trim());
}

/**
 * The entitlement class for a tool name. Aletheia-mode-internal tools resolve
 * to `aletheia-mode-internal`; everything else is `standard`. Classification is
 * deterministic and namespace-agnostic.
 */
export function entitlementClassOf(name: string): string {
	return isAletheiaModeInternalTool(name)
		? ALETHEIA_MODE_INTERNAL_CLASS
		: STANDARD_ENTITLEMENT_CLASS;
}

/** Options for {@link enumerateSkillUniverse}. */
export interface SkillUniverseOptions {
	/**
	 * When true, append the canonical Aletheia-mode-internal tool universe
	 * ({@link ALETHEIA_MODE_INTERNAL_TOOLS}) to the enumerated set so those tools
	 * enumerate through the same entitlement resolver as every other tool. This
	 * is the operationalisation of "no side-door": the Gnosis/GraphRAG/Aletheia
	 * tools become first-class entries in the universe `U`. Off by default so the
	 * pure skill-directory enumeration (used by skill loaders) is unchanged.
	 */
	includeAletheiaModeInternal?: boolean;
}

/**
 * Enumerate the live SKILL universe across one or more skill directories.
 *
 * For each `dir`, reads its immediate subdirectories and keeps each `<name>`
 * for which `<dir>/<name>/SKILL.md` exists. Results are deduped by name in
 * first-seen order (dirs are scanned in the order given). Missing directories
 * are tolerated (skipped), so callers may pass speculative paths.
 *
 * When `opts.includeAletheiaModeInternal` is set, the canonical
 * Aletheia-mode-internal tool names are appended (deduped) AFTER the enumerated
 * skills — making every `s4'.mediation.route`-dispatched tool a first-class
 * entry in the universe so it resolves through the same entitlement contract as
 * all other tools (Tranche 12.32 — close the GraphRAG side-door).
 */
export function enumerateSkillUniverse(
	dirs: string[],
	opts?: SkillUniverseOptions,
): string[] {
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
	// Fold the Aletheia/GraphRAG tool universe in as first-class entries so they
	// enumerate through the same resolver — no side-door (Tranche 12.32).
	if (opts?.includeAletheiaModeInternal) {
		for (const tool of ALETHEIA_MODE_INTERNAL_TOOLS) {
			if (seen.has(tool)) continue;
			seen.add(tool);
			out.push(tool);
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

// ── Mediation-route gate (Tranche 12.32 — no side-door) ───────────────────
//
// The `s4'.mediation.route` dispatch is no longer entitlement-exempt. EVERY
// tool routed through it — including the Aletheia-mode-internal family — passes
// through the SAME `isEntitled()` resolver as any other tool. For the
// `aletheia-mode-internal` class an ADDITIONAL, explicitly-declared condition
// applies (it is NOT assumed by side-door): the caller must hold the
// `anima.dispatcher` role AND an `aletheia.mode.active` session state. The
// routing is uniform; only the class — and therefore the extra condition —
// varies.

/** The role a caller must hold to dispatch Aletheia-mode-internal tools. */
export const ANIMA_DISPATCHER_ROLE = "anima.dispatcher";

/** Session/runtime context consulted by the mediation-route gate. */
export interface MediationRouteContext {
	/** The tool/skill universe `U` (should include the mediation tool family). */
	universe: string[];
	/** Optional team entitlement layer. */
	team?: EntitlementLayer;
	/** Optional agent entitlement layer. */
	agent?: EntitlementLayer;
	/** Roles the calling agent holds (e.g. `["anima.dispatcher"]`). */
	roles?: string[];
	/** Live session state; `aletheiaModeActive` gates the aletheia class. */
	session?: { aletheiaModeActive?: boolean };
}

/** The decision returned by {@link enforceMediationRouteEntitlement}. */
export interface MediationRouteDecision {
	allowed: boolean;
	toolName: string;
	/** `standard` or `aletheia-mode-internal`. */
	entitlementClass: string;
	reason: string;
}

/**
 * HARD-GATE for any tool dispatched through `s4'.mediation.route`.
 *
 * Step 1 (uniform): the tool MUST be entitled via the same `isEntitled()`
 * resolver as every other tool. A tool absent from the effective set is
 * refused — there is no bypass.
 *
 * Step 2 (class-specific, explicitly declared): if the tool is in the
 * `aletheia-mode-internal` class, the caller must additionally hold the
 * `anima.dispatcher` role AND an `aletheia.mode.active` session state. This is
 * the contract-level enforcement of "dispatched-through-Anima-during-
 * crystallisation-mode" — checked at dispatch time, never assumed.
 *
 * `standard`-class tools are permitted on the strength of step 1 alone.
 */
export function enforceMediationRouteEntitlement(
	toolName: string,
	ctx: MediationRouteContext,
): MediationRouteDecision {
	const name = typeof toolName === "string" ? toolName.trim() : "";
	const entitlementClass = entitlementClassOf(name);
	if (name.length === 0) {
		return {
			allowed: false,
			toolName,
			entitlementClass,
			reason: "empty tool name",
		};
	}

	// Step 1 — uniform entitlement check: isEntitled() runs for aletheia-mode
	// -internal tools exactly as for any other tool (no side-door entitlement).
	if (!isEntitled(name, ctx.universe, ctx.team, ctx.agent)) {
		return {
			allowed: false,
			toolName: name,
			entitlementClass,
			reason: "tool not entitled (not in effective set)",
		};
	}

	// Step 2 — class-specific condition for aletheia-mode-internal tools.
	if (entitlementClass === ALETHEIA_MODE_INTERNAL_CLASS) {
		const roles = Array.isArray(ctx.roles) ? ctx.roles : [];
		const hasDispatcher = roles.includes(ANIMA_DISPATCHER_ROLE);
		const modeActive = ctx.session?.aletheiaModeActive === true;
		if (!hasDispatcher || !modeActive) {
			const missing: string[] = [];
			if (!hasDispatcher) missing.push(`role:${ANIMA_DISPATCHER_ROLE}`);
			if (!modeActive) missing.push("session:aletheia.mode.active");
			return {
				allowed: false,
				toolName: name,
				entitlementClass,
				reason: `aletheia-mode-internal requires ${missing.join(" + ")}`,
			};
		}
	}

	return {
		allowed: true,
		toolName: name,
		entitlementClass,
		reason: "entitled",
	};
}

/**
 * Audit helper (used by the `no_tool_bypasses_entitlement_contract` test):
 * given the set of tool names declared in the capability-matrix entitlement
 * table, assert that EVERY canonical mediation-route tool has a declared entry.
 * Returns the names that are missing (empty array = no bypass).
 */
export function auditNoToolBypass(declaredTableTools: string[]): string[] {
	const declared = new Set(
		(Array.isArray(declaredTableTools) ? declaredTableTools : [])
			.filter((n): n is string => typeof n === "string")
			.map((n) => n.trim()),
	);
	return ALETHEIA_MODE_INTERNAL_TOOLS.filter((t) => !declared.has(t));
}
