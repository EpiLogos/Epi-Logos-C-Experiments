#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const STATE_VERSION = 1;
const STATUSES = new Set(["pending", "ready", "in_progress", "blocked", "review", "done"]);
const DEFAULT_LEASE_MINUTES = 120;

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
    context: null,
    reset: false,
    route: false,
    subagents: false,
    inSession: false,
    parallel: false,
    owner: null,
    leaseMinutes: DEFAULT_LEASE_MINUTES,
    worktree: null,
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
    else if (arg === "--context") args.context = argv[++i];
    else if (arg === "--reset") args.reset = true;
    else if (arg === "--route" || arg === "--mark-route") args.route = true;
    else if (arg === "--subagents") args.subagents = true;
    else if (arg === "--in-session") args.inSession = true;
    else if (arg === "--parallel") args.parallel = true;
    else if (arg === "--owner") args.owner = argv[++i];
    else if (arg === "--lease-minutes") args.leaseMinutes = Number.parseInt(argv[++i], 10);
    else if (arg === "--worktree") args.worktree = argv[++i];
    else if (!arg.startsWith("--") && !args.plan) args.plan = arg;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (args.status && !STATUSES.has(args.status)) {
    throw new Error(`Invalid status "${args.status}". Expected one of: ${Array.from(STATUSES).join(", ")}`);
  }
  if (args.mark && !args.status) {
    throw new Error("--mark requires --status");
  }
  if (!Number.isFinite(args.leaseMinutes) || args.leaseMinutes <= 0) {
    throw new Error("--lease-minutes must be a positive integer");
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
    "05": ["Body/M/epi-tauri/**", "Idea/Pratibimba/System/**"],
    "06": ["Body/M/epi-tauri/**"],
    "07": ["Idea/Pratibimba/System/extensions/**"],
    "08": ["Idea/Pratibimba/System/extensions/**"],
    "09": ["Body/S/S4/**", "Body/S/S5/**", "Body/M/epi-tauri/**", "Idea/Pratibimba/System/**"],
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
    activeRoute: state.activeRoute ?? null,
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
      owner: existing.owner ?? null,
      leaseExpiresAt: existing.leaseExpiresAt ?? null,
      heartbeatAt: existing.heartbeatAt ?? null,
      runId: existing.runId ?? null,
      worktree: existing.worktree ?? null,
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
  const now = new Date();
  const staleActiveTasks = inProgressTasks.filter((task) => task.leaseExpiresAt && new Date(task.leaseExpiresAt) <= now);
  const hardStops = [];
  const softCautions = [];
  const carryForwardRisks = [];

  if (inProgressTasks.length > 0) {
    softCautions.push(
      `${inProgressTasks.length} active task(s) already in progress; resume matching work orders before claiming fresh lanes.`,
    );
  }
  if (reviewTasks.length > 0) {
    softCautions.push(`${reviewTasks.length} task(s) in review; finish or requeue them before treating downstream work as done.`);
  }
  if (staleActiveTasks.length > 0) {
    softCautions.push(`${staleActiveTasks.length} active task lease(s) appear stale and can be renewed by the same owner or requeued deliberately.`);
  }
  if (dirtyOverlaps.length > 0) {
    softCautions.push(`${dirtyOverlaps.length} ready task(s) overlap dirty files; prefer resume, same-owner continuation, or isolated worktrees.`);
  }

  const blockedTasks = enrichedTasks.filter((task) => task.status === "blocked");
  if (blockedTasks.length > 0) {
    carryForwardRisks.push(`${blockedTasks.length} task(s) are blocked; keep building other lanes unless a dependency edge requires them.`);
  }
  const waitingTasks = enrichedTasks.filter((task) => task.computedStatus === "waiting");
  if (waitingTasks.length > 0) {
    carryForwardRisks.push(`${waitingTasks.length} task(s) are waiting on dependencies; reassess after each completed tranche.`);
  }

  const recommendedTask = readyTasks[0] ?? null;
  const parallelGroup = buildParallelGroup(readyTasks, dirtyFiles);
  const recommendedRoute = buildRecommendedRoute(enrichedTasks);
  const workOrders = buildWorkOrders(recommendedRoute, dirtyOverlaps);

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
    hardStops,
    softCautions,
    carryForwardRisks,
    stopReasons: hardStops,
    recommendedTask,
    recommendedRoute,
    workOrders,
    parallelGroup,
    parallelExecution: parallelGroup.length > 1 && hardStops.length === 0,
    dirtyFiles,
    dirtyOverlaps,
    tasks: enrichedTasks.map(({ body, ...task }) => task),
    index,
    state,
  };
}

