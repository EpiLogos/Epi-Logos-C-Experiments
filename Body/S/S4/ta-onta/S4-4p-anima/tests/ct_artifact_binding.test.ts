/**
 * ct_artifact_binding.test.ts — CT declarations bind to real Hen artifacts
 * (50.T50.08).
 *
 * The CT coordinate declares WHICH artifact a step produces or consumes. Before
 * this binding, `artifactTemplates()` handed back raw CT codes and nothing turned
 * them into a template Hen could render — a script could declare `ct: ["CT2"]`
 * and no `task-spec` would ever materialise.
 *
 * Proven here:
 *   1. the surface resolves a step's CT set to Hen template types, consuming
 *      Hen's registry rather than a second copy of the table;
 *   2. a mechanistic dispatch whose CT names no archetype is REFUSED with the
 *      offending coordinate named, instead of running and silently producing
 *      nothing;
 *   3. a dialogical dispatch is not held to that bar, because its CT is still
 *      being determined.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  artifactTemplates,
  resolvedArtifactTemplates,
} from "../lib/vak-orchestration-surface.ts";
import { validateDispatchParams } from "../modules/dispatch-validate.ts";
import type { VakAddress } from "../../shared/vak_address.ts";

/** A canonical mechanistic address bound to Logos (CF1), with the CT under test. */
function address(ct: VakAddress["ct"]): VakAddress {
  return {
    cpf: "(4.0/1-4.4/5)",
    ct,
    cp: "CP4.2",
    cf: "(0/1)",
    cfp: "CFP2",
    cs: { code: "CS2", direction: "Day" },
  } as VakAddress;
}

test("the surface answers in CT codes AND in Hen template types", () => {
  const addr = address(["CT2"]);
  // The CT reading is unchanged — still coordinates.
  assert.deepEqual(artifactTemplates(addr), ["CT2"]);
  // The resolved reading is what Hen can actually render.
  const resolved = resolvedArtifactTemplates(addr);
  assert.deepEqual([...resolved.templates], ["task-spec"]);
  assert.deepEqual([...resolved.unresolved], []);
});

test("a multi-CT step resolves every declared artifact, de-duplicated", () => {
  const resolved = resolvedArtifactTemplates(address(["CT0", "CT4b", "CT0"]));
  assert.deepEqual([...resolved.templates], ["seed", "flow", "daily-note", "now"]);
});

test("CT4a resolves to the integration-preview archetype", () => {
  // This archetype was canon and on disk yet unreachable before 50.T50.08.
  const resolved = resolvedArtifactTemplates(address(["CT4a"]));
  assert.deepEqual([...resolved.templates], ["integration-preview"]);
});

test("a mechanistic dispatch declaring bare CT4 is REFUSED, naming the coordinate", () => {
  const result = validateDispatchParams({
    agent_name: "logos",
    task: "produce the thing",
    vak_address: address(["CT4"]),
  });
  assert.equal(result.ok, false);
  assert.match(result.error!, /ct declares no materialisable Hen template/);
  assert.match(result.error!, /CT4/);
  // The message must point at the fix, not just complain.
  assert.match(result.error!, /CT4a/);
  assert.match(result.error!, /CT4b/);
});

test("a mechanistic dispatch with a resolvable CT passes validation", () => {
  const result = validateDispatchParams({
    agent_name: "logos",
    task: "produce the thing",
    vak_address: address(["CT2"]),
  });
  assert.equal(result.ok, true, result.error);
});

test("a partially-resolvable CT set is still refused — no partial artifact runs", () => {
  const result = validateDispatchParams({
    agent_name: "logos",
    task: "produce the things",
    vak_address: address(["CT2", "CT4"]),
  });
  assert.equal(result.ok, false);
  assert.match(result.error!, /CT4/);
});

test("a DIALOGICAL dispatch is not held to CT resolvability", () => {
  // `(00/00)` is the register where the VAK is still being determined —
  // brainstorming IS the CT determination, so bare CT4 is tolerated here.
  const result = validateDispatchParams({
    agent_name: "nous",
    task: "work out what this even is",
    vak_address: { ...address(["CT4"]), cpf: "(00/00)" } as VakAddress,
  });
  assert.equal(result.ok, true, result.error);
});
