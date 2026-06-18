import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const require = createRequire(import.meta.url);
const repoRoot = "/Users/admin/Documents/Epi-Logos C Experiments";
const extensionsRoot = join(repoRoot, "Body/M/epi-theia/extensions");
const grammarJsonPath = join(extensionsRoot, "contracts/readiness-state-grammar.json");
const grammarMdPath = join(extensionsRoot, "contracts/readiness-state-grammar.md");
const sevenT0Path = join(extensionsRoot, "contracts/07-t0-extension-contract-preflight.json");
const readinessSourcePath = join(extensionsRoot, "m-extension-runtime/src/common/readiness.ts");
const bannerSourcePath = join(extensionsRoot, "m-extension-runtime/src/browser/readiness-banner.tsx");
const runtimePackageRoot = join(extensionsRoot, "m-extension-runtime");

const expectedFlavours = [
  "pending_first_tick",
  "s3_gateway_unreachable",
  "s5_atelier_blocked",
  "pending_dataset",
  "ready_protected_local"
];

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function contractStatesFrom07T0() {
  const seven = readJson(sevenT0Path);
  return seven.readinessTaxonomy.map((entry) =>
    typeof entry === "string" ? entry : (entry.id ?? entry.name ?? entry.state)
  );
}

function stateSnapshot(state, overrides = {}) {
  return Object.freeze({
    fetchedAt: Date.UTC(2026, 5, 17, 12, 0, 0),
    state,
    reason: `fixture reason for ${state}`,
    profileGeneration: state === "ready_public_current" ? 42 : null,
    bridgeReachable: state !== "bridge_unavailable",
    blockerIds: Object.freeze([]),
    ...overrides
  });
}

function flavourSnapshot(flavour) {
  switch (flavour) {
    case "pending_first_tick":
      return stateSnapshot("bridge_unavailable", {
        bridgeReachable: true,
        profileGeneration: null,
        blockerIds: Object.freeze(["profile_tick.pending"])
      });
    case "s3_gateway_unreachable":
      return stateSnapshot("s3_subscription_blocked", {
        bridgeReachable: true,
        blockerIds: Object.freeze(["s3.gateway.unreachable"])
      });
    case "s5_atelier_blocked":
      return stateSnapshot("s5_review_blocked", {
        blockerIds: Object.freeze(["s5.atelier.blocked"])
      });
    case "pending_dataset":
      return stateSnapshot("authority_payload_missing", {
        missingDataset: "3 outer planets",
        payloadOwner: "M3 Mahamaya"
      });
    case "ready_protected_local":
      return stateSnapshot("ready_public_current", {
        privacyClass: "protected_local"
      });
    default:
      throw new Error(`unknown flavour fixture ${flavour}`);
  }
}

function renderBanner(snapshot) {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const { ReadinessBanner } = require(
    join(runtimePackageRoot, "lib/browser/readiness-banner.js")
  );

  return renderToStaticMarkup(
    React.createElement(ReadinessBanner, {
      extensionId: "m-test",
      extensionLabel: "M Test",
      snapshot,
      declaredBlockers: Object.freeze(["fixture.declared"])
    })
  );
}

function htmlText(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

test("readiness-state grammar contract files exist", () => {
  assert.equal(existsSync(grammarMdPath), true, "readiness-state-grammar.md is missing");
  assert.equal(existsSync(grammarJsonPath), true, "readiness-state-grammar.json is missing");
});

test("every 07.T0 contract readiness state has one grammar entry", () => {
  const grammar = readJson(grammarJsonPath);
  const expectedStates = contractStatesFrom07T0();
  const grammarStates = grammar.states.map((entry) => entry.state);

  assert.deepEqual(
    grammarStates.slice().sort(),
    expectedStates.slice().sort(),
    "grammar states must match 07.T0 readiness taxonomy exactly"
  );

  for (const entry of grammar.states) {
    assert.equal(entry.cssClass, `mext-banner-state-${entry.state}`);
    assert.ok(entry.uxResponse?.label, `${entry.state} missing uxResponse.label`);
    assert.ok(entry.uxResponse?.presentation, `${entry.state} missing uxResponse.presentation`);
  }
});

test("every render-time flavour has one parent contract state", () => {
  const grammar = readJson(grammarJsonPath);
  const expectedStates = new Set(contractStatesFrom07T0());
  const grammarFlavours = grammar.flavours.map((entry) => entry.flavour);

  assert.deepEqual(
    grammarFlavours.slice().sort(),
    expectedFlavours.slice().sort(),
    "grammar flavours must be the canonical render-time set"
  );

  for (const entry of grammar.flavours) {
    assert.ok(expectedStates.has(entry.parentState), `${entry.flavour} parent state is not 07.T0 canonical`);
    assert.equal(entry.cssClass, `mext-banner-flavour-${entry.flavour}`);
    assert.ok(entry.uxResponse?.label, `${entry.flavour} missing uxResponse.label`);
  }
});

test("readiness.ts exports the flavour union and reducer", () => {
  const source = readFileSync(readinessSourcePath, "utf8");
  assert.match(source, /export type MExtensionReadinessFlavour/);
  assert.match(source, /export function flavourOf\(/);
  for (const flavour of expectedFlavours) {
    assert.match(source, new RegExp(`['"]${flavour}['"]`));
  }
});

test("ReadinessBanner source layers state and flavour CSS classes", () => {
  const source = readFileSync(bannerSourcePath, "utf8");
  assert.match(source, /mext-banner-state-\$\{view\.state\}/);
  assert.match(source, /mext-banner-flavour-\$\{flavour\}/);
});

test("ReadinessBanner renders all contract states and flavours distinctly", () => {
  const build = spawnSync("pnpm", ["--dir", runtimePackageRoot, "build"], {
    cwd: repoRoot,
    encoding: "utf8"
  });
  assert.equal(
    build.status,
    0,
    `m-extension-runtime build failed\nSTDOUT:\n${build.stdout}\nSTDERR:\n${build.stderr}`
  );

  const grammar = readJson(grammarJsonPath);
  for (const entry of grammar.states) {
    const html = renderBanner(stateSnapshot(entry.state));
    assert.match(html, new RegExp(`mext-banner-state-${entry.state}`), `${entry.state} class missing`);
    assert.ok(html.includes(htmlText(entry.uxResponse.label)), `${entry.state} label missing`);
  }

  for (const entry of grammar.flavours) {
    const html = renderBanner(flavourSnapshot(entry.flavour));
    assert.match(html, new RegExp(`mext-banner-state-${entry.parentState}`), `${entry.flavour} parent class missing`);
    assert.match(html, new RegExp(`mext-banner-flavour-${entry.flavour}`), `${entry.flavour} class missing`);
    assert.ok(html.includes(htmlText(entry.uxResponse.label)), `${entry.flavour} label missing`);
  }
});
