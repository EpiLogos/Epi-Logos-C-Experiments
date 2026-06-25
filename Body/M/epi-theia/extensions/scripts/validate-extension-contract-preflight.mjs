#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const repoRoot = "/Users/admin/Documents/Epi-Logos C Experiments";
const manifestPath = join(
  repoRoot,
  "Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json"
);
const captureRequirementsPath = join(
  repoRoot,
  "Body/M/epi-theia/extensions/test/fixtures/07-t0-readiness-capture-requirements.json"
);
const ideShellContractSourcePath = join(
  repoRoot,
  "Body/M/epi-theia/extensions/ide-shell-m0-m5/src/common/contract.ts"
);
const chromeContractPath = join(
  repoRoot,
  "Body/M/epi-theia/extensions/ide-shell-m0-m5/CHROME-CONTRACT.md"
);
const omnipanelSourceRoot = join(
  repoRoot,
  "Body/M/epi-theia/extensions/omnipanel-shell/src"
);
const extensionsRoot = join(repoRoot, "Body/M/epi-theia/extensions");

const omnipanelCompatImportExceptions = new Map([
  [
    join(omnipanelSourceRoot, "browser/omnipanel-runtime-stub.ts"),
    "@deprecated TODO"
  ],
  [
    join(omnipanelSourceRoot, "browser/controllers/epi-claw/gateway-client.ts"),
    "migrate to invokeGatewayRpc"
  ]
]);

const omnipanelAllowedSharedSiblingImports = new Set([
  "@pratibimba/integrated-composition",
  "@pratibimba/m-extension-runtime",
  "@pratibimba/m-extension-runtime/lib/common/recursive-self-review-gate",
  "@pratibimba/pratibimba-layouts",
  "@pratibimba/kernel-bridge",
  "@pratibimba/kernel-bridge-readiness",
  "@pratibimba/ide-shell-m0-m5/lib/browser/services/privacy-drop-feed",
  "@pratibimba/integrated-composition/common/evidence-shapes"
]);

const expectedExtensions = [
  "m0-anuttara",
  "m1-paramasiva",
  "m2-parashakti",
  "m3-mahamaya",
  "m4-nara",
  "m5-epii"
];

const forbiddenStandaloneProjectionExtensions = [
  "library-surface",
  "logos-atelier",
  "scent-following-workspace"
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

const allowedChromeContractCategories = new Set([
  "M0' chrome",
  "M5' chrome",
  "shared infrastructure"
]);

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

function relativeRepoPath(path) {
  return relative(repoRoot, path);
}

function readImportSpecifiers(content) {
  const imports = [];
  const importPattern = /(?:\bfrom\s*['"`]([^'"`]+)['"`]|\bimport\s*['"`]([^'"`]+)['"`]|\brequire\(\s*['"`]([^'"`]+)['"`]|\bimport\(\s*['"`]([^'"`]+)['"`])/g;
  const lines = content.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) {
      continue;
    }
    for (const match of line.matchAll(importPattern)) {
      imports.push({
        specifier: match[1] ?? match[2] ?? match[3] ?? match[4],
        line: index + 1
      });
    }
  }
  return imports;
}

function importMatchesForbiddenFragment(specifier, forbiddenFragment) {
  if (forbiddenFragment.includes("ws-connection-provider")) {
    return specifier.startsWith("@theia/") && specifier.endsWith("ws-connection-provider");
  }
  return specifier.includes(forbiddenFragment);
}

