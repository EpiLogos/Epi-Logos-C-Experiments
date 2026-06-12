import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
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
const layoutTypesPath = join(
  repoRoot,
  "Body/M/epi-theia/extensions/pratibimba-layouts/src/common/layout-types.ts"
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
const omnipanelRuntimeStubPath = join(
  omnipanelSourceRoot,
  "browser/omnipanel-runtime-stub.ts"
);
const omnipanelGatewayClientPath = join(
  omnipanelSourceRoot,
  "browser/controllers/epi-claw/gateway-client.ts"
);
const expectedExtensions = [
  "m0-anuttara",
  "m1-paramasiva",
  "m2-parashakti",
  "m3-mahamaya",
  "m4-nara",
  "m5-epii"
];

const widgetFactoryModulePaths = [
  "Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/frontend-module.ts",
  "Body/M/epi-theia/extensions/omnipanel-shell/src/browser/frontend-module.ts",
  ...expectedExtensions.map((extension) =>
    `Body/M/epi-theia/extensions/${extension}/src/browser/frontend-module.ts`
  )
].map((path) => join(repoRoot, path));

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

function readIdeShellWidgetIds() {
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

function runValidator() {
  return spawnSync(process.execPath, [validatorPath], {
    cwd: repoRoot,
    encoding: "utf8"
  });
}

function extractBalancedBlock(source, openIndex, openChar, closeChar) {
  let depth = 0;
  for (let index = openIndex; index < source.length; index += 1) {
    const char = source[index];
    if (char === openChar) {
      depth += 1;
    } else if (char === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return source.slice(openIndex, index + 1);
      }
    }
  }
  throw new Error(`unterminated ${openChar}${closeChar} block`);
}

function extractExportedObject(source, exportName) {
  const declarationStart = source.indexOf(`export const ${exportName}`);
  assert.notEqual(declarationStart, -1, `missing export const ${exportName}`);
  const objectStart = source.indexOf("{", declarationStart);
  assert.notEqual(objectStart, -1, `missing object literal for ${exportName}`);
  return extractBalancedBlock(source, objectStart, "{", "}");
}

function extractStringArrayProperty(objectSource, propertyName) {
  const propertyStart = objectSource.indexOf(`${propertyName}:`);
  assert.notEqual(propertyStart, -1, `missing ${propertyName} property`);
  const arrayStart = objectSource.indexOf("[", propertyStart);
  assert.notEqual(arrayStart, -1, `missing ${propertyName} array`);
  const arraySource = extractBalancedBlock(objectSource, arrayStart, "[", "]");
  return Array.from(arraySource.matchAll(/['"]([^'"]+)['"]/g), (match) => match[1]);
}

function extractStringRecordProperty(objectSource, propertyName) {
  const propertyStart = objectSource.indexOf(`${propertyName}:`);
  if (propertyStart === -1) {
    return new Map();
  }
  const objectStart = objectSource.indexOf("{", propertyStart);
  assert.notEqual(objectStart, -1, `missing ${propertyName} object`);
  const recordSource = extractBalancedBlock(objectSource, objectStart, "{", "}");
  return new Map(
    Array.from(
      recordSource.matchAll(/['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g),
      (match) => [match[1], match[2]]
    )
  );
}

function parseNamedImports(source, fromFile) {
  const imports = new Map();
  const importPattern = /import\s+\{([\s\S]*?)\}\s+from\s+['"]([^'"]+)['"]/g;
  for (const match of source.matchAll(importPattern)) {
    const importPath = resolveSourcePath(fromFile, match[2]);
    if (!importPath) {
      continue;
    }
    for (const rawName of match[1].split(",")) {
      const name = rawName.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0].trim();
      if (name) {
        imports.set(name, importPath);
      }
    }
  }
  return imports;
}

function resolveSourcePath(fromFile, specifier) {
  if (!specifier.startsWith(".")) {
    return null;
  }
  const base = resolve(dirname(fromFile), specifier);
  const candidates = extname(base)
    ? [base]
    : [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")];
  return candidates.find((path) => existsSync(path)) ?? null;
}

function readCommonSourceFiles(modulePath) {
  const commonRoot = resolve(dirname(modulePath), "../common");
  if (!existsSync(commonRoot)) {
    return [];
  }
  return readdirSync(commonRoot)
    .filter((file) => file.endsWith(".ts"))
    .map((file) => join(commonRoot, file));
}

function readStringConstants(sourceFiles) {
  const constants = new Map();
  for (const sourceFile of sourceFiles) {
    const source = readFileSync(sourceFile, "utf8");
    for (const match of source.matchAll(/(?:export\s+)?const\s+([A-Z0-9_]+)\s*=\s*['"]([^'"]+)['"]/g)) {
      constants.set(match[1], match[2]);
    }
    for (const match of source.matchAll(/(?:export\s+)?const\s+([A-Z0-9_]+)\s*=\s*\{([\s\S]*?)\}\s+as\s+const/g)) {
      for (const entry of match[2].matchAll(/([A-Z0-9_]+)\s*:\s*['"]([^'"]+)['"]/g)) {
        constants.set(`${match[1]}.${entry[1]}`, entry[2]);
      }
    }
  }
  return constants;
}

function resolveWidgetClassId(modulePath, className, imports) {
  const widgetSourcePath = imports.get(className);
  assert.ok(widgetSourcePath, `${className} must be imported by ${modulePath}`);
  const widgetSource = readFileSync(widgetSourcePath, "utf8");
  const idMatch = widgetSource.match(/static\s+readonly\s+ID\s*=\s*([^;]+);/);
  assert.ok(idMatch, `${className} must define static readonly ID`);

  const expression = idMatch[1].trim();
  const literal = expression.match(/^['"]([^'"]+)['"]$/);
  if (literal) {
    return literal[1];
  }

  const constants = readStringConstants([widgetSourcePath, ...readCommonSourceFiles(modulePath)]);
  const resolved = constants.get(expression);
  assert.ok(resolved, `${className}.ID expression ${expression} must resolve to a string constant`);
  return resolved;
}

function readRegisteredWidgetFactoryIds() {
  const registered = new Set();
  for (const modulePath of widgetFactoryModulePaths) {
    const source = readFileSync(modulePath, "utf8");
    const imports = parseNamedImports(source, modulePath);
    for (const match of source.matchAll(/id:\s*([A-Za-z0-9_]+)\.ID/g)) {
      registered.add(resolveWidgetClassId(modulePath, match[1], imports));
    }
  }
  return registered;
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

test("ide-shell CHROME-CONTRACT categorizes every M0/M5 chrome widget plus bridge-gate", () => {
  assert.ok(existsSync(chromeContractPath), "missing ide-shell CHROME-CONTRACT.md");
  assert.ok(existsSync(ideShellContractSourcePath), "missing ide-shell contract source");

  const content = readFileSync(chromeContractPath, "utf8");
  const categories = parseChromeContractCategories(content);
  const widgetIds = readIdeShellWidgetIds();

  assert.equal(widgetIds.length, 8, "ide-shell must export eight chrome widget ids");
  for (const widgetId of widgetIds) {
    assert.ok(categories.has(widgetId), `${widgetId} missing CHROME-CONTRACT category`);
    assert.ok(
      allowedChromeContractCategories.has(categories.get(widgetId)),
      `${widgetId} has invalid CHROME-CONTRACT category`
    );
  }
  assert.equal(categories.get("bridge-gate"), "shared infrastructure");
  assert.match(content, /SharedBridgeAdapter/);
  assert.match(content, /kernel-bridge/);
  assert.match(content, /isPrivacySafe\(\)/);
  assert.match(content, /useProfileTick\(\)/);
});

test("IDE_DEEP_DESCRIPTOR expected widgets are factory-backed or explicitly layout-only", () => {
  assert.ok(existsSync(layoutTypesPath), "missing pratibimba layout types");

  const layoutSource = readFileSync(layoutTypesPath, "utf8");
  const descriptorSource = extractExportedObject(layoutSource, "IDE_DEEP_DESCRIPTOR");
  const expectedWidgets = extractStringArrayProperty(descriptorSource, "expectedWidgets");
  const layoutOnlyWidgets = extractStringRecordProperty(descriptorSource, "layoutOnlyWidgets");
  const registeredWidgetFactoryIds = readRegisteredWidgetFactoryIds();

  assert.ok(
    expectedWidgets.includes("pratibimba.ide-shell.autoresearch-pane"),
    "IDE_DEEP_DESCRIPTOR must include the Autoresearch Pane widget id"
  );
  assert.ok(
    registeredWidgetFactoryIds.has("pratibimba.ide-shell.autoresearch-pane"),
    "Autoresearch Pane must resolve to a registered ide-shell WidgetFactory"
  );

  for (const [widgetId, note] of layoutOnlyWidgets) {
    assert.ok(expectedWidgets.includes(widgetId), `${widgetId} has a layout-only annotation but is not expected`);
    assert.match(note, /layout-only/, `${widgetId} annotation must explicitly say layout-only`);
  }

  const orphans = expectedWidgets.filter(
    (widgetId) => !registeredWidgetFactoryIds.has(widgetId) && !layoutOnlyWidgets.has(widgetId)
  );
  assert.deepEqual(orphans, [], `unowned IDE_DEEP_DESCRIPTOR.expectedWidgets: ${orphans.join(", ")}`);
});

test("Track 07 T0 validator succeeds on the checked-in contract package", () => {
  assert.ok(existsSync(validatorPath), "missing contract validator");
  const result = runValidator();

  assert.equal(result.status, 0, result.stdout || result.stderr);
});

test("Track 27 T27.12 validator rejects forbidden direct OmniPanel imports with file and line", () => {
  assert.ok(existsSync(validatorPath), "missing contract validator");

  const fixtureDir = join(omnipanelSourceRoot, "browser/components/omni/panels/__lint_fixture__");
  const fixturePath = join(fixtureDir, "ForbiddenDirectImportFixture.tsx");

  try {
    mkdirSync(fixtureDir, { recursive: true });
    writeFileSync(
      fixturePath,
      [
        "export const before = true;",
        "import neo4j from 'neo4j-driver';",
        "export const after = neo4j;"
      ].join("\n"),
      "utf8"
    );

    const result = runValidator();
    const output = `${result.stdout}\n${result.stderr}`;

    assert.notEqual(result.status, 0, output);
    assert.match(output, /ForbiddenDirectImportFixture\.tsx:2/);
    assert.match(output, /neo4j-driver/);
  } finally {
    rmSync(fixtureDir, { recursive: true, force: true });
  }
});

test("Track 27 T27.12 validator excludes only marked OmniPanel compat files", () => {
  const runtimeStub = readFileSync(omnipanelRuntimeStubPath, "utf8");
  const gatewayClient = readFileSync(omnipanelGatewayClientPath, "utf8");

  assert.match(runtimeStub, /@deprecated TODO/);
  assert.match(gatewayClient, /migrate to invokeGatewayRpc/);

  try {
    writeFileSync(
      omnipanelRuntimeStubPath,
      `import rawRedis from 'redis';\n${runtimeStub}\nexport const __lintCompatRuntimeStub = rawRedis;\n`,
      "utf8"
    );
    writeFileSync(
      omnipanelGatewayClientPath,
      `import neo4j from 'neo4j-driver';\n${gatewayClient}\nexport const __lintCompatGatewayClient = neo4j;\n`,
      "utf8"
    );

    const result = runValidator();
    const output = `${result.stdout}\n${result.stderr}`;

    assert.equal(result.status, 0, output);
    assert.doesNotMatch(output, /omnipanel-runtime-stub\.ts/);
    assert.doesNotMatch(output, /gateway-client\.ts/);
  } finally {
    writeFileSync(omnipanelRuntimeStubPath, runtimeStub, "utf8");
    writeFileSync(omnipanelGatewayClientPath, gatewayClient, "utf8");
  }
});
