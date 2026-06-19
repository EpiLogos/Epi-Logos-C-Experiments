#!/usr/bin/env node
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readlinkSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const CENTRAL_SKILL_ROOTS = Object.freeze([
  "Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills",
  "Body/S/S4/ta-onta/S4-4p-anima/S4'/skills",
  "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/skills",
  "Body/S/S5/plugins/epi-logos/skills",
]);

const MANIFEST_FILE = ".epi-skill-projection.json";
const ENV_FILE = ".epi-skill-projection.env";

export function findRepoRoot(start = process.cwd()) {
  let current = resolve(start);
  while (true) {
    if (existsSync(join(current, "AGENTS.md")) && existsSync(join(current, "Body"))) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) return resolve(start);
    current = parent;
  }
}

export function targetForHarness(harness, options = {}) {
  const repoRoot = resolve(options.repoRoot ?? findRepoRoot());
  const env = options.env ?? process.env;
  const overrides = options.targetOverrides ?? {};
  if (overrides[harness]) return resolve(overrides[harness]);

  switch (harness) {
    case "claude-native":
      return join(repoRoot, ".claude", "skills");
    case "codex-native":
      return join(env.CODEX_HOME ? resolve(env.CODEX_HOME) : join(repoRoot, ".codex"), "skills");
    case "hermes-acp":
      return resolve(env.HERMES_ACP_SKILLS_DIR ?? join(repoRoot, ".agents", "skills"));
    case "pi":
      return null;
    default:
      throw new Error(`Unknown harness '${harness}'`);
  }
}

export function enumerateCentralSkills(repoRoot, roots = CENTRAL_SKILL_ROOTS) {
  const skills = [];
  const byName = new Map();
  const duplicates = [];

  for (const relRoot of roots) {
    const absRoot = resolve(repoRoot, relRoot);
    if (!existsSync(absRoot)) continue;
    for (const name of readdirSync(absRoot).sort()) {
      const absPath = join(absRoot, name);
      const skillFile = join(absPath, "SKILL.md");
      if (!existsSync(skillFile)) continue;
      if (byName.has(name)) {
        duplicates.push({ name, first: byName.get(name).path, duplicate: absPath });
        continue;
      }
      const entry = {
        name,
        path: absPath,
        sourceRoot: absRoot,
        sourceRootRelative: relRoot,
      };
      byName.set(name, entry);
      skills.push(entry);
    }
  }

  return { skills, duplicates };
}

