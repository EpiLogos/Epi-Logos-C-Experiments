#!/usr/bin/env node
/**
 * Coordinate: #5/S0 (verification harness — Track 00.T1, cycle-3 full rerun)
 * Residency: .codex/scripts/verify-all.mjs
 * Position (#n): #5 — Integration; the single gate every rerun tranche must pass
 * Actualises: [[00-verification-harness]] T1 — one command, real exit codes,
 *   per-suite table over the real system suites (no manifest/string proxies);
 *   [[00-verification-harness-hardening]] T8 — the offline backend S-stack
 *   crates (epi-kernel-contract, S0–S5) gated as first-class suites;
 *   T10 — env-guarded gnostic offline pytest lane + spacetime module crate;
 *   T18 — the 43.T43.5 boundary/coordinate-header lint (a) and the Track-30
 *   carrier token-consumption lint (b) as gate stages.
 * Public surface: SUITES, parseArgs, parseTestCount, runSuite, runAll, formatTable;
 *   CLI: node .codex/scripts/verify-all.mjs [--only a,b] [--quiet]
 * Does NOT own: the suites' own pass/fail law (each suite's repo owns it);
 *   tranche verification recording (verify-tranche.mjs, T6).
 * Contract: a suite that does not run is a FAIL unless excluded by an explicit --only.
 */

import { execFileSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(SCRIPT_DIR, "..", "..");

const SUITE_TIMEOUT_MS = Number(process.env.VERIFY_ALL_TIMEOUT_MS ?? 40 * 60 * 1000);

/**
 * The suite inventory named by Track 00.T1, in run order. Later Track-00
 * tranches (T2 live-wire, T3 honesty lint, T4 kernel truth) register here —
 * verify-all is the one gate, and absence of a registered stage is a FAIL.
 */
export const SUITES = [
  // T16: the gate runs its own unit tests FIRST — a broken harness must
  // never adjudicate the system (self-integrity before coverage).
  {
    id: "harness-selftest",
    label: "harness self-tests node --test (T16)",
    cwd: REPO_ROOT,
    commands: [["node", "--test", ".codex/scripts/__tests__/*.test.mjs"]],
  },
  {
    id: "epi-lib",
    label: "epi-lib (C) make test",
    cwd: join(REPO_ROOT, "Body", "S", "S0", "epi-lib"),
    commands: [["make", "test"]],
  },
  {
    id: "portal-core",
    label: "portal-core cargo test",
    cwd: join(REPO_ROOT, "Body", "S", "S0", "portal-core"),
    commands: [["cargo", "test"]],
  },
  {
    id: "epi-cli",
    label: "epi-cli cargo test",
    cwd: join(REPO_ROOT, "Body", "S", "S0", "epi-cli"),
    commands: [["cargo", "test"]],
  },
  {
    id: "schemas",
    label: "epi-cli/schemas pnpm test",
    cwd: join(REPO_ROOT, "Body", "S", "S0", "epi-cli", "schemas"),
    commands: [["pnpm", "test"]],
  },
  // --- T8 (hardening ledger Axis A): the offline backend S-stack crates.
  // Live-infra paths stay behind their own #[ignore]/Reachability fences;
  // a plain `cargo test` here is offline-green by construction.
  {
    id: "kernel-contract",
    label: "epi-kernel-contract cargo test",
    cwd: join(REPO_ROOT, "Body", "S", "epi-kernel-contract"),
    commands: [["cargo", "test"]],
  },
  {
    id: "s0-settings",
    label: "S0 settings cargo test",
    cwd: join(REPO_ROOT, "Body", "S", "S0", "settings"),
    commands: [["cargo", "test"]],
  },
  {
    id: "gemini-embedding",
    label: "S0 gemini-embedding cargo test",
    cwd: join(REPO_ROOT, "Body", "S", "S0", "gemini-embedding"),
    commands: [["cargo", "test"]],
  },
  {
    id: "hen-compiler-core",
    label: "S1 hen-compiler-core cargo test",
    cwd: join(REPO_ROOT, "Body", "S", "S1", "hen-compiler-core"),
    commands: [["cargo", "test"]],
  },
  {
    id: "graph-schema",
    label: "S2 graph-schema cargo test",
    cwd: join(REPO_ROOT, "Body", "S", "S2", "graph-schema"),
    commands: [["cargo", "test"]],
  },
  {
    id: "graph-services",
    label: "S2 graph-services cargo test",
    cwd: join(REPO_ROOT, "Body", "S", "S2", "graph-services"),
    commands: [["cargo", "test"]],
  },
  {
    id: "gateway",
    label: "S3 gateway cargo test",
    cwd: join(REPO_ROOT, "Body", "S", "S3", "gateway"),
    commands: [["cargo", "test"]],
  },
  {
    id: "gateway-contract",
    label: "S3 gateway-contract cargo test",
    cwd: join(REPO_ROOT, "Body", "S", "S3", "gateway-contract"),
    commands: [["cargo", "test"]],
  },
  {
    id: "redis-context",
    label: "S3 redis-context cargo test",
    cwd: join(REPO_ROOT, "Body", "S", "S3", "redis-context"),
    commands: [["cargo", "test"]],
  },
  {
    id: "graphiti-runtime",
    label: "S3/S5 graphiti-runtime cargo test",
    cwd: join(REPO_ROOT, "Body", "S", "S3", "graphiti-runtime"),
    commands: [["cargo", "test"]],
  },
  // T10: the SpacetimeDB 2.x module crate. Host-side `cargo test` runs the
  // real schema/reducer declaration corpus (arena tables, being-pattern
  // projection — 11 tests); the wasm32 build/publish path stays a deploy-time
  // concern (`spacetime build`), not gated here.
  {
    id: "spacetime",
    label: "S3 epi-spacetime-module cargo test",
    cwd: join(REPO_ROOT, "Body", "S", "S3", "epi-spacetime-module"),
    commands: [["cargo", "test"]],
  },
  // T9: the S4 corpus is cwd-bound to the repo root (tests read
  // Body/S/S5/... fixtures via root-relative paths) — cwd MUST stay REPO_ROOT.
  {
    id: "ta-onta",
    label: "S4 ta-onta + pi-agent node --test",
    cwd: REPO_ROOT,
    commands: [
      ["node", "--test", "Body/S/S4/**/*.test.ts", "Body/S/S4/**/*.test.mjs"],
    ],
  },
  {
    id: "epii-agent-core",
    label: "S5 epii-agent-core cargo test",
    cwd: join(REPO_ROOT, "Body", "S", "S5", "epii-agent-core"),
    commands: [["cargo", "test"]],
  },
  {
    id: "epii-review-core",
    label: "S5 epii-review-core cargo test",
    cwd: join(REPO_ROOT, "Body", "S", "S5", "epii-review-core"),
    commands: [["cargo", "test"]],
  },
  {
    id: "epii-autoresearch-core",
    // resonance_ebm per the crate's own AGENTS.md verification law — the
    // feature-gated 12 tests must not go dark again.
    label: "S5 epii-autoresearch-core cargo test --features resonance_ebm",
    cwd: join(REPO_ROOT, "Body", "S", "S5", "epii-autoresearch-core"),
    commands: [["cargo", "test", "--features", "resonance_ebm"]],
  },
  // T10: the S5 gnostic Python lane, OFFLINE tier — the crate-local venv
  // (Body/S/S5/epi-gnostic/.venv) runs pytest with SKIP_NEO4J_TESTS=true so
  // every graph/Gemini-bound test self-skips (15 passed / 16 skipped basis).
  // LIVE lane (documented, run on demand, NOT gated): bring up the S2
  // substrate first, then run the same pytest without the skip env —
  //   docker compose -f docker-compose.epi-s2.yml up -d        (repo root)
  //   cd Body/S/S5/epi-gnostic && .venv/bin/python -m pytest
  {
    id: "gnostic-offline",
    label: "S5 epi-gnostic pytest offline lane (SKIP_NEO4J_TESTS)",
    cwd: join(REPO_ROOT, "Body", "S", "S5", "epi-gnostic"),
    env: { SKIP_NEO4J_TESTS: "true" },
    commands: [
      [
        join(REPO_ROOT, "Body", "S", "S5", "epi-gnostic", ".venv", "bin", "python"),
        "-m",
        "pytest",
        "-q",
      ],
    ],
  },
  {
    id: "app-typecheck",
    label: "pratibimba-app pnpm typecheck",
    cwd: join(REPO_ROOT, "Body", "M", "pratibimba-app"),
    commands: [["pnpm", "typecheck"]],
  },
  {
    id: "app-test",
    label: "pratibimba-app pnpm test",
    cwd: join(REPO_ROOT, "Body", "M", "pratibimba-app"),
    commands: [["pnpm", "test"]],
  },
  {
    id: "app-build",
    label: "pratibimba-app pnpm build",
    cwd: join(REPO_ROOT, "Body", "M", "pratibimba-app"),
    commands: [["pnpm", "build"]],
  },
  // Track-00 hardening: the behavioral boot gate (real spawned gateway on
  // 18797 + live GatewayClient wire smoke) promoted into the repo gate.
  {
    id: "app-smoke",
    label: "pratibimba-app pnpm smoke (boot gate)",
    cwd: join(REPO_ROOT, "Body", "M", "pratibimba-app"),
    commands: [["pnpm", "smoke"]],
  },
  // Track-00 hardening: real-UI drivable-loop specs — Playwright drives the
  // Vite face in Chromium against a REAL `epi gate start` (e2e port 18933)
  // and a real-filesystem vault sidecar (18934). tauri-driver has no macOS
  // support, so the Tauri shell itself stays covered by app-smoke.
  {
    id: "app-ui-flow",
    label: "pratibimba-app pnpm test:e2e (Playwright real-UI flow)",
    cwd: join(REPO_ROOT, "Body", "M", "pratibimba-app"),
    commands: [["pnpm", "test:e2e"]],
  },
  {
    id: "live-wire",
    label: "live-wire projection harness (T2)",
    cwd: join(REPO_ROOT, "Body", "M", "pratibimba-app"),
    commands: [["node", "scripts/live-wire.mjs"]],
  },
  {
    id: "gateway-methods",
    label: "gateway-method probe + expected-present ratchet (T11)",
    cwd: REPO_ROOT,
    commands: [["node", ".codex/scripts/gateway-method-gate.mjs"]],
  },
  // T18a: the 43.T43.5 mechanical boundary lint — forbidden-imports matrix,
  // Cargo description gaps, 43.2 coordinate-header presence, C `.h` < `.c`
  // size law. The script owns its own allowlists; green on the current repo.
  {
    id: "lint-boundaries",
    label: "boundary + coordinate-header lint (43.T43.5, T18)",
    cwd: join(REPO_ROOT, "Body", "M", "epi-theia", "extensions"),
    commands: [["node", "scripts/lint-boundaries.mjs"]],
  },
  // T18b: the Track-30 carrier token-consumption lint — raw hex/font-size/ms
  // literals live ONLY in the token sources (pratibimba-app src/styles.css +
  // src/ui/tokens.ts); test files are exempt (the lint documents why).
  {
    id: "carrier-tokens",
    label: "carrier token-consumption lint (Track 30, T18b)",
    cwd: REPO_ROOT,
    commands: [["node", ".codex/scripts/lint-carrier-tokens.mjs"]],
  },
  {
    id: "honesty-lint",
    label: "anti-fraud test + evidence lint (T3)",
    cwd: REPO_ROOT,
    commands: [["node", ".codex/scripts/lint-test-honesty.mjs"]],
  },
  {
    id: "kernel-truth",
    label: "kernel truth red-test stage (T4)",
    cwd: REPO_ROOT,
    commands: [["node", ".codex/scripts/kernel-truth.mjs"]],
  },
];

export function parseArgs(argv, suites = SUITES) {
  const opts = { only: null, quiet: false };
  const known = new Set(suites.map((s) => s.id));
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--only") {
      const value = argv[i + 1];
      if (!value) throw new Error("--only requires a comma-separated suite list");
      i += 1;
      opts.only = value.split(",").map((s) => s.trim()).filter(Boolean);
      for (const id of opts.only) {
        if (!known.has(id)) {
          throw new Error(`unknown suite '${id}' in --only (known: ${[...known].join(", ")})`);
        }
      }
    } else if (arg === "--quiet") {
      opts.quiet = true;
    } else {
      throw new Error(`unknown argument '${arg}'`);
    }
  }
  return opts;
}

