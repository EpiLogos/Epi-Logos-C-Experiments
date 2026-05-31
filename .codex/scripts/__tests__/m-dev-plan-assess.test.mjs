import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { assessPlan, buildIndex, discoverPlanFolder, parseTrackTasks, run } from "../m-dev-plan-assess.mjs";

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
