#!/usr/bin/env node
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const defaultRepoRoot = resolve(scriptDir, "../../../../..");

const legacyMissingDescriptionAllowlist = new Set([
  "Body/S/S0/epi-lib/Cargo.toml",
  "Body/S/S0/gemini-embedding/Cargo.toml",
  "Body/S/S0/settings/Cargo.toml",
  "Body/S/S5/epii-agent-core/Cargo.toml",
  "Body/S/S5/epii-autoresearch-core/Cargo.toml",
  "Body/S/S5/epii-review-core/Cargo.toml"
]);

const legacyMissingHeaderAllowlist = new Set([
  "Body/M/epi-theia/extensions/acceptance-harness/src/common/index.ts",
  "Body/M/epi-theia/extensions/agentic-control-room/src/common/index.ts",
  "Body/M/epi-theia/extensions/backend-studio/src/common/index.ts",
  "Body/M/epi-theia/extensions/bases-view/src/common/index.ts",
  "Body/M/epi-theia/extensions/block-kit/src/common/index.ts",
  "Body/M/epi-theia/extensions/body-lite-surface/src/common/index.ts",
  "Body/M/epi-theia/extensions/canon-studio/src/common/index.ts",
  "Body/M/epi-theia/extensions/ide-shell-m0-m5/src/common/index.ts",
  "Body/M/epi-theia/extensions/integrated-composition/src/common/index.ts",
  "Body/M/epi-theia/extensions/kernel-bridge-readiness/src/common/index.ts",
  "Body/M/epi-theia/extensions/kernel-bridge/src/common/index.ts",
  "Body/M/epi-theia/extensions/m-extension-runtime/src/common/index.ts",
  "Body/M/epi-theia/extensions/m0-anuttara/src/common/index.ts",
  "Body/M/epi-theia/extensions/m1-paramasiva-played-torus/src/common/index.ts",
  "Body/M/epi-theia/extensions/m1-paramasiva/src/common/index.ts",
  "Body/M/epi-theia/extensions/m2-parashakti/src/common/index.ts",
  "Body/M/epi-theia/extensions/m3-mahamaya/src/common/index.ts",
  "Body/M/epi-theia/extensions/m4-nara/src/common/index.ts",
  "Body/M/epi-theia/extensions/m5-epii/src/common/index.ts",
  "Body/M/epi-theia/extensions/omnipanel-shell/src/common/index.ts",
  "Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/common/index.ts",
  "Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/common/index.ts",
  "Body/M/epi-theia/extensions/pratibimba-layouts/src/common/index.ts",
  "Body/M/epi-theia/extensions/tuning-surface/src/common/index.ts",
  "Body/S/S0/epi-cli/src/lib.rs",
  "Body/S/S0/epi-cli/src/main.rs",
  "Body/S/S0/epi-lib/src/lib.rs",
  "Body/S/S0/gemini-embedding/src/lib.rs",
  "Body/S/S0/portal-core/src/lib.rs",
  "Body/S/S0/settings/src/lib.rs",
  "Body/S/S1/hen-compiler-core/src/lib.rs",
  "Body/S/S2/graph-schema/src/lib.rs",
  "Body/S/S2/graph-services/src/lib.rs",
  "Body/S/S2/m1-cpt-trainer/src/main.rs",
  "Body/S/S3/epi-spacetime-module/src/lib.rs",
  "Body/S/S3/gateway-contract/src/lib.rs",
  "Body/S/S3/gateway/src/lib.rs",
  "Body/S/S5/epii-agent-core/src/lib.rs",
  "Body/S/S5/epii-autoresearch-core/src/lib.rs",
  "Body/S/S5/epii-review-core/src/lib.rs",
  "Body/S/epi-kernel-contract/src/lib.rs"
]);

const legacyForbiddenImportAllowlist = new Set([
  // The 11 epi-cli entries that stood here were never rot: they were the CLI
  // membrane doing its job. `epi graph`, `epi vault`, `epi gate` exist to let
  // every module be touched from the terminal, which means reaching every
  // layer. That is now stated as a licence in the contract (`S0-membrane`,
  // Architect ruling 2026-07-28) instead of accumulating here as debt, and
  // epi-cli is constrained by residency — it may hold no domain law — rather
  // than by counting edges. Track 53 T53.02.
  //
  // What remains below is a genuine violation with no such defence: S2 must
  // not depend on S3. Track 53 T53.06 removes it, and T53.09 removes this
  // mechanism entirely.
  "Body/S/S2/graph-services/Cargo.toml#dependencies.epi-s3-gateway-contract",
  "Body/S/S2/graph-services/Cargo.toml#dependencies.epi-s3-redis-context"
]);

