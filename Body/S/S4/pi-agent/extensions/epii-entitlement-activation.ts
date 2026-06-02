/**
 * epii-entitlement-activation.ts — LIVE activation handshake for the epii peer
 * pi_agent's skill/tool entitlement hard-gate.
 *
 * Architecture truth:
 *   - The pure decision core (resolve/compute/enforce/expose, universe
 *     enumeration) lives canonically in `ta-onta/shared/entitlement.ts` and the
 *     loader in `ta-onta/shared/entitlement-loader.ts`. This module does NOT
 *     re-implement any of it; it only orchestrates the runtime handshake.
 *   - The staged tool-gate (`skill-entitlement.ts` default export) is INERT
 *     until `(pi).__setActiveEntitlement(effective)` is called. This module
 *     computes epii's effective entitlement and performs that call, taking the
 *     PreToolUse/tool_call hard-gate LIVE for the epii persona only.
 *   - epii's skills are PROMPT-INJECTED by pi (v0.49 `formatSkillsForPrompt`
 *     emits an `<available_skills>` XML manifest into the system prompt; the
 *     model loads a skill by `read`-ing its file). pi exposes NO skill API
 *     (`getActiveSkills`/`setActiveSkills` do not exist), so the skill side is
 *     gated by filtering that injected manifest in the `before_agent_start`
 *     systemPrompt rewrite — mirroring how agent-team.ts filters sub-agent
 *     skill injection to `eff.skills.effective`.
 *
 * DEFENSIVE CONTRACT: the epii persona is the DEFAULT persona and its pi launch
 * is load-bearing. Every step here feature-detects and degrades to a no-op (at
 * most a debug log) if anything is absent — missing contract, missing skill
 * dirs, missing pi API, parse error. It NEVER throws into startup and NEVER
 * denies-all (empty allow => inherit the full package).
 *
 * Node-builtins + the shared resolver/loader only (no pi import at module load,
 * so the pure compute is headless-testable under `node --test`).
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";

import {
	computeAgentEntitlement,
	enumerateSkillUniverse,
	exposeEntitled,
	type AgentEffectiveEntitlement,
} from "../lib/entitlement.ts";
import {
	parseAgentEntitlementFromContract,
	type AgentEntitlement,
} from "../lib/entitlement-loader.ts";

// ── Constants ─────────────────────────────────────────────────────────────

/** The default/primary pi persona id (epi-cli DEFAULT_PI_AGENT_ID). */
const EPII_AGENT_ID = "epii";

/**
 * Repo-root-relative location of the epii agent contract. Used both to load the
 * contract and to anchor repo-root discovery when ctx.cwd is unreliable.
 */
const EPII_CONTRACT_REL = "Body/S/S5/epii-agent/agent-contract.json";

function dbg(msg: string): void {
	if (process.env.EPI_ENTITLEMENT_DEBUG) {
		// Single debug channel; never throws.
		try {
			console.error(`[epii-entitlement-activation] ${msg}`);
		} catch {
			/* ignore */
		}
	}
}

// ── Active-persona detection ────────────────────────────────────────────────

/**
 * Is the active pi persona `epii`? Detection order (all defensive):
 *   1. EPI_AGENT_ID / EPI_PI_AGENT_ID / EPI_AGENT_NAME env (set by epi-cli at
 *      launch to the active agent id — see agent/launch.rs, agent/models.rs).
 *   2. If NONE of those env vars is set at all, fall back to "epii is the
 *      default persona" — but ONLY when the env is genuinely silent, so an
 *      explicitly non-epii launch is never mis-detected as epii.
 */
export function isEpiiActive(env: NodeJS.ProcessEnv = process.env): boolean {
	const explicit =
		env.EPI_AGENT_ID ?? env.EPI_PI_AGENT_ID ?? env.EPI_AGENT_NAME ?? "";
	const id = explicit.trim().toLowerCase();
	if (id.length > 0) return id === EPII_AGENT_ID;
	// Env silent on identity => epii is the documented default persona.
	return true;
}

// ── Repo-root + contract discovery ──────────────────────────────────────────

