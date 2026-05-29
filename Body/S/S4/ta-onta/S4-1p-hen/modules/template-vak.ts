import type { VakAddress } from "../../shared/vak_address.ts";

export interface TemplateRenderInput {
  template_id: string;
  day_id: string;
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
 */
export function renderTemplateWithVak(input: TemplateRenderInput): string {
  const v = input.vak_address;
  const ctList = v.ct.map((t) => `  - ${t}`).join("\n");
  const body = input.body ?? "";
  return `---
template_id: ${input.template_id}
day_id: "${input.day_id}"
c_4_cpf: "${v.cpf}"
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