const ignoredDirectoryNames = new Set([
  ".git",
  ".pnpm",
  "lib",
  "node_modules",
  "target",
  "vendor"
]);

function parseArgs(argv) {
  const options = {
    repoRoot: defaultRepoRoot,
    contractPath: null,
    json: false,
    allowLegacyGaps: true
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--repo-root") {
      options.repoRoot = resolve(argv[++index]);
    } else if (arg === "--contract") {
      options.contractPath = resolve(argv[++index]);
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--no-legacy-allowlist") {
      options.allowLegacyGaps = false;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }

  options.contractPath ??= join(
    options.repoRoot,
    "Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json"
  );
  return options;
}

function printHelp() {
  console.log(`Usage: node Body/M/epi-theia/extensions/scripts/lint-boundaries.mjs [options]

Options:
  --repo-root <path>          Repository or fixture root to lint.
  --contract <path>           Contract JSON carrying rustSStackBoundary.
  --no-legacy-allowlist       Fail current migration gaps instead of ratcheting them.
  --json                      Emit machine-readable summary.
`);
}

function normalizeRelative(path) {
  return path.split(sep).join("/");
}

function relativeRepoPath(repoRoot, path) {
  return normalizeRelative(relative(repoRoot, path));
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function walkFiles(root) {
  if (!existsSync(root)) {
    return [];
  }

  const files = [];
  for (const entry of readdirSync(root)) {
    if (ignoredDirectoryNames.has(entry)) {
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

function stripInlineComment(line) {
  let inString = false;
  let quote = "";
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if ((char === "\"" || char === "'") && line[index - 1] !== "\\") {
      if (!inString) {
        inString = true;
        quote = char;
      } else if (quote === char) {
        inString = false;
        quote = "";
      }
    }
    if (char === "#" && !inString) {
      return line.slice(0, index).trimEnd();
    }
  }
  return line.trimEnd();
}

function parseCargoManifest(path) {
  const content = readFileSync(path, "utf8");
  const packageName = content.match(/^\s*name\s*=\s*"([^"]+)"/m)?.[1] ?? null;
  const description = content.match(/^\s*description\s*=\s*"([^"]+)"/m)?.[1]?.trim() ?? "";
  const dependencies = [];
  let section = "";

  for (const rawLine of content.split(/\r?\n/)) {
    const line = stripInlineComment(rawLine).trim();
    if (!line) {
      continue;
    }
    const sectionMatch = line.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      section = sectionMatch[1];
      continue;
    }
    if (!section.endsWith("dependencies")) {
      continue;
    }
    const dependencyMatch = line.match(/^"?([^"=\s]+)"?\s*=\s*(.+)$/);
    if (!dependencyMatch) {
      continue;
    }
    const [, key, value] = dependencyMatch;
    const packageAlias = value.match(/\bpackage\s*=\s*"([^"]+)"/)?.[1] ?? null;
    const pathValue = value.match(/\bpath\s*=\s*"([^"]+)"/)?.[1] ?? null;
    dependencies.push({
      section,
      key,
      package: packageAlias,
      path: pathValue
    });
  }

  return {
    packageName,
    description,
    dependencies
  };
}

function forbiddenFragmentMatchesDependency(repoRoot, manifestPath, dependency, fragment) {
  if (dependency.key === fragment || dependency.package === fragment) {
    return true;
  }

  if (!dependency.path) {
    return false;
  }

  const manifestDir = dirname(manifestPath);
  const absoluteDependencyPath = resolve(manifestDir, dependency.path);
  const dependencyRepoPath = relativeRepoPath(repoRoot, absoluteDependencyPath);
  return dependencyRepoPath === fragment || dependencyRepoPath.startsWith(`${fragment}/`);
}

function lintRustForbiddenImports(options, contract, errors, counts) {
  const boundary = contract.rustSStackBoundary;
  if (!boundary) {
    errors.push(`${relativeRepoPath(options.repoRoot, options.contractPath)} missing rustSStackBoundary`);
    return;
  }

  const layers = new Map(boundary.layers.map((layer) => [layer.id, layer]));
  for (const crate of boundary.crates ?? []) {
    const manifestPath = join(options.repoRoot, crate.manifestPath);
    counts.rustCrates += 1;
    if (!existsSync(manifestPath)) {
      errors.push(`${crate.manifestPath}: declared S-stack crate manifest is missing`);
      continue;
    }
    const layer = layers.get(crate.forbiddenImportsFromLayer ?? crate.layer);
    if (!layer) {
      errors.push(`${crate.manifestPath}: missing forbidden-import layer ${crate.forbiddenImportsFromLayer ?? crate.layer}`);
      continue;
    }
    const manifest = parseCargoManifest(manifestPath);
    for (const dependency of manifest.dependencies) {
      const edgeKey = `${crate.manifestPath}#${dependency.section}.${dependency.key}`;
      if (options.allowLegacyGaps && legacyForbiddenImportAllowlist.has(edgeKey)) {
        counts.legacyForbiddenImportGaps += 1;
        continue;
      }
      for (const forbidden of layer.forbiddenImports ?? []) {
        if (forbiddenFragmentMatchesDependency(options.repoRoot, manifestPath, dependency, forbidden)) {
          errors.push(
            `${crate.manifestPath}: ${dependency.section}.${dependency.key} violates ${layer.id} forbidden-imports via ${forbidden}`
          );
          break;
        }
      }
    }
  }
}

