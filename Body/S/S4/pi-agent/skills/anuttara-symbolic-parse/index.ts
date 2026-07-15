/**
 * anuttara-symbolic-parse — deterministic helper surface for Verifier questions.
 *
 * @coordinate   S4-4' | Pi agent verifier-skill surface
 * @residency    Body/S/S4/pi-agent/skills/anuttara-symbolic-parse/index.ts
 * @position     #4 — LLM-Nara parser / Verifier-question articulation
 * @actualises   [[05-m4-nara-reconciliation]] T5.21; [[mental-pole-mechanics]] §0/1
 *
 * Public surface:
 *   parseVerifierSymbolicCoordinate — parses Verifier-Anuttara symbolic-coordinate strings.
 *   formulateVerifierQuestion — emits the structured inquiry routed back through Anima.
 *   evaluateSymbolicParseGate — refuses raw symbolic-coordinate inputs without the skill.
 * Does NOT own:
 *   M0 relation law, R-virtue law, or Anima dispatch execution.
 */

export const ANUTTARA_SYMBOLIC_PARSE_SKILL = "anuttara-symbolic-parse" as const;

const ENTRY_STATES = [
	"pending",
	"missing",
	"contradiction",
	"unaligned",
	"unwitnessed",
] as const;

export type VerifierEntryState = (typeof ENTRY_STATES)[number];

export interface ParsedVerifierSymbolicCoordinate {
	readonly raw: string;
	readonly relationIndex: number;
	readonly polarPair: readonly [number, number];
	readonly domainTag: string;
	readonly domainKind: "archetype" | "virtue" | "coordinate";
	readonly domainEntry: string;
	readonly entryState: VerifierEntryState;
}

export type ParseFailureCode = "parse-failure" | "resolve-failure";

export type ParseResult =
	| { readonly ok: true; readonly value: ParsedVerifierSymbolicCoordinate }
	| {
			readonly ok: false;
			readonly code: ParseFailureCode;
			readonly diagnostic: string;
	  };

export interface SymbolicResolution {
	readonly relationName: string;
	readonly leftFunction: string;
	readonly rightFunction: string;
	readonly domainLabel?: string;
}

export interface VerifierQuestionEnvelope {
	readonly tag: `#V-verify:${number}`;
	readonly relation: string;
	readonly polar: string;
	readonly domain: string;
	readonly entry: VerifierEntryState;
	readonly question: string;
	readonly route: {
		readonly via: "Anima.verify_gate";
		readonly target: "Verifier re-check";
		readonly maxCycles: 3;
	};
}

export interface SymbolicParseGateResult {
	readonly allowed: boolean;
	readonly requiredSkill: typeof ANUTTARA_SYMBOLIC_PARSE_SKILL | null;
	readonly reason: string;
}

const SYMBOLIC_COORDINATE_RE =
	/^#R(?<relationIndex>\d+)-(?<left>[0-5])\/(?<right>[0-5])\/(?<domainKind>A|V|C)-(?<domainEntry>[TRP]\d+)-(?<entryState>pending|missing|contradiction|unaligned|unwitnessed)\?$/;

const ARCHETYPE_NAMES: Readonly<Record<number, string>> = Object.freeze({
	7: "Divine-Action",
});

export function parseVerifierSymbolicCoordinate(raw: string): ParseResult {
	const trimmed = raw.trim();
	const match = SYMBOLIC_COORDINATE_RE.exec(trimmed);
	if (!match?.groups) {
		return {
			ok: false,
			code: "parse-failure",
			diagnostic: `#parse-failure:${trimmed}`,
		};
	}

	const relationIndex = Number(match.groups.relationIndex);
	if (!Number.isInteger(relationIndex) || relationIndex < 0 || relationIndex > 64) {
		return {
			ok: false,
			code: "resolve-failure",
			diagnostic: `#resolve-failure:${relationIndex}`,
		};
	}

	const domainKind = domainKindFor(match.groups.domainKind);
	if (!domainKind) {
		return {
			ok: false,
			code: "resolve-failure",
			diagnostic: `#resolve-failure:${match.groups.domainKind}`,
		};
	}

	return {
		ok: true,
		value: {
			raw: trimmed,
			relationIndex,
			polarPair: [Number(match.groups.left), Number(match.groups.right)] as const,
			domainTag: `${match.groups.domainKind}-${match.groups.domainEntry}`,
			domainKind,
			domainEntry: match.groups.domainEntry,
			entryState: match.groups.entryState as VerifierEntryState,
		},
	};
}

export function requiresAnuttaraSymbolicParse(input: string): boolean {
	return /^\s*#R\d+-[0-5]\/[0-5]\//.test(input);
}

export function evaluateSymbolicParseGate(
	input: string,
	declaredSkills: readonly string[],
): SymbolicParseGateResult {
	if (!requiresAnuttaraSymbolicParse(input)) {
		return {
			allowed: true,
			requiredSkill: null,
			reason: "input is not a raw Verifier-Anuttara symbolic-coordinate string",
		};
	}

	if (declaredSkills.includes(ANUTTARA_SYMBOLIC_PARSE_SKILL)) {
		return {
			allowed: true,
			requiredSkill: ANUTTARA_SYMBOLIC_PARSE_SKILL,
			reason: "raw symbolic-coordinate input is gated by anuttara-symbolic-parse",
		};
	}

	return {
		allowed: false,
		requiredSkill: ANUTTARA_SYMBOLIC_PARSE_SKILL,
		reason:
			"raw Verifier-Anuttara symbolic-coordinate strings must route through anuttara-symbolic-parse",
	};
}

export function formulateVerifierQuestion(
	parsed: ParsedVerifierSymbolicCoordinate,
	resolution: SymbolicResolution,
	cycleCount = 0,
): VerifierQuestionEnvelope {
	const [left, right] = parsed.polarPair;
	const domain = resolution.domainLabel ?? defaultDomainLabel(parsed);
	const polar = `P${left}<->P${right} (${resolution.leftFunction} <-> ${resolution.rightFunction})`;
	const question = [
		`${domain} at ${polar}:`,
		`why is this entry ${parsed.entryState} at relation R${parsed.relationIndex}`,
		`instead of being structurally witnessed?`,
	].join(" ");

	return {
		tag: `#V-verify:${cycleCount}`,
		relation: resolution.relationName,
		polar,
		domain,
		entry: parsed.entryState,
		question,
		route: {
			via: "Anima.verify_gate",
			target: "Verifier re-check",
			maxCycles: 3,
		},
	};
}

function domainKindFor(tag: string): ParsedVerifierSymbolicCoordinate["domainKind"] | null {
	if (tag === "A") return "archetype";
	if (tag === "V") return "virtue";
	if (tag === "C") return "coordinate";
	return null;
}

function defaultDomainLabel(parsed: ParsedVerifierSymbolicCoordinate): string {
	const id = Number(parsed.domainEntry.slice(1));
	if (parsed.domainKind === "archetype") {
		const name = ARCHETYPE_NAMES[id];
		return name ? `Archetype-${id} ${name}` : `Archetype-${id}`;
	}
	if (parsed.domainKind === "virtue") return `Virtue-${id}`;
	return `Coordinate P${id}`;
}
