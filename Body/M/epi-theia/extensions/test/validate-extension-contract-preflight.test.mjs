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
const extensionsRoot = join(repoRoot, "Body/M/epi-theia/extensions");
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

const forbiddenStandaloneProjectionExtensions = [
  "library-surface",
  "logos-atelier",
  "scent-following-workspace"
];

const widgetFactoryModulePaths = [
  "Body/M/epi-theia/extensions/ide-shell-m0-m5/src/browser/frontend-module.ts",
  "Body/M/epi-theia/extensions/omnipanel-shell/src/browser/frontend-module.ts",
  "Body/M/epi-theia/extensions/body-lite-surface/src/browser/frontend-module.ts",
  "Body/M/epi-theia/extensions/kernel-bridge-readiness/src/browser/frontend-module.ts",
  ...expectedExtensions.map((extension) =>
    `Body/M/epi-theia/extensions/${extension}/src/browser/frontend-module.ts`
  )
].map((path) => join(repoRoot, path));

const dailyContributorEvidence = new Map([
  [
    "pratibimba.body.review-alert-badge",
    {
      owner: "body-lite-surface",
      path: "Body/M/epi-theia/extensions/body-lite-surface/src/browser/frontend-module.ts",
      pattern: /BODY_LITE_WIDGET_IDS\.REVIEW_ALERT_BADGE/
    }
  ],
  [
    "pratibimba.body.agent-checkin",
    {
      owner: "body-lite-surface",
      path: "Body/M/epi-theia/extensions/body-lite-surface/src/browser/frontend-module.ts",
      pattern: /BODY_LITE_WIDGET_IDS\.AGENT_CHECKIN/
    }
  ],
  [
    "pratibimba.body.safe-source-handle-row",
    {
      owner: "body-lite-surface",
      path: "Body/M/epi-theia/extensions/body-lite-surface/src/browser/frontend-module.ts",
      pattern: /BODY_LITE_WIDGET_IDS\.SAFE_SOURCE_HANDLE_ROW/
    }
  ],
  [
    "kernel-bridge-readiness:widget",
    {
      owner: "kernel-bridge-readiness",
      path: "Body/M/epi-theia/extensions/kernel-bridge-readiness/src/browser/readiness-widget.tsx",
      pattern: /static\s+readonly\s+ID\s*=\s*['"]kernel-bridge-readiness:widget['"]/
    }
  ],
  [
    "pratibimba.daily.library-projection",
    {
      owner: "body-lite-surface",
      path: "Body/M/epi-theia/extensions/body-lite-surface/src/common/lite-surface-types.ts",
      pattern: /coordinate-overlay[\s\S]*theia-file-tree/
    }
  ],
  [
    "pratibimba.daily.atelier-cluster-lens",
    {
      owner: "m0-anuttara",
      path: "Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts",
      pattern: /etymological-cluster[\s\S]*atelier-projection-lens/
    }
  ],
  [
    "pratibimba.omnipanel.shell",
    {
      owner: "omnipanel-shell",
      path: "Body/M/epi-theia/extensions/omnipanel-shell/src/browser/frontend-module.ts",
      pattern: /OmniPanelWidget\.ID/
    }
  ]
]);

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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

function extractExportedStringArray(source, exportName) {
  const declarationStart = source.indexOf(`export const ${exportName}`);
  assert.notEqual(declarationStart, -1, `missing export const ${exportName}`);
  const arrayStart = source.indexOf("[", declarationStart);
  assert.notEqual(arrayStart, -1, `missing array literal for ${exportName}`);
  const arraySource = extractBalancedBlock(source, arrayStart, "[", "]");
  return Array.from(arraySource.matchAll(/['"]([^'"]+)['"]/g), (match) => match[1]);
}

function extractStringArrayProperty(objectSource, propertyName) {
  const propertyStart = objectSource.indexOf(`${propertyName}:`);
  assert.notEqual(propertyStart, -1, `missing ${propertyName} property`);
  const arrayStart = objectSource.indexOf("[", propertyStart);
  assert.notEqual(arrayStart, -1, `missing ${propertyName} array`);
  const arraySource = extractBalancedBlock(objectSource, arrayStart, "[", "]");
  return Array.from(arraySource.matchAll(/['"]([^'"]+)['"]/g), (match) => match[1]);
}

function extractConstStringTuple(source, exportName) {
  const declarationStart = source.indexOf(`export const ${exportName}`);
  assert.notEqual(declarationStart, -1, `missing export const ${exportName}`);
  const arrayStart = source.indexOf("[", declarationStart);
  assert.notEqual(arrayStart, -1, `missing tuple array for ${exportName}`);
  const arraySource = extractBalancedBlock(source, arrayStart, "[", "]");
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
    : [`${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")];
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
  const sourcePath = widgetSourcePath ?? modulePath;
  let widgetSource = "";
  if (!widgetSourcePath) {
    widgetSource = readFileSync(modulePath, "utf8");
    assert.match(widgetSource, new RegExp(`class\\s+${className}\\b`), `${className} must be imported by or declared in ${modulePath}`);
  } else {
    widgetSource = readFileSync(sourcePath, "utf8");
  }
  const classStart = widgetSource.search(new RegExp(`class\\s+${className}\\b`));
  const classSource = classStart === -1 ? widgetSource : widgetSource.slice(classStart);
  const idMatch = classSource.match(/static\s+readonly\s+ID\s*=\s*([^;]+);/);
  assert.ok(idMatch, `${className} must define static readonly ID`);

  const expression = idMatch[1].trim();
  const literal = expression.match(/^['"]([^'"]+)['"]$/);
  if (literal) {
    return literal[1];
  }

  const expressionSourcePath = imports.get(expression);
  const constants = readStringConstants([
    sourcePath,
    ...(expressionSourcePath ? [expressionSourcePath] : []),
    ...readCommonSourceFiles(modulePath)
  ]);
  const resolved = constants.get(expression);
  assert.ok(resolved, `${className}.ID expression ${expression} must resolve to a string constant`);
  return resolved;
}

function resolveStringExpression(modulePath, expression, imports) {
  const literal = expression.match(/^['"]([^'"]+)['"]$/);
  if (literal) {
    return literal[1];
  }

  const memberExpression = expression.match(/^([A-Z0-9_]+)\.([A-Z0-9_]+)$/);
  if (memberExpression) {
    const [, importedName, memberName] = memberExpression;
    const constantsPath = imports.get(importedName);
    const sourceFiles = constantsPath
      ? [constantsPath, ...readCommonSourceFiles(modulePath)]
      : readCommonSourceFiles(modulePath);
    const constants = readStringConstants(sourceFiles);
    return constants.get(`${importedName}.${memberName}`) ?? null;
  }

  const directConstant = expression.match(/^([A-Z0-9_]+)$/);
  if (directConstant) {
    const constantsPath = imports.get(directConstant[1]);
    const sourceFiles = constantsPath
      ? [constantsPath, ...readCommonSourceFiles(modulePath)]
      : readCommonSourceFiles(modulePath);
    const constants = readStringConstants(sourceFiles);
    return constants.get(directConstant[1]) ?? null;
  }

  return null;
}

function readRegisteredWidgetFactoryIds() {
  const registered = new Set();
  for (const modulePath of widgetFactoryModulePaths) {
    const source = readFileSync(modulePath, "utf8");
    const imports = parseNamedImports(source, modulePath);
    for (const match of source.matchAll(/id:\s*([A-Za-z0-9_]+)\.ID/g)) {
      registered.add(resolveWidgetClassId(modulePath, match[1], imports));
    }
    for (const match of source.matchAll(/id:\s*([^,\n}]+)/g)) {
      const expression = match[1].trim();
      if (/^[A-Za-z0-9_]+\.ID$/.test(expression)) {
        continue;
      }
      const resolved = resolveStringExpression(modulePath, expression, imports);
      if (resolved) {
        registered.add(resolved);
      }
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
  const descriptorExpectedWidgets = extractStringArrayProperty(descriptorSource, "expectedWidgets");
  const expectedWidgets = descriptorExpectedWidgets.length > 0
    ? descriptorExpectedWidgets
    : extractConstStringTuple(layoutSource, "DAILY_0_1_WIDGET_IDS");
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

test("DAILY_0_1_DESCRIPTOR expected widgets map to contributors or projection-lenses", () => {
  assert.ok(existsSync(layoutTypesPath), "missing pratibimba layout types");

  const layoutSource = readFileSync(layoutTypesPath, "utf8");
  const descriptorSource = extractExportedObject(layoutSource, "DAILY_0_1_DESCRIPTOR");
  const contributorsSource = extractExportedObject(layoutSource, "DAILY_0_1_WIDGET_CONTRIBUTORS");
  assert.match(
    descriptorSource,
    /expectedWidgets:\s*\[\.\.\.DAILY_0_1_WIDGET_IDS\]/,
    "daily descriptor must source expectedWidgets from DAILY_0_1_WIDGET_IDS"
  );
  const expectedWidgets = extractExportedStringArray(layoutSource, "DAILY_0_1_WIDGET_IDS");
  const layoutOnlyWidgets = extractStringRecordProperty(descriptorSource, "layoutOnlyWidgets");
  const registeredWidgetFactoryIds = readRegisteredWidgetFactoryIds();

  assert.ok(
    expectedWidgets.includes("pratibimba.daily.library-projection"),
    "daily layout must register the Library projection-lens"
  );
  assert.ok(
    expectedWidgets.includes("pratibimba.daily.atelier-cluster-lens"),
    "daily layout must register the Atelier cluster projection-lens"
  );
  assert.equal(
    expectedWidgets.includes("pratibimba.daily.cymatic-placeholder"),
    false,
    "unowned cymatic placeholder must not remain an expected widget"
  );
  assert.equal(
    expectedWidgets.includes("pratibimba.daily.status-display"),
    false,
    "daily status-display claim must align to the real kernel-bridge-readiness widget id"
  );

  for (const widgetId of expectedWidgets) {
    const evidence = dailyContributorEvidence.get(widgetId);
    assert.ok(evidence, `${widgetId} missing daily contributor evidence mapping`);
    assert.match(contributorsSource, new RegExp(`['"]${escapeRegExp(widgetId)}['"]`));
    assert.match(contributorsSource, new RegExp(`ownerExtension:\\s*['"]${escapeRegExp(evidence.owner)}['"]`));
    const evidencePath = join(repoRoot, evidence.path);
    assert.ok(existsSync(evidencePath), `${widgetId} owner path missing: ${evidence.path}`);
    assert.match(readFileSync(evidencePath, "utf8"), evidence.pattern, `${widgetId} owner evidence missing`);
  }

  const factoryBackedOrphans = expectedWidgets.filter(
    (widgetId) =>
      !registeredWidgetFactoryIds.has(widgetId) &&
      !layoutOnlyWidgets.has(widgetId)
  );
  assert.deepEqual(
    factoryBackedOrphans,
    [],
    `unowned DAILY_0_1_DESCRIPTOR.expectedWidgets: ${factoryBackedOrphans.join(", ")}`
  );

  for (const widgetId of layoutOnlyWidgets.keys()) {
    assert.match(
      layoutOnlyWidgets.get(widgetId),
      /projection-lens/,
      `${widgetId} layout-only annotation must explicitly say projection-lens`
    );
  }
});

test("Track 11 T11.3 validator enforces projection-lens anti-rebuild rule", () => {
  assert.ok(existsSync(validatorPath), "missing contract validator");
  const validatorSource = readFileSync(validatorPath, "utf8");

  for (const extensionName of forbiddenStandaloneProjectionExtensions) {
    assert.equal(
      existsSync(join(extensionsRoot, extensionName)),
      false,
      `${extensionName} must not exist as a standalone extension`
    );
    assert.match(validatorSource, new RegExp(`['"]${escapeRegExp(extensionName)}['"]`));
  }
  assert.match(validatorSource, /projection-lens/);
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
