import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  assessPlan,
  buildIndex,
  claimGuardViolations,
  classViolations,
  discoverPlanFolder,
  drCitationViolations,
  extractDrCitations,
  loadVerificationClasses,
  nowIsStale,
  parseArgs,
  parseReceipt,
  parseTrackTasks,
  presentDayId,
  readActiveDevelopmentContext,
  readVerificationRecord,
  receiptViolations,
  run,
} from "../m-dev-plan-assess.mjs";

// Shared decision-register fixture for the DR-citation fail-closed guards.
const registerDir = mkdtempSync(join(tmpdir(), "m-dev-registers-"));
const registerPath = join(registerDir, "register.md");
writeFileSync(
  registerPath,
  `# Fixture decision register
- DR-TEST-1 — alpha decision (VALIDATED 2026-07-01)
- DR-TEST-2 — beta decision, proposed only
`,
);
process.env.M_DEV_DR_REGISTERS = registerPath;

const VALID_RECEIPT = JSON.stringify({
  command: 'node -e "process.exit(0)"',
  exitCode: 0,
  testsPassed: 3,
  testsFailed: 0,
  keyPaths: ["Body/S/S0/fixture.rs"],
});

function setTaskStatus(planFolder, taskId, status) {
  const statePath = join(planFolder, "plan.state.json");
  const state = JSON.parse(readFileSync(statePath, "utf8"));
  state.tasks[taskId] = { ...(state.tasks[taskId] ?? { evidence: [] }), status };
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
}

function readTask(planFolder, taskId) {
  return JSON.parse(readFileSync(join(planFolder, "plan.state.json"), "utf8")).tasks[taskId];
}

function writeVerificationRecord(planFolder, taskId, { verdict = "PASS", verifierOwner = "verifier-9", verifiedAt } = {}) {
  const dir = join(planFolder, "plan.runs", "verifications");
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, `${taskId}.md`),
    `# Verification record — ${taskId}

- verdict: **${verdict}**
- verifiedAt: ${verifiedAt ?? new Date(Date.now() + 2000).toISOString()}
- verifier: verify-tranche.mjs (independent re-execution; verifier ≠ closer)
- verifier-owner: ${verifierOwner}
`,
  );
}

function makePlanSet() {
  const root = mkdtempSync(join(tmpdir(), "m-dev-plan-"));
  const planFolder = join(root, "docs", "plans", "2026-05-31-example-tracks");
  mkdirSync(planFolder, { recursive: true });
  writeFileSync(
    join(planFolder, "01-foundation.md"),
    `# Track 01 - Foundation

## Tranches

1. **T0 - Baseline Contract Inventory (S, 1 day).**

   Deliverables:

   - Inspect \`Body/S/S0/example.rs\`.

2. **T1 - Bridge Contract (M, 1 week; gated by Track 02 Tranches 0-1).**

   Deliverables:

   - Update \`Body/S/S0/bridge.rs\`.
`,
  );
  writeFileSync(
    join(planFolder, "02-surface.md"),
    `# Track 02 - Surface

## Tranches

1. **Tranche 0 - Surface Preflight (S, 1 day).**

   Deliverables:

   - Inspect \`Body/M/example.ts\`.

2. **Tranche 1 - Surface Slice (M, 1 week).**

   Deliverables:

   - Update \`Body/M/surface.ts\`.
`,
  );
  return { root, planFolder };
}

test("discovers newest numbered plan set under docs/plans", () => {
  const { root, planFolder } = makePlanSet();
  assert.equal(discoverPlanFolder(root, null), planFolder);
});

test("parses T and Tranche task headings with dependencies and write scopes", () => {
  const track = {
    id: "01",
    file: "01-foundation.md",
    path: "docs/plans/example/01-foundation.md",
    title: "Track 01",
  };
  const content = `# Track 01

1. **Tranche 0 - Start (S, 1 day).**

   Work in \`Body/S/S0/foo.rs\`.

2. **T1 - Continue (M, 1 week; gated by Track 02 Tranches 0-1).**

   Work in \`Body/S/S0/bar.rs\`.
`;
  const tasks = parseTrackTasks(track, content);
  assert.equal(tasks.length, 2);
  assert.equal(tasks[0].id, "01.T0");
  assert.equal(tasks[0].title, "Start (S, 1 day)");
  assert.ok(tasks[0].writeScopes.includes("Body/S/S0/**"));
  assert.deepEqual(tasks[1].dependsOn, ["02.T0", "02.T1"]);
});