/**
 * The magnitude ratchet for the S0 CLI membrane.
 *
 * `epi-logos` is licensed to reach every layer — passthrough access is what a
 * CLI is for — so counting its import edges says nothing. What must not grow is
 * the amount of *law* it holds. This walks `src/gate/` and `src/graph/`, counts
 * the files that name an S1/S2/S3/S5 crate, and fails when that count rises
 * above the recorded ceiling.
 *
 * This is the check the old allowlist could not perform: a boolean permit let
 * 41 files become 59 without ever turning red.
 */
function lintS0MembraneResidency(options, errors, counts) {
  const contractPath = join(
    options.repoRoot,
    "Body/M/epi-theia/extensions/contracts/s0-membrane-residency.json"
  );
  if (!existsSync(contractPath)) {
    errors.push("Body/M/epi-theia/extensions/contracts/s0-membrane-residency.json is missing");
    return;
  }
  const contract = JSON.parse(readFileSync(contractPath, "utf8"));
  const upward = /\bepi_s1_[a-z0-9_]+|\bepi_s2_[a-z0-9_]+|\bepi_s3_[a-z0-9_]+|\bepi_s5_[a-z0-9_]+/;

  const lawBearing = [];
  for (const root of contract.roots) {
    const absolute = join(options.repoRoot, root);
    if (!existsSync(absolute)) continue;
    for (const file of walkFiles(absolute)) {
      if (!file.endsWith(".rs")) continue;
      if (upward.test(readFileSync(file, "utf8"))) {
        lawBearing.push(relativeRepoPath(options.repoRoot, file));
      }
    }
  }

  counts.s0MembraneLawBearingFiles = lawBearing.length;
  counts.s0MembraneCeiling = contract.lawBearingFileCeiling;
  const ceiling = contract.lawBearingFileCeiling;
  if (lawBearing.length > ceiling) {
    lawBearing.sort();
    errors.push(
      `S0 membrane residency ratchet: ${lawBearing.length} law-bearing file(s) under ` +
        `${contract.roots.join(" + ")} exceeds the ceiling of ${ceiling}. The epi CLI may reach ` +
        `every layer, but it may not accumulate their law. Move the handler to its coordinate ` +
        `and register it (Track 53); do NOT raise the ceiling to pass. Files: ` +
        lawBearing.join(", ")
    );
  }
}

function lintCargoDescriptions(options, errors, counts) {
  const cargoManifests = walkFiles(join(options.repoRoot, "Body/S"))
    .filter((path) => path.endsWith(`${sep}Cargo.toml`))
    .filter((path) => !relativeRepoPath(options.repoRoot, path).includes("/vendor/"))
    .sort();

  for (const manifestPath of cargoManifests) {
    counts.cargoManifests += 1;
    const rel = relativeRepoPath(options.repoRoot, manifestPath);
    const manifest = parseCargoManifest(manifestPath);
    if (manifest.description.length > 0) {
      continue;
    }
    if (options.allowLegacyGaps && legacyMissingDescriptionAllowlist.has(rel)) {
      counts.legacyCargoDescriptionGaps += 1;
      continue;
    }
    errors.push(`${rel}: Cargo.toml [package] description is required`);
  }
}

function hasCoordinateHeader(content) {
  const firstBlock = content.slice(0, 3500);
  if (firstBlock.includes("convention:coordinate-header:v1")) {
    return true;
  }

  const requiredLabels = [
    "Coordinate",
    "Residency",
    "Actualises",
    "Public surface",
    "Does NOT own"
  ];
  const hasCoreLabels = requiredLabels.every((label) => firstBlock.includes(label));
  const hasPosition = firstBlock.includes("Position (#n)") || firstBlock.includes("@position") || firstBlock.includes("Position");
  return hasCoreLabels && hasPosition;
}

