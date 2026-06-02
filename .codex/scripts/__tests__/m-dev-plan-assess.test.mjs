import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  assessPlan,
  buildIndex,
  discoverPlanFolder,
  parseTrackTasks,
  readActiveDevelopmentContext,
  run,
} from "../m-dev-plan-assess.mjs";

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

test("claim and mark preserve state through the CLI runner", () => {
  const { root, planFolder } = makePlanSet();
  const initial = run(["--plan", planFolder, "--write", "--no-git"], root);
  const taskId = initial.recommendedTask.id;
  const claimed = run(["--plan", planFolder, "--claim", taskId, "--no-git"], root);
  assert.equal(claimed.state.tasks[taskId].status, "in_progress");
  const marked = run(["--plan", planFolder, "--mark", taskId, "--status", "done", "--evidence", "unit test evidence", "--no-git"], root);
  assert.equal(marked.state.tasks[taskId].status, "done");
  assert.equal(marked.state.tasks[taskId].evidence.at(-1).text, "unit test evidence");
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
