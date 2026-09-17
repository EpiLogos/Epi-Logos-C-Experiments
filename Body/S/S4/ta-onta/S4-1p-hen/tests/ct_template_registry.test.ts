import { strict as assert } from "node:assert";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  CT_TEMPLATE_ARCHETYPES,
  HEN_TEMPLATE_TYPES,
  TEMPLATE_CT,
  ctForTemplate,
  isHenTemplateType,
  resolveArtifactTemplates,
  resolveCtTemplates,
  type HenTemplateType,
} from "../modules/ct-template-registry.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
// tests -> S4-1p-hen -> ta-onta -> S4 -> S -> Body -> repo root
const REPO_ROOT = join(HERE, "..", "..", "..", "..", "..", "..");

test("CT0 carries both (00/00) artifacts — seed and flow", () => {
  const resolved = resolveCtTemplates("CT0");
  assert.equal(resolved.status, "resolved");
  assert.deepEqual([...resolved.templates], ["seed", "flow"]);
});

test("each single-archetype CT resolves to its canon template", () => {
  const expected: Record<string, HenTemplateType[]> = {
    CT1: ["prompt"],
    CT2: ["task-spec"],
    CT3: ["pattern-note"],
    CT4a: ["integration-preview"],
    CT5: ["thought"],
  };
  for (const [ct, templates] of Object.entries(expected)) {
    const resolved = resolveCtTemplates(ct as never);
    assert.equal(resolved.status, "resolved", `${ct} must resolve`);
    assert.deepEqual([...resolved.templates], templates, `${ct} templates`);
  }
});

test("CT4b carries both the day artifacts", () => {
  const resolved = resolveCtTemplates("CT4b");
  assert.deepEqual([...resolved.templates], ["daily-note", "now"]);
});

test("bare CT4 REFUSES rather than defaulting to a phase", () => {
  const resolved = resolveCtTemplates("CT4");
  assert.equal(resolved.status, "no-archetype");
  assert.deepEqual([...resolved.templates], []);
  // The reason must name the phases, so a script author can fix the declaration.
  assert.match(resolved.reason, /CT4a/);
  assert.match(resolved.reason, /CT4b/);
  assert.match(resolved.reason, /layer/i);
});

test("a multi-CT declaration de-duplicates shared templates", () => {
  // CT4b and CT4b again, plus CT2 — `now`/`daily-note` must not appear twice.
  const resolution = resolveArtifactTemplates(["CT4b", "CT2", "CT4b"]);
  assert.deepEqual(resolution.templates, ["daily-note", "now", "task-spec"]);
  assert.deepEqual(resolution.unresolved, []);
});

test("an unresolvable CT is reported, not silently dropped", () => {
  const resolution = resolveArtifactTemplates(["CT2", "CT4"]);
  // The resolvable half still resolves...
  assert.deepEqual(resolution.templates, ["task-spec"]);
  // ...and the refused half is named with its reason.
  assert.equal(resolution.unresolved.length, 1);
  assert.equal(resolution.unresolved[0]!.ct, "CT4");
  assert.match(resolution.unresolved[0]!.reason, /phase/i);
});

test("the derived inverse claims every template exactly once", () => {
  // TEMPLATE_CT is built by inverting the authored table; if the authored table
  // ever leaves a template unclaimed the module throws at import, so reaching
  // this assertion at all is part of the proof.
  for (const template of HEN_TEMPLATE_TYPES) {
    const ct = ctForTemplate(template);
    assert.ok(
      CT_TEMPLATE_ARCHETYPES[ct].includes(template),
      `${template} -> ${ct} must round-trip through the authored table`,
    );
  }
  assert.equal(Object.keys(TEMPLATE_CT).length, HEN_TEMPLATE_TYPES.length);
});

test("no template is claimed by bare CT4", () => {
  assert.deepEqual([...CT_TEMPLATE_ARCHETYPES.CT4], []);
  assert.ok(!Object.values(TEMPLATE_CT).includes("CT4"));
});

test("isHenTemplateType gates values crossing a wire", () => {
  assert.ok(isHenTemplateType("integration-preview"));
  assert.ok(!isHenTemplateType("Task-Spec.md"));
  assert.ok(!isHenTemplateType(undefined));
});

test("hen_template_invoke accepts every template the registry can resolve", () => {
  // A resolvable CT that the tool's parameter union rejects would be a dead
  // archetype — exactly the CT4a/integration-preview gap this tranche closed.
  const extension = readFileSync(
    join(HERE, "..", "extension.ts"),
    "utf8",
  );
  const union = extension.slice(
    extension.indexOf("template_type: Type.Union("),
    extension.indexOf("coordinate: Type.Optional"),
  );
  for (const template of HEN_TEMPLATE_TYPES) {
    assert.ok(
      union.includes(`Type.Literal("${template}")`),
      `hen_template_invoke must accept ${template} (CT ${ctForTemplate(template)})`,
    );
  }
});

test("PARITY: templates.rs::profile_ct_mapping mirrors the authored TS table", () => {
  // The Rust CLI carries the same mapping for its own render path. Two mirrors
  // drift silently, so pin them: every template the TS table claims must map to
  // the same CT in Rust.
  const rust = readFileSync(
    join(REPO_ROOT, "Body/S/S0/epi-cli/src/vault/templates.rs"),
    "utf8",
  );
  const body = rust.slice(rust.indexOf("fn profile_ct_mapping"));
  const arms = body.slice(0, body.indexOf("_ => None"));

  const rustMapping = new Map<string, string>();
  for (const line of arms.split("\n")) {
    const match = /^\s*(.+?)\s*=>\s*Some\("(CT[0-9a-b]+)"\)/.exec(line);
    if (!match) continue;
    for (const literal of match[1]!.split("|")) {
      const name = literal.trim().replace(/^"|"$/g, "");
      rustMapping.set(name, match[2]!);
    }
  }

  assert.ok(rustMapping.size > 0, "must have parsed the Rust match arms");
  for (const template of HEN_TEMPLATE_TYPES) {
    assert.equal(
      rustMapping.get(template),
      ctForTemplate(template),
      `templates.rs must map ${template} to ${ctForTemplate(template)}`,
    );
  }
  // And Rust must not claim a CT for a template TS does not know about.
  for (const [template, ct] of rustMapping) {
    assert.ok(
      isHenTemplateType(template),
      `templates.rs maps unknown template ${template} (${ct})`,
    );
  }
});