function lintCoordinateHeaders(options, errors, counts) {
  const sFiles = walkFiles(join(options.repoRoot, "Body/S"))
    .filter((path) => path.endsWith(`${sep}src${sep}lib.rs`) || path.endsWith(`${sep}src${sep}main.rs`));
  const mBarrels = walkFiles(join(options.repoRoot, "Body/M/epi-theia/extensions"))
    .filter((path) => path.endsWith(`${sep}src${sep}common${sep}index.ts`));
  const declarationFiles = [...sFiles, ...mBarrels].sort();

  for (const filePath of declarationFiles) {
    counts.coordinateHeaderFiles += 1;
    const rel = relativeRepoPath(options.repoRoot, filePath);
    if (hasCoordinateHeader(readFileSync(filePath, "utf8"))) {
      continue;
    }
    if (options.allowLegacyGaps && legacyMissingHeaderAllowlist.has(rel)) {
      counts.legacyHeaderGaps += 1;
      continue;
    }
    errors.push(`${rel}: missing 43.2 Coordinate Header`);
  }
}

function lineCount(path) {
  const content = readFileSync(path, "utf8");
  if (content.length === 0) {
    return 0;
  }
  return content.split(/\r?\n/).length;
}

function lintCHeaderInvariant(options, errors, counts) {
  const headerPaths = walkFiles(join(options.repoRoot, "Body/S"))
    .filter((path) => path.endsWith(".h"))
    .filter((path) => relativeRepoPath(options.repoRoot, path).includes("/include/"))
    .sort();

  for (const headerPath of headerPaths) {
    const rel = relativeRepoPath(options.repoRoot, headerPath);
    const base = rel.split("/").at(-1).replace(/\.h$/, "");
    const sourceCandidates = [
      join(dirname(dirname(headerPath)), "src", `${base}.c`),
      join(dirname(headerPath), `${base}.c`)
    ];
    const sourcePath = sourceCandidates.find((candidate) => existsSync(candidate));
    if (!sourcePath) {
      counts.cHeadersWithoutSibling += 1;
      continue;
    }
    counts.cHeaderPairs += 1;
    const headerLines = lineCount(headerPath);
    const sourceLines = lineCount(sourcePath);
    if (headerLines > sourceLines) {
      errors.push(
        `${rel}: C header has ${headerLines} lines, exceeding sibling ${relativeRepoPath(options.repoRoot, sourcePath)} (${sourceLines} lines)`
      );
    }
  }
}

function run(options) {
  const errors = [];
  const counts = {
    rustCrates: 0,
    cargoManifests: 0,
    coordinateHeaderFiles: 0,
    cHeaderPairs: 0,
    cHeadersWithoutSibling: 0,
    legacyCargoDescriptionGaps: 0,
    legacyForbiddenImportGaps: 0,
    legacyHeaderGaps: 0
  };

  if (!existsSync(options.contractPath)) {
    errors.push(`${options.contractPath}: contract file not found`);
  } else {
    const contract = readJson(options.contractPath);
    lintRustForbiddenImports(options, contract, errors, counts);
  }
  lintCargoDescriptions(options, errors, counts);
  lintS0MembraneResidency(options, errors, counts);
  lintCoordinateHeaders(options, errors, counts);
  lintCHeaderInvariant(options, errors, counts);

  return { ok: errors.length === 0, errors, counts };
}

let options;
try {
  options = parseArgs(process.argv.slice(2));
  const result = run(options);
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.ok) {
    const legacyGapSummary = [];
    if (result.counts.legacyCargoDescriptionGaps > 0) {
      legacyGapSummary.push(`${result.counts.legacyCargoDescriptionGaps} Cargo description migration gaps allowlisted`);
    }
    if (result.counts.legacyForbiddenImportGaps > 0) {
      legacyGapSummary.push(`${result.counts.legacyForbiddenImportGaps} forbidden-import migration gaps allowlisted`);
    }
    if (typeof result.counts.s0MembraneLawBearingFiles === "number") {
      legacyGapSummary.push(
        `S0 membrane law-bearing files ${result.counts.s0MembraneLawBearingFiles}/${result.counts.s0MembraneCeiling}`
      );
    }
    if (result.counts.legacyHeaderGaps > 0) {
      legacyGapSummary.push(`${result.counts.legacyHeaderGaps} Coordinate Header migration gaps allowlisted`);
    }
    const suffix = legacyGapSummary.length > 0 ? ` (${legacyGapSummary.join("; ")})` : "";
    console.log(`boundary lint passed${suffix}`);
  } else {
    console.error("boundary lint failed:");
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
  }
  process.exit(result.ok ? 0 : 1);
} catch (error) {
  console.error(`boundary lint error: ${error.message}`);
  process.exit(1);
}
