import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = "/Users/admin/Documents/Epi-Logos C Experiments";
const manifestPath = join(
  repoRoot,
  "Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json"
);
const captureRequirementsPath = join(
  repoRoot,
  "Body/M/epi-theia/extensions/test/fixtures/07-t0-readiness-capture-requirements.json"
);
const validatorPath = join(
  repoRoot,
  "Body/M/epi-theia/extensions/scripts/validate-extension-contract-preflight.mjs"
);

const expectedExtensions = [
  "m0-anuttara",
  "m1-paramasiva",
  "m2-parashakti",
  "m3-mahamaya",
  "m4-nara",
  "m5-epii"
];

const expectedReadinessStates = [
  "bridge_unavailable",
  "profile_missing_field",
  "s2_graph_blocked",
  "s3_subscription_blocked",
  "s5_review_blocked",
  "authority_payload_missing",
  "privacy_blocked",
  "degraded_but_readable",
  "ready_public_current"
];

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

test("Track 07 T0 contract package defines the full extension inventory", () => {
  assert.ok(existsSync(manifestPath), "missing contract manifest");
  const manifest = readJson(manifestPath);
  const ids = manifest.extensions.map((entry) => entry.id);

  assert.deepEqual(ids, expectedExtensions);
  assert.deepEqual(
    manifest.readinessTaxonomy.map((entry) => entry.id),
    expectedReadinessStates
  );

  for (const extension of manifest.extensions) {
    assert.equal(
      extension.packagePath,
      `Body/M/epi-theia/extensions/${extension.id}`
    );
    assert.ok(extension.command.open.startsWith(`${extension.id.slice(0, 2)}.`) || extension.command.open.startsWith(`m${extension.id[1]}.`));
    assert.ok(Array.isArray(extension.track08Exports));
    assert.ok(extension.track08Exports.length >= 2);
    assert.ok(Array.isArray(extension.bridge.requiredCapabilities));
    assert.ok(extension.bridge.requiredCapabilities.length >= 3);
    assert.ok(Array.isArray(extension.bridge.forbiddenDirectImports));
    assert.ok(extension.bridge.forbiddenDirectImports.length >= 3);
  }
});

test("Track 07 T0 capture requirements cover every degraded readiness state without inline fake payloads", () => {
  assert.ok(existsSync(captureRequirementsPath), "missing readiness capture requirements");
  const requirements = readJson(captureRequirementsPath);
  const states = new Map(requirements.requirements.map((entry) => [entry.readinessState, entry]));

  for (const state of expectedReadinessStates.filter((entry) => entry !== "ready_public_current")) {
    assert.ok(states.has(state), `missing capture requirement for ${state}`);
    const entry = states.get(state);
    assert.equal(typeof entry.futureFixturePath, "string");
    assert.equal(typeof entry.captureCommand, "string");
    assert.equal(typeof entry.sourceTrack, "string");
    assert.equal(typeof entry.sourceTranche, "string");
    assert.ok(Array.isArray(entry.requiredFields));
    assert.ok(entry.requiredFields.length >= 2);
    assert.ok(!("payload" in entry), `${state} must not ship handwritten inline payloads`);
  }
});

test("Track 07 T0 validator succeeds on the checked-in contract package", () => {
  assert.ok(existsSync(validatorPath), "missing contract validator");
  const result = spawnSync(process.execPath, [validatorPath], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(result.status, 0, result.stdout || result.stderr);
});