export function buildContextPack({ cwd = process.cwd(), planFolder, assessment, taskId }) {
  const indexedTask = assessment.index.tasks.find((entry) => entry.id === taskId);
  const task = assessment.tasks.find((entry) => entry.id === taskId);
  if (!indexedTask || !task) throw new Error(`Cannot build context pack for unknown task: ${taskId}`);

  const trackPath = join(planFolder, indexedTask.file);
  const trackContent = readFileSync(trackPath, "utf8");
  const sourceSpecs = extractMarkdownSection(trackContent, "Source Specs");
  const trackOpenDecisions = extractMarkdownSection(trackContent, "Open Decisions");
  const dependencies = task.dependsOn.map((depId) => {
    const dep = assessment.index.tasks.find((entry) => entry.id === depId);
    return dep ? `${dep.id} - ${dep.title} (${dep.file})` : `${depId} - missing from current index`;
  });
  const sourceFiles = Array.from(
    new Set([
      indexedTask.path,
      ...extractPathReferences(sourceSpecs),
      ...extractPathReferences(indexedTask.body),
      ...task.dependsOn
        .map((depId) => assessment.index.tasks.find((entry) => entry.id === depId)?.path)
        .filter(Boolean),
      relative(cwd, join(planFolder, "11-open-architectural-decisions.md")),
    ]),
  ).sort();
  const openDecisionExcerpt = readOpenDecisionExcerpt(planFolder);
  const contextPath = join(planFolder, "plan.runs", `context-${taskId.replace(".", "-")}.md`);
  const generatedAt = new Date().toISOString();

  const markdown = `# M-Dev Context Pack - ${taskId}

Generated: ${generatedAt}

## Task

- **ID:** ${task.id}
- **Title:** ${task.title}
- **Track:** ${indexedTask.file}
- **Computed status:** ${task.computedStatus}
- **Write scopes:** ${task.writeScopes.join(", ") || "unspecified"}

## Required Reading

Read these before implementation. Do not rely on the tranche summary alone.

${sourceFiles.map((file) => `- \`${file}\``).join("\n")}

## Dependency Context

${dependencies.length > 0 ? dependencies.map((dep) => `- ${dep}`).join("\n") : "- None"}

## Track Source Specs

${sourceSpecs || "_No Source Specs section found in the track file. Pause and gather source context manually before implementation._"}

## Task Body

${indexedTask.body}

## Track Open Decisions

${trackOpenDecisions || "_No track-specific Open Decisions section found._"}

## Decision Register Excerpt

${openDecisionExcerpt}

## Execution Guidance

- Default to in-session execution unless the user explicitly requested subagents for this run.
- If subagents are used, give each subagent this context pack plus the exact source files it must read.
- Before editing code, verify the relevant source/spec files above have actually been read or searched for the sections cited in the plan.
- Verification must exercise real functionality; mock-only or placeholder proof does not satisfy the ledger.
`;

  mkdirSync(dirname(contextPath), { recursive: true });
  writeFileSync(contextPath, markdown);
  return {
    path: relative(cwd, contextPath),
    taskId,
    sourceFiles,
  };
}

function extractMarkdownSection(content, heading) {
  const lines = content.split("\n");
  const headingPattern = new RegExp(`^##\\s+${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`);
  const start = lines.findIndex((line) => headingPattern.test(line));
  if (start === -1) return "";
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i])) {
      end = i;
      break;
    }
  }
  return lines.slice(start + 1, end).join("\n").trim();
}

