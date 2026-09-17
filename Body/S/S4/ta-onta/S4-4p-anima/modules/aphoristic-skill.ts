import type { VakAddress } from "../../shared/vak_address.ts";
import { isValidQKey } from "./sophia-hook.ts";

export type AphoristicDepthTarget = "pithy" | "qv-detail";

export interface AphoristicValidation {
  ok: boolean;
  error?: string;
  token_count: number;
  slot_name?: "aletheia.janus" | "aletheia.zeithoven";
}

const TOKEN_BUDGET: Record<AphoristicDepthTarget, number> = {
  pithy: 80,
  "qv-detail": 250,
};

const TEMPORAL_HEDGES = /\b(currently|for now|at this time|right now|presently)\b/gi;
const META_NARRATION = /\b(this means that|in other words|what this says is|the point is that)\b/gi;
const IMAGE_MARKERS = /\b(like|as|mirror|seed|gate|hinge|river|fire|thread|loom|vessel|threshold|root|constellation|courtyard|lock|current|lamp|bridge)\b/i;

const EXEMPLARS: Record<string, readonly string[]> = {
  q_4_locality_signature: [
    "Like a courtyard with four gates, parent, lateral, inversion, and resonance keep locality porous.",
  ],
  q_5_integration_template: [
    "Like a river lock, integration gathers pressure, tests passage, and releases a higher current.",
  ],
  q_5_conjunctive_threshold: [
    "Like a hinge under dawn, the threshold joins what would otherwise remain two doors.",
  ],
};

