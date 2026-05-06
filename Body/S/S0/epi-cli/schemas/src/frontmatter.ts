import { z } from "zod";

/**
 * All 68 canonical frontmatter keys.
 * Source: frontmatter_schema.ts in .pi/extensions/s_i/modules/ql_obsidian/
 * Pattern: {coord}_{n}_{semantic} + special agent/artifact keys
 */
export const CANONICAL_KEYS = [
  // P family (11)
  "p_0_grounds", "p_1_title", "p_1_definitions", "p_2_operations", "p_2_skills",
  "p_3_patterns", "p_4_temporals", "p_4_spatials", "p_5_integrations",
  "p_5_crystallizations", "p_5_prime_crystallizations",
  // C family (6)
  "c_0_links_to", "c_0_relates_to", "c_1_type", "c_4_classifies", "c_4_category", "c_4_classified",
  // M family (3)
  "m_3_archived_to", "m_5_mobius_return", "m_5_bimba_form",
  // S family (16)
  "s_0_source", "s_1_file_path", "s_2_graph_id", "s_2_contains", "s_3_pack",
  "s_3_orphaned", "s_3_blocked_by", "s_3_depends_on", "s_3_registers",
  "s_4_session", "s_4_spawned", "s_4_transitioned_to", "s_4_communicated",
  "s_4_handed_off_to", "s_4_modulated_to", "s_5_reflects",
  // T family (10)
  "t_0_question_from", "t_0_operative_frame", "t_1_extracted_from",
  "t_2_challenge_source", "t_3_duplicates", "t_3_thread_of",
  "t_4_kairos_context", "t_5_crystallized_to", "t_5_crystallized_from", "t_5_mobius_return",
  // L family (6)
  "l_0_ground", "l_1_structural", "l_2_processual", "l_3_archetypal",
  "l_4_contextual", "l_5_integral",
  // Agent-semantic + artifact role (16)
  "aletheia_verifies", "artifact_role", "ctx_type", "invocation_profile",
  "source_coordinate", "parent_day_id", "now_id", "day_id", "session_id",
  "parent_session_id", "created_at", "updated_at", "merged_at", "merge_reason",
  "provenance_refs", "invocation_kind",
] as const;

export type CanonicalKey = (typeof CANONICAL_KEYS)[number];

const CANONICAL_SET = new Set<string>(CANONICAL_KEYS);

const DEPRECATED_PATTERNS = [
  /^coordinate$/,
  /^ql_position$/,
  /^pos\d+_/,
  /^pos_[a-z]/,
  /^ctx_(?!type$)/,
  /^bimba_coordinate$/,
];

/** Check if a key is in the canonical set. */
export function isCanonicalKey(key: string): boolean {
  return CANONICAL_SET.has(key);
}

/** Check if a key matches a deprecated pattern. */
export function isDeprecatedKey(key: string): boolean {
  return DEPRECATED_PATTERNS.some((p) => p.test(key));
}

/** Validate a set of frontmatter keys. */
export function validateFrontmatterKeys(keys: string[]): {
  valid: string[];
  deprecated: string[];
  unknown: string[];
} {
  const valid: string[] = [];
  const deprecated: string[] = [];
  const unknown: string[] = [];
  for (const k of keys) {
    if (isDeprecatedKey(k)) deprecated.push(k);
    else if (isCanonicalKey(k)) valid.push(k);
    else unknown.push(k);
  }
  return { valid, deprecated, unknown };
}

/** Zod schema for a single canonical frontmatter key. Rejects deprecated patterns. */
export const FrontmatterKeySchema = z.string().refine(
  (k) => isCanonicalKey(k) && !isDeprecatedKey(k),
  { message: "Not a canonical frontmatter key or uses deprecated pattern" }
);