test("parses bare bold tranche headings used by Track 03", () => {
  const track = {
    id: "03",
    file: "03-s3.md",
    path: "docs/plans/example/03-s3.md",
    title: "Track 03",
  };
  const content = `# Track 03

## Tranches

**Tranche 1 - Projection contract freeze.**

Work in \`Body/S/S3/gateway-contract\`.

**Tranche 6.5 - S1 vault gateway surface.**

Work in \`Body/S/S3/gateway\`.
`;
  const tasks = parseTrackTasks(track, content);
  assert.equal(tasks.length, 2);
  assert.equal(tasks[0].id, "03.T1");
  assert.equal(tasks[0].title, "Projection contract freeze");
  assert.equal(tasks[1].id, "03.T6.5");
  assert.equal(tasks[1].title, "S1 vault gateway surface");
});

test("parses bold tranche titles that contain single asterisks inside backticks", () => {
  // Regression: Track 03 T6.5 in 03-s3-gateway-and-spacetimedb.md has a title
  // like `s1'.vault.*` + `s1'.semantic.*` — single asterisks inside backticks.
  // The earlier `[^*\n]+` regex stopped at the first internal `*` and silently
  // dropped the heading. We now allow single asterisks while still terminating
  // on the closing `**`. Trailing inline content after the closing `**` (e.g.
  // `(per IOD-18, IOD-19)`) must not block the match either.
  const track = {
    id: "03",
    file: "03-s3.md",
    path: "docs/plans/example/03-s3.md",
    title: "Track 03",
  };
  const content = `# Track 03

## Tranches

**Tranche 6 - Graphiti runtime compatibility and temporal reference bridge.**

Work in \`Body/S/S3/graphiti-runtime\`.

**Tranche 6.5 - S1 vault gateway surface (\`s1'.vault.*\` + \`s1'.semantic.*\`) over Hen substrate.** (per IOD-18, IOD-19)

Work in \`Body/S/S3/gateway\`.

**Tranche 7 - Multi-client soak.**

Work in \`Body/S/S3/gateway\`.
`;
  const tasks = parseTrackTasks(track, content);
  assert.equal(tasks.length, 3);
  const ids = tasks.map((task) => task.id);
  assert.deepEqual(ids, ["03.T6", "03.T6.5", "03.T7"]);
  const t65 = tasks.find((task) => task.id === "03.T6.5");
  assert.ok(t65.title.includes("S1 vault gateway surface"));
  assert.ok(t65.title.includes("`s1'.vault.*`"));
});

test("parses markdown tranche headings used by Track 04", () => {
  const track = {
    id: "04",
    file: "04-s5.md",
    path: "docs/plans/example/04-s5.md",
    title: "Track 04",
  };
  const content = `# Track 04

## Tranches

### Tranche 0 — Baseline Characterization and Compatibility Map

Work in \`Body/S/S5/epii-agent-core\`.

### Tranche 1 — Typed Spine Core Schema

Work in \`Body/S/S5/epii-autoresearch-core\`.
`;
  const tasks = parseTrackTasks(track, content);
  assert.equal(tasks.length, 2);
  assert.equal(tasks[0].id, "04.T0");
  assert.equal(tasks[0].title, "Baseline Characterization and Compatibility Map");
  assert.equal(tasks[1].id, "04.T1");
  assert.equal(tasks[1].title, "Typed Spine Core Schema");
});

test("builds index and adds sequential dependencies within each track", () => {
  const { root, planFolder } = makePlanSet();
  const index = buildIndex(planFolder, root);
  const firstTrackSecondTask = index.tasks.find((task) => task.id === "01.T1");
  assert.ok(firstTrackSecondTask.dependsOn.includes("01.T0"));
  assert.ok(firstTrackSecondTask.dependsOn.includes("02.T0"));
  assert.ok(firstTrackSecondTask.dependsOn.includes("02.T1"));
});

test("assesses ready tasks and recommends a ready tranche before later tranches", () => {
  const { root, planFolder } = makePlanSet();
  const assessment = assessPlan({ cwd: root, planFolder, includeGit: false });
  assert.equal(assessment.summary.totalTasks, 4);
  assert.equal(assessment.summary.ready, 2);
  assert.ok(["01.T0", "02.T0"].includes(assessment.recommendedTask.id));
  assert.equal(assessment.recommendedTask.computedStatus, "ready");
});

