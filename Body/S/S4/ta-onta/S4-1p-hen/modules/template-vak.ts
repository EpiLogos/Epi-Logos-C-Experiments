import type { VakAddress } from "../../shared/vak_address.ts";

export interface TemplateRenderInput {
  template_id: string;
  /**
   * Optional day identifier in `DD-MM-YYYY` form (the Hen convention).
   * When absent or empty, the frontmatter omits the day_id line entirely
   * rather than emitting an ambiguous empty-string sentinel.
   */
  day_id?: string;
  vak_address: VakAddress;
  /** Optional markdown body content appended after the frontmatter close. */
  body?: string;
}

/**
 * Render a Day/NOW template with the current VAK address injected as frontmatter.
 *
 * Field naming follows the canonical coordinate-driven convention:
 *   c_4_cpf, c_1_ct, c_4_cp, c_4_cf, c_4_cfp, c_4_cs, c_4_cs_direction
 *
 * The cs_direction is split out from the nested cs object because Obsidian
 * frontmatter is flat YAML — nested objects don't render cleanly in property
 * editors. The wire-format cs.code/cs.direction shape is preserved on the
 * JSON side; this function is for Markdown frontmatter only.
 *
 * Caller invariants:
 *   - vak_address must have been validated by isValidVakAddress (callers in
 *     extension.ts do this). Each VAK field is then guaranteed to be a member
 *     of a canonical literal set that contains no YAML-significant characters
 *     (no quotes, backslashes, newlines, colons), so safe to interpolate
 *     directly into both quoted and unquoted YAML positions.
 *   - template_id should come from the tool's TypeBox Union schema (a literal
 *     enum), which guarantees a bare identifier. If callers ever pipe an
 *     unvalidated template_id, they must pre-escape.
 *   - day_id is the only field with no upstream validation; we defensively
 *     emit it via JSON.stringify (which is a strict subset of YAML
 *     double-quoted-string syntax) so quotes/newlines/backslashes survive
 *     round-trip.
 */
export function renderTemplateWithVak(input: TemplateRenderInput): string {
  const v = input.vak_address;
  const ctList = v.ct.map((t) => `  - ${t}`).join("\n");
  const body = input.body ?? "";
  const dayIdLine = input.day_id
    ? `day_id: ${JSON.stringify(input.day_id)}\n`
    : "";
  return `---
template_id: ${input.template_id}
${dayIdLine}c_4_cpf: "${v.cpf}"
c_1_ct:
${ctList}
c_4_cp: ${v.cp}
c_4_cf: "${v.cf}"
c_4_cfp: ${v.cfp}
c_4_cs: ${v.cs.code}
c_4_cs_direction: ${v.cs.direction}
---
${body}
`;
}