function isSymlinkTo(path, target) {
  if (!existsSync(path)) return false;
  const stat = lstatSync(path);
  if (!stat.isSymbolicLink()) return false;
  return resolve(dirname(path), readlinkSync(path)) === resolve(target);
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

export function projectSkills(input = {}) {
  const repoRoot = resolve(input.repoRoot ?? findRepoRoot());
  const harnesses = input.harnesses ?? ["claude-native", "codex-native", "hermes-acp"];
  const cfIdentity = input.cfIdentity ?? process.env.CF_IDENTITY ?? "";
  const roots = input.centralRoots ?? CENTRAL_SKILL_ROOTS;
  const { skills, duplicates } = enumerateCentralSkills(repoRoot, roots);
  const projections = [];

  for (const harness of harnesses) {
    const targetDir = targetForHarness(harness, {
      repoRoot,
      env: input.env,
      targetOverrides: input.targetOverrides,
    });

    if (harness === "pi") {
      projections.push({
        harness,
        targetDir: null,
        mode: "native-extension-registration",
        linked: [],
        skipped: [],
      });
      continue;
    }

    if (!targetDir) throw new Error(`Harness '${harness}' did not resolve a target dir`);
    try {
      mkdirSync(targetDir, { recursive: true });
    } catch (error) {
      projections.push({
        harness,
        targetDir,
        mode: "symlink-projection",
        linked: [],
        skipped: skills.map((skill) => ({
          name: skill.name,
          linkPath: join(targetDir, skill.name),
          reason: `target dir unavailable: ${error instanceof Error ? error.message : String(error)}`,
        })),
        error: error instanceof Error ? error.message : String(error),
      });
      continue;
    }
    const linked = [];
    const skipped = [];

    for (const skill of skills) {
      const linkPath = join(targetDir, skill.name);
      if (existsSync(linkPath)) {
        if (isSymlinkTo(linkPath, skill.path)) {
          linked.push({ name: skill.name, linkPath, target: skill.path, status: "already-linked" });
          continue;
        }
        const stat = lstatSync(linkPath);
        if (stat.isSymbolicLink()) {
          rmSync(linkPath);
        } else {
          skipped.push({
            name: skill.name,
            linkPath,
            reason: "pre-existing non-symlink path",
          });
          continue;
        }
      }
      try {
        symlinkSync(skill.path, linkPath, "dir");
        linked.push({ name: skill.name, linkPath, target: skill.path, status: "linked" });
      } catch (error) {
        skipped.push({
          name: skill.name,
          linkPath,
          reason: `symlink failed: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }

    const manifest = {
      schema: "epi-logos.skill-projection.v1",
      harness,
      targetDir,
      repoRoot,
      cf_identity: cfIdentity,
      centralSkillRoots: roots.map((root) => resolve(repoRoot, root)),
      skillCount: skills.length,
      linkedCount: linked.length,
      skipped,
      duplicates,
      skills: skills.map((skill) => ({
        name: skill.name,
        source: skill.path,
        sourceRelative: relative(repoRoot, skill.path),
      })),
    };
    let manifestPath = join(targetDir, MANIFEST_FILE);
    let envPath = join(targetDir, ENV_FILE);
    let manifestError = null;
    try {
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
      writeFileSync(
        envPath,
        [
          `CF_IDENTITY=${shellQuote(cfIdentity)}`,
          `EPI_SKILL_PROJECTION=${shellQuote(manifestPath)}`,
          "",
        ].join("\n"),
        "utf8",
      );
    } catch (error) {
      manifestError = error instanceof Error ? error.message : String(error);
      manifestPath = null;
      envPath = null;
    }

    projections.push({
      harness,
      targetDir,
      mode: "symlink-projection",
      linked,
      skipped,
      manifestPath,
      envPath,
      manifestError,
    });
  }

  return {
    schema: "epi-logos.skill-projector.result.v1",
    repoRoot,
    cf_identity: cfIdentity,
    centralSkillRoots: roots.map((root) => resolve(repoRoot, root)),
    skillCount: skills.length,
    duplicateCount: duplicates.length,
    duplicates,
    projections,
  };
}

function parseArgs(argv) {
  const out = {
    harnesses: [],
    targetOverrides: {},
    json: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--repo-root") out.repoRoot = argv[++i];
    else if (arg === "--cf-identity") out.cfIdentity = argv[++i];
    else if (arg === "--harness") out.harnesses.push(argv[++i]);
    else if (arg === "--target") {
      const [harness, target] = String(argv[++i] ?? "").split("=", 2);
      if (!harness || !target) throw new Error("--target must be harness=/path");
      out.targetOverrides[harness] = target;
    } else if (arg === "--json") out.json = true;
    else if (arg === "--all") out.harnesses = ["claude-native", "codex-native", "hermes-acp"];
    else throw new Error(`Unknown argument '${arg}'`);
  }
  if (out.harnesses.length === 0) out.harnesses = ["claude-native", "codex-native", "hermes-acp"];
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const result = projectSkills(args);
    if (args.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    } else {
      for (const projection of result.projections) {
        const target = projection.targetDir ?? "native";
        const linked = projection.linked?.length ?? 0;
        const skipped = projection.skipped?.length ?? 0;
        process.stdout.write(`${projection.harness}: ${linked} skills projected to ${target}`);
        if (skipped > 0) process.stdout.write(` (${skipped} skipped)`);
        process.stdout.write("\n");
      }
    }
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
