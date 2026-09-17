#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";

const cwd = process.cwd();
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const write = args.has("--write");
const manifestOnly = args.has("--manifest-only");
const rewriteOnly = args.has("--rewrite-only");
const includeArchives = args.has("--include-archives");

const sourceRoots = [
  "docs/specs",
  "docs/plans",
  "docs/superpowers",
  "docs/resources/S",
  "docs/resources/s-deprecated",
];
const textExtensions = new Set([".c", ".h", ".js", ".json", ".md", ".mjs", ".rs", ".toml", ".txt", ".yaml", ".yml"]);
const rewriteRoots = [".claude", ".codex", "Body", "Idea", "docs"];
const rewriteSkip = new Set([".git", "node_modules", "target", "dist", ".next"]);
const coherentPlanSetRoots = [
  "docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks",
  "docs/plans/2026-06-02-m-prime-cycle-1-close",
  "docs/plans/2026-06-02-m-prime-cycle-2-canonical",
];

function walk(dir) {
  if (!existsSync(dir)) return [];
  const entries = readdirSync(dir).sort();
  const files = [];
  for (const entry of entries) {
    if (entry === ".DS_Store") continue;
    const path = join(dir, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) files.push(...walk(path));
    else files.push(path);
  }
  return files;
}

function walkRewrite(dir) {
  if (!existsSync(dir)) return [];
  const entries = readdirSync(dir).sort();
  const files = [];
  for (const entry of entries) {
    if (rewriteSkip.has(entry)) continue;
    const path = join(dir, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) files.push(...walkRewrite(path));
    else files.push(path);
  }
  return files;
}

function loadSavedManifest() {
  const path = "Idea/Bimba/Seeds/LEGACY-DOCS-MIGRATION-MANIFEST.json";
  if (!existsSync(path)) throw new Error(`Saved manifest not found: ${path}`);
  return JSON.parse(readFileSync(path, "utf8"));
}

function readHead(source) {
  try {
    return readFileSync(source, "utf8").slice(0, 12000).toLowerCase();
  } catch {
    return "";
  }
}

