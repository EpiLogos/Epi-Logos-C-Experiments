/**
 * entitlement-loader.ts — pure parsers for the entitlement schema
 * (node-builtins only; no typebox / pi imports).
 *
 * Residency: canonical, lives in the ta-onta sync tree alongside
 * `./entitlement.ts`. `pi-agent/lib/entitlement-loader.ts` is a thin
 * re-export shim over this module.
 *
 * Two parsers:
 *   1. parseAgentEntitlement(frontmatterText) — reads the FOUR binding fields
 *      from an agent `.md` frontmatter: `skills`, `skills_deny`, `tools`,
 *      `tools_deny` (each comma-separated, absent => empty).
 *   2. parseTeamEntitlements(teamsYamlText) — reads optional per-team
 *      `skills`/`tools` allow/deny from a `members:`-style teams.yaml,
 *      backward-compatibly (a team with none => empty layers => ceiling is U).
 *
 * Existing per-agent `tools:`/`skills:` VALUES are unchanged by these parsers;
 * we only read them and promote them to BINDING allowlists for the resolver.
 */

import { parseCommaList, type EntitlementLayer } from "./entitlement.ts";

/** The four binding entitlement layers carried by one agent definition. */
export interface AgentEntitlement {
	skills: EntitlementLayer; // allow = `skills:`, deny = `skills_deny:`
	tools: EntitlementLayer; // allow = `tools:`,  deny = `tools_deny:`
}

/** The two binding entitlement layers carried by one team. */
export interface TeamEntitlement {
	skills: EntitlementLayer; // allow = team `skills`/`skills_allow`, deny = `skills_deny`
	tools: EntitlementLayer; // allow = team `tools`/`tools_allow`,  deny = `tools_deny`
}

/**
 * Extract a flat `key: value` map from a frontmatter block (the text BETWEEN
 * the `---` fences, NOT including them). Mirrors the simple line parser already
 * used in agent-team.ts: split on the first colon. Nested YAML is not needed —
 * the four entitlement fields are flat comma-separated scalars.
 */
function parseFlatFrontmatter(frontmatterText: string): Record<string, string> {
	const out: Record<string, string> = {};
	for (const line of frontmatterText.split("\n")) {
		const idx = line.indexOf(":");
		if (idx > 0) {
			const key = line.slice(0, idx).trim();
			const val = line.slice(idx + 1).trim();
			if (key) out[key] = val;
		}
	}
	return out;
}

/**
 * Read the four binding fields from an agent `.md` frontmatter block.
 * `frontmatterText` is the inner text of the `---`…`---` fence.
 *
 * Absent fields => empty layers (which the resolver treats as "inherit",
 * never "deny-all").
 */
export function parseAgentEntitlement(frontmatterText: string): AgentEntitlement {
	const fm = parseFlatFrontmatter(frontmatterText);
	return {
		skills: {
			allow: parseCommaList(fm.skills),
			deny: parseCommaList(fm.skills_deny),
		},
		tools: {
			allow: parseCommaList(fm.tools),
			deny: parseCommaList(fm.tools_deny),
		},
	};
}

/**
 * Read the agent entitlement directly from a full `.md` file's raw text
 * (extracts the leading frontmatter fence first). Returns empty layers if the
 * file has no frontmatter.
 */
export function parseAgentEntitlementFromFile(raw: string): AgentEntitlement {
	const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
	if (!match) return { skills: { allow: [], deny: [] }, tools: { allow: [], deny: [] } };
	return parseAgentEntitlement(match[1]);
}

/**
 * Read agent entitlement from a JSON agent contract (a peer pi_agent like
 * `epii` or `anima`, whose authority/gateway surface is machine-managed JSON
 * rather than human-authored markdown). The resolver itself is format-agnostic;
 * this is just the second source of the same four binding layers.
 *
 * Recognized shape (all optional, each value an array OR a comma string):
 *
 *   { "entitlement": {
 *       "skills": { "allow": [...], "deny": [...] },
 *       "tools":  { "allow": [...], "deny": [...] }
 *   } }
 *
 * Absent `entitlement` (or absent sub-keys) => empty layers, which the resolver
 * treats as "inherit" — for a peer agent that means: inherit its full skill
 * universe (e.g. epii's `resource_package_target` skill set), never deny-all.
 */