test("reads active development context from real session state and NOW files", () => {
  const { root } = makePlanSet();
  const nowPath = join(root, "Idea", "Empty", "Present", "02-06-2026", "20260602-120000-test01", "now.md");
  mkdirSync(join(root, ".epi"), { recursive: true });
  mkdirSync(join(root, "Idea", "Empty", "Present", "02-06-2026", "20260602-120000-test01"), { recursive: true });
  writeFileSync(nowPath, "# NOW\n");
  writeFileSync(join(root, "Idea", "Empty", "Present", "02-06-2026", "daily-note.md"), "# Daily\n");
  writeFileSync(
    join(root, ".epi", "session.json"),
    JSON.stringify({
      context: {
        session_id: "20260602-120000-test01",
        day_id: "02-06-2026",
        now_path: nowPath,
      },
    }),
  );

  const context = readActiveDevelopmentContext(root, {});
  assert.equal(context.source, ".epi/session.json");
  assert.equal(context.dayId, "02-06-2026");
  assert.equal(context.sessionId, "20260602-120000-test01");
  assert.equal(context.nowPath, "Idea/Empty/Present/02-06-2026/20260602-120000-test01/now.md");
  assert.equal(context.nowExists, true);
  assert.equal(context.dailyNoteExists, true);
});

test("reads active development context from EPI_NOW_PATH when session state is absent", () => {
  const { root } = makePlanSet();
  const nowPath = join(root, "Idea", "Empty", "Present", "02-06-2026", "20260602-130000-env01", "now.md");
  mkdirSync(join(root, "Idea", "Empty", "Present", "02-06-2026", "20260602-130000-env01"), { recursive: true });
  writeFileSync(nowPath, "# NOW\n");

  const context = readActiveDevelopmentContext(root, { EPI_NOW_PATH: nowPath });
  assert.equal(context.source, "environment");
  assert.equal(context.dayId, "02-06-2026");
  assert.equal(context.sessionId, "20260602-130000-env01");
  assert.equal(context.nowExists, true);
});

test("require-now records a hard stop when no active NOW exists", () => {
  const { root, planFolder } = makePlanSet();
  const assessment = assessPlan({ cwd: root, planFolder, includeGit: false, requireNow: true });
  assert.equal(assessment.activeDevelopmentContext.source, "missing");
  assert.equal(assessment.activeDevelopmentContext.nowExists, false);
  assert.ok(assessment.hardStops.some((stop) => stop.includes("Active NOW context is required")));
});

test("builds a recommended 3-5 task route by simulating dependency completion", () => {
  const { root, planFolder } = makePlanSet();
  const assessment = assessPlan({ cwd: root, planFolder, includeGit: false });
  assert.deepEqual(
    assessment.recommendedRoute.tasks.map((task) => task.id),
    ["01.T0", "02.T0", "02.T1", "01.T1"],
  );
  assert.equal(assessment.recommendedRoute.totalWeight, 8);
  assert.equal(assessment.recommendedRoute.taxingLevel, "balanced");
  assert.equal(assessment.recommendedRoute.tasks[2].modeHint, "consider-subagents-if-approved");
});

test("route marking stores the active route in plan state", () => {
  const { root, planFolder } = makePlanSet();
  const assessment = run(["--plan", planFolder, "--route", "--write", "--no-git"], root);
  assert.deepEqual(
    assessment.state.activeRoute.taskIds,
    assessment.recommendedRoute.tasks.map((task) => task.id),
  );
  assert.equal(assessment.state.activeRoute.status, "active");
  assert.equal(assessment.state.activeRoute.totalWeight, assessment.recommendedRoute.totalWeight);
});

test("active in-progress task is the first task in the recommended route", () => {
  const { root, planFolder } = makePlanSet();
  run(["--plan", planFolder, "--claim", "01.T0", "--write", "--no-git"], root);
  const assessment = assessPlan({ cwd: root, planFolder, includeGit: false });
  assert.equal(assessment.recommendedRoute.tasks[0].id, "01.T0");
  assert.equal(assessment.recommendedRoute.tasks[0].status, "in_progress");
  assert.ok(assessment.recommendedRoute.taskIds.includes("01.T1"));
});

