#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const repoRoot = "/Users/admin/Documents/Epi-Logos C Experiments";
const manifestPath = join(
  repoRoot,
  "Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json"
);
const captureRequirementsPath = join(
  repoRoot,
  "Body/M/epi-theia/extensions/test/fixtures/07-t0-readiness-capture-requirements.json"
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

function walkFiles(root) {
  if (!existsSync(root)) {
    return [];
  }

  const files = [];
  for (const entry of readdirSync(root)) {
    if (entry === "node_modules" || entry === "lib" || entry === ".pnpm") {
      // node_modules / lib are populated by the toolchain and may symlink to the
      // shared runtime; only the source tree counts as the extension's authored
      // surface for forbidden-import scanning.
      continue;
    }
    const fullPath = join(root, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...walkFiles(fullPath));
      continue;
    }
    files.push(fullPath);
  }
  return files;
}

function validateManifest(manifest, errors) {
  const ids = manifest.extensions.map((entry) => entry.id);
  if (JSON.stringify(ids) !== JSON.stringify(expectedExtensions)) {
    errors.push(`extension ids mismatch: ${ids.join(", ")}`);
  }

  const readinessStates = manifest.readinessTaxonomy.map((entry) => entry.id);
  if (JSON.stringify(readinessStates) !== JSON.stringify(expectedReadinessStates)) {
    errors.push(`readiness taxonomy mismatch: ${readinessStates.join(", ")}`);
  }

  for (const extension of manifest.extensions) {
    if (extension.packagePath !== `Body/M/epi-theia/extensions/${extension.id}`) {
      errors.push(`${extension.id} packagePath mismatch`);
    }
    if (!extension.command?.open?.startsWith(`m${extension.id[1]}.`)) {
      errors.push(`${extension.id} open command does not follow mN.* convention`);
    }
    if (!Array.isArray(extension.track08Exports) || extension.track08Exports.length < 2) {
      errors.push(`${extension.id} must declare at least two Track 08 exports`);
    }
    if (!Array.isArray(extension.bridge?.requiredCapabilities) || extension.bridge.requiredCapabilities.length < 3) {
      errors.push(`${extension.id} must declare bridge capabilities`);
    }
    if (!Array.isArray(extension.bridge?.forbiddenDirectImports) || extension.bridge.forbiddenDirectImports.length < 3) {
      errors.push(`${extension.id} must declare forbidden direct imports`);
    }
  }
}

function validateCaptureRequirements(captureRequirements, errors) {
  const expectedBlockedStates = expectedReadinessStates.filter((state) => state !== "ready_public_current");
  const states = new Map(captureRequirements.requirements.map((entry) => [entry.readinessState, entry]));

  for (const state of expectedBlockedStates) {
    const entry = states.get(state);
    if (!entry) {
      errors.push(`missing capture requirement for ${state}`);
      continue;
    }
    for (const field of ["sourceTrack", "sourceTranche", "captureCommand", "futureFixturePath"]) {
      if (typeof entry[field] !== "string" || entry[field].length === 0) {
        errors.push(`${state} missing ${field}`);
      }
    }
    if (!Array.isArray(entry.requiredFields) || entry.requiredFields.length < 2) {
      errors.push(`${state} missing requiredFields`);
    }
    if ("payload" in entry) {
      errors.push(`${state} must not define inline payload data`);
    }
  }
}

function scanExtensionImports(manifest, errors) {
  for (const extension of manifest.extensions) {
    const packageRoot = join(repoRoot, extension.packagePath);
    if (!existsSync(packageRoot)) {
      continue;
    }
    const scannedFiles = walkFiles(packageRoot).filter((path) =>
      /\.(?:[cm]?js|tsx?|json)$/.test(path)
    );
    for (const file of scannedFiles) {
      const content = readFileSync(file, "utf8");
      for (const forbiddenFragment of extension.bridge.forbiddenDirectImports) {
        // Only flag forbidden fragments that appear inside actual import/require
        // statements; substring matches inside JSDoc or comments are noise.
        const escaped = forbiddenFragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const importPattern = new RegExp(
          `(?:from\\s+['"\`]|require\\(\\s*['"\`]|import\\s*\\(\\s*['"\`])[^'"\`\\n]*${escaped}`,
          "m"
        );
        if (importPattern.test(content)) {
          errors.push(`${extension.id} imports forbidden dependency fragment ${forbiddenFragment} in ${file}`);
        }
      }
    }
  }
}

function main() {
  const errors = [];
  if (!existsSync(manifestPath)) {
    errors.push("missing contract manifest");
  }
  if (!existsSync(captureRequirementsPath)) {
    errors.push("missing readiness capture requirements");
  }

  if (errors.length === 0) {
    const manifest = readJson(manifestPath);
    const captureRequirements = readJson(captureRequirementsPath);
    validateManifest(manifest, errors);
    validateCaptureRequirements(captureRequirements, errors);
    scanExtensionImports(manifest, errors);
  }

  if (errors.length > 0) {
    console.error(JSON.stringify({ ok: false, errors }, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify({ ok: true }, null, 2));
}

main();