/** Best-effort test count from a suite's combined output; null when unknown. */
export function parseTestCount(output) {
  const vitest = output.match(/^\s*Tests\s+.*?(\d+)\s+passed/m);
  if (vitest) return Number(vitest[1]);
  // node:test summary — spec reporter ("ℹ pass N") or tap reporter ("# pass N")
  const nodeTest = output.match(/^\s*(?:ℹ|#) pass (\d+)\s*$/m);
  if (nodeTest) return Number(nodeTest[1]);
  let sum = 0;
  let found = false;
  for (const match of output.matchAll(/(\d+)\s+passed/g)) {
    sum += Number(match[1]);
    found = true;
  }
  return found ? sum : null;
}

function runCommand(command, cwd, quiet, extraEnv = null) {
  return new Promise((resolveRun) => {
    const [bin, ...args] = command;
    let output = "";
    let settled = false;
    const child = spawn(bin, args, {
      cwd,
      env: extraEnv ? { ...process.env, ...extraEnv } : process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const finish = (code, note) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolveRun({ code, output, note: note ?? null });
    };
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      finish(1, `timed out after ${SUITE_TIMEOUT_MS}ms`);
    }, SUITE_TIMEOUT_MS);
    const onChunk = (chunk) => {
      output += String(chunk);
      if (!quiet) process.stdout.write(chunk);
    };
    child.stdout.on("data", onChunk);
    child.stderr.on("data", onChunk);
    child.on("error", (err) => finish(1, `failed to spawn '${command.join(" ")}': ${err.message}`));
    child.on("close", (code) => finish(code ?? 1));
  });
}

export async function runSuite(suite, { quiet = false } = {}) {
  const startedAt = Date.now();
  if (!existsSync(suite.cwd)) {
    return {
      id: suite.id,
      label: suite.label,
      tests: null,
      result: "FAIL",
      seconds: 0,
      note: `suite directory missing: ${suite.cwd}`,
    };
  }
  let combined = "";
  for (const command of suite.commands) {
    if (!quiet) console.log(`\n=== [verify-all] ${suite.id}: ${command.join(" ")} (${suite.cwd}) ===`);
    const { code, output, note } = await runCommand(command, suite.cwd, quiet, suite.env ?? null);
    combined += output;
    if (code !== 0) {
      if (quiet) {
        // Never hide a failure's identity: surface the failing suite's tail
        // even in quiet mode (flake chases died on --quiet swallowing names).
        const tail = output.split("\n").filter((line) =>
          /FAILED|failures:|panicked at|error\[|error: test failed|✖|^not ok|\[live-wire\] FAIL|\[gateway-method-gate\] FAIL/.test(line),
        );
        for (const line of tail.slice(0, 30)) console.error(`[verify-all] ${suite.id}> ${line}`);
      }
      return {
        id: suite.id,
        label: suite.label,
        tests: parseTestCount(combined),
        result: "FAIL",
        seconds: (Date.now() - startedAt) / 1000,
        note: note ?? `'${command.join(" ")}' exited ${code}`,
      };
    }
  }
  return {
    id: suite.id,
    label: suite.label,
    tests: parseTestCount(combined),
    result: "PASS",
    seconds: (Date.now() - startedAt) / 1000,
    note: null,
  };
}

export async function runAll({ suites = SUITES, only = null, quiet = false } = {}) {
  const results = [];
  for (const suite of suites) {
    if (only && !only.includes(suite.id)) {
      results.push({
        id: suite.id,
        label: suite.label,
        tests: null,
        result: "SKIP(--only)",
        seconds: 0,
        note: "explicitly excluded via --only",
      });
      continue;
    }
    results.push(await runSuite(suite, { quiet }));
  }
  const ok = results.every((r) => r.result === "PASS" || r.result === "SKIP(--only)");
  return { results, ok };
}

export function formatTable(results) {
  const rows = [
    ["suite", "tests", "result", "seconds"],
    ...results.map((r) => [
      r.id,
      r.tests === null ? "—" : String(r.tests),
      r.result,
      r.seconds.toFixed(1),
    ]),
  ];
  const widths = rows[0].map((_, col) => Math.max(...rows.map((row) => row[col].length)));
  const line = (row) => row.map((cell, col) => cell.padEnd(widths[col])).join("  ·  ");
  const separator = widths.map((w) => "-".repeat(w)).join("--·--");
  return [line(rows[0]), separator, ...rows.slice(1).map(line)].join("\n");
}

/**
 * Orphaned (ppid 1) gateway daemons from THIS repo's debug binary poison the
 * fixed-port test corpus (twice today: month-old strays on 18794/18832).
 * Detect them from `ps` output; main() kills them loudly before suites run.
 */
export function parseOrphanGateways(psOutput, repoRoot = REPO_ROOT) {
  const needle = `${repoRoot}/Body/S/S0/epi-cli/target/debug/epi`;
  const orphans = [];
  for (const line of psOutput.split("\n")) {
    const match = line.match(/^\s*(\d+)\s+1\s+(.*)$/);
    if (!match) continue;
    const command = match[2].trim();
    if (command.startsWith(needle) && /\bgate\b.*\bstart\b/.test(command)) {
      orphans.push({ pid: Number(match[1]), command });
    }
  }
  return orphans;
}

function sweepOrphanGateways() {
  const { execFileSync } = require_child_process();
  let psOutput = "";
  try {
    psOutput = execFileSync("ps", ["ax", "-o", "pid,ppid,command"], { encoding: "utf8" });
  } catch {
    return;
  }
  for (const orphan of parseOrphanGateways(psOutput)) {
    console.log(`[verify-all] clearing orphaned gateway daemon pid ${orphan.pid}: ${orphan.command}`);
    try {
      process.kill(orphan.pid, "SIGTERM");
    } catch {
      /* already gone */
    }
  }
}

let childProcessModule = null;
function require_child_process() {
  childProcessModule ??= { execFileSync };
  return childProcessModule;
}

async function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`[verify-all] ${err.message}`);
    process.exit(2);
  }
  sweepOrphanGateways();
  const startedAt = Date.now();
  const { results, ok } = await runAll(opts);
  console.log(`\n[verify-all] repo: ${REPO_ROOT}`);
  console.log(formatTable(results));
  for (const r of results) {
    if (r.note && r.result === "FAIL") console.log(`[verify-all] ${r.id}: ${r.note}`);
  }
  console.log(
    `[verify-all] ${ok ? "GREEN" : "RED"} in ${((Date.now() - startedAt) / 1000).toFixed(1)}s` +
      (opts.only ? ` (--only ${opts.only.join(",")})` : ""),
  );
  process.exit(ok ? 0 : 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