export function parseAgentEntitlementFromContract(contract: unknown): AgentEntitlement {
	const empty: AgentEntitlement = {
		skills: { allow: [], deny: [] },
		tools: { allow: [], deny: [] },
	};
	if (!contract || typeof contract !== "object") return empty;
	const ent = (contract as Record<string, unknown>)["entitlement"];
	if (!ent || typeof ent !== "object") return empty;

	// Accept either a string[] or a comma-separated string for each list.
	const toList = (v: unknown): string[] => {
		if (Array.isArray(v)) {
			return parseCommaList(v.filter((x) => typeof x === "string").join(","));
		}
		if (typeof v === "string") return parseCommaList(v);
		return [];
	};
	const layer = (key: "skills" | "tools"): EntitlementLayer => {
		const block = (ent as Record<string, unknown>)[key];
		if (!block || typeof block !== "object") return { allow: [], deny: [] };
		const b = block as Record<string, unknown>;
		return { allow: toList(b.allow), deny: toList(b.deny) };
	};
	return { skills: layer("skills"), tools: layer("tools") };
}

/**
 * Parse per-team entitlement layers from a `members:`-style teams.yaml.
 *
 * Backward-compatible: teams without any `skills*`/`tools*` keys yield empty
 * layers, so `resolveEntitlement` treats their ceiling as the full universe U.
 *
 * Recognized per-team keys (all optional, comma-separated OR inline `[a, b]`):
 *   skills        / skills_allow   -> skills.allow
 *   skills_deny                    -> skills.deny
 *   tools         / tools_allow    -> tools.allow
 *   tools_deny                     -> tools.deny
 *
 * The format handled here matches `Body/S/S4/pi-agent/agents/teams.yaml`:
 *
 *   teamName:
 *     description: "..."
 *     members:
 *       - a
 *       - b
 *     skills_allow: x, y         # optional
 *     tools_deny: [danger_tool]  # optional
 */
export function parseTeamEntitlements(
	teamsYamlText: string,
): Record<string, TeamEntitlement> {
	const teams: Record<string, TeamEntitlement> = {};
	let current: string | null = null;

	const ensure = (name: string): TeamEntitlement => {
		if (!teams[name]) {
			teams[name] = {
				skills: { allow: [], deny: [] },
				tools: { allow: [], deny: [] },
			};
		}
		return teams[name];
	};

	const splitInline = (value: string): string[] => {
		// Strip an optional inline-array bracket pair, then comma-split.
		const trimmed = value.trim().replace(/^\[/, "").replace(/\]$/, "");
		return parseCommaList(trimmed);
	};

	for (const rawLine of teamsYamlText.split("\n")) {
		const line = rawLine.replace(/\s+$/, "");
		if (line.trim().length === 0 || line.trim().startsWith("#")) continue;

		// Top-level team header: `name:` at column 0 (no leading whitespace),
		// with nothing meaningful after the colon.
		const teamHeader = line.match(/^(\S[^:]*):\s*$/);
		if (teamHeader) {
			current = teamHeader[1].trim();
			ensure(current);
			continue;
		}

		if (!current) continue;

		// Indented `key: value` entitlement fields.
		const kv = line.match(/^\s+([A-Za-z_]+):\s*(.+)$/);
		if (kv) {
			const key = kv[1].trim();
			const value = kv[2].trim();
			const layer = ensure(current);
			switch (key) {
				case "skills":
				case "skills_allow":
					layer.skills.allow = splitInline(value);
					break;
				case "skills_deny":
					layer.skills.deny = splitInline(value);
					break;
				case "tools":
				case "tools_allow":
					layer.tools.allow = splitInline(value);
					break;
				case "tools_deny":
					layer.tools.deny = splitInline(value);
					break;
				default:
					break; // description, members, etc. are ignored here
			}
		}
	}

	return teams;
}
