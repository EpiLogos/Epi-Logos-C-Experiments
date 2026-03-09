#!/usr/bin/env -S npx tsx
/**
 * validate-datasets.ts — Validates docs/datasets/ JSON files against Zod schemas.
 *
 * Checks:
 *   1. Every node in nodes_*.json has required fields (coordinate, name)
 *   2. Node field types are correct where present
 *   3. Every relation in relations_*.json has source, type, target
 *   4. Relation types are checked against the 34 canonical RELATION_TYPES
 *
 * Run:  bun run validate       (see package.json script)
 *   or: npx tsx validate-datasets.ts
 *   or: deno run --allow-read validate-datasets.ts
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import { z } from "zod";
import { RELATION_TYPES } from "./src/relations.js";

// ─── Paths ───────────────────────────────────────────────────────────────────

const SCHEMAS_DIR = import.meta.dirname ?? new URL(".", import.meta.url).pathname;
const REPO_ROOT = join(SCHEMAS_DIR, "..", "..");
const DATASETS_DIR = join(REPO_ROOT, "docs", "datasets");

// ─── Dataset-native schemas (permissive — validates what the datasets ACTUALLY have) ─

/**
 * Dataset nodes use a DIFFERENT shape from the HCNode Zod schema.
 * Field mapping:
 *   dataset "coordinate"  →  schema "coordinate"
 *   dataset "coreNature"  →  (no HCNode equivalent)
 *   dataset "formulation" →  (no HCNode equivalent)
 *   dataset "essence"     →  schema "essence"
 *   dataset "description" →  schema "description"
 *   dataset "structure"   →  (no HCNode equivalent)
 *   dataset "name"        →  schema "name"
 */
const DatasetNodeSchema = z.object({
  coordinate: z.string().min(1, "coordinate must be a non-empty string"),
  name: z.string().min(1, "name must be a non-empty string"),
  // Optional/nullable fields present in datasets
  coreNature: z.string().nullable().optional(),
  formulation: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  essence: z.string().nullable().optional(),
  structure: z.string().nullable().optional(),
}).passthrough(); // allow extra fields without failing

const DatasetRelationSchema = z.object({
  source: z.string().min(1, "source must be a non-empty string"),
  type: z.string().min(1, "type must be a non-empty string"),
  target: z.string().nullable(),
});

// ─── Reporting types ─────────────────────────────────────────────────────────

interface Violation {
  file: string;
  index: number;
  coordinate?: string;
  field: string;
  message: string;
}

interface FileReport {
  file: string;
  total: number;
  valid: number;
  violations: Violation[];
}

interface RelationTypeReport {
  canonical: string[];
  nonCanonical: string[];
  counts: Map<string, number>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadJson(path: string): unknown[] | null {
  if (!existsSync(path)) return null;
  try {
    const raw = readFileSync(path, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.error(`  WARNING: ${basename(path)} is not a JSON array, skipping.`);
      return null;
    }
    return parsed;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`  ERROR loading ${basename(path)}: ${msg}`);
    return null;
  }
}

const CANONICAL_SET = new Set<string>(RELATION_TYPES);

function hr(char = "─", len = 78): string {
  return char.repeat(len);
}

// ─── Node validation ─────────────────────────────────────────────────────────

function validateNodes(filePath: string): FileReport {
  const file = basename(filePath);
  const data = loadJson(filePath);
  if (data === null) {
    return { file, total: 0, valid: 0, violations: [{ file, index: -1, field: "file", message: "File not found or not a JSON array" }] };
  }

  const violations: Violation[] = [];
  let valid = 0;

  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    const result = DatasetNodeSchema.safeParse(node);
    if (result.success) {
      valid++;
    } else {
      const coord = typeof (node as Record<string, unknown>)?.coordinate === "string"
        ? (node as Record<string, unknown>).coordinate as string
        : `[index ${i}]`;
      for (const issue of result.error.issues) {
        violations.push({
          file,
          index: i,
          coordinate: coord,
          field: issue.path.join(".") || "(root)",
          message: issue.message,
        });
      }
    }
  }

  return { file, total: data.length, valid, violations };
}

// ─── Relation validation ─────────────────────────────────────────────────────

