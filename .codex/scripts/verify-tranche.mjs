#!/usr/bin/env node
/**
 * Coordinate: #5/S0 (verifier protocol runner — Track 00.T6, cycle-3 full rerun)
 * Residency: .codex/scripts/verify-tranche.mjs
 * Position (#n): #5 — Integration; verifier ≠ closer made mechanical
 * Actualises: [[00-verification-harness]] T6 + charter Verification-law §2 —
 *   the independent verifier re-executes a tranche's Verify commands FRESH,
 *   records verbatim output under plan.runs/verifications/, and refuses to
 *   record a pass when the tranche checks, the honesty lint, or verify-all
 *   are red. The verifier reads the recorded output, never the implementer's
 *   claim.
 * Public surface: extractVerifyCommands, resolveTaskVerify, runVerification,
 *   acquireGateLock, releaseGateLock, scopeForTasks, main;
 *   CLI: node .codex/scripts/verify-tranche.mjs <TASK_ID> [<TASK_ID>…]
 *     [--plan <folder-or-md>] [--cwd <dir>] [--only <verify-all suites>]
 *     [--full] [--owner <independent-verifier-id>] — recorded as
 *     verifier-owner; the ledger close path (m-dev-plan-assess.mjs) refuses
 *     a done mark whose verifier-owner equals the closing owner.
 *   Gate-lane lock: .codex/verify.lock (mkdir-atomic, stale-pid steal) —
 *     one verify run machine-wide; concurrent sessions queue, never collide.
 *   Batch ids to run the shared gate ONCE for N records; scoped gates per
 *     K/W/UF/D class replace the full 28-suite sweep per close (--full for
 *     the whole gate; the nightly/checkpoint sweep stays whole-repo).
 * Does NOT own: suite definitions (verify-all.mjs); the ledger write path
 *   (m-dev-plan-assess.mjs) — this records evidence, the closer marks.
 * Contract: a PASS file is only written when every stage is green; every run
 *   (pass or refusal) leaves a verbatim record.
 */

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(SCRIPT_DIR, "..", "..");
const DEFAULT_PLAN = join(
  REPO_ROOT,
  "Idea", "Bimba", "Seeds", "M", "Legacy", "plans", "2026-07-03-m-prime-cycle-3-full-rerun",
);
const MAX_RECORDED_OUTPUT = 200_000;

/* Class-scoped gate: the honest core per close is the tranche's Verify
 * commands + honesty-lint + the suites the change class can actually reach
 * (verification-classes.json per track). The FULL gate stays available via
 * --full and remains the periodic sweep; a scoped PASS record names its
 * scope verbatim in the gate command line. */
/* Scopes are the MINIMAL honest set per class. Deliberately excluded from
 * K and W: `epi-cli` (260s+, carries the live-tmux flake family — its tests
 * belong to closes that actually touch epi-cli, via the tranche's own
 * Verify line or an explicit --only) and the app-* suites (UF-only). The
 * nightly / checkpoint sweep (`verify-all` with no --only) remains the
 * whole-repo truth; a per-close gate proves the change class, not the
 * universe (protocol sanity ruling, 2026-07-07). */
const CLASS_SUITES = {
  D: ["honesty-lint"],
  K: [
    "harness-selftest", "honesty-lint", "kernel-truth",
    "epi-lib", "kernel-contract", "schemas", "portal-core",
  ],
  W: [
    "harness-selftest", "honesty-lint",
    "gateway", "gateway-contract", "gateway-methods", "live-wire",
    "ta-onta", "redis-context", "spacetime", "graphiti-runtime",
  ],
  UF: [
    "harness-selftest", "honesty-lint",
    "gateway", "gateway-contract", "gateway-methods", "live-wire",
    "ta-onta", "redis-context", "spacetime", "graphiti-runtime",
    "app-typecheck", "app-test", "app-build", "app-smoke", "app-ui-flow",
    "carrier-tokens",
  ],
  // harness-g-class (Architect-ordered, 2026-07-12): the live-graph gate. In
  // practice G is layered ON a base K/W/UF/D class via `graphLiveTracks` (a
  // graph-truth track keeps its base class AND additionally runs graph-live);
  // this entry defines the standalone gate should a track ever be set to "G".
  G: ["harness-selftest", "honesty-lint", "graph-live"],
};