function coordinateFor(source) {
  const lower = source.toLowerCase();
  const name = basename(source).toLowerCase();
  const head = readHead(source);
  const haystack = `${lower}\n${head}`;

  const sMatch = name.match(/\bs([0-5])(?:i|')?\b/) || name.match(/\bs([0-5])[-_]/);
  const mMatch = name.match(/\bm([0-5])(?:i|')?\b/) || name.match(/\bm([0-5])[-_]/);
  const explicitMCoordinate = name.match(/^m([0-5])(?:-|_|'|i|\b)/) || name.match(/\bm([0-5])(?:-|_|'|i|\b)/);
  const explicitSCoordinate = name.match(/^s([0-5])(?:-|_|'|i|\b)/) || name.match(/\bs([0-5])(?:-|_|'|i|\b)/);

  if (lower.includes("docs/resources/s-deprecated/s")) {
    const deprecated = basename(source).match(/^S([0-5])(?:[.-](\d)|-(\d))?('?|Cx)?/);
    if (deprecated) {
      const prime = deprecated[4] === "'" ? `/S${deprecated[1]}'` : "";
      return { family: "S", coordinate: `S${deprecated[1]}${prime}`, reason: "deprecated S coordinate filename" };
    }
  }

  if (lower.includes("docs/specs/m/") || lower.includes("docs/dev/m") || lower.includes("/m-branch") || explicitMCoordinate) {
    const index = explicitMCoordinate?.[1] ?? mMatch?.[1];
    if (index) return { family: "M", coordinate: `M${index}'`, reason: "explicit M coordinate path or filename" };
    return { family: "M", coordinate: "", reason: "explicit M/M' path" };
  }
  if (lower.includes("docs/plans/clock-and-nara-specs/")) {
    return { family: "M", coordinate: "M4'", reason: "Clock and Nara spec set" };
  }
  if (lower.includes("docs/specs/s/") || lower.includes("docs/resources/s/") || explicitSCoordinate) {
    const index = explicitSCoordinate?.[1] ?? sMatch?.[1];
    if (index) return { family: "S", coordinate: `S${index}${name.includes("i") || name.includes("'") ? `/S${index}'` : ""}`, reason: "explicit S coordinate path or filename" };
    return { family: "S", coordinate: "", reason: "explicit S/S' path" };
  }

  if (haystack.includes("s4'") || haystack.includes("s4i") || haystack.includes("pleroma") || haystack.includes("omx") || haystack.includes("pi-agent") || haystack.includes("superpowers") || haystack.includes("vak")) {
    return { family: "S", coordinate: "S4/S4'", reason: "S4/S4' agent, Pleroma, OMX, superpowers, or VAK surface" };
  }
  if (haystack.includes("s3'") || haystack.includes("s3i") || haystack.includes("gateway") || haystack.includes("spacetime") || haystack.includes("hermes") || haystack.includes("electron")) {
    return { family: "S", coordinate: "S3/S3'", reason: "S3/S3' gateway, spacetime, bridge, or Electron runtime surface" };
  }
  if (haystack.includes("s2'") || haystack.includes("s2i") || haystack.includes("graph") || haystack.includes("bimba-map") || haystack.includes("neo4j") || haystack.includes("semantic")) {
    return { family: "S", coordinate: "S2/S2'", reason: "S2/S2' graph, Neo4j, semantic, or Bimba-map surface" };
  }
  if (haystack.includes("s1'") || haystack.includes("s1i") || haystack.includes("obsidian") || haystack.includes("vault") || haystack.includes("khora") || haystack.includes("hen") || haystack.includes("world-types") || haystack.includes("idea-tree")) {
    return { family: "S", coordinate: "S1/S1'", reason: "S1/S1' vault, Hen, Obsidian, or World/Types surface" };
  }
  if (haystack.includes("s0'") || haystack.includes("s0i") || haystack.includes("cli") || haystack.includes("qv-pipeline") || haystack.includes("kernel") || haystack.includes("portal-core")) {
    return { family: "S", coordinate: "S0/S0'", reason: "S0/S0' CLI, kernel, portal-core, or QV pipeline surface" };
  }
  if (haystack.includes("s5'") || haystack.includes("s5i") || haystack.includes("sync") || haystack.includes("autoresearch") || haystack.includes("review")) {
    return { family: "S", coordinate: "S5/S5'", reason: "S5/S5' sync, review, or autoresearch surface" };
  }
  if (lower.includes("docs/specs/s/") || lower.includes("docs/resources/s/") || haystack.includes("s-stack") || haystack.includes("s/s'")) {
    return { family: "S", coordinate: "", reason: "general S/S' stack source" };
  }
  if (sMatch) return { family: "S", coordinate: `S${sMatch[1]}`, reason: "S coordinate filename" };

  if (haystack.includes("m4") || haystack.includes("nara") || haystack.includes("clock") || haystack.includes("oracle") || haystack.includes("subtle-body")) {
    return { family: "M", coordinate: "M4'", reason: "M4' Nara, clock, oracle, or subtle-body surface" };
  }
  if (haystack.includes("m5") || haystack.includes("epii")) return { family: "M", coordinate: "M5'", reason: "M5' Epii or holographic integration surface" };
  if (haystack.includes("m3") || haystack.includes("mahamaya")) return { family: "M", coordinate: "M3'", reason: "M3' Mahamaya symbolic transcription surface" };
  if (haystack.includes("m2") || haystack.includes("parashakti") || haystack.includes("vibrational")) return { family: "M", coordinate: "M2'", reason: "M2' Parashakti vibrational surface" };
  if (haystack.includes("m1") || haystack.includes("paramasiva") || haystack.includes("quaternionic") || haystack.includes("harmonic")) return { family: "M", coordinate: "M1'", reason: "M1' Paramasiva harmonic/math surface" };
  if (haystack.includes("m0") || haystack.includes("anuttara")) return { family: "M", coordinate: "M0'", reason: "M0' Anuttara language/map surface" };
  if (haystack.includes("m-prime") || haystack.includes("mprime") || haystack.includes("pratibimba") || haystack.includes("tauri") || haystack.includes("theia") || haystack.includes("m-branch")) {
    return { family: "M", coordinate: "", reason: "general M/M' Pratibimba shell or branch source" };
  }
  if (mMatch) return { family: "M", coordinate: `M${mMatch[1]}'`, reason: "M coordinate filename" };

  return { family: "Seeds", coordinate: "", reason: "general Seed source without a stronger coordinate signal" };
}

function sourceClass(source) {
  if (source.startsWith("docs/specs/")) return "specs";
  if (source.startsWith("docs/plans/")) return "plans";
  if (source.startsWith("docs/superpowers/")) return "superpowers";
  if (source.startsWith("docs/resources/S/")) return "resources/S";
  if (source.startsWith("docs/resources/s-deprecated/")) return "resources/s-deprecated";
  return "docs";
}

function targetFor(source) {
  const { family, coordinate } = coordinateFor(source);
  const cls = sourceClass(source);
  const sourceRoot = sourceRoots.find((root) => source.startsWith(`${root}/`));
  const rest = sourceRoot ? relative(sourceRoot, source) : source.replace(/^docs\//, "");
  const coherentPlanSet = coherentPlanSetRoots.find((root) => source.startsWith(`${root}/`));
  if (coherentPlanSet) {
    return join("Idea", "Bimba", "Seeds", "M", "Legacy", "plans", relative("docs/plans", source));
  }
  const targetParts = ["Idea", "Bimba", "Seeds"];
  if (family !== "Seeds") targetParts.push(family);
  if (coordinate) targetParts.push(...coordinate.split("/"));
  targetParts.push("Legacy", cls, rest);
  return join(...targetParts);
}

function dateFromName(source) {
  const match = basename(source).match(/(20\d{2})[-_](\d{2})[-_](\d{2})|(\d{8})/);
  if (!match) return "";
  if (match[4]) return `${match[4].slice(0, 4)}-${match[4].slice(4, 6)}-${match[4].slice(6, 8)}`;
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function manifestEntry(source) {
  const stats = statSync(source);
  const assignment = coordinateFor(source);
  const target = targetFor(source);
  return {
    source,
    target,
    family: assignment.family,
    coordinate: assignment.coordinate || `${assignment.family}' general`,
    sourceClass: sourceClass(source),
    filenameDate: dateFromName(source),
    mtime: stats.mtime.toISOString(),
    mtimeMs: stats.mtimeMs,
    wikilink: target.endsWith(".md") ? toWiki(target) : "",
    reason: assignment.reason,
  };
}

function extension(path) {
  const index = path.lastIndexOf(".");
  return index === -1 ? "" : path.slice(index);
}

function rewriteReferences(moves) {
  const replacements = moves.flatMap(({ source, target }) => [
    [source, target],
    [`/${source}`, `/${target}`],
  ]);
  let filesChanged = 0;
  let replacementsApplied = 0;
  for (const file of rewriteRoots.flatMap((root) => walkRewrite(root))) {
    if (!textExtensions.has(extension(file))) continue;
    let content;
    try {
      content = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    let next = content;
    for (const [from, to] of replacements) {
      if (!next.includes(from)) continue;
      const before = next;
      next = next.split(from).join(to);
      replacementsApplied += before.split(from).length - 1;
    }
    if (next !== content) {
      filesChanged += 1;
      if (!dryRun && file !== ".codex/scripts/seed-legacy-migrate.mjs") {
        try {
          writeFileSync(file, next);
        } catch (error) {
          if (error?.code !== "EPERM") throw error;
        }
      }
    }
  }
  return { filesChanged, replacementsApplied };
}

function toWiki(path) {
  return `[[${path.replace(/^Idea\//, "").replace(/\.md$/, "")}]]`;
}

const candidates = rewriteOnly ? [] : sourceRoots.flatMap((root) => walk(root)).filter((path) => includeArchives || !path.includes("/_archive/"));
const manifest = rewriteOnly
  ? loadSavedManifest()
  : candidates
      .map(manifestEntry)
      .filter(({ source, target }) => source !== target)
      .sort((a, b) => a.mtimeMs - b.mtimeMs || a.source.localeCompare(b.source));
const moves = manifest.map(({ source, target }) => ({ source, target }));

if (!write && !dryRun && !manifestOnly && !rewriteOnly) {
  console.error("Pass --dry-run to preview, --manifest-only to write assignment indexes, --write to migrate, or --rewrite-only to recover path rewrites.");
  process.exit(2);
}

const moved = [];
for (const move of moves) {
  if (existsSync(move.target)) {
    if (rewriteOnly) {
      moved.push(move);
      continue;
    }
    throw new Error(`Refusing to overwrite existing target: ${move.target}`);
  }
  if (manifestOnly || rewriteOnly) continue;
  if (!dryRun) {
    mkdirSync(dirname(move.target), { recursive: true });
    renameSync(move.source, move.target);
  }
  moved.push(move);
}

const indexPath = "Idea/Bimba/Seeds/LEGACY-DOCS-MIGRATION-INDEX.md";
const lines = [
  "# Legacy Docs Migration Index",
  "",
  "Canonical `/docs` spec, plan, resource, and superpowers artifacts migrated into coordinate-owned Seed legacy folders so vault wikilinks become the discovery surface.",
  "",
  "## Rules",
  "",
  "- `Idea/Bimba/Seeds/**/Legacy/specs` carries migrated specification sources.",
  "- `Idea/Bimba/Seeds/**/Legacy/plans` carries migrated implementation plans and M-dev plan sets.",
  "- `Idea/Bimba/Seeds/**/Legacy/superpowers` carries migrated Superpowers-generated designs/plans that were part of the in-house development corpus.",
  "- `Idea/Bimba/Seeds/**/Legacy/resources` carries migrated S-resource and deprecated coordinate source notes.",
  "- New canonical work should be born under Seeds or crystallised into World; do not create new load-bearing `/docs/plans` or `/docs/specs` artifacts.",
  "",
  "## Migrated Artifacts",
  "",
  "| mtime | filename date | coordinate | class | old path | new vault path | wikilink | reason |",
  "| --- | --- | --- | --- | --- | --- | --- | --- |",
  ...manifest.map((entry) => `| ${entry.mtime} | ${entry.filenameDate || "-"} | ${entry.coordinate} | ${entry.sourceClass} | \`${entry.source}\` | \`${entry.target}\` | ${entry.wikilink} | ${entry.reason} |`),
  "",
];

const jsonIndexPath = "Idea/Bimba/Seeds/LEGACY-DOCS-MIGRATION-MANIFEST.json";
if (!dryRun) {
  mkdirSync(dirname(indexPath), { recursive: true });
  writeFileSync(indexPath, `${lines.join("\n")}\n`);
  writeFileSync(jsonIndexPath, `${JSON.stringify(manifest.map(({ mtimeMs, ...entry }) => entry), null, 2)}\n`);
}
const rewrites = manifestOnly ? { filesChanged: 0, replacementsApplied: 0 } : rewriteReferences(moved);

const activeCycle = moved.find(({ source }) => source === "docs/plans/2026-06-02-m-prime-cycle-2-canonical/00-overview-and-m-prime-first-coverage.md");
if (!dryRun && !manifestOnly && activeCycle) {
  const planFolder = dirname(activeCycle.target);
  mkdirSync(".codex", { recursive: true });
  writeFileSync(".codex/m-dev.active.json", `${JSON.stringify({ planFolder }, null, 2)}\n`);
}

const summary = {
  dryRun,
  manifestOnly,
  rewriteOnly,
  moved: moved.length,
  rewrites,
  indexPath,
  jsonIndexPath,
  roots: sourceRoots,
};

console.log(JSON.stringify(summary, null, 2));
