import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = "/Users/admin/Documents/Epi-Logos C Experiments";

const composition = JSON.parse(
  readFileSync(
    join(repoRoot, "Body/M/epi-theia/extensions/contracts/08-t0-composition-contract-preflight.json"),
    "utf8"
  )
);

const seven = JSON.parse(
  readFileSync(
    join(repoRoot, "Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json"),
    "utf8"
  )
);

const expectedIntegratedPlugins = ["plugin-integrated-1-2-3", "plugin-integrated-4-5-0"];
const expectedShapes = [
  "IntegratedSurfaceContribution",
  "IntegratedViewPart",
  "IntegratedMiniInspector",
  "IntegratedEvidenceProducer",
  "IntegratedLayoutClaim",
  "IntegratedReadiness",
];

test("08.T0 declares both integrated plugins with correct contributors", () => {
  const ids = composition.integratedPlugins.map((p) => p.id);
  for (const id of expectedIntegratedPlugins) {
    assert.ok(ids.includes(id), `${id} missing from integratedPlugins`);
  }

  const oneTwoThree = composition.integratedPlugins.find((p) => p.id === "plugin-integrated-1-2-3");
  assert.deepEqual(
    oneTwoThree.extensionContributors.sort(),
    ["m1-paramasiva", "m2-parashakti", "m3-mahamaya"].sort(),
    "plugin-integrated-1-2-3 contributors drift"
  );

  const fourFiveZero = composition.integratedPlugins.find((p) => p.id === "plugin-integrated-4-5-0");
  assert.deepEqual(
    fourFiveZero.extensionContributors.sort(),
    ["m4-nara", "m5-epii", "m0-anuttara"].sort(),
    "plugin-integrated-4-5-0 contributors drift"
  );
});

test("08.T0 declares all six required contract shapes with required-field sets", () => {
  const declared = composition.contractShapes.shapes.map((s) => s.name);
  for (const shape of expectedShapes) {
    assert.ok(declared.includes(shape), `${shape} missing from contractShapes`);
  }
  for (const shape of composition.contractShapes.shapes) {
    assert.ok(
      Array.isArray(shape.required_fields) && shape.required_fields.length > 0,
      `${shape.name} must declare required_fields`
    );
  }
});

test("08.T0 readiness taxonomy inherits 07.T0 exactly", () => {
  const readinessShape = composition.contractShapes.shapes.find(
    (s) => s.name === "IntegratedReadiness"
  );
  assert.ok(readinessShape, "IntegratedReadiness shape missing");
  const inherited = readinessShape.states_inherited_from_07;
  const expected = seven.readinessTaxonomy.map((r) => r.id ?? r.name ?? r.state ?? r);
  // 07.T0 readinessTaxonomy entries may be objects or strings — normalize.
  const expectedStrings = seven.readinessTaxonomy.map((r) =>
    typeof r === "string" ? r : (r.id ?? r.name ?? r.state)
  );
  for (const state of expectedStrings) {
    assert.ok(inherited.includes(state), `Readiness state ${state} from 07.T0 not inherited in 08.T0`);
  }
});

test("08.T0 inherits 07.T0 forbidden imports (no divergent list)", () => {
  const sevenForbidden = seven.sharedBridgeAdapter.forbiddenDirectImports;
  const refersToSeven = (rule) =>
    /07[.\-_]?[Tt]0/.test(rule) || rule.includes("07-t0-extension-contract-preflight");

  const inheritsBridgeRule = composition.sharedRules.some(
    (rule) => refersToSeven(rule) && rule.includes("KernelBridgeAPI")
  );
  assert.ok(inheritsBridgeRule, "08.T0 must explicitly inherit 07.T0's KernelBridgeAPI adapter");

  const inheritsForbiddenRule = composition.sharedRules.some(
    (rule) => refersToSeven(rule) && /forbidden[-_ ]?import/i.test(rule)
  );
  assert.ok(inheritsForbiddenRule, "08.T0 must explicitly inherit 07.T0's forbidden-import set");

  // Sanity: a representative forbidden import is still forbidden upstream.
  assert.ok(
    sevenForbidden.includes("@clockworklabs/spacetimedb-sdk"),
    "Sanity: 07.T0 must forbid @clockworklabs/spacetimedb-sdk"
  );
});

test("08.T0 compatibility matrix marks Track 07 internals out of scope", () => {
  for (const id of expectedIntegratedPlugins) {
    const entry = composition.compatibilityMatrix[id];
    assert.ok(entry, `compatibilityMatrix.${id} missing`);
    assert.ok(
      Array.isArray(entry.explicit_out_of_scope_for_08) &&
        entry.explicit_out_of_scope_for_08.some((scope) => /extension/i.test(scope)),
      `${id} must explicitly mark per-extension internals out of scope`
    );
    const needsTrack07 = entry.needs.some((n) => n.out_of_scope_for_08 === true && n.owner_track === "07");
    assert.ok(needsTrack07, `${id} compatibility needs must flag Track 07 outputs as out_of_scope_for_08`);
  }
});

test("08.T0 declares fixture-payload requirements pointing at real upstream tests/contracts", () => {
  const reqs = composition.fixturePayloadRequirements;
  assert.ok(reqs.rule.includes("real upstream"), "fixturePayloadRequirements.rule must enforce real upstream payloads");
  assert.ok(reqs.by_upstream_track.track_01_S0_kernel, "Track 01 S0 fixture set missing");
  assert.ok(reqs.by_upstream_track.track_02_S2_graph, "Track 02 S2 fixture set missing");
  assert.ok(reqs.by_upstream_track.track_03_S3_gateway_spacetimedb, "Track 03 S3 fixture set missing");
  assert.ok(reqs.by_upstream_track.track_04_S5_review_autoresearch, "Track 04 S5 fixture set missing");
});

test("08.T0 carries open decisions + blockers including track-08 composition-ownership, PRD-03, IOD-07", () => {
  const decisionIds = composition.openDecisions.map((d) => d.id);
  const blockerIds = composition.readinessBlockersCarriedForward.map((d) => d.id);
  const all = new Set([...decisionIds, ...blockerIds]);

  for (const required of [
    "track-08.composition-ownership",
    "track-08.activation-mode",
    "track-08.mini-mode-contract",
    "PRD-03",
    "IOD-07",
    "DCC-01",
  ]) {
    assert.ok(
      all.has(required),
      `${required} missing from openDecisions and readinessBlockersCarriedForward`
    );
  }
});