function validateRelations(filePath: string): { report: FileReport; typeReport: RelationTypeReport } {
  const file = basename(filePath);
  const data = loadJson(filePath);
  const typeReport: RelationTypeReport = {
    canonical: [],
    nonCanonical: [],
    counts: new Map(),
  };

  if (data === null) {
    return {
      report: { file, total: 0, valid: 0, violations: [{ file, index: -1, field: "file", message: "File not found or not a JSON array" }] },
      typeReport,
    };
  }

  const violations: Violation[] = [];
  let valid = 0;
  const seenTypes = new Set<string>();

  for (let i = 0; i < data.length; i++) {
    const rel = data[i];
    const result = DatasetRelationSchema.safeParse(rel);
    if (result.success) {
      valid++;
      const t = result.data.type;
      typeReport.counts.set(t, (typeReport.counts.get(t) ?? 0) + 1);
      seenTypes.add(t);
    } else {
      const src = typeof (rel as Record<string, unknown>)?.source === "string"
        ? (rel as Record<string, unknown>).source as string
        : `[index ${i}]`;
      for (const issue of result.error.issues) {
        violations.push({
          file,
          index: i,
          coordinate: src,
          field: issue.path.join(".") || "(root)",
          message: issue.message,
        });
      }
    }
  }

  for (const t of seenTypes) {
    if (CANONICAL_SET.has(t)) {
      typeReport.canonical.push(t);
    } else {
      typeReport.nonCanonical.push(t);
    }
  }

  return { report: { file, total: data.length, valid, violations }, typeReport };
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main(): void {
  console.log();
  console.log(hr("═"));
  console.log("  EPI-LOGOS DATASET VALIDATION REPORT");
  console.log("  Schemas: @epi-logos/ql-schema (Zod)");
  console.log("  Datasets: docs/datasets/nodes_*.json, relations_*.json");
  console.log(hr("═"));

  if (!existsSync(DATASETS_DIR)) {
    console.error(`\n  FATAL: datasets directory not found at ${DATASETS_DIR}`);
    process.exit(1);
  }

  const files = readdirSync(DATASETS_DIR);
  const nodeFiles = files.filter((f) => f.startsWith("nodes_") && f.endsWith(".json")).sort();
  const relFiles = files.filter((f) => f.startsWith("relations_") && f.endsWith(".json")).sort();

  // ── Node validation ──

  let totalNodes = 0;
  let totalValidNodes = 0;
  let totalNodeViolations = 0;
  const nodeReports: FileReport[] = [];

  console.log("\n" + hr());
  console.log("  SECTION 1: NODE VALIDATION");
  console.log(hr());

  if (nodeFiles.length === 0) {
    console.log("  No nodes_*.json files found.");
  }

  for (const f of nodeFiles) {
    const report = validateNodes(join(DATASETS_DIR, f));
    nodeReports.push(report);
    totalNodes += report.total;
    totalValidNodes += report.valid;
    totalNodeViolations += report.violations.length;

    const status = report.violations.length === 0 ? "PASS" : "FAIL";
    console.log(`\n  [${status}] ${report.file}`);
    console.log(`         Nodes: ${report.total}  |  Valid: ${report.valid}  |  Violations: ${report.violations.length}`);

    if (report.violations.length > 0) {
      // Show first 10 violations per file
      const shown = report.violations.slice(0, 10);
      for (const v of shown) {
        console.log(`         - [${v.index}] ${v.coordinate ?? "?"}: ${v.field} => ${v.message}`);
      }
      if (report.violations.length > 10) {
        console.log(`         ... and ${report.violations.length - 10} more`);
      }
    }
  }

  // ── Relation validation ──

  let totalRels = 0;
  let totalValidRels = 0;
  let totalRelViolations = 0;
  const allNonCanonical = new Set<string>();
  const allCanonical = new Set<string>();
  const globalTypeCounts = new Map<string, number>();
  const relReports: FileReport[] = [];

  console.log("\n" + hr());
  console.log("  SECTION 2: RELATION VALIDATION");
  console.log(hr());

  if (relFiles.length === 0) {
    console.log("  No relations_*.json files found.");
  }

  for (const f of relFiles) {
    const { report, typeReport } = validateRelations(join(DATASETS_DIR, f));
    relReports.push(report);
    totalRels += report.total;
    totalValidRels += report.valid;
    totalRelViolations += report.violations.length;

    for (const t of typeReport.canonical) allCanonical.add(t);
    for (const t of typeReport.nonCanonical) allNonCanonical.add(t);
    for (const [t, c] of typeReport.counts) {
      globalTypeCounts.set(t, (globalTypeCounts.get(t) ?? 0) + c);
    }

    const status = report.violations.length === 0 ? "PASS" : "FAIL";
    console.log(`\n  [${status}] ${report.file}`);
    console.log(`         Relations: ${report.total}  |  Valid: ${report.valid}  |  Violations: ${report.violations.length}`);

    if (report.violations.length > 0) {
      const shown = report.violations.slice(0, 10);
      for (const v of shown) {
        console.log(`         - [${v.index}] ${v.coordinate ?? "?"}: ${v.field} => ${v.message}`);
      }
      if (report.violations.length > 10) {
        console.log(`         ... and ${report.violations.length - 10} more`);
      }
    }
  }

  // ── Relation type analysis ──

  console.log("\n" + hr());
  console.log("  SECTION 3: RELATION TYPE ANALYSIS");
  console.log(hr());

  console.log(`\n  Canonical types found (${allCanonical.size} / ${RELATION_TYPES.length}):`);
  if (allCanonical.size > 0) {
    for (const t of [...allCanonical].sort()) {
      console.log(`    [C] ${t}  (${globalTypeCounts.get(t) ?? 0} uses)`);
    }
  } else {
    console.log("    (none)");
  }

  console.log(`\n  Non-canonical types found (${allNonCanonical.size}):`);
  if (allNonCanonical.size > 0) {
    // Show top 20 by frequency, then summarize the rest
    const sorted = [...allNonCanonical].sort((a, b) => (globalTypeCounts.get(b) ?? 0) - (globalTypeCounts.get(a) ?? 0));
    const top = sorted.slice(0, 20);
    for (const t of top) {
      console.log(`    [?] ${t}  (${globalTypeCounts.get(t) ?? 0} uses)`);
    }
    if (sorted.length > 20) {
      console.log(`    ... and ${sorted.length - 20} more non-canonical types`);
    }
  } else {
    console.log("    (none)");
  }

  const missingCanonical = RELATION_TYPES.filter((t) => !allCanonical.has(t));
  console.log(`\n  Canonical types NOT in datasets (${missingCanonical.length}):`);
  if (missingCanonical.length > 0) {
    for (const t of missingCanonical) {
      console.log(`    [-] ${t}`);
    }
  } else {
    console.log("    (all present)");
  }

  // ── Field name mapping analysis ──

  console.log("\n" + hr());
  console.log("  SECTION 4: SCHEMA / DATASET FIELD MAPPING");
  console.log(hr());

  console.log(`
  Dataset field         HCNode/HCIdentity field   Status
  ────────────────────  ────────────────────────   ──────
  coordinate            bimbaCoordinate            RENAME NEEDED
  name                  name                       OK
  coreNature            (none)                     DATASET-ONLY
  formulation           (none)                     DATASET-ONLY
  description           description                OK
  essence               essence                    OK
  structure             (none)                     DATASET-ONLY
  (missing)             uuid                       SCHEMA-ONLY (must generate)
  (missing)             qlPosition                 SCHEMA-ONLY (must parse)
  (missing)             family                     SCHEMA-ONLY (must parse)
  (missing)             inversionState             SCHEMA-ONLY (must derive)
  (missing)             flags                      SCHEMA-ONLY (must derive)
  (missing)             weaveState                 SCHEMA-ONLY (must derive)
  (missing)             layer                      SCHEMA-ONLY (must derive)
  (missing)             topoMode                   SCHEMA-ONLY (must derive)
  (missing)             12 pointer fields (c,p,..) SCHEMA-ONLY (must populate)
  (missing)             vaultPath                  SCHEMA-ONLY
  (missing)             semanticEmbedding          SCHEMA-ONLY
  (missing)             createdAt / updatedAt      SCHEMA-ONLY
`);

  // ── Summary ──

  console.log(hr("═"));
  console.log("  SUMMARY");
  console.log(hr("═"));

  console.log(`
  Node files:       ${nodeFiles.length}
  Total nodes:      ${totalNodes}
  Valid nodes:      ${totalValidNodes}
  Node violations:  ${totalNodeViolations}

  Relation files:   ${relFiles.length}
  Total relations:  ${totalRels}
  Valid relations:  ${totalValidRels}
  Rel violations:   ${totalRelViolations}

  Relation types:   ${globalTypeCounts.size} unique
    Canonical:      ${allCanonical.size} / ${RELATION_TYPES.length}
    Non-canonical:  ${allNonCanonical.size}
`);

  const overallPass = totalNodeViolations === 0 && totalRelViolations === 0;
  console.log(`  OVERALL: ${overallPass ? "PASS" : "FAIL (see violations above)"}`);
  console.log(hr("═"));
  console.log();

  process.exit(overallPass ? 0 : 1);
}

main();
