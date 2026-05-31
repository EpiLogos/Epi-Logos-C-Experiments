#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const STATE_VERSION = 1;
const STATUSES = new Set(["pending", "ready", "in_progress", "blocked", "review", "done"]);

export function parseArgs(argv) {
  const args = {
    cwd: process.cwd(),
    plan: null,
    write: false,
    json: false,
    claim: null,
    mark: null,
    status: null,
    evidence: null,
    noGit: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--write") args.write = true;
    else if (arg === "--json") args.json = true;
    else if (arg === "--no-git") args.noGit = true;
    else if (arg === "--plan") args.plan = argv[++i];
    else if (arg === "--claim") args.claim = argv[++i];
    else if (arg === "--mark") args.mark = argv[++i];
    else if (arg === "--status") args.status = argv[++i];
    else if (arg === "--evidence") args.evidence = argv[++i];
    else if (!arg.startsWith("--") && !args.plan) args.plan = arg;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (args.status && !STATUSES.has(args.status)) {
    throw new Error(`Invalid status "${args.status}". Expected one of: ${Array.from(STATUSES).join(", ")}`);
  }
  if (args.mark && !args.status) {
    throw new Error("--mark requires --status");
  }
  return args;
}

export function discoverPlanFolder(cwd, explicitPlan) {
  if (explicitPlan) {
    const explicit = isAbsolute(explicitPlan) ? explicitPlan : resolve(cwd, explicitPlan);
    if (!existsSync(explicit) || !statSync(explicit).isDirectory()) {
      throw new Error(`Plan folder does not exist: ${explicit}`);
    }
    return explicit;
  }

  const active = readActivePlanPointer(cwd);
  if (active) return active;

  const docsPlans = join(cwd, "docs", "plans");
  if (!existsSync(docsPlans)) {
    throw new Error("Could not discover plan folder: docs/plans does not exist and no explicit plan was provided.");
  }

  const candidates = readdirSync(docsPlans)
    .map((name) => join(docsPlans, name))
    .filter((path) => statSync(path).isDirectory())
    .filter((path) => {
      const files = readdirSync(path).filter((file) => /^\d{2}-.+\.md$/.test(file));
      return files.length >= 2;
    })
    .map((path) => ({ path, mtimeMs: statSync(path).mtimeMs }))
    .sort((a, b) => b.mtimeMs - a.mtimeMs || b.path.localeCompare(a.path));

  if (candidates.length === 0) {
    throw new Error("Could not discover plan folder: no numbered plan-set folders found under docs/plans.");
  }
  return candidates[0].path;
}

function readActivePlanPointer(cwd) {
  const paths = [
    join(cwd, "plan.active.json"),
    join(cwd, "docs", "plans", "plan.active.json"),
    join(cwd, ".codex", "m-dev.active.json"),
  ];
  for (const pointerPath of paths) {
    if (!existsSync(pointerPath)) continue;
    const parsed = JSON.parse(readFileSync(pointerPath, "utf8"));
    const rawPath = parsed.planFolder || parsed.plan || parsed.path;
    if (!rawPath) continue;
    return isAbsolute(rawPath) ? rawPath : resolve(dirname(pointerPath), rawPath);
  }
  return null;
}

export function buildIndex(planFolder, cwd = process.cwd()) {
  const files = readdirSync(planFolder)
    .filter((file) => /^\d{2}-.+\.md$/.test(file))
    .sort();
  const tracks = [];
  const tasks = [];

  for (const file of files) {
    const absolutePath = join(planFolder, file);
    const content = readFileSync(absolutePath, "utf8");
    const trackId = file.slice(0, 2);
    const title = firstHeading(content) || file.replace(/\.md$/, "");
    const track = {
      id: trackId,
      file,
      path: relative(cwd, absolutePath),
      title,
      checksum: sha256(content),
    };
    tracks.push(track);
    tasks.push(...parseTrackTasks(track, content));
  }

  addSequentialDependencies(tasks);

  return {
    version: STATE_VERSION,
    generatedAt: new Date().toISOString(),
    planFolder: relative(cwd, planFolder),
    tracks,
    tasks,
  };
}

function firstHeading(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

export function parseTrackTasks(track, content) {
  const taskPattern = /^\s*(\d+)\.\s+\*\*(?:(?:Tranche|T)\s*)?(\d+)\s*[-–]\s*([^*\n]+)\*\*/gm;
  const matches = Array.from(content.matchAll(taskPattern));
  return matches.map((match, index) => {
    const trancheNumber = Number.parseInt(match[2], 10);
    const start = match.index ?? 0;
    const end = index + 1 < matches.length ? matches[index + 1].index ?? content.length : content.length;
    const body = content.slice(start, end).trim();
    const rawTitle = normalizeTitle(match[3]);
    const id = `${track.id}.T${trancheNumber}`;
    return {
      id,
      trackId: track.id,
      tranche: `T${trancheNumber}`,
      title: rawTitle,
      effort: extractEffort(rawTitle),
      file: track.file,
      path: track.path,
      dependsOn: Array.from(extractDependencies(dependencyRelevantText(body), id)).sort(),
      writeScopes: inferWriteScopes(body, track.id),
      body,
    };
  });
}

function normalizeTitle(raw) {
  return raw.trim().replace(/\s+\.$/, "").replace(/\.$/, "");
}

function extractEffort(title) {
  const match = title.match(/\(([^)]*(?:day|days|week|weeks|S|M|L|XL)[^)]*)\)\.?$/i);
  return match ? match[1].trim() : null;
}