function extractPathReferences(text) {
  const refs = new Set();
  if (!text) return [];
  const patterns = [
    /`((?:Body|Idea|docs|pratibimba|\.codex|\.claude|\.omx|src|scripts|tests|vendors)\/[^`]+?)`/g,
    /\b((?:Body|Idea|docs|pratibimba|\.codex|\.claude|\.omx|src|scripts|tests|vendors)\/[^\s),;]+?\.(?:md|rs|ts|tsx|js|mjs|json|toml|yaml|yml|c|h))\b/g,
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const ref = match[1].replace(/[,.;:]$/, "");
      refs.add(ref);
    }
  }
  return Array.from(refs);
}

function readOpenDecisionExcerpt(planFolder) {
  const decisionPath = join(planFolder, "11-open-architectural-decisions.md");
  if (!existsSync(decisionPath)) return "_No decision register found._";
  const content = readFileSync(decisionPath, "utf8");
  const index = extractMarkdownSection(content, "Decision Index");
  const userFinal = extractMarkdownSection(content, "User-Final-Validation Required");
  const prototype = extractMarkdownSection(content, "Prototype-Resolved Decisions");
  return [index, userFinal, prototype].filter(Boolean).join("\n\n").slice(0, 16000);
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
    owner: record.owner ?? null,
    leaseExpiresAt: record.leaseExpiresAt ?? null,
    heartbeatAt: record.heartbeatAt ?? null,
    runId: record.runId ?? null,
    worktree: record.worktree ?? null,
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

function buildWorkOrders(route, dirtyOverlaps) {
  const dirtyByTask = new Map(dirtyOverlaps.map((entry) => [entry.taskId, entry.files]));
  return route.tasks.map((task, index) => {
    const dirtyFiles = dirtyByTask.get(task.id) ?? [];
    const action = workOrderAction(task);
    return {
      order: index + 1,
      taskId: task.id,
      title: task.title,
      action,
      canStart: (action === "claim" || action === "resume") && dirtyFiles.length === 0,
      status: task.status,
      computedStatus: task.computedStatus,
      modeHint: task.modeHint,
      effortWeight: task.effortWeight,
      owner: task.owner ?? null,
      leaseExpiresAt: task.leaseExpiresAt ?? null,
      worktree: task.worktree ?? null,
      writeScopes: task.writeScopes,
      dirtyFiles,
      lane: `${task.trackId}:${task.writeScopes.map(stripGlob).join("+") || "unspecified"}`,
    };
  });
}

function workOrderAction(task) {
  if (task.status === "in_progress" || task.status === "review") return "resume";
  if (task.computedStatus === "ready") return "claim";
  if (task.computedStatus === "waiting") return "wait";
  return "skip";
}

function buildRecommendedRoute(tasks, { minTasks = 3, maxTasks = 5, weightBudget = 8 } = {}) {
  const simulatedDone = new Set(tasks.filter((task) => task.status === "done").map((task) => task.id));
  const selectedIds = new Set();
  const route = [];
  let totalWeight = 0;

  for (const task of activeRoutePrefix(tasks)) {
    if (route.length >= maxTasks) break;
    const weight = effortWeight(task);
    route.push(routeTaskSummary(task, weight));
    selectedIds.add(task.id);
    simulatedDone.add(task.id);
    totalWeight += weight;
  }

  while (route.length < maxTasks) {
    const ready = simulatedReadyTasks(tasks, simulatedDone, selectedIds).sort(comparePriority);
    if (ready.length === 0) break;

    const next = ready[0];
    const weight = effortWeight(next);
    if (route.length >= minTasks && totalWeight + weight > weightBudget) break;

    route.push(routeTaskSummary(next, weight));
    selectedIds.add(next.id);
    simulatedDone.add(next.id);
    totalWeight += weight;
  }

  const taskIds = route.map((task) => task.id);
  return {
    taskIds,
    tasks: route,
    totalWeight,
    maxTasks,
    minTasks: Math.min(minTasks, tasks.filter((task) => task.status !== "done").length),
    weightBudget,
    taxingLevel: routeTaxingLevel(route, totalWeight),
    rationale: routeRationale(route, totalWeight, weightBudget),
  };
}

function activeRoutePrefix(tasks) {
  return tasks
    .filter((task) => task.status === "in_progress" || task.status === "review")
    .sort((a, b) => {
      const aTime = a.claimedAt ?? a.completedAt ?? "";
      const bTime = b.claimedAt ?? b.completedAt ?? "";
      return aTime.localeCompare(bTime) || a.id.localeCompare(b.id, undefined, { numeric: true });
    });
}

function simulatedReadyTasks(tasks, simulatedDone, selectedIds) {
  return tasks.filter((task) => {
    if (selectedIds.has(task.id)) return false;
    if (task.status === "done" || task.status === "blocked" || task.status === "in_progress" || task.status === "review") return false;
    if (task.missingDeps.length > 0) return false;
    return task.dependsOn.every((depId) => simulatedDone.has(depId));
  });
}

function routeTaskSummary(task, weight) {
  const { body, ...summary } = task;
  return {
    ...summary,
    effortWeight: weight,
    modeHint: modeHintForWeight(weight),
  };
}

function effortWeight(task) {
  const text = `${task.effort ?? ""} ${task.title ?? ""}`.toLowerCase();
  let weight = 2;
  if (/\bxl\b/.test(text)) weight = 5;
  else if (/\bl\b/.test(text)) weight = 3;
  else if (/\bm\b/.test(text)) weight = 2;
  else if (/\bs\b/.test(text)) weight = 1;

  const weekRange = text.match(/(\d+)(?:\s*[-–]\s*(\d+))?\s*weeks?/);
  if (weekRange) {
    const weeks = Number.parseInt(weekRange[2] ?? weekRange[1], 10);
    weight = Math.max(weight, weeks >= 2 ? 5 : 3);
  }

  const dayRange = text.match(/(\d+)(?:\s*[-–]\s*(\d+))?\s*days?/);
  if (dayRange) {
    const days = Number.parseInt(dayRange[2] ?? dayRange[1], 10);
    weight = Math.max(weight, days >= 5 ? 3 : days >= 2 ? 2 : 1);
  }

  return weight;
}

function modeHintForWeight(weight) {
  if (weight >= 5) return "split-before-execution";
  if (weight >= 3) return "consider-subagents-if-approved";
  return "in-session";
}

function routeTaxingLevel(route, totalWeight) {
  if (route.some((task) => task.effortWeight >= 5) || totalWeight > 8) return "heavy";
  if (totalWeight <= 4) return "light";
  return "balanced";
}

function routeRationale(route, totalWeight, weightBudget) {
  if (route.length === 0) return ["No pending task is dependency-ready under the current ledger."];
  const rationale = [
    `Simulated each selected task as done before choosing the next task, so downstream dependencies can enter the route.`,
    `Capped the route at ${route.length} task(s) with total effort weight ${totalWeight}/${weightBudget} unless fewer tasks were available.`,
  ];
  if (route.some((task) => task.status === "in_progress" || task.status === "review")) {
    rationale.push("Placed active in-progress/review task(s) at the front so the route resumes before claiming fresh work.");
  }
  if (route.some((task) => task.modeHint !== "in-session")) {
    rationale.push("Marked heavier tasks for optional subagents or split-before-execution review; default execution remains in-session.");
  }
  return rationale;
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

function resetState() {
  return {
    version: STATE_VERSION,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tasks: {},
    runs: [],
    activeRoute: null,
  };
}

function markActiveRoute(assessment) {
  const now = new Date().toISOString();
  const route = assessment.recommendedRoute;
  assessment.state.activeRoute = {
    status: route.taskIds.length > 0 ? "active" : "empty",
    createdAt: now,
    updatedAt: now,
    taskIds: route.taskIds,
    totalWeight: route.totalWeight,
    taxingLevel: route.taxingLevel,
    weightBudget: route.weightBudget,
    modeHints: Object.fromEntries(route.tasks.map((task) => [task.id, task.modeHint])),
    rationale: route.rationale,
  };
  assessment.state.updatedAt = now;
  return assessment.state.activeRoute;
}

function claimTask(planFolder, assessment, taskId, { owner = defaultOwner(), leaseMinutes = DEFAULT_LEASE_MINUTES, worktree = null } = {}) {
  const task = assessment.tasks.find((entry) => entry.id === taskId);
  if (!task) throw new Error(`Cannot claim unknown task: ${taskId}`);
  if ((task.status === "in_progress" || task.status === "review") && task.owner === owner) {
    return renewTaskLease(assessment.state, taskId, { owner, leaseMinutes, worktree });
  }
  if (task.computedStatus !== "ready") {
    throw new Error(`Cannot claim ${taskId}: computed status is ${task.computedStatus}`);
  }
  const state = assessment.state;
  const now = new Date().toISOString();
  const leaseExpiresAt = leaseExpiry(now, leaseMinutes);
  const runId = `${now.replace(/[-:]/g, "").replace(/\..+$/, "Z")}-${taskId.replace(".", "-")}`;
  state.tasks[taskId] = {
    ...(state.tasks[taskId] ?? {}),
    status: "in_progress",
    claimedAt: now,
    updatedAt: now,
    heartbeatAt: now,
    leaseExpiresAt,
    owner,
    worktree,
    runId,
    evidence: state.tasks[taskId]?.evidence ?? [],
  };
  state.runs.push({ runId, taskId, status: "in_progress", startedAt: now, owner, leaseExpiresAt, worktree });
  mkdirSync(join(planFolder, "plan.runs"), { recursive: true });
  writeFileSync(
    join(planFolder, "plan.runs", `${runId}.json`),
    `${JSON.stringify({ runId, taskId, startedAt: now, owner, leaseExpiresAt, worktree, task }, null, 2)}\n`,
  );
  return state;
}

function renewTaskLease(state, taskId, { owner, leaseMinutes, worktree }) {
  const now = new Date().toISOString();
  const leaseExpiresAt = leaseExpiry(now, leaseMinutes);
  const existing = state.tasks[taskId] ?? {};
  state.tasks[taskId] = {
    ...existing,
    owner,
    worktree: worktree ?? existing.worktree ?? null,
    heartbeatAt: now,
    leaseExpiresAt,
    updatedAt: now,
  };
  state.runs = (state.runs ?? []).map((run) =>
    run.taskId === taskId && !run.completedAt ? { ...run, owner, leaseExpiresAt, heartbeatAt: now, worktree: worktree ?? run.worktree ?? null } : run,
  );
  return state;
}

function leaseExpiry(nowIso, leaseMinutes) {
  return new Date(new Date(nowIso).getTime() + leaseMinutes * 60 * 1000).toISOString();
}

function defaultOwner() {
  return process.env.M_DEV_OWNER || process.env.CODEX_SESSION_ID || process.env.USER || "m-dev";
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
    leaseExpiresAt: status === "in_progress" || status === "review" ? existing.leaseExpiresAt ?? null : null,
    heartbeatAt: status === "in_progress" || status === "review" ? now : existing.heartbeatAt ?? null,
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
  if (assessment.hardStops.length > 0) {
    lines.push("Hard stops:");
    for (const reason of assessment.hardStops) lines.push(`- ${reason}`);
  }
  if (assessment.softCautions.length > 0) {
    lines.push("Soft cautions:");
    for (const reason of assessment.softCautions) lines.push(`- ${reason}`);
  }
  if (assessment.carryForwardRisks.length > 0) {
    lines.push("Carry-forward risks:");
    for (const reason of assessment.carryForwardRisks) lines.push(`- ${reason}`);
  }
  if (assessment.recommendedTask) {
    lines.push(`Recommended: ${assessment.recommendedTask.id} - ${assessment.recommendedTask.title}`);
  } else {
    lines.push("Recommended: none");
  }
  if (assessment.recommendedRoute?.tasks?.length > 0) {
    lines.push(
      `Route (${assessment.recommendedRoute.taxingLevel}, weight ${assessment.recommendedRoute.totalWeight}/${assessment.recommendedRoute.weightBudget}): ${assessment.recommendedRoute.tasks
        .map((task) => `${task.id}[${task.modeHint}]`)
        .join(" -> ")}`,
    );
  }
  if (assessment.state.activeRoute?.taskIds?.length > 0) {
    lines.push(`Active route: ${assessment.state.activeRoute.taskIds.join(" -> ")}`);
  }
  if (assessment.workOrders.length > 0) {
    lines.push(`Work orders: ${assessment.workOrders.map((order) => `${order.taskId}:${order.action}`).join(", ")}`);
  }
  if (assessment.parallelGroup.length > 1) {
    lines.push(`Parallel-safe candidates: ${assessment.parallelGroup.map((task) => task.id).join(", ")}`);
  }
  if (assessment.contextPack) {
    lines.push(`Context pack: ${assessment.contextPack.path}`);
  }
  return `${lines.join("\n")}\n`;
}

export function run(argv = process.argv.slice(2), cwd = process.cwd()) {
  const args = parseArgs(argv);
  const planFolder = discoverPlanFolder(cwd, args.plan);
  if (args.reset) {
    mkdirSync(join(planFolder, "plan.runs"), { recursive: true });
    writeFileSync(join(planFolder, "plan.state.json"), `${JSON.stringify(resetState(), null, 2)}\n`);
  }
  let assessment = assessPlan({ cwd, planFolder, includeGit: !args.noGit });

  if (args.route) {
    markActiveRoute(assessment);
    writeAssessmentFiles(planFolder, assessment);
    assessment = assessPlan({ cwd, planFolder, includeGit: !args.noGit });
  }

  if (args.claim) {
    assessment.state = claimTask(planFolder, assessment, args.claim, {
      owner: args.owner ?? defaultOwner(),
      leaseMinutes: args.leaseMinutes,
      worktree: args.worktree,
    });
    writeAssessmentFiles(planFolder, assessment);
    assessment = assessPlan({ cwd, planFolder, includeGit: !args.noGit });
  }

  if (args.mark) {
    assessment.state = markTask(assessment, args.mark, args.status, args.evidence);
    writeAssessmentFiles(planFolder, assessment);
    assessment = assessPlan({ cwd, planFolder, includeGit: !args.noGit });
  }

  if (args.context) {
    assessment.contextPack = buildContextPack({ cwd, planFolder, assessment, taskId: args.context });
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