test("in-progress work is a resumable work order, not a global stop", () => {
  const { root, planFolder } = makePlanSet();
  const claimed = run(["--plan", planFolder, "--claim", "01.T0", "--owner", "anima", "--lease-minutes", "45", "--write", "--no-git"], root);
  assert.equal(claimed.state.tasks["01.T0"].owner, "anima");
  assert.match(claimed.state.tasks["01.T0"].leaseExpiresAt, /^\d{4}-\d{2}-\d{2}T/);

  const assessment = assessPlan({ cwd: root, planFolder, includeGit: false });
  assert.deepEqual(assessment.hardStops, []);
  assert.equal(assessment.stopReasons.length, 0);
  assert.ok(assessment.softCautions.some((caution) => caution.includes("1 active task")));
  assert.equal(assessment.workOrders[0].taskId, "01.T0");
  assert.equal(assessment.workOrders[0].action, "resume");
  assert.equal(assessment.workOrders[0].owner, "anima");
});

test("same owner claim renews an existing lease without duplicate run records", () => {
  const { root, planFolder } = makePlanSet();
  const claimed = run(["--plan", planFolder, "--claim", "01.T0", "--owner", "anima", "--lease-minutes", "15", "--write", "--no-git"], root);
  const renewed = run(["--plan", planFolder, "--claim", "01.T0", "--owner", "anima", "--lease-minutes", "90", "--write", "--no-git"], root);
  assert.equal(renewed.state.tasks["01.T0"].status, "in_progress");
  assert.equal(renewed.state.tasks["01.T0"].owner, "anima");
  assert.notEqual(renewed.state.tasks["01.T0"].leaseExpiresAt, claimed.state.tasks["01.T0"].leaseExpiresAt);
  assert.equal(renewed.state.runs.filter((run) => run.taskId === "01.T0").length, 1);
});

test("the CLI runner REFUSES a bare done mark (no receipt, no verification record) but still accepts review", () => {
  const { root, planFolder } = makePlanSet();
  const initial = run(["--plan", planFolder, "--write", "--no-git"], root);
  const taskId = initial.recommendedTask.id;
  const claimed = run(["--plan", planFolder, "--claim", taskId, "--no-git"], root);
  assert.equal(claimed.state.tasks[taskId].status, "in_progress");
  assert.throws(
    () => run(["--plan", planFolder, "--mark", taskId, "--status", "done", "--evidence", "unit test evidence", "--no-git"], root),
    /REFUSED --mark/,
  );
  assert.equal(readTask(planFolder, taskId).status, "in_progress");
  const reviewed = run(["--plan", planFolder, "--mark", taskId, "--status", "review", "--evidence", "partial work", "--no-git"], root);
  assert.equal(reviewed.state.tasks[taskId].status, "review");
  assert.equal(reviewed.state.tasks[taskId].evidence.at(-1).text, "partial work");
});