function dependencyRelevantText(body) {
  const lines = body.split("\n");
  const relevant = [lines[0] ?? ""];
  const dependencySection = body.match(
    /\n\s*Dependencies:\s*\n?([\s\S]*?)(?=\n\s*(?:Deliverables|Verification|Success Criteria|Open Decisions):|\n\s*\d+\.\s+\*\*|$)/i,
  );
  if (dependencySection) relevant.push(dependencySection[1]);
  for (const line of lines) {
    if (/\b(?:gated by|depends on|dependent on|requires)\s+Track\b/i.test(line)) {
      relevant.push(line);
    }
  }
  return relevant.join("\n");
}

function extractDependencies(body, currentTaskId) {
  const deps = new Set();
  const dependencyPattern =
    /Track\s+(\d{2})\s+(?:(?:Tranches?|Tranche)\s+)?((?:T?\d+\s*(?:[-–]\s*T?\d+)?)(?:\s*(?:,|\/|and)\s*T?\d+\s*(?:[-–]\s*T?\d+)?)*)/gi;
  for (const match of body.matchAll(dependencyPattern)) {
    const trackId = match[1];
    const expression = match[2];
    for (const number of expandTrancheExpression(expression)) {
      const dep = `${trackId}.T${number}`;
      if (dep !== currentTaskId) deps.add(dep);
    }
  }

  const explicitPattern = /\b(\d{2})\.T(\d+)\b/g;
  for (const match of body.matchAll(explicitPattern)) {
    const dep = `${match[1]}.T${Number.parseInt(match[2], 10)}`;
    if (dep !== currentTaskId) deps.add(dep);
  }

  return deps;
}