/**
 * Union of the class scopes for the given task ids; null = full gate.
 * Graph-truth tracks (verification-classes.json `graphLiveTracks`) keep their
 * base K/W/UF/D scope AND additionally include the `graph-live` suite — a
 * graph-bypass tranche cannot produce a PASS record, so it cannot close.
 */
export function scopeForTasks(taskIds, planDir) {
  let manifest;
  try {
    manifest = JSON.parse(
      readFileSync(join(planDir, "plan.runs", "verification-classes.json"), "utf8"),
    );
  } catch {
    return null; // no class registry — run the full gate
  }
  const classes = manifest.classes ?? {};
  const graphLiveTracks = new Set(
    Array.isArray(manifest.graphLiveTracks) ? manifest.graphLiveTracks.map(String) : [],
  );
  const suites = new Set();
  for (const taskId of taskIds) {
    const track = taskId.split(".")[0];
    const cls = classes[track];
    const scoped = CLASS_SUITES[cls];
    if (!scoped) return null; // unknown class — fail open to the full gate
    for (const suite of scoped) suites.add(suite);
    if (graphLiveTracks.has(track)) suites.add("graph-live");
  }
  return [...suites];
}

/** Backticked shell fragments on the Verify line(s) of a tranche body. */
export function extractVerifyCommands(body) {
  const commands = [];
  for (const line of body.split("\n")) {
    if (!/\bVerify:/i.test(line)) continue;
    for (const match of line.matchAll(/`([^`]+)`/g)) {
      const fragment = match[1].trim();
      // command-shaped: starts with a known runner, not a bare path/flag
      if (/^(node|pnpm|npm|cargo|make|sh|bash|python3?|rg|npx|echo|exit)\b/.test(fragment)) {
        commands.push(fragment);
      }
    }
  }
  return commands;
}

/** Resolve a task's Verify text + commands from a plan folder or single .md. */
export function resolveTaskVerify(taskId, planPath = DEFAULT_PLAN) {
  const stats = statSync(planPath);
  if (stats.isDirectory()) {
    const index = JSON.parse(readFileSync(join(planPath, "plan.index.json"), "utf8"));
    const tasks = index.tasks ?? [];
    const task = (Array.isArray(tasks) ? tasks : Object.values(tasks)).find(
      (t) => t.id === taskId,
    );
    if (!task) throw new Error(`task ${taskId} not found in ${planPath}`);
    const body = task.body ?? "";
    return { taskId, verifyText: body, commands: extractVerifyCommands(body), file: task.file ?? null };
  }
  // single-file plan: take the section from the line naming the task id to the
  // next task-looking line, and use its Verify line(s)
  const text = readFileSync(planPath, "utf8");
  const lines = text.split("\n");
  const idPattern = new RegExp(`(^|[^\\w.])${taskId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^\\w.]|$)`);
  const start = lines.findIndex((line) => idPattern.test(line));
  if (start === -1) throw new Error(`task ${taskId} not found in ${planPath}`);
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^\s*[-*]?\s*(\*\*)?T?\d+(\.\d+)*\s*[—-]|^#{1,3} /.test(lines[i]) && /T\d/.test(lines[i])) {
      end = i;
      break;
    }
  }
  const section = lines.slice(start, end).join("\n");
  return { taskId, verifyText: section, commands: extractVerifyCommands(section), file: planPath };
}

/* Gate-lane lock: the verify gate spawns real gateways on fixed ports and
 * real tmux sessions, so exactly one verify run may execute machine-wide.
 * mkdir is the atomic acquire; a lock whose recorded pid is dead is stale
 * and stolen. Concurrent sessions queue here instead of colliding. */
const GATE_LOCK_DIR = join(REPO_ROOT, ".codex", "verify.lock");

function pidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export async function acquireGateLock(owner) {
  for (;;) {
    try {
      mkdirSync(GATE_LOCK_DIR);
      writeFileSync(
        join(GATE_LOCK_DIR, "holder.json"),
        JSON.stringify({ pid: process.pid, owner, at: new Date().toISOString() }),
      );
      return;
    } catch {
      let holder = null;
      try {
        holder = JSON.parse(readFileSync(join(GATE_LOCK_DIR, "holder.json"), "utf8"));
      } catch {
        // holder file not written yet or unreadable — treat as live briefly
      }
      if (holder && !pidAlive(holder.pid)) {
        try {
          rmSync(GATE_LOCK_DIR, { recursive: true, force: true });
          console.log(`[verify-tranche] stole stale gate lock (dead pid ${holder.pid})`);
          continue;
        } catch { /* another process stole it first */ }
      }
      console.log(
        `[verify-tranche] gate lane held by ${holder?.owner ?? "unknown"} (pid ${holder?.pid ?? "?"}) — waiting`,
      );
      await new Promise((r) => setTimeout(r, 10_000));
    }
  }
}

export function releaseGateLock() {
  try {
    rmSync(GATE_LOCK_DIR, { recursive: true, force: true });
  } catch { /* already gone */ }
}

function runShell(command, cwd) {
  return new Promise((resolveRun) => {
    const child = spawn("sh", ["-c", command], { cwd, env: process.env, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    const onChunk = (chunk) => {
      output += String(chunk);
    };
    child.stdout.on("data", onChunk);
    child.stderr.on("data", onChunk);
    child.on("error", (err) => resolveRun({ code: 1, output: `${output}\n[spawn error] ${err.message}` }));
    child.on("close", (code) => resolveRun({ code: code ?? 1, output }));
  });
}

function runArgv(argv, cwd) {
  return runShell(argv.map((part) => (/\s/.test(part) ? JSON.stringify(part) : part)).join(" "), cwd);
}

function clip(output) {
  if (output.length <= MAX_RECORDED_OUTPUT) return output;
  return `${output.slice(0, MAX_RECORDED_OUTPUT)}\n… [truncated at ${MAX_RECORDED_OUTPUT} bytes]`;
}

/**
 * Execute tranche commands then gate commands; write the verbatim record.
 * Returns { verdict: 'PASS' | 'REFUSED', recordPath }.
 */
export async function runVerification({
  taskId,
  commands,
  gateCommands,
  cwd = REPO_ROOT,
  outDir,
  verifyText = "",
  owner = null,
}) {
  const sections = [];
  let refused = false;

  for (const command of commands) {
    const { code, output } = await runShell(command, cwd);
    sections.push({ title: `tranche check: \`${command}\` (cwd ${cwd})`, code, output });
    if (code !== 0) refused = true;
  }
  if (commands.length === 0) {
    sections.push({
      title: "tranche check: (no machine-runnable commands on the Verify line — gate only)",
      code: 0,
      output: verifyText.trim(),
    });
  }
  for (const gate of gateCommands) {
    if (refused) break; // already refusing; don't burn the full gate
    const { code, output } = await runArgv(gate, REPO_ROOT);
    sections.push({ title: `gate: \`${gate.join(" ")}\``, code, output });
    if (code !== 0) refused = true;
  }

  const verdict = refused ? "REFUSED" : "PASS";
  const record = [
    `# Verification record — ${taskId}`,
    ``,
    `- verdict: **${verdict}**${refused ? " (a pass may not be recorded while any stage is red)" : ""}`,
    `- verifiedAt: ${new Date().toISOString()}`,
    `- verifier: verify-tranche.mjs (independent re-execution; verifier ≠ closer)`,
    `- verifier-owner: ${owner ?? "unspecified"}`,
    ``,
    ...sections.flatMap((section) => [
      `## ${section.title}`,
      ``,
      `exit code: ${section.code}`,
      ``,
      "```",
      clip(section.output.trim()),
      "```",
      ``,
    ]),
  ].join("\n");

  mkdirSync(outDir, { recursive: true });
  const recordPath = join(outDir, `${taskId}.md`);
  writeFileSync(recordPath, record);
  return { verdict, recordPath };
}

