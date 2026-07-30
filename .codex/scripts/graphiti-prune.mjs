#!/usr/bin/env node
// Prune Graphiti test residue from the development graph.
//
// Graphiti (`:Entity` / `:Episodic`) shares a database with the Bimba ontology
// but is a disjoint namespace: no node carries both labels and no edge crosses
// between them (verified 2026-07-29). Test runs leave episodic fixtures behind
// and nothing cleaned them up, so they accumulate — and since 2026-07-29 they
// are inside the nightly backup too.
//
// Three safety rules, in order of importance:
//
//   1. A node touched by this script must carry `:Entity` or `:Episodic` and
//      must NOT carry `:Bimba`. Both halves are asserted in the Cypher itself,
//      so the guarantee does not depend on this script's own bookkeeping.
//   2. Only group_ids matching a KNOWN FIXTURE PATTERN are eligible. Real
//      session memory (a UUID group_id) is never matched. There is no
//      "delete everything older than X" mode for session data — that is a
//      retention policy decision, not a cleanup.
//   3. Dry run by default. `--apply` is required to delete anything.
//
// Usage:
//   graphiti-prune.mjs              report what would be deleted
//   graphiti-prune.mjs --apply      delete it
//   graphiti-prune.mjs --list       show group_id inventory by class

import { execFileSync } from "node:child_process";

const CONTAINER = process.env.EPI_NEO4J_CONTAINER ?? "epi-neo4j";
const USER = process.env.EPILOGOS_NEO4J_USER ?? "neo4j";
const PASSWORD = process.env.NEO4J_PASSWORD ?? process.env.EPILOGOS_NEO4J_PASSWORD ?? "password";

// group_id patterns that only a test run produces. Anchored, and deliberately
// narrow: anything not listed here is left alone.
const FIXTURE_PATTERNS = [
  "^agent_live-graphiti-proof.*",
  "^arena_e2e$",
  "^test_.*",
  "^.*_test_fixture$",
  "^live_graphiti_runtime_proof.*",
];

function cypher(statement) {
  const out = execFileSync(
    "docker",
    ["exec", "-i", CONTAINER, "cypher-shell", "-u", USER, "-p", PASSWORD, "--format", "plain", statement],
    { encoding: "utf8" },
  );
  return out.trim().split("\n").slice(1).filter(Boolean);
}

const patternList = FIXTURE_PATTERNS.map((p) => `'${p}'`).join(", ");

// The label guard lives in the query, not in JS.
const ELIGIBLE = `
  MATCH (n)
  WHERE (n:Entity OR n:Episodic) AND NOT n:Bimba
    AND n.group_id IS NOT NULL
    AND any(p IN [${patternList}] WHERE n.group_id =~ p)
`;

function inventory() {
  console.log("Graphiti group_id inventory (Entity + Episodic, never :Bimba):\n");
  const rows = cypher(`
    MATCH (n) WHERE (n:Entity OR n:Episodic) AND NOT n:Bimba
    WITH n.group_id AS g, count(*) AS c
    RETURN CASE
      WHEN g IS NULL THEN 'no-group-id'
      WHEN any(p IN [${patternList}] WHERE g =~ p) THEN 'TEST FIXTURE (prunable)'
      WHEN g =~ '[0-9a-f-]{36}' THEN 'session memory (kept)'
      ELSE 'unclassified (kept)'
    END AS kind, sum(c) AS nodes, count(*) AS groups
    ORDER BY nodes DESC;`);
  for (const r of rows) console.log("  " + r);
}

function main() {
  const apply = process.argv.includes("--apply");
  if (process.argv.includes("--list")) {
    inventory();
    return;
  }

  const counts = cypher(`${ELIGIBLE} RETURN count(n) AS eligible;`);
  const eligible = Number.parseInt(counts[0] ?? "0", 10) || 0;

  const groups = cypher(`${ELIGIBLE} RETURN DISTINCT n.group_id AS g ORDER BY g;`);

  console.log(`[graphiti-prune] eligible test-fixture nodes: ${eligible}`);
  for (const g of groups) console.log(`  group: ${g}`);

  // Prove the guard: nothing eligible may be a Bimba node.
  const leak = cypher(`${ELIGIBLE} AND n:Bimba RETURN count(n) AS leak;`);
  if ((Number.parseInt(leak[0] ?? "0", 10) || 0) !== 0) {
    console.error("[graphiti-prune] ABORT — selection touched a :Bimba node");
    process.exit(1);
  }

  if (eligible === 0) {
    console.log("[graphiti-prune] nothing to prune");
    return;
  }
  if (!apply) {
    console.log("\n[graphiti-prune] DRY RUN — re-run with --apply to delete these");
    return;
  }

  const before = cypher("MATCH (n:Bimba) RETURN count(n);")[0];
  cypher(`${ELIGIBLE} DETACH DELETE n;`);
  const after = cypher("MATCH (n:Bimba) RETURN count(n);")[0];
  if (before !== after) {
    console.error(`[graphiti-prune] ALARM — :Bimba count changed ${before} -> ${after}`);
    process.exit(1);
  }
  console.log(`[graphiti-prune] pruned ${eligible} fixture nodes; :Bimba unchanged at ${after}`);
}

main();