function expandTrancheExpression(expression) {
  const normalized = expression.replace(/\band\b/gi, ",").replace(/\//g, ",");
  const numbers = [];
  for (const part of normalized.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const range = trimmed.match(/^T?(\d+)\s*[-–]\s*T?(\d+)$/i);
    if (range) {
      const start = Number.parseInt(range[1], 10);
      const end = Number.parseInt(range[2], 10);
      const step = start <= end ? 1 : -1;
      for (let value = start; value !== end + step; value += step) numbers.push(value);
      continue;
    }
    const single = trimmed.match(/^T?(\d+)$/i);
    if (single) numbers.push(Number.parseInt(single[1], 10));
  }
  return numbers;
}

function inferWriteScopes(body, trackId) {
  const scopes = new Set(trackHeuristicScopes(trackId));
  const backtickPattern = /`([^`]+)`/g;
  for (const match of body.matchAll(backtickPattern)) {
    const value = match[1].trim();
    if (looksLikePath(value)) scopes.add(normalizeScope(value));
  }
  return Array.from(scopes).sort();
}

function trackHeuristicScopes(trackId) {
  const scopesByTrack = {
    "01": ["Body/S/S0/**"],
    "02": ["Body/S/S2/**"],
    "03": ["Body/S/S3/**", "Body/S/S0/epi-cli/src/gate/**"],
    "04": ["Body/S/S5/**"],
    "05": ["Body/M/epi-tauri/**", "pratibimba/system/**"],
    "06": ["Body/M/epi-tauri/**"],
    "07": ["pratibimba/system/extensions/**"],
    "08": ["pratibimba/system/extensions/**"],
    "09": ["Body/S/S4/**", "Body/S/S5/**", "Body/M/epi-tauri/**", "pratibimba/system/**"],
    "10": [".omx/**", "docs/plans/**"],
    "11": ["docs/plans/**"],
  };
  return scopesByTrack[trackId] ?? [];
}

function looksLikePath(value) {
  return /^(Body|Idea|docs|pratibimba|\.codex|\.claude|\.omx|src|scripts|tests|vendors)\//.test(value);
}

function normalizeScope(value) {
  if (value.endsWith("/")) return `${value}**`;
  return value;
}

function addSequentialDependencies(tasks) {
  const byTrack = new Map();
  for (const task of tasks) {
    const list = byTrack.get(task.trackId) ?? [];
    list.push(task);
    byTrack.set(task.trackId, list);
  }
  for (const list of byTrack.values()) {
    list.sort((a, b) => trancheNumber(a) - trancheNumber(b));
    for (let i = 1; i < list.length; i += 1) {
      const previous = list[i - 1].id;
      if (!list[i].dependsOn.includes(previous)) list[i].dependsOn.push(previous);
      list[i].dependsOn.sort();
    }
  }
}

function trancheNumber(task) {
  return Number.parseInt(task.tranche.replace(/^T/, ""), 10);
}

export function loadState(planFolder) {
  const statePath = join(planFolder, "plan.state.json");
  if (!existsSync(statePath)) {
    return {
      version: STATE_VERSION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: {},
      runs: [],
    };
  }
  return JSON.parse(readFileSync(statePath, "utf8"));
}

function reconcileState(index, state) {
  const now = new Date().toISOString();
  const nextState = {
    version: STATE_VERSION,
    createdAt: state.createdAt ?? now,
    updatedAt: now,
    tasks: { ...(state.tasks ?? {}) },
    runs: Array.isArray(state.runs) ? state.runs : [],
  };

  for (const task of index.tasks) {
    const existing = nextState.tasks[task.id] ?? {};
    const status = STATUSES.has(existing.status) ? existing.status : "pending";
    nextState.tasks[task.id] = {
      status,
      updatedAt: existing.updatedAt ?? null,
      claimedAt: existing.claimedAt ?? null,
      completedAt: existing.completedAt ?? null,
      evidence: Array.isArray(existing.evidence) ? existing.evidence : [],
      notes: existing.notes ?? null,
    };
  }

  for (const taskId of Object.keys(nextState.tasks)) {
    if (!index.tasks.some((task) => task.id === taskId)) {
      nextState.tasks[taskId].status = nextState.tasks[taskId].status === "done" ? "done" : "blocked";
      nextState.tasks[taskId].notes = "Task no longer appears in plan index.";
    }
  }

  return nextState;
}

export function assessPlan({ cwd = process.cwd(), planFolder, includeGit = true } = {}) {
  const index = buildIndex(planFolder, cwd);
  const state = reconcileState(index, loadState(planFolder));
  const taskById = new Map(index.tasks.map((task) => [task.id, task]));
  const enrichedTasks = index.tasks.map((task) => enrichTask(task, state, taskById));
  const counts = countStatuses(enrichedTasks);
  const readyTasks = enrichedTasks
    .filter((task) => task.computedStatus === "ready")
    .sort(comparePriority);
  const inProgressTasks = enrichedTasks.filter((task) => task.status === "in_progress");
  const reviewTasks = enrichedTasks.filter((task) => task.status === "review");
  const dirtyFiles = includeGit ? gitDirtyFiles(cwd).filter((file) => !isGeneratedPlanStateFile(file)) : [];
  const dirtyOverlaps = readyTasks
    .map((task) => ({ taskId: task.id, files: overlappingDirtyFiles(task.writeScopes, dirtyFiles) }))
    .filter((entry) => entry.files.length > 0);
  const stopReasons = [];

  if (inProgressTasks.length > 0) {
    stopReasons.push(`There are ${inProgressTasks.length} task(s) already in progress. Resume or release them before claiming new work.`);
  }
  if (reviewTasks.length > 0) {
    stopReasons.push(`There are ${reviewTasks.length} task(s) in review. Finish review before starting new work.`);
  }

  const recommendedTask = readyTasks[0] ?? null;
  const parallelGroup = buildParallelGroup(readyTasks, dirtyFiles);

  return {
    version: STATE_VERSION,
    generatedAt: new Date().toISOString(),
    planFolder: relative(cwd, planFolder),
    indexPath: relative(cwd, join(planFolder, "plan.index.json")),
    statePath: relative(cwd, join(planFolder, "plan.state.json")),
    summary: {
      totalTasks: enrichedTasks.length,
      ...counts,
      ready: readyTasks.length,
      blockedByDependencies: enrichedTasks.filter((task) => task.computedStatus === "waiting").length,
    },
    stopReasons,
    recommendedTask,
    parallelGroup,
    parallelExecution: parallelGroup.length > 1 && stopReasons.length === 0,
    dirtyFiles,
    dirtyOverlaps,
    tasks: enrichedTasks.map(({ body, ...task }) => task),
    index,
    state,
  };
}

function enrichTask(task, state, taskById) {
  const record = state.tasks[task.id] ?? { status: "pending", evidence: [] };
  const missingDeps = task.dependsOn.filter((dep) => !taskById.has(dep));
  const unmetDeps = task.dependsOn.filter((dep) => {
    const depStatus = state.tasks[dep]?.status;
    return depStatus !== "done";
  });
  let computedStatus = record.status;
  if (record.status === "pending" || record.status === "ready") {
    computedStatus = unmetDeps.length === 0 && missingDeps.length === 0 ? "ready" : "waiting";
  }
  return {
    ...task,
    status: record.status,
    computedStatus,
    missingDeps,
    unmetDeps,
    evidence: record.evidence ?? [],
    claimedAt: record.claimedAt ?? null,
    completedAt: record.completedAt ?? null,
  };
}

function countStatuses(tasks) {
  const counts = {};
  for (const status of STATUSES) counts[status] = 0;
  for (const task of tasks) counts[task.status] = (counts[task.status] ?? 0) + 1;
  return counts;
}

function comparePriority(a, b) {
  return priorityScore(b) - priorityScore(a) || a.id.localeCompare(b.id, undefined, { numeric: true });
}

function priorityScore(task) {
  const title = task.title.toLowerCase();
  let score = 0;
  if (task.id === "10.T0") score += 1000;
  if (title.includes("decision gate")) score += 200;
  if (title.includes("preflight")) score += 120;
  if (title.includes("baseline")) score += 80;
  if (title.includes("contract")) score += 50;
  score -= Number.parseInt(task.trackId, 10);
  score -= trancheNumber(task) * 2;
  return score;
}

function buildParallelGroup(readyTasks, dirtyFiles, max = 3) {
  const group = [];
  for (const task of readyTasks) {
    if (overlappingDirtyFiles(task.writeScopes, dirtyFiles).length > 0) continue;
    if (group.every((existing) => canRunTogether(existing, task))) {
      group.push(task);
      if (group.length >= max) break;
    }
  }
  return group;
}

function canRunTogether(a, b) {
  if (a.trackId === b.trackId) return false;
  if (a.dependsOn.includes(b.id) || b.dependsOn.includes(a.id)) return false;
  return !scopesOverlap(a.writeScopes, b.writeScopes);
}

function scopesOverlap(aScopes, bScopes) {
  if (aScopes.length === 0 || bScopes.length === 0) return true;
  return aScopes.some((a) => bScopes.some((b) => scopeOverlap(a, b)));
}

function scopeOverlap(a, b) {
  const left = stripGlob(a);
  const right = stripGlob(b);
  return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

function stripGlob(scope) {
  return scope.replace(/\*\*?$/g, "").replace(/\/$/, "");
}

function overlappingDirtyFiles(scopes, dirtyFiles) {
  if (scopes.length === 0) return dirtyFiles;
  return dirtyFiles.filter((file) => scopes.some((scope) => fileMatchesScope(file, scope)));
}

function fileMatchesScope(file, scope) {
  const normalizedScope = stripGlob(scope);
  return file === normalizedScope || file.startsWith(`${normalizedScope}/`);
}

function gitDirtyFiles(cwd) {
  try {
    const output = execFileSync("git", ["status", "--porcelain"], { cwd, encoding: "utf8" });
    return output
      .split("\n")
      .map((line) => line.trimEnd())
      .filter(Boolean)
      .map((line) => line.slice(3).replace(/^"|"$/g, ""))
      .sort();
  } catch {
    return [];
  }
}

function isGeneratedPlanStateFile(file) {
  return /(?:^|\/)plan\.(?:index|state)\.json$/.test(file) || /(?:^|\/)plan\.runs\//.test(file);
}

function writeAssessmentFiles(planFolder, assessment) {
  mkdirSync(join(planFolder, "plan.runs"), { recursive: true });
  writeFileSync(join(planFolder, "plan.index.json"), `${JSON.stringify(assessment.index, null, 2)}\n`);
  writeFileSync(join(planFolder, "plan.state.json"), `${JSON.stringify(assessment.state, null, 2)}\n`);
}

function claimTask(planFolder, assessment, taskId) {
  const task = assessment.tasks.find((entry) => entry.id === taskId);
  if (!task) throw new Error(`Cannot claim unknown task: ${taskId}`);
  if (task.computedStatus !== "ready") {
    throw new Error(`Cannot claim ${taskId}: computed status is ${task.computedStatus}`);
  }
  const state = assessment.state;
  const now = new Date().toISOString();
  const runId = `${now.replace(/[-:]/g, "").replace(/\..+$/, "Z")}-${taskId.replace(".", "-")}`;
  state.tasks[taskId] = {
    ...(state.tasks[taskId] ?? {}),
    status: "in_progress",
    claimedAt: now,
    updatedAt: now,
    runId,
    evidence: state.tasks[taskId]?.evidence ?? [],
  };
  state.runs.push({ runId, taskId, status: "in_progress", startedAt: now });
  mkdirSync(join(planFolder, "plan.runs"), { recursive: true });
  writeFileSync(
    join(planFolder, "plan.runs", `${runId}.json`),
    `${JSON.stringify({ runId, taskId, startedAt: now, task }, null, 2)}\n`,
  );
  return state;
}

function markTask(assessment, taskId, status, evidence) {
  const task = assessment.tasks.find((entry) => entry.id === taskId);
  if (!task) throw new Error(`Cannot mark unknown task: ${taskId}`);
  const state = assessment.state;
  const now = new Date().toISOString();
  const existing = state.tasks[taskId] ?? { evidence: [] };
  const evidenceList = Array.isArray(existing.evidence) ? existing.evidence : [];
  if (evidence) evidenceList.push({ at: now, text: evidence });
  state.tasks[taskId] = {
    ...existing,
    status,
    updatedAt: now,
    completedAt: status === "done" ? now : existing.completedAt ?? null,
    evidence: evidenceList,
  };
  state.runs = (state.runs ?? []).map((run) =>
    run.taskId === taskId && !run.completedAt ? { ...run, status, completedAt: now } : run,
  );
  return state;
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function printHuman(assessment) {
  const lines = [];
  lines.push(`Plan: ${assessment.planFolder}`);
  lines.push(`Tasks: ${assessment.summary.totalTasks} total, ${assessment.summary.done} done, ${assessment.summary.ready} ready, ${assessment.summary.in_progress} in progress, ${assessment.summary.review} in review`);
  if (assessment.stopReasons.length > 0) {
    lines.push("Stop reasons:");
    for (const reason of assessment.stopReasons) lines.push(`- ${reason}`);
  }
  if (assessment.recommendedTask) {
    lines.push(`Recommended: ${assessment.recommendedTask.id} - ${assessment.recommendedTask.title}`);
  } else {
    lines.push("Recommended: none");
  }
  if (assessment.parallelGroup.length > 1) {
    lines.push(`Parallel-safe candidates: ${assessment.parallelGroup.map((task) => task.id).join(", ")}`);
  }
  return `${lines.join("\n")}\n`;
}

export function run(argv = process.argv.slice(2), cwd = process.cwd()) {
  const args = parseArgs(argv);
  const planFolder = discoverPlanFolder(cwd, args.plan);
  let assessment = assessPlan({ cwd, planFolder, includeGit: !args.noGit });

  if (args.claim) {
    assessment.state = claimTask(planFolder, assessment, args.claim);
    writeAssessmentFiles(planFolder, assessment);
    assessment = assessPlan({ cwd, planFolder, includeGit: !args.noGit });
  }

  if (args.mark) {
    assessment.state = markTask(assessment, args.mark, args.status, args.evidence);
    writeAssessmentFiles(planFolder, assessment);
    assessment = assessPlan({ cwd, planFolder, includeGit: !args.noGit });
  }

  if (args.write) writeAssessmentFiles(planFolder, assessment);
  return assessment;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    const assessment = run();
    process.stdout.write(process.argv.includes("--json") ? `${JSON.stringify(assessment, null, 2)}\n` : printHuman(assessment));
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}