export function countAphoristicTokens(text: string): number {
  const tokens = text.trim().match(/[A-Za-z0-9']+/g);
  return tokens ? tokens.length : 0;
}

export function resolveAphoristicSlot(input: {
  source_vak: VakAddress;
  depth_target: AphoristicDepthTarget;
}): "aletheia.janus" | "aletheia.zeithoven" {
  if (input.depth_target === "qv-detail" || input.source_vak.cp === "CP4.5") {
    return "aletheia.zeithoven";
  }
  return "aletheia.janus";
}

export async function composeAphoristic(
  rationale: string,
  source_vak: VakAddress,
  q_key: string,
  depth_target: AphoristicDepthTarget,
): Promise<string> {
  if (!isValidQKey(q_key)) {
    throw new Error(`composeAphoristic refused malformed q_key: ${q_key}`);
  }

  const slot_name = resolveAphoristicSlot({ source_vak, depth_target });
  const cleaned = stripBannedPhrases(rationale)
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) {
    throw new Error("composeAphoristic requires non-empty rationale.");
  }

  const familyImage = imageForQKey(q_key);
  const bounded = trimToBudget(cleaned.replace(/[.!?]+$/g, ""), TOKEN_BUDGET[depth_target] - 10);
  const candidate = `Like ${familyImage}, ${lowercaseFirst(bounded)}.`;
  const validation = validateAphoristicCandidate(candidate, q_key, depth_target, slot_name);
  if (!validation.ok) {
    throw new Error(validation.error);
  }
  return candidate;
}

export function validateAphoristicCandidate(
  candidate: string,
  q_key: string,
  depth_target: AphoristicDepthTarget,
  slot_name?: "aletheia.janus" | "aletheia.zeithoven",
): AphoristicValidation {
  const token_count = countAphoristicTokens(candidate);
  if (!isValidQKey(q_key)) {
    return { ok: false, error: `malformed q_key: ${q_key}`, token_count, slot_name };
  }
  if (token_count === 0) {
    return { ok: false, error: "aphoristic candidate is empty.", token_count, slot_name };
  }
  if (token_count > TOKEN_BUDGET[depth_target]) {
    return {
      ok: false,
      error: `aphoristic candidate exceeds ${depth_target} token budget (${token_count}/${TOKEN_BUDGET[depth_target]}).`,
      token_count,
      slot_name,
    };
  }
  if (TEMPORAL_HEDGES.test(candidate) || META_NARRATION.test(candidate)) {
    TEMPORAL_HEDGES.lastIndex = 0;
    META_NARRATION.lastIndex = 0;
    return {
      ok: false,
      error: "aphoristic candidate contains temporal hedging or meta-narration.",
      token_count,
      slot_name,
    };
  }
  TEMPORAL_HEDGES.lastIndex = 0;
  META_NARRATION.lastIndex = 0;

  if (!hasBoundedSentenceShape(candidate)) {
    return {
      ok: false,
      error: "aphoristic candidate must be one sentence or bounded clauses.",
      token_count,
      slot_name,
    };
  }
  if (!IMAGE_MARKERS.test(candidate)) {
    return {
      ok: false,
      error: "aphoristic candidate must carry an image or analogy.",
      token_count,
      slot_name,
    };
  }
  if (isLocalitySignatureKey(q_key) && !hasStructuredLocalityShape(candidate)) {
    return {
      ok: false,
      error:
        "locality signature must name parent, lateral siblings, key inversion, and cross-namespace resonance.",
      token_count,
      slot_name,
    };
  }
  if (!peerReviewAgainstExemplars(candidate, q_key)) {
    return {
      ok: false,
      error: `aphoristic candidate is too flat against ${q_key} exemplar family.`,
      token_count,
      slot_name,
    };
  }
  return { ok: true, token_count, slot_name };
}

export function peerReviewAgainstExemplars(candidate: string, q_key: string): boolean {
  const exemplars = EXEMPLARS[q_key] ?? EXEMPLARS[familyKey(q_key)] ?? [];
  if (exemplars.length === 0) return IMAGE_MARKERS.test(candidate);
  const candidateTerms = importantTerms(candidate);
  return exemplars.some((exemplar) => {
    const exemplarTerms = importantTerms(exemplar);
    return [...candidateTerms].some((term) => exemplarTerms.has(term)) || IMAGE_MARKERS.test(candidate);
  });
}

function stripBannedPhrases(value: string): string {
  return value.replace(TEMPORAL_HEDGES, "").replace(META_NARRATION, "");
}

function trimToBudget(value: string, budget: number): string {
  const words = value.match(/\S+/g) ?? [];
  if (words.length <= budget) return value;
  return words.slice(0, budget).join(" ").replace(/[,:;]+$/g, "");
}

function lowercaseFirst(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function imageForQKey(q_key: string): string {
  if (isLocalitySignatureKey(q_key)) return "a courtyard with four gates";
  if (q_key.startsWith("q_5")) return "a river lock";
  if (q_key.startsWith("q_4")) return "a hinge in a threshold";
  if (q_key.startsWith("q_3")) return "a constellation";
  if (q_key.startsWith("q_2")) return "a braided current";
  if (q_key.startsWith("q_1")) return "a root under stone";
  return "a seed before dawn";
}

function hasBoundedSentenceShape(value: string): boolean {
  const sentenceBreaks = value.match(/[.!?]/g)?.length ?? 0;
  return sentenceBreaks <= 1 && !/\n{2,}/.test(value);
}

function isLocalitySignatureKey(q_key: string): boolean {
  return /^q_4'?(?:_\d+)?_locality_signature$/.test(q_key);
}

function hasStructuredLocalityShape(value: string): boolean {
  return /\bparent\b/i.test(value) &&
    /\blateral\b/i.test(value) &&
    /\binversion\b/i.test(value) &&
    /\bresonance\b/i.test(value);
}

function familyKey(q_key: string): string {
  const match = q_key.match(/^(q_[0-5]'?(?:_\d+)?_[a-z0-9]+)(?:_|$)/);
  return match?.[1] ?? q_key;
}

function importantTerms(value: string): Set<string> {
  return new Set(
    (value.toLowerCase().match(/[a-z0-9']+/g) ?? [])
      .filter((term) => term.length > 4),
  );
}
