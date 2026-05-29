import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { renderTemplateWithVak } from "../modules/template-vak.ts";
import type { VakAddress } from "../../shared/vak_address.ts";

describe("hen template_invoke VAK injection", () => {
  const vak: VakAddress = {
    cpf: "(4.0/1-4.4/5)",
    ct: ["CT4a"],
    cp: "CP4.4",
    cf: "(4.0/1-4.4/5)",
    cfp: "CFP0",
    cs: { code: "CS0", direction: "Day" },
  };

  it("renders daily-note frontmatter with VAK address fields", () => {
    const out = renderTemplateWithVak({
      template_id: "daily-note",
      day_id: "22-05-2026",
      vak_address: vak,
    });
    assert.match(out, /c_4_cpf:\s*"\(4\.0\/1-4\.4\/5\)"/);
    assert.match(out, /c_1_ct:\s*\n\s*-\s*CT4a/);
    assert.match(out, /c_4_cp:\s*CP4\.4/);
    assert.match(out, /c_4_cf:\s*"\(4\.0\/1-4\.4\/5\)"/);
    assert.match(out, /c_4_cfp:\s*CFP0/);
    assert.match(out, /c_4_cs:\s*CS0/);
    assert.match(out, /c_4_cs_direction:\s*Day/);
    assert.match(out, /template_id:\s*daily-note/);
    assert.match(out, /day_id:\s*"22-05-2026"/);
  });

  it("preserves multi-CT arrays as YAML list", () => {
    const out = renderTemplateWithVak({
      template_id: "daily-note",
      day_id: "22-05-2026",
      vak_address: { ...vak, ct: ["CT0", "CT2", "CT5"] },
    });
    assert.match(out, /c_1_ct:\s*\n\s*-\s*CT0\s*\n\s*-\s*CT2\s*\n\s*-\s*CT5/);
  });

  it("emits primed Night' direction (canonical Pratibimba marker)", () => {
    const out = renderTemplateWithVak({
      template_id: "now",
      day_id: "22-05-2026",
      vak_address: { ...vak, cs: { code: "CS5", direction: "Night'" } },
    });
    assert.match(out, /c_4_cs_direction:\s*Night'/);
  });

  it("appends optional body content after the frontmatter close", () => {
    const out = renderTemplateWithVak({
      template_id: "daily-note",
      day_id: "22-05-2026",
      vak_address: vak,
      body: "# Today's plan\n\n- ground",
    });
    assert.match(out, /---\n# Today's plan\n\n- ground\n$/);
  });

  it("frontmatter starts and ends with --- markers", () => {
    const out = renderTemplateWithVak({
      template_id: "daily-note",
      day_id: "22-05-2026",
      vak_address: vak,
    });
    assert.match(out, /^---\n/);
    // Match the closing --- somewhere after the first ---
    assert.ok(out.indexOf("---", 4) > 4, "must have closing --- after opening");
  });
});