/**
 * Discover the repo root by walking up from a starting directory until a
 * directory containing the epii contract (at its repo-relative path) is found.
 * Falls back to undefined if none is found within the walk budget.
 */
function discoverRepoRoot(startDir: string): string | undefined {
	let dir = startDir;
	for (let i = 0; i < 12; i++) {
		if (existsSync(join(dir, EPII_CONTRACT_REL))) return dir;
		const parent = dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	return undefined;
}

/**
 * Resolve the repo root, trying (in order): an explicit candidate (e.g.
 * ctx.cwd), this module's own location, and process.cwd(). Returns the first
 * directory under which the epii contract resolves, or undefined.
 */
export function resolveRepoRoot(
	candidateCwd?: string,
	moduleDir: string = dirname(fileFromUrl(import.meta.url)),
): string | undefined {
	const seeds = [candidateCwd, moduleDir, process.cwd()].filter(
		(s): s is string => typeof s === "string" && s.length > 0,
	);
	for (const seed of seeds) {
		// Direct hit: seed itself is the repo root.
		if (existsSync(join(seed, EPII_CONTRACT_REL))) return seed;
		// Otherwise walk up from the seed.
		const found = discoverRepoRoot(seed);
		if (found) return found;
	}
	return undefined;
}

function fileFromUrl(url: string): string {
	try {
		// Lazy import avoids pulling node:url into the headless test path twice.
		return new URL(url).pathname;
	} catch {
		return process.cwd();
	}
}

// ── Pure activation-compute (headless-testable) ─────────────────────────────

export interface EpiiActivationInput {
	/** Parsed JSON contract object (or already-extracted entitlement). */
	contract: unknown;
	/** The contract's `entitlement.skill_universe_roots` (repo-root-relative). */
	skillUniverseRoots: string[];
	/** Repo root used to resolve each (relative) skill root to an absolute dir. */
	repoRoot: string | undefined;
	/** The live tool universe the runtime exposes (or [] if unknown). */
	toolUniverse: string[];
}

/**
 * Pure compute of epii's effective entitlement from a parsed contract + the
 * real skill universe roots + the live tool universe. No pi, no env, no I/O
 * beyond the shared `enumerateSkillUniverse` directory scan.
 *
 * Skills universe = enumerate(resolve(root, repoRoot)) for each root.
 * Tools universe  = `toolUniverse` (whatever the runtime exposes, or []).
 * Team layer is undefined (epii is a peer persona, not a sub-team member).
 * Agent layer is the contract's parsed entitlement (empty allow => inherit the
 * full package — never deny-all).
 */
export function computeEpiiEffectiveEntitlement(
	input: EpiiActivationInput,
): AgentEffectiveEntitlement {
	const roots = Array.isArray(input.skillUniverseRoots)
		? input.skillUniverseRoots
		: [];
	const absRoots = roots
		.filter((r) => typeof r === "string" && r.length > 0)
		.map((r) =>
			isAbsolute(r)
				? r
				: input.repoRoot
					? resolve(input.repoRoot, r)
					: r,
		);

	const skillUniverse = enumerateSkillUniverse(absRoots);
	const toolUniverse = Array.isArray(input.toolUniverse)
		? input.toolUniverse
		: [];

	const agent: AgentEntitlement = parseAgentEntitlementFromContract(input.contract);

	return computeAgentEntitlement(
		{ skills: skillUniverse, tools: toolUniverse },
		undefined, // peer persona => no team ceiling
		agent,
	);
}

/** Extract the declared skill_universe_roots from a parsed contract, defensively. */
export function readSkillUniverseRoots(contract: unknown): string[] {
	if (!contract || typeof contract !== "object") return [];
	const ent = (contract as Record<string, unknown>)["entitlement"];
	if (!ent || typeof ent !== "object") return [];
	const roots = (ent as Record<string, unknown>)["skill_universe_roots"];
	if (!Array.isArray(roots)) return [];
	return roots.filter((r): r is string => typeof r === "string" && r.length > 0);
}

// ── Skill-injection gating (prompt manifest filter) ─────────────────────────

/**
 * Filter pi's injected `<available_skills>` XML manifest down to the entitled
 * skill set, dropping `<skill>` blocks whose `<name>` is not in
 * `effective.skills.effective`. Mirrors agent-team.ts's "inject ONLY entitled
 * skills" rule, but applied to pi's already-built manifest (since the primary
 * persona's skills are injected by pi internally, not by us).
 *
 * Fully defensive: if there is no manifest, no entitled skills are computed, or
 * parsing is ambiguous, the prompt is returned UNCHANGED (no-op, never strips
 * everything). Returns `{ prompt, removed }` for diagnostics.
 */
export function filterInjectedSkillsManifest(
	systemPrompt: string,
	effective: AgentEffectiveEntitlement,
): { prompt: string; removed: string[] } {
	if (typeof systemPrompt !== "string" || systemPrompt.length === 0) {
		return { prompt: systemPrompt, removed: [] };
	}
	const blockMatch = systemPrompt.match(
		/<available_skills>([\s\S]*?)<\/available_skills>/,
	);
	if (!blockMatch) return { prompt: systemPrompt, removed: [] };

	const inner = blockMatch[1];
	const skillBlocks = inner.match(/<skill>[\s\S]*?<\/skill>/g);
	if (!skillBlocks || skillBlocks.length === 0) {
		return { prompt: systemPrompt, removed: [] };
	}

	const allowed = new Set(effective.skills.effective);
	const removed: string[] = [];
	const keptBlocks: string[] = [];
	for (const block of skillBlocks) {
		const nameMatch = block.match(/<name>([\s\S]*?)<\/name>/);
		const rawName = nameMatch ? unescapeXml(nameMatch[1].trim()) : "";
		// Use exposeEntitled so the decision authority is the shared resolver.
		const isAllowed =
			rawName.length > 0 &&
			exposeEntitled(effective, "skill", [rawName]).length === 1;
		// Defensive: if we cannot read a name, KEEP the block (never silently
		// strip something we failed to identify).
		if (rawName.length === 0 || isAllowed || allowed.size === 0) {
			keptBlocks.push(block);
		} else {
			removed.push(rawName);
		}
	}

	if (removed.length === 0) return { prompt: systemPrompt, removed: [] };

	const rebuilt = `<available_skills>\n${keptBlocks
		.map((b) => `  ${b}`)
		.join("\n")}\n</available_skills>`;
	const prompt =
		systemPrompt.slice(0, blockMatch.index!) +
		rebuilt +
		systemPrompt.slice(blockMatch.index! + blockMatch[0].length);
	return { prompt, removed };
}

function unescapeXml(s: string): string {
	return s
		.replace(/&apos;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&gt;/g, ">")
		.replace(/&lt;/g, "<")
		.replace(/&amp;/g, "&");
}

// ── Live runtime activation (the handshake) ─────────────────────────────────

type PiLike = {
	on?: (event: string, handler: (...args: any[]) => any) => void;
	getActiveTools?: () => string[];
	__setActiveEntitlement?: (e: AgentEffectiveEntitlement | null) => void;
};

/**
 * Wire the LIVE entitlement activation for the epii persona.
 *
 * Steps (each wrapped so any failure degrades to no-op + at most a debug log):
 *   1. If the active persona is not epii => no-op.
 *   2. Resolve repo root; load + JSON-parse the epii contract.
 *   3. Compute epii's effective entitlement (skills universe from the contract's
 *      skill_universe_roots; tools universe from pi.getActiveTools()).
 *   4. Call pi.__setActiveEntitlement(effective) => tool hard-gate goes LIVE.
 *   5. Register a before_agent_start systemPrompt rewrite that filters the
 *      injected <available_skills> manifest to the entitled skill set.
 *
 * Returns the computed effective entitlement (for diagnostics/tests) or null if
 * activation no-opped.
 */
export async function activateEpiiEntitlement(
	pi: PiLike,
	ctxCwd?: string,
): Promise<AgentEffectiveEntitlement | null> {
	try {
		if (!isEpiiActive()) {
			dbg("active persona is not epii; no-op");
			return null;
		}
		if (!pi || typeof pi.__setActiveEntitlement !== "function") {
			dbg("pi.__setActiveEntitlement absent (staged gate not loaded); no-op");
			return null;
		}

		const repoRoot = resolveRepoRoot(ctxCwd);
		if (!repoRoot) {
			dbg("repo root not found (contract path unresolved); no-op");
			return null;
		}

		const contractPath = join(repoRoot, EPII_CONTRACT_REL);
		if (!existsSync(contractPath)) {
			dbg(`contract absent at ${contractPath}; no-op`);
			return null;
		}

		let contract: unknown;
		try {
			contract = JSON.parse(readFileSync(contractPath, "utf-8"));
		} catch (e) {
			dbg(`contract parse failed: ${(e as Error)?.message ?? e}; no-op`);
			return null;
		}

		const skillUniverseRoots = readSkillUniverseRoots(contract);

		let toolUniverse: string[] = [];
		try {
			if (typeof pi.getActiveTools === "function") {
				const t = pi.getActiveTools();
				if (Array.isArray(t)) toolUniverse = t;
			}
		} catch {
			toolUniverse = []; // unknown tool universe => empty (resolver-safe)
		}

		const effective = computeEpiiEffectiveEntitlement({
			contract,
			skillUniverseRoots,
			repoRoot,
			toolUniverse,
		});

		// (4) Take the tool hard-gate LIVE for epii.
		pi.__setActiveEntitlement(effective);
		// Refresh the effective set the (once-registered) skill filter reads.
		(pi as any).__epiiEffective = effective;
		dbg(
			`activated: ${effective.skills.effective.length} skills, ` +
				`${effective.tools.effective.length} tools entitled`,
		);

		// (5) Gate the prompt-injected skill manifest. Register the
		// before_agent_start listener once per pi instance (activation may run on
		// every session_start). The listener reads `effective` via the closure
		// captured on first registration; subsequent activations refresh the
		// gate's tool set via __setActiveEntitlement above, and the skill filter
		// re-reads the shared effective set through that same closure variable.
		if (typeof pi.on === "function" && !(pi as any).__epiiSkillFilterRegistered) {
			(pi as any).__epiiSkillFilterRegistered = true;
			(pi as any).__epiiEffective = effective;
			try {
				pi.on("before_agent_start", (event: any) => {
					try {
						const sp: string =
							typeof event?.systemPrompt === "string" ? event.systemPrompt : "";
						if (!sp) return undefined;
						const live: AgentEffectiveEntitlement =
							((pi as any).__epiiEffective as AgentEffectiveEntitlement) ??
							effective;
						const { prompt, removed } = filterInjectedSkillsManifest(sp, live);
						if (removed.length === 0) return undefined;
						dbg(`filtered injected skills: removed [${removed.join(", ")}]`);
						return { systemPrompt: prompt };
					} catch (e) {
						dbg(`skill-manifest filter failed: ${(e as Error)?.message ?? e}`);
						return undefined; // never break prompt assembly
					}
				});
			} catch (e) {
				dbg(`before_agent_start registration failed: ${(e as Error)?.message ?? e}`);
			}
		}

		return effective;
	} catch (e) {
		// Absolute backstop: never break epii startup.
		dbg(`activation aborted: ${(e as Error)?.message ?? e}; no-op`);
		return null;
	}
}

/**
 * Default export: pi extension entrypoint. Loads the staged tool-gate extension
 * (so `__setActiveEntitlement` exists), then performs the activation handshake.
 * Safe to register after the staged gate in composite-entry.
 */
export default async function epiiEntitlementActivation(pi: PiLike, ctx?: { cwd?: string }) {
	try {
		// Ensure the staged tool-gate is installed exactly once per pi instance
		// (it attaches event listeners + the __setActiveEntitlement setter; the
		// composite-entry may invoke this on every session_start, so guard against
		// double-registering the listeners).
		if (typeof pi.__setActiveEntitlement !== "function") {
			try {
				const { default: installToolGate } = await import("./skill-entitlement.ts");
				if (typeof installToolGate === "function") installToolGate(pi as any);
			} catch (e) {
				dbg(`staged tool-gate load failed: ${(e as Error)?.message ?? e}`);
			}
		}
		await activateEpiiEntitlement(pi, ctx?.cwd);
	} catch (e) {
		dbg(`extension entry aborted: ${(e as Error)?.message ?? e}; no-op`);
	}
}
