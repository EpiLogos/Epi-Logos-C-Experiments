import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { renderThoughtFrontmatter } from "../modules/thought-vak.ts";

describe("thought_route VAK frontmatter", () => {
  it("records the producing VAK address on T-bucket artifacts (canonical keys)", () => {
    const fm = renderThoughtFrontmatter({
      bucket: "T3",
      summary: "pattern noticed",
      vak_address: {
        cpf: "(4.0/1-4.4/5)",
        ct: ["CT3"],
        cp: "CP4.3",
        cf: "(0/1/2/3)",
        cfp: "CFP0",
        cs: { code: "CS3", direction: "Day" },
      },
    });
    assert.match(fm, /^---\n/);
    assert.match(fm, /\n---\n$/);
    assert.match(fm, /thought_bucket:\s*T3/);
    assert.match(fm, /cpf:\s*"\(4\.0\/1-4\.4\/5\)"/);
    assert.match(fm, /cf:\s*"\(0\/1\/2\/3\)"/);
    assert.match(fm, /cp:\s*CP4\.3/);
    assert.match(fm, /cfp:\s*CFP0/);
    assert.match(fm, /cs_code:\s*CS3/);
    assert.match(fm, /cs_direction:\s*Day/);
    assert.match(fm, /ct:\s*\n\s+- CT3/);
  });

  it("preserves the dialogical (00/00) CPF literal", () => {
    const fm = renderThoughtFrontmatter({
      bucket: "T0",
      summary: "open chat",
      vak_address: {
        cpf: "(00/00)",
        ct: ["CT0"],
        cp: "CP4.0",
        cf: "(00/00)",
        cfp: "CFP0",
        cs: { code: "CS0", direction: "Day" },
      },
    });
    assert.match(fm, /cpf:\s*"\(00\/00\)"/);
  });

  it("preserves the primed Night' direction", () => {
    const fm = renderThoughtFrontmatter({
      bucket: "T2",
      summary: "analysis",
      vak_address: {
        cpf: "(4.0/1-4.4/5)",
        ct: ["CT2"],
        cp: "CP4.2",
        cf: "(0/1/2)",
        cfp: "CFP0",
        cs: { code: "CS2", direction: "Night'" },
      },
    });
    assert.match(fm, /cs_direction:\s*Night'/);
  });
});