test("context pack includes task body, source specs, dependencies, and decision context", () => {
  const { root, planFolder } = makePlanSet();
  const nowPath = join(root, "Idea", "Empty", "Present", "02-06-2026", "20260602-140000-pack01", "now.md");
  mkdirSync(join(root, ".epi"), { recursive: true });
  mkdirSync(join(root, "Idea", "Empty", "Present", "02-06-2026", "20260602-140000-pack01"), { recursive: true });
  writeFileSync(nowPath, "# NOW\n");
  writeFileSync(join(root, ".epi", "session.json"), JSON.stringify({ context: { now_path: nowPath } }));
  writeFileSync(
    join(planFolder, "11-open-architectural-decisions.md"),
    `# Decisions

## Decision Index

| ID | Decision |
| --- | --- |
| PRD-01 | Runtime choice |

## User-Final-Validation Required

### UFV-01 - Consent

Resolve consent text.
`,
  );
  const assessment = run(["--plan", planFolder, "--context", "01.T1", "--write", "--no-git"], root);
  assert.equal(assessment.contextPack.taskId, "01.T1");
  assert.ok(assessment.contextPack.sourceFiles.includes("docs/plans/2026-05-31-example-tracks/11-open-architectural-decisions.md"));
  assert.ok(assessment.contextPack.sourceFiles.includes("Body/S/S0/bridge.rs"));
  const contextPackBody = readFileSync(join(root, assessment.contextPack.path), "utf8");
  assert.match(contextPackBody, /## Active Development Context/);
  assert.match(contextPackBody, /NOW:\*\* Idea\/Empty\/Present\/02-06-2026\/20260602-140000-pack01\/now\.md \(present\)/);
});

test("reset clears task state without deleting the index", () => {
  const { root, planFolder } = makePlanSet();
  run(["--plan", planFolder, "--route", "--write", "--no-git"], root);
  run(["--plan", planFolder, "--claim", "01.T0", "--write", "--no-git"], root);
  const reset = run(["--plan", planFolder, "--reset", "--write", "--no-git"], root);
  assert.equal(reset.state.tasks["01.T0"].status, "pending");
  assert.equal(reset.state.runs.length, 0);
  assert.equal(reset.state.activeRoute, null);
});

// ---------------------------------------------------------------------------
// Fail-closed mark-path guards (Track 00 hardening — the ledger records
// verified truth or nothing).
// ---------------------------------------------------------------------------

test("parseArgs accepts --receipt and --allow-dirty", () => {
  const args = parseArgs(["--mark", "01.T0", "--status", "done", "--receipt", "{}", "--allow-dirty"]);
  assert.equal(args.receipt, "{}");
  assert.equal(args.allowDirty, true);
});

test("receiptViolations rejects missing/red/failing receipts and accepts a green one", () => {
  assert.equal(receiptViolations(null).length, 1);
  assert.ok(receiptViolations({ exitCode: 0 }).some((violation) => violation.includes("receipt.command")));
  assert.ok(receiptViolations({ command: "cargo test", exitCode: 1 }).some((violation) => violation.includes("exit 0")));
  assert.ok(
    receiptViolations({ command: "cargo test", exitCode: 0, testsFailed: 2 }).some((violation) => violation.includes("0 failing")),
  );
  assert.deepEqual(receiptViolations(JSON.parse(VALID_RECEIPT)), []);
});

test("parseReceipt accepts inline JSON and file paths, rejects garbage", () => {
  const dir = mkdtempSync(join(tmpdir(), "m-dev-receipt-"));
  const receiptPath = join(dir, "receipt.json");
  writeFileSync(receiptPath, VALID_RECEIPT);
  assert.equal(parseReceipt(VALID_RECEIPT, dir).exitCode, 0);
  assert.equal(parseReceipt(receiptPath, dir).testsPassed, 3);
  assert.throws(() => parseReceipt("{ not json", dir), /not valid JSON/);
  assert.throws(() => parseReceipt("missing-receipt.json", dir), /not found/);
});

test("a done mark with a receipt but no independent verification record is REFUSED", () => {
  const { root, planFolder } = makePlanSet();
  run(["--plan", planFolder, "--claim", "01.T0", "--owner", "impl-1", "--write", "--no-git"], root);
  assert.throws(
    () =>
      run(
        ["--plan", planFolder, "--mark", "01.T0", "--status", "done", "--owner", "impl-1", "--receipt", VALID_RECEIPT, "--no-git"],
        root,
      ),
    /no verification record[\s\S]*verify-tranche/,
  );
});

test("a done mark against a REFUSED verification record is REFUSED", () => {
  const { root, planFolder } = makePlanSet();
  run(["--plan", planFolder, "--write", "--no-git"], root);
  writeVerificationRecord(planFolder, "01.T0", { verdict: "REFUSED" });
  assert.throws(
    () => run(["--plan", planFolder, "--mark", "01.T0", "--status", "done", "--receipt", VALID_RECEIPT, "--no-git"], root),
    /verdict is REFUSED/,
  );
});

test("verifier ≠ closer: a record whose verifier-owner equals the closing owner is REFUSED", () => {
  const { root, planFolder } = makePlanSet();
  run(["--plan", planFolder, "--write", "--no-git"], root);
  writeVerificationRecord(planFolder, "01.T0", { verifierOwner: "impl-1" });
  assert.throws(
    () =>
      run(
        ["--plan", planFolder, "--mark", "01.T0", "--status", "done", "--owner", "impl-1", "--receipt", VALID_RECEIPT, "--no-git"],
        root,
      ),
    /verifier ≠ closer is mandatory/,
  );
});

test("a verification record that predates the claim is REFUSED as stale", () => {
  const { root, planFolder } = makePlanSet();
  run(["--plan", planFolder, "--write", "--no-git"], root);
  writeVerificationRecord(planFolder, "01.T0", { verifiedAt: "2020-01-01T00:00:00.000Z" });
  run(["--plan", planFolder, "--claim", "01.T0", "--owner", "impl-1", "--write", "--no-git"], root);
  assert.throws(
    () =>
      run(
        ["--plan", planFolder, "--mark", "01.T0", "--status", "done", "--owner", "impl-1", "--receipt", VALID_RECEIPT, "--no-git"],
        root,
      ),
    /predates this claim/,
  );
});

test("happy path: claim + fresh independent PASS record + receipt closes the task with the receipt in the ledger", () => {
  const { root, planFolder } = makePlanSet();
  run(["--plan", planFolder, "--claim", "01.T0", "--owner", "impl-1", "--write", "--no-git"], root);
  writeVerificationRecord(planFolder, "01.T0", { verifierOwner: "verifier-9" });
  const marked = run(
    [
      "--plan", planFolder, "--mark", "01.T0", "--status", "done", "--owner", "impl-1",
      "--receipt", VALID_RECEIPT,
      "--evidence", "3 tests green per DR-TEST-1 VALIDATED",
      "--no-git",
    ],
    root,
  );
  assert.equal(marked.state.tasks["01.T0"].status, "done");
  const withReceipt = marked.state.tasks["01.T0"].evidence.find((entry) => entry.receipt);
  assert.ok(withReceipt, "receipt must be stored in the ledger evidence entry");
  assert.equal(withReceipt.receipt.exitCode, 0);
});

test("DR citations fail closed: a non-existent decision id REFUSES the mark", () => {
  const { root, planFolder } = makePlanSet();
  run(["--plan", planFolder, "--claim", "01.T0", "--owner", "impl-1", "--write", "--no-git"], root);
  writeVerificationRecord(planFolder, "01.T0");
  assert.throws(
    () =>
      run(
        [
          "--plan", planFolder, "--mark", "01.T0", "--status", "done", "--owner", "impl-1",
          "--receipt", VALID_RECEIPT,
          "--evidence", "closes per DR-WC-FAKE-7",
          "--no-git",
        ],
        root,
      ),
    /DR-WC-FAKE-7 does not exist in any decision register/,
  );
});

test("a VALIDATED claim for a merely-proposed decision is a violation; a validated one is clean", () => {
  const violations = drCitationViolations({ text: "DR-TEST-2 VALIDATED, direct close", cwd: registerDir });
  assert.ok(violations.some((violation) => violation.includes("DR-TEST-2") && violation.includes("no register line")));
  assert.deepEqual(drCitationViolations({ text: "per DR-TEST-1 VALIDATED", cwd: registerDir }), []);
});

test("extractDrCitations finds multi-segment DR ids only", () => {
  assert.deepEqual(extractDrCitations("per DR-FACE-4 and DR-M3-LENS-18; DRAKE is not a DR"), ["DR-FACE-4", "DR-M3-LENS-18"]);
  assert.deepEqual(extractDrCitations("no citations here"), []);
});

test("quarantine propagates audit_required to dependents that trusted the work", () => {
  const { root, planFolder } = makePlanSet();
  run(["--plan", planFolder, "--write", "--no-git"], root);
  setTaskStatus(planFolder, "01.T1", "done");
  const marked = run(
    ["--plan", planFolder, "--mark", "02.T0", "--status", "quarantine", "--evidence", "fabricated evidence found", "--no-git"],
    root,
  );
  assert.equal(marked.state.tasks["02.T0"].status, "quarantine");
  assert.equal(marked.state.tasks["01.T1"].status, "audit_required");
  assert.match(marked.state.tasks["01.T1"].notes ?? "", /dependency 02\.T0 quarantined/);
  // 02.T1 was pending — it never trusted the work, so it stays pending.
  assert.equal(marked.state.tasks["02.T1"].status, "pending");
});

test("a blocked task does not wall its chain successors; authored deps still hold", () => {
  const { root, planFolder } = makePlanSet();
  run(["--plan", planFolder, "--write", "--no-git"], root);
  // 02.T1's only dep is the mechanical chain on 02.T0. While 02.T0 is merely
  // pending, the chain holds and 02.T1 waits.
  let assessment = run(["--plan", planFolder, "--write", "--no-git"], root);
  let surfaceSlice = assessment.tasks.find((t) => t.id === "02.T1");
  assert.equal(surfaceSlice.computedStatus, "waiting");
  // Once 02.T0 is blocked (external blocker), the chain skips it — successors
  // must not be walled behind another lane's blocker (ruling 2026-07-08).
  setTaskStatus(planFolder, "02.T0", "blocked");
  assessment = run(["--plan", planFolder, "--write", "--no-git"], root);
  surfaceSlice = assessment.tasks.find((t) => t.id === "02.T1");
  assert.equal(surfaceSlice.computedStatus, "ready");
  assert.ok(!surfaceSlice.dependsOn.includes("02.T0"));
  // Authored deps are law and are NOT skipped: 01.T1 names Track 02 Tranches
  // 0-1 in its heading, so it keeps waiting on blocked 02.T0.
  const bridge = assessment.tasks.find((t) => t.id === "01.T1");
  assert.ok(bridge.dependsOn.includes("02.T0"));
  assert.equal(bridge.computedStatus, "waiting");
  const claimed = run(["--plan", planFolder, "--claim", "02.T1", "--owner", "impl-1", "--write", "--no-git"], root);
  assert.equal(claimed.state.tasks["02.T1"].status, "in_progress");
});

test("a quarantined task cannot be claimed; an audit_required task can (it IS the re-verification queue)", () => {
  const { root, planFolder } = makePlanSet();
  run(["--plan", planFolder, "--write", "--no-git"], root);
  setTaskStatus(planFolder, "01.T0", "quarantine");
  assert.throws(
    () => run(["--plan", planFolder, "--claim", "01.T0", "--owner", "impl-1", "--no-git"], root),
    /quarantined; a human decision/,
  );
  setTaskStatus(planFolder, "01.T0", "audit_required");
  const claimed = run(["--plan", planFolder, "--claim", "01.T0", "--owner", "impl-1", "--no-git"], root);
  assert.equal(claimed.state.tasks["01.T0"].status, "in_progress");
});

test("a done mark on a task with a quarantined dependency is REFUSED", () => {
  const { root, planFolder } = makePlanSet();
  run(["--plan", planFolder, "--write", "--no-git"], root);
  setTaskStatus(planFolder, "02.T0", "quarantine");
  writeVerificationRecord(planFolder, "01.T1");
  assert.throws(
    () => run(["--plan", planFolder, "--mark", "01.T1", "--status", "done", "--receipt", VALID_RECEIPT, "--no-git"], root),
    /dependencies quarantined: 02\.T0/,
  );
});

test("claim guard: dirty tree over the limit refuses unless --allow-dirty", () => {
  const dirtyFiles = Array.from({ length: 30 }, (_, i) => `Body/S/file-${i}.rs`);
  assert.equal(claimGuardViolations({ dirtyFiles, allowDirty: false, env: {} }).length, 1);
  assert.deepEqual(claimGuardViolations({ dirtyFiles, allowDirty: true, env: {} }), []);
  assert.deepEqual(claimGuardViolations({ dirtyFiles: dirtyFiles.slice(0, 5), allowDirty: false, env: {} }), []);
  assert.equal(
    claimGuardViolations({ dirtyFiles: dirtyFiles.slice(0, 5), allowDirty: false, env: { M_DEV_DIRTY_LIMIT: "3" } }).length,
    1,
  );
});

test("require-now hard-stops on a stale NOW day and the runner refuses to claim through it", () => {
  const { root, planFolder } = makePlanSet();
  const staleDay = "02-06-2026";
  const nowPath = join(root, "Idea", "Empty", "Present", staleDay, "20260602-120000-stale1", "now.md");
  mkdirSync(join(root, ".epi"), { recursive: true });
  mkdirSync(join(root, "Idea", "Empty", "Present", staleDay, "20260602-120000-stale1"), { recursive: true });
  writeFileSync(nowPath, "# NOW\n");
  writeFileSync(join(root, ".epi", "session.json"), JSON.stringify({ context: { day_id: staleDay, now_path: nowPath } }));

  const assessment = assessPlan({ cwd: root, planFolder, includeGit: false, requireNow: true });
  assert.ok(assessment.hardStops.some((stop) => stop.includes("STALE")));
  assert.throws(
    () => run(["--plan", planFolder, "--claim", "01.T0", "--require-now", "--no-git"], root),
    /hard stops are unresolved/,
  );
});

test("nowIsStale flags another day, tolerates today and non-day formats", () => {
  assert.equal(nowIsStale("01-01-2020"), true);
  assert.equal(nowIsStale(presentDayId()), false);
  assert.equal(nowIsStale(null), false);
  assert.equal(nowIsStale("session-xyz"), false);
});

test("classViolations: trivial commands are rejected everywhere; UF and W tracks demand class-appropriate proof", () => {
  assert.ok(
    classViolations({ trackClass: null, receipt: { command: "ls -la Body/", exitCode: 0 } }).some((violation) =>
      violation.includes("trivial"),
    ),
  );
  assert.ok(
    classViolations({ trackClass: null, receipt: { command: "rg 'pattern' src/", exitCode: 0 } }).some((violation) =>
      violation.includes("trivial"),
    ),
  );
  // UF track with jsdom-only proof: refused.
  assert.ok(
    classViolations({ trackClass: "UF", receipt: { command: "pnpm test", exitCode: 0 } }).some((violation) =>
      violation.includes("class UF"),
    ),
  );
  // UF track with real playwright proof: clean.
  assert.deepEqual(
    classViolations({ trackClass: "UF", receipt: { command: "pnpm test:e2e", exitCode: 0 } }),
    [],
  );
  // W track needs wire proof; keyPaths artifacts count.
  assert.ok(
    classViolations({ trackClass: "W", receipt: { command: "cargo test", exitCode: 0 } }).some((violation) =>
      violation.includes("class W"),
    ),
  );
  assert.deepEqual(
    classViolations({
      trackClass: "W",
      receipt: { command: "node scripts/live-wire.mjs", exitCode: 0 },
    }),
    [],
  );
  assert.deepEqual(
    classViolations({
      trackClass: "W",
      receipt: { command: "cargo test", exitCode: 0, keyPaths: ["plan.runs/wire-captures/x.json"] },
    }),
    [],
  );
  // K tracks: any real runner suffices.
  assert.deepEqual(classViolations({ trackClass: "K", receipt: { command: "cargo test -p portal-core", exitCode: 0 } }), []);
});

test("loadVerificationClasses reads a class manifest and done marks enforce it", () => {
  const { root, planFolder } = makePlanSet();
  run(["--plan", planFolder, "--claim", "01.T0", "--owner", "impl-1", "--write", "--no-git"], root);
  writeVerificationRecord(planFolder, "01.T0", { verifierOwner: "verifier-9" });
  mkdirSync(join(planFolder, "plan.runs"), { recursive: true });
  writeFileSync(
    join(planFolder, "plan.runs", "verification-classes.json"),
    JSON.stringify({ version: 1, classes: { "01": "UF" } }),
  );
  assert.equal(loadVerificationClasses(planFolder).classes["01"], "UF");
  // jsdom-only receipt on a UF track: REFUSED.
  assert.throws(
    () =>
      run(
        ["--plan", planFolder, "--mark", "01.T0", "--status", "done", "--owner", "impl-1", "--receipt", VALID_RECEIPT, "--no-git"],
        root,
      ),
    /class UF/,
  );
  // Real UI-flow receipt: closes.
  const ufReceipt = JSON.stringify({ command: "pnpm test:e2e", exitCode: 0, testsPassed: 2, testsFailed: 0 });
  const marked = run(
    ["--plan", planFolder, "--mark", "01.T0", "--status", "done", "--owner", "impl-1", "--receipt", ufReceipt, "--no-git"],
    root,
  );
  assert.equal(marked.state.tasks["01.T0"].status, "done");
});

test("readVerificationRecord parses verdict, verifiedAt, and verifier-owner", () => {
  const { planFolder } = makePlanSet();
  writeVerificationRecord(planFolder, "01.T0", {
    verdict: "PASS",
    verifierOwner: "verifier-9",
    verifiedAt: "2026-07-06T10:00:00.000Z",
  });
  const record = readVerificationRecord(planFolder, "01.T0");
  assert.equal(record.exists, true);
  assert.equal(record.verdict, "PASS");
  assert.equal(record.verifiedAt, "2026-07-06T10:00:00.000Z");
  assert.equal(record.verifierOwner, "verifier-9");
  assert.equal(readVerificationRecord(planFolder, "99.T9").exists, false);
});
