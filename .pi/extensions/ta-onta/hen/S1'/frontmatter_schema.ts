/**
 * Hen Frontmatter Schema Authority — 126 canonical keys
 *
 * Key format: {family}_{n}_{semantic}
 * Families: C, P, L, S, T, M (position 0-5 each)
 * Special fields: ONLY `coordinate` is exempt from {family}_{n}_{semantic} — see SPECIAL_KEYS
 * Enforcement posture: unknown key = ERROR, not warning. All keys must conform.
 * The SPECIAL_KEYS set is intentionally minimal — only `coordinate` is exempt because
 * it IS the root Bimba reference, not a property.
 */

/**
 * C-FAMILY ONTOLOGICAL RULE:
 * The C family is the default for ALL artifact ontological properties.
 * Use non-C prefixes only when the property is genuinely domain-specific:
 *   - t_0_thought_type: T-bucket position is a T-domain fact
 *   - m_4_nara_domain: M4 subsystem hook
 * Everything else — temporal stamps, session IDs, entity IDs — uses C-family:
 *   - Temporal stamps (day_id, created_at): C3 (Process/Canvas)
 *   - Entity IDs (session_id, uuid): C2 (Entity/Operation)
 *   - Sourcing/origin refs: C0 (Bimba/Ground)
 *   - Type/role/invocation: C4 (Type/Context)
 *   - Integration state: C5 (Pratibimba)
 * Ambiguity between C0 and C3 is ontologically honest — notice it, choose the reading
 * that best serves the artifact's function.
 */

// Special system keys — ONLY keys with no coordinate semantics of their own
// coordinate is the canonical Bimba node identifier: it IS the ground reference, not a property of it
export const SPECIAL_KEYS = new Set([
  "coordinate",   // THE canonical Bimba node identifier — all other props use {family}_{n}_{semantic}
]);

// Banned keys — reject on write, warn on read
export const BANNED_KEYS = new Set([
  "bimbaCoordinate",      // superseded by `coordinate`
  "ql_position",          // superseded by coordinate system
]);

// Banned prefixes
export const BANNED_PREFIXES = ["pos_", "pos0_", "pos1_", "pos2_", "pos3_", "pos4_", "pos5_"];

// Valid families
export const VALID_FAMILIES = ["c", "p", "l", "s", "t", "m"] as const;

// Valid positions
export const VALID_POSITIONS = [0, 1, 2, 3, 4, 5] as const;

export interface SchemaValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateFrontmatterKey(key: string): SchemaValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Special keys are always valid
  if (SPECIAL_KEYS.has(key)) return { valid: true, errors, warnings };

  // Banned keys
  if (BANNED_KEYS.has(key)) {
    warnings.push(`deprecated key: "${key}" — use "coordinate" for node identifiers`);
    return { valid: true, errors, warnings }; // warn, not error (allow read-path migration)
  }

  // Banned prefixes
  for (const prefix of BANNED_PREFIXES) {
    if (key.startsWith(prefix)) {
      errors.push(`banned prefix "${prefix}" in key "${key}" — use {family}_{n}_{semantic} format`);
      return { valid: false, errors, warnings };
    }
  }

  // Validate {family}_{n}_{semantic} pattern
  const match = key.match(/^([cplstm])_([0-5])_(.+)$/);
  if (!match) {
    // Unknown key — this is an ERROR. All keys must be {family}_{n}_{semantic} or `coordinate`.
    errors.push(`non-conforming key "${key}" — ALL frontmatter keys must use {family}_{n}_{semantic} format (e.g. c_4_artifact_role, c_3_day_id, c_2_session_id). Only "coordinate" is exempt.`);
    return { valid: false, errors, warnings };
  }

  const [, _family, _pos, semantic] = match;
  if (!semantic || semantic.length < 2) {
    errors.push(`key "${key}" has empty or too-short semantic component`);
    return { valid: false, errors, warnings };
  }

  return { valid: true, errors, warnings };
}

export function validateFrontmatter(fm: Record<string, unknown>): SchemaValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  for (const key of Object.keys(fm)) {
    const result = validateFrontmatterKey(key);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  }
  return { valid: allErrors.length === 0, errors: allErrors, warnings: allWarnings };
}