async function main() {
  const argv = process.argv.slice(2);
  const taskIds = [];
  let plan = DEFAULT_PLAN;
  let cwd = REPO_ROOT;
  let only = null;
  let full = false;
  let owner = process.env.M_DEV_VERIFIER || process.env.M_DEV_OWNER || process.env.USER || "verify-tranche";
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--plan") plan = resolve(REPO_ROOT, argv[(i += 1)]);
    else if (argv[i] === "--cwd") cwd = resolve(REPO_ROOT, argv[(i += 1)]);
    else if (argv[i] === "--only") only = argv[(i += 1)];
    else if (argv[i] === "--full") full = true;
    else if (argv[i] === "--owner") owner = argv[(i += 1)];
    else if (argv[i].startsWith("--")) throw new Error(`unknown argument '${argv[i]}'`);
    else taskIds.push(argv[i]);
  }
  if (taskIds.length === 0) {
    console.error("usage: node .codex/scripts/verify-tranche.mjs <TASK_ID> [<TASK_ID>…] [--plan <folder-or-md>] [--cwd <dir>] [--only <suites>] [--owner <verifier-id>]");
    process.exit(2);
  }

  await acquireGateLock(owner);
  process.on("exit", releaseGateLock);
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      releaseGateLock();
      process.exit(130);
    });
  }

  const planDir = statSync(plan).isDirectory() ? plan : DEFAULT_PLAN;
  const verifyAll = ["node", join(SCRIPT_DIR, "verify-all.mjs"), "--quiet"];
  if (only) {
    verifyAll.push("--only", only);
  } else if (!full) {
    const scoped = scopeForTasks(taskIds, planDir);
    if (scoped) {
      verifyAll.push("--only", scoped.join(","));
      console.log(`[verify-tranche] class-scoped gate: ${scoped.join(",")} (use --full for the whole gate)`);
    }
  }
  const gateCommands = [
    ["node", join(SCRIPT_DIR, "lint-test-honesty.mjs")],
    verifyAll,
  ];
  const outDir = join(planDir, "plan.runs", "verifications");

  if (taskIds.length === 1) {
    const taskId = taskIds[0];
    const resolved = resolveTaskVerify(taskId, plan);
    console.log(`[verify-tranche] ${taskId}: ${resolved.commands.length} command(s) from the Verify line`);
    const { verdict, recordPath } = await runVerification({
      taskId,
      commands: resolved.commands,
      gateCommands,
      cwd,
      outDir,
      verifyText: resolved.verifyText,
      owner,
    });
    console.log(`[verify-tranche] ${verdict} — record: ${recordPath}`);
    process.exit(verdict === "PASS" ? 0 : 1);
  }

  // Batched mode: each task's OWN Verify-line commands run per task; the
  // expensive shared gates (honesty-lint + verify-all) run ONCE, fresh, and
  // every record carries the same verbatim gate sections. One green gate
  // honestly backs every task verified against it — the per-task work is
  // the Verify line, not a re-run of the whole repo gate per task id.
  const perTask = taskIds.map((taskId) => {
    const resolved = resolveTaskVerify(taskId, plan);
    console.log(`[verify-tranche] ${taskId}: ${resolved.commands.length} command(s) from the Verify line`);
    return { taskId, resolved, sections: [], refused: false };
  });

  for (const task of perTask) {
    for (const command of task.resolved.commands) {
      const { code, output } = await runShell(command, cwd);
      task.sections.push({ title: `tranche check: \`${command}\` (cwd ${cwd})`, code, output });
      if (code !== 0) task.refused = true;
    }
    if (task.resolved.commands.length === 0) {
      task.sections.push({
        title: "tranche check: (no machine-runnable commands on the Verify line — gate only)",
        code: 0,
        output: task.resolved.verifyText.trim(),
      });
    }
  }

  const gateSections = [];
  let gateRefused = false;
  const anyTaskGreen = perTask.some((t) => !t.refused);
  for (const gate of gateCommands) {
    if (gateRefused || !anyTaskGreen) break;
    const { code, output } = await runArgv(gate, REPO_ROOT);
    gateSections.push({ title: `gate: \`${gate.join(" ")}\` (shared batch run)`, code, output });
    if (code !== 0) gateRefused = true;
  }

  mkdirSync(outDir, { recursive: true });
  let exitCode = 0;
  for (const task of perTask) {
    const refused = task.refused || gateRefused || !anyTaskGreen;
    const verdict = refused ? "REFUSED" : "PASS";
    if (verdict !== "PASS") exitCode = 1;
    const sections = [...task.sections, ...gateSections];
    const record = [
      `# Verification record — ${task.taskId}`,
      ``,
      `- verdict: **${verdict}**${refused ? " (a pass may not be recorded while any stage is red)" : ""}`,
      `- verifiedAt: ${new Date().toISOString()}`,
      `- verifier: verify-tranche.mjs (independent re-execution; verifier ≠ closer; batched gate run over ${taskIds.join(", ")})`,
      `- verifier-owner: ${owner ?? "unspecified"}`,
      ``,
      ...sections.flatMap((section) => [
        `## ${section.title}`,
        ``,
        `exit code: ${section.code}`,
        ``,
        "```",
        clip(section.output.trim()),
        "```",
        ``,
      ]),
    ].join("\n");
    const recordPath = join(outDir, `${task.taskId}.md`);
    writeFileSync(recordPath, record);
    console.log(`[verify-tranche] ${verdict} — record: ${recordPath}`);
  }
  process.exit(exitCode);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