function isAllowedOmniPanelSharedSiblingImport(specifier) {
  for (const allowed of omnipanelAllowedSharedSiblingImports) {
    if (specifier === allowed || specifier.startsWith(`${allowed}/`)) {
      return true;
    }
  }
  return false;
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

function readIdeShellWidgetIds(errors) {
  if (!existsSync(ideShellContractSourcePath)) {
    errors.push("missing ide-shell contract source");
    return [];
  }

  const source = readFileSync(ideShellContractSourcePath, "utf8");
  return Array.from(new Set(Array.from(source.matchAll(/'pratibimba\.ide-shell\.[^']+'/g), (match) =>
    match[0].slice(1, -1)
  )));
}

function parseChromeContractCategories(content) {
  const categories = new Map();
  const rowPattern = /^\|\s*`([^`]+)`\s*\|[^|]*\|\s*([^|]+?)\s*\|$/gm;
  for (const match of content.matchAll(rowPattern)) {
    categories.set(match[1], match[2].trim());
  }
  return categories;
}

function validateChromeContract(errors) {
  if (!existsSync(chromeContractPath)) {
    errors.push("missing ide-shell CHROME-CONTRACT.md");
    return;
  }

  const content = readFileSync(chromeContractPath, "utf8");
  for (const required of [
    "M0' chrome",
    "M5' chrome",
    "shared infrastructure",
    "bridge-gate",
    "SharedBridgeAdapter",
    "kernel-bridge",
    "isPrivacySafe()",
    "useProfileTick()",
    "audit-extend, never rebuild"
  ]) {
    if (!content.includes(required)) {
      errors.push(`CHROME-CONTRACT.md missing required term: ${required}`);
    }
  }

  const categories = parseChromeContractCategories(content);
  const widgetIds = readIdeShellWidgetIds(errors);
  for (const widgetId of widgetIds) {
    const category = categories.get(widgetId);
    if (!category) {
      errors.push(`${widgetId} missing CHROME-CONTRACT category`);
      continue;
    }
    if (!allowedChromeContractCategories.has(category)) {
      errors.push(`${widgetId} has invalid CHROME-CONTRACT category: ${category}`);
    }
  }

  const bridgeGateCategory = categories.get("bridge-gate");
  if (bridgeGateCategory !== "shared infrastructure") {
    errors.push("bridge-gate must be categorized as shared infrastructure");
  }
}

function scanExtensionImports(manifest, errors) {
  for (const extension of manifest.extensions) {
    const packageRoot = join(repoRoot, extension.packagePath);
    if (!existsSync(packageRoot)) {
      continue;
    }
    const sourceRoot = join(packageRoot, "src");
    if (!existsSync(sourceRoot)) {
      errors.push(`${extension.id} missing source root: ${relativeRepoPath(sourceRoot)}`);
      continue;
    }
    const scannedFiles = walkFiles(sourceRoot).filter((path) =>
      /\.tsx?$/.test(path)
    );
    for (const file of scannedFiles) {
      const content = readFileSync(file, "utf8");
      for (const { specifier, line } of readImportSpecifiers(content)) {
        const forbiddenFragment = extension.bridge.forbiddenDirectImports.find((fragment) =>
          importMatchesForbiddenFragment(specifier, fragment)
        );
        if (forbiddenFragment) {
          errors.push(
            `${extension.id} imports forbidden dependency fragment ${forbiddenFragment} in ${relativeRepoPath(file)}:${line}`
          );
        }
      }
    }
  }
}

function validateOmniPanelForbiddenDirectImports(manifest, errors) {
  if (!existsSync(omnipanelSourceRoot)) {
    errors.push("missing omnipanel-shell src root");
    return;
  }

  for (const [file, marker] of omnipanelCompatImportExceptions) {
    if (!existsSync(file)) {
      errors.push(`missing OmniPanel compat exception: ${relativeRepoPath(file)}`);
      continue;
    }
    const content = readFileSync(file, "utf8");
    if (!content.includes(marker)) {
      errors.push(`${relativeRepoPath(file)} missing compat TODO marker: ${marker}`);
    }
  }

  const forbiddenFragments = [
    ...manifest.sharedBridgeAdapter.forbiddenDirectImports,
    "@theia/core/lib/browser/messaging/ws-connection-provider"
  ];
  const scannedFiles = walkFiles(omnipanelSourceRoot).filter((path) =>
    /\.tsx?$/.test(path)
  );

  for (const file of scannedFiles) {
    const marker = omnipanelCompatImportExceptions.get(file);
    if (marker) {
      const content = readFileSync(file, "utf8");
      if (content.includes(marker)) {
        continue;
      }
    }

    const content = readFileSync(file, "utf8");
    for (const { specifier, line } of readImportSpecifiers(content)) {
      const forbiddenFragment = forbiddenFragments.find((fragment) =>
        importMatchesForbiddenFragment(specifier, fragment)
      );
      if (forbiddenFragment) {
        errors.push(
          `omnipanel-shell imports forbidden dependency fragment ${forbiddenFragment} in ${relativeRepoPath(file)}:${line}`
        );
        continue;
      }
      if (
        specifier.startsWith("@pratibimba/") &&
        !isAllowedOmniPanelSharedSiblingImport(specifier)
      ) {
        errors.push(
          `omnipanel-shell imports non-allowlisted shared sibling ${specifier} in ${relativeRepoPath(file)}:${line}`
        );
      }
    }
  }
}

function validateNoStandaloneProjectionExtensions(errors) {
  for (const extensionName of forbiddenStandaloneProjectionExtensions) {
    const extensionPath = join(extensionsRoot, extensionName);
    if (existsSync(extensionPath)) {
      errors.push(
        `${relativeRepoPath(extensionPath)} must not exist; Library/Atelier/scent-following surfaces are projection-lens contributions on existing extensions`
      );
    }
  }
}

function validateIntegratedPluginProfileSubscriptionDiscipline(errors) {
  for (const pluginName of ["plugin-integrated-1-2-3", "plugin-integrated-4-5-0"]) {
    const browserRoot = join(extensionsRoot, pluginName, "src/browser");
    if (!existsSync(browserRoot)) {
      errors.push(`missing integrated plugin browser root: ${relativeRepoPath(browserRoot)}`);
      continue;
    }
    const scannedFiles = walkFiles(browserRoot).filter((path) =>
      /\.(?:[cm]?js|tsx?)$/.test(path)
    );
    for (const file of scannedFiles) {
      const content = readFileSync(file, "utf8");
      if (/\bbridge\.onProfile\b|\bonProfileAdvance\b/.test(content)) {
        errors.push(
          `${relativeRepoPath(file)} opens a direct profile subscription; use CompositionProfileProvider/useCompositionProfile`
        );
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
  validateNoStandaloneProjectionExtensions(errors);
  validateIntegratedPluginProfileSubscriptionDiscipline(errors);
  validateChromeContract(errors);

  if (errors.length === 0) {
    const manifest = readJson(manifestPath);
    const captureRequirements = readJson(captureRequirementsPath);
    validateManifest(manifest, errors);
    validateCaptureRequirements(captureRequirements, errors);
    scanExtensionImports(manifest, errors);
    validateOmniPanelForbiddenDirectImports(manifest, errors);
  }

  if (errors.length > 0) {
    console.error(JSON.stringify({ ok: false, errors }, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify({ ok: true }, null, 2));
}

main();
