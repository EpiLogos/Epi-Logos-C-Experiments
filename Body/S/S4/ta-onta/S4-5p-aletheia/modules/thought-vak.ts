import type { VakAddress } from "../../shared/vak_address.ts";

export interface ThoughtFrontmatterInput {
  /** T-bucket slot — "T0".."T5". */
  bucket: string;
  /** Short human-readable summary of the thought. */
  summary: string;
  /** Producing VAK address (already validated by isValidVakAddress). */
  vak_address: VakAddress;
}

/**
 * Render YAML frontmatter for a T-bucket thought artifact, encoding the
 * producing VAK address using the canonical VAK prefix keys.
 *
 * Field naming follows the canonical VAK grammar — each layer has its own
 * coordinate key (cpf, ct, cp, cf, cfp, cs_code, cs_direction) because VAK
 * is its own grammar (S0' register), not C4/Type metadata. Flattening VAK
 * fields into a single c_4_* family would falsely jam them all into the
 * Type position. Mirrors A3 Hen (template-vak.ts) and A4 Graphiti.
 *
 * The cs_direction is split out from the nested cs object because Obsidian
 * frontmatter is flat YAML — nested objects don't render cleanly in
 * property editors. The wire-format cs.code/cs.direction shape is preserved
 * on the JSON side; this function is for Markdown frontmatter only.
 *
 * Caller invariants:
 *   - vak_address MUST have been validated by isValidVakAddress at the
 *     call site (the extension.ts wiring does this). Each VAK field is
 *     then guaranteed to be a member of a canonical literal set
 *     containing no YAML-significant characters in unquoted positions
 *     (no colons / leading reserved chars), so safe to interpolate
 *     directly into unquoted YAML scalars.
 *   - cpf and cf are emitted double-quoted because their literal values
 *     contain parens and slashes, which are technically YAML-legal as a
 *     bare flow scalar but trigger reader ambiguity with some tools.
 *   - summary is emitted via JSON.stringify (a strict subset of YAML
 *     double-quoted-string syntax) so arbitrary user content with quotes,
 *     newlines, or backslashes survives round-trip.
 *   - cs_direction is emitted unquoted; the only inhabitants of CsDirection
 *     are "Day" and "Night'". The trailing single quote in Night' is
 *     YAML-legal in an unquoted scalar position (consistent with A3 Hen).
 */
export function renderThoughtFrontmatter(input: ThoughtFrontmatterInput): string {
  const v = input.vak_address;
  const ctLines = v.ct.map((t) => `  - ${t}`).join("\n");
  return `---
thought_bucket: ${input.bucket}
summary: ${JSON.stringify(input.summary)}
cpf: "${v.cpf}"
ct:
${ctLines}
cp: ${v.cp}
cf: "${v.cf}"
cfp: ${v.cfp}
cs_code: ${v.cs.code}
cs_direction: ${v.cs.direction}
---
`;
}
