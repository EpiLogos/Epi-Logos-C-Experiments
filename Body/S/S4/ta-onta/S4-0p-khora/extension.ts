import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { spawnSync } from "node:child_process";
import { existsSync, writeFileSync, appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { join, basename, dirname } from "node:path";
// cross-agent disabled: Claude/Gemini/Codex @-discovery not needed for pi-native agent dispatch
// import registerCrossAgent from "./S0'/cross-agent.ts";
import registerSystemSelect from "./S0'/system-select.ts";
import { composePhaseVakAddress } from "./modules/z-phase-vak.ts";
import {
  createKhoraFlowWatcher,
  RESULT_ARTIFACT_WAKE,
  type KhoraFlowWatcher,
  type KhoraFlowEvent,
} from "./modules/flow-watcher.ts";
import {
  consumePendingSophia,
  fireSophiaDisclosure,
  recordPendingSophia,
} from "./modules/sophia-fire.ts";
import { stampNowFibonacciGroundFrontmatter } from "./modules/now-fibonacci-ground.ts";
import { stampNowKleinWeightingFrontmatter } from "./modules/now-klein-weighting.ts";
import {
  bindHarnessToSessionWorkspace,
  parseSessionWorkspace,
  readSessionWorkspaceForBootstrap,
  writeSessionWorkspaceAtomically,
  type GatewaySessionProjection,
} from "./modules/session-workspace.ts";

// Session state singleton (persists within a PI process)
let _sessionId: string | null = null;
let _dayId: string | null = null;
let _nowPath: string | null = null;
let _flowWatcher: KhoraFlowWatcher | null = null;
let _m4ProteinHandle: string | null = null;
let _m4ProteinClosed = false;

// Exported getters — other extensions and agent-team.ts read these
export function getSessionId() { return _sessionId ?? process.env.EPI_SESSION_ID ?? null; }
export function getDayId()     { return _dayId     ?? process.env.EPI_DAY_ID     ?? null; }
export function getNowPath()   { return _nowPath   ?? process.env.EPI_NOW_PATH   ?? null; }

const AGENT_HIGHLIGHT_CATEGORIES = Object.freeze([
  "recognition",
  "prospective-surfacing",
  "retrospective-surfacing",
  "kairos-touch",
  "somatic-mark",
  "live-spread",
] as const);

export type KhoraAgentHighlightCategory = (typeof AGENT_HIGHLIGHT_CATEGORIES)[number];

export interface KhoraHighlightedInscriptionInput {
  readonly path: string;
  readonly category: KhoraAgentHighlightCategory;
  readonly position?: "top" | "bottom";
  readonly content: string;
  readonly response_token: string;
  readonly coordinate?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function highlightedInscriptionBlock(input: KhoraHighlightedInscriptionInput): string {
  const timestamp = Date.now();
  const highlightId = `agent_${input.response_token.replace(/[^a-zA-Z0-9_-]/g, "_")}_${timestamp}`;
  const safeContent = escapeHtml(input.content.trim());
  return [
    `<mark class="m4-nara-highlight m4-nara-highlight-${input.category}" data-highlight-id="${highlightId}" data-category="${input.category}" data-timestamp="${timestamp}" data-original-text="${escapeAttribute(input.content.trim())}" data-highlight-label="${escapeAttribute(input.response_token)}">`,
    safeContent,
    "</mark>",
    "",
  ].join("\n");
}

export async function khora_write_highlighted_inscription(
  input: KhoraHighlightedInscriptionInput,
): Promise<{ path: string; response_token: string; category: KhoraAgentHighlightCategory }> {
  if (!AGENT_HIGHLIGHT_CATEGORIES.includes(input.category)) {
    throw new Error(`Unsupported agent highlight category: ${input.category}`);
  }
  if (!input.path.trim()) throw new Error("path is required");
  if (!input.content.trim()) throw new Error("content is required");
  if (!input.response_token.trim()) throw new Error("response_token is required");

  mkdirSync(dirname(input.path), { recursive: true });
  const existing = existsSync(input.path) ? readFileSync(input.path, "utf8") : "";
  const block = highlightedInscriptionBlock(input);
  const next =
    input.position === "bottom"
      ? `${existing.trimEnd()}\n\n${block}`
      : `${block}${existing.replace(/^\s*/, "")}`;

  writeFileSync(input.path, next, "utf8");
  await enqueue_sync_event({
    path: input.path,
    coordinate: input.coordinate,
    action: "write",
  });
  appendFileSync(join(process.env.EPI_REPO_ROOT || ".", ".khora-highlight-events.jsonl"), JSON.stringify({
    ts: new Date().toISOString(),
    path: input.path,
    category: input.category,
    response_token: input.response_token,
    source: "khora_write_highlighted_inscription",
  }) + "\n", "utf8");

  return { path: input.path, response_token: input.response_token, category: input.category };
}

function dailyNotePath(dayId: string | null): string | null {
  if (!dayId) return null;
  const vaultRoot = process.env.EPILOGOS_VAULT || join(process.env.EPI_REPO_ROOT || process.cwd(), "Idea");
  return join(vaultRoot, "Empty", "Present", dayId, "daily-note.md");
}

function invokeNaraSessionDispatch(kind: "open" | "close", payload: Record<string, unknown>): Record<string, unknown> | null {
  const command = kind === "open" ? "nara-session-open" : "nara-session-close";
  const result = spawnSync(
    "epi",
    ["--json", "gate", "dispatch", command, "--payload-json", JSON.stringify(payload)],
    { encoding: "utf8" },
  );
  if (result.status !== 0) {
    console.warn(`[khora] nara.session_${kind} failed (non-blocking): ${result.stderr?.trim() || result.stdout?.trim() || "no output"}`);
    return null;
  }
  try {
    return JSON.parse(result.stdout || "{}");
  } catch (e) {
    console.warn(`[khora] nara.session_${kind} returned invalid JSON: ${e}`);
    return null;
  }
}

function openM4SessionProtein(sessionId: string): void {
  const response = invokeNaraSessionDispatch("open", {
    session_id: sessionId,
    kairos: Date.now(),
  });
  const handle = response?.protein_handle;
  if (typeof handle === "string" && handle.length > 0) {
    _m4ProteinHandle = handle;
    _m4ProteinClosed = false;
  }
}

function closeM4SessionProtein(sessionId: string | null): Record<string, unknown> | null {
  if (!sessionId || !_m4ProteinHandle || _m4ProteinClosed) return null;
  const response = invokeNaraSessionDispatch("close", {
    session_id: sessionId,
    protein_handle: _m4ProteinHandle,
    kairos_close: Date.now(),
  });
  if (response?.ok === true) {
    _m4ProteinClosed = true;
  }
  return response;
}

function recordFlowWatcherEvent(api: ExtensionAPI, event: KhoraFlowEvent) {
  const nowPath = _nowPath ?? process.env.EPI_NOW_PATH ?? event.path;
  if (nowPath) {
    try {
      stampNowFibonacciGroundFrontmatter(nowPath);
    } catch (e) {
      console.warn(`[khora] NOW Fibonacci Ground stamp skipped: ${e}`);
    }
  }
  appendFileSync(join(process.env.EPI_REPO_ROOT || ".", ".khora-flow-events.jsonl"), JSON.stringify(event) + "\n", "utf8");
  const emit = (api as unknown as { emit?: (name: string, payload: unknown) => void | Promise<void> }).emit;
  if (emit) {
    void Promise.resolve(emit(event.kind, event));
    if (event.kind !== RESULT_ARTIFACT_WAKE) {
      void Promise.resolve(emit("tranche.complete", event));
    }
  }
}

function gateStateRoot(repoRoot: string): string {
  return process.env.EPI_GATE_STATE_ROOT
    || process.env.EPI_GATE_ROOT
    || join(process.env.HOME || repoRoot, ".epi", "gate");
}

function currentGatewaySessionKey(): string | null {
  return process.env.EPI_GATE_SESSION_KEY
    || process.env.EPI_SESSION_KEY
    || _sessionId
    || process.env.EPI_SESSION_ID
    || null;
}

function currentTmuxLease(sessionId: string): Record<string, unknown> {
  return {
    leaseId: process.env.EPI_TMUX_LEASE_ID || `khora-${sessionId}`,
    leaseOwner: process.env.EPI_AGENT_ID || process.env.EPI_AGENT_NAME || "pi",
    leasePurpose: "khora-session-workspace",
    sessionName: process.env.EPI_TMUX_SESSION || process.env.TMUX_SESSION,
    paneId: process.env.EPI_TMUX_PANE || process.env.TMUX_PANE,
    live: Boolean(process.env.TMUX || process.env.EPI_TMUX_PANE || process.env.TMUX_PANE),
  };
}

function applyBootstrapHarnessBinding(sessionKey: string, repoRoot: string): void {
  try {
    const binding = readSessionWorkspaceForBootstrap({
      gateStateRoot: gateStateRoot(repoRoot),
      sessionKey,
    });
    if (!binding) return;
    process.env.EPI_HARNESS_BINDING = JSON.stringify(binding.workspace.harness);
    process.env.EPI_HARNESS_ID = binding.workspace.harness.harness_id;
    process.env.EPI_HARNESS_MODEL_SLOT = binding.workspace.harness.model_slot;
    process.env.EPI_HARNESS_LEASE_RESUMED = binding.leaseResumed ? "1" : "0";
  } catch (e) {
    console.warn(`[khora] session-workspace bootstrap read skipped: ${e}`);
  }
}

function bindCurrentPiHarness(repoRoot: string): void {
  const sessionId = getSessionId();
  if (!sessionId) return;
  try {
    const sessionKey = currentGatewaySessionKey() || sessionId;
    const lineage = process.env.EPI_SUBAGENT_LINEAGE
      ? JSON.parse(process.env.EPI_SUBAGENT_LINEAGE)
      : [];
    const session: GatewaySessionProjection = {
      canonicalKey: sessionKey,
      sessionId,
      dayId: getDayId() ?? undefined,
      vaultNowPath: getNowPath() ?? undefined,
      runtimeCwd: repoRoot,
      providerOverride: process.env.EPI_PROVIDER_OVERRIDE,
      modelOverride: process.env.EPI_MODEL_OVERRIDE || process.env.PI_MODEL,
      resultDropDir: process.env.EPI_RESULT_DROP_DIR,
      resultDayDir: process.env.EPI_RESULT_DAY_DIR,
      resultParentNowPath: process.env.EPI_PARENT_NOW_PATH,
      parentSessionKey: process.env.EPI_PARENT_SESSION_KEY,
      activeAgentId: process.env.EPI_AGENT_ID || process.env.EPI_AGENT_NAME || "anima",
      subagentLineage: Array.isArray(lineage) ? lineage.map(String) : [],
      terminalBinding: { lease: currentTmuxLease(sessionId) },
    };
    bindHarnessToSessionWorkspace({
      gateStateRoot: gateStateRoot(repoRoot),
      session,
      harnessId: process.env.EPI_HARNESS_ID || "pi",
      backing: "native-cli",
      permissionProfile: process.env.EPI_PERMISSION_PROFILE || "khora-write-authority",
      cfIdentity: process.env.EPI_CF_IDENTITY || "anima",
      authority: "khora_write",
    });
  } catch (e) {
    console.warn(`[khora] session-workspace harness bind skipped: ${e}`);
  }
}

export async function khoraExtension(api: ExtensionAPI) {
  // registerCrossAgent(api);
  registerSystemSelect(api);

  // ── Tool: khora_session_init ─────────────────────────────────────
  api.registerTool({
    name: "khora_session_init",
    label: "Khora Session Init",
    description: "Initialize a Khora session: generate session ID, run bootstrap sequence, export env vars. Must be called before any vault operations.",
    parameters: Type.Object({
      now: Type.Optional(Type.String({ description: "ISO8601 override for deterministic testing" })),
      random_suffix: Type.Optional(Type.String({ description: "Override random suffix (testing only)" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      try {
        const args = ["agent", "session", "init"];
        if (params.now) args.push("--now", params.now);
        if (params.random_suffix) args.push("--random-suffix", params.random_suffix);
        const result = spawnSync("epi", args, { encoding: "utf8" });
        if (result.status !== 0) throw new Error(result.stderr || "session init failed");
        // Parse env vars from output
        const lines = result.stdout.split("\n");
        for (const line of lines) {
          if (line.startsWith("EPI_SESSION_ID=")) _sessionId = line.split("=")[1];
          if (line.startsWith("EPI_DAY_ID=")) _dayId = line.split("=")[1];
          if (line.startsWith("EPI_NOW_PATH=")) _nowPath = line.split("=")[1];
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (e) {
        return { content: [{ type: "text", text: `khora_session_init error: ${e}` }], isError: true };
      }
    },
  });

  // ── Tool: khora_session_status ───────────────────────────────────
  api.registerTool({
    name: "khora_session_status",
    label: "Khora Session Status",
    description: "Return current session identity (session_id, day_id, now_path) and bootstrap state.",
    parameters: Type.Object({}),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const result = spawnSync("epi", ["agent", "session", "status"], { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }] };
    },
  });

  // ── Tool: khora_write ────────────────────────────────────────────
  api.registerTool({
    name: "khora_write",
    label: "Khora Write",
    description: "THE canonical vault write primitive. ALL vault filesystem writes MUST route through this tool. Writes content to path, then enqueues a graph sync event.",
    parameters: Type.Object({
      path: Type.String({ description: "Absolute filesystem path to write" }),
      content: Type.String({ description: "File content to write" }),
      coordinate: Type.Optional(Type.String({ description: "Coordinate of the artifact (for graph sync)" })),
      create_dirs: Type.Optional(Type.Boolean({ description: "Create parent directories if missing", default: true })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      try {
        if (params.create_dirs !== false) {
          const dir = params.path.substring(0, params.path.lastIndexOf("/"));
          if (dir) mkdirSync(dir, { recursive: true });
        }
        if (basename(params.path) === "session-workspace.json") {
          const workspace = parseSessionWorkspace(params.content);
          if (workspace.harness) {
            writeSessionWorkspaceAtomically(params.path, workspace, "khora_write");
            await enqueue_sync_event({ path: params.path, coordinate: params.coordinate, action: "write" });
            return { content: [{ type: "text", text: `wrote ${params.path}` }] };
          }
        }
        writeFileSync(params.path, params.content, "utf8");
        // Enqueue graph sync event
        await enqueue_sync_event({ path: params.path, coordinate: params.coordinate, action: "write" });
        // PASU.md writes trigger identity propagation: wind → Graphiti IdentityEvent
        if (params.path.endsWith("PASU.md")) {
          spawnSync("epi", ["nara", "wind", "--profile"], { encoding: "utf8" });
        }
        return { content: [{ type: "text", text: `wrote ${params.path}` }] };
      } catch (e) {
        return { content: [{ type: "text", text: `khora_write error: ${e}` }], isError: true };
      }
    },
  });

  // ── Tool: khora_write_highlighted_inscription ─────────────────────
  api.registerTool({
    name: "khora_write_highlighted_inscription",
    label: "Khora Write Highlighted Inscription",
    description: "Write an agent response into a Nara canvas file as a highlighted inscription, then enqueue the canonical Khora graph-sync event.",
    parameters: Type.Object({
      path: Type.String({ description: "Absolute filesystem path to mutate" }),
      category: Type.Union([
        Type.Literal("recognition"),
        Type.Literal("prospective-surfacing"),
        Type.Literal("retrospective-surfacing"),
        Type.Literal("kairos-touch"),
        Type.Literal("somatic-mark"),
        Type.Literal("live-spread"),
      ]),
      position: Type.Optional(Type.Union([Type.Literal("top"), Type.Literal("bottom")], { default: "top" })),
      content: Type.String({ description: "Agent inscription content" }),
      response_token: Type.String({ description: "Chronos response token binding this inscription to its tranche" }),
      coordinate: Type.Optional(Type.String({ description: "Optional graph coordinate for sync" })),
    }),
    async execute(_id: string, params: KhoraHighlightedInscriptionInput, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      try {
        const result = await khora_write_highlighted_inscription(params);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `khora_write_highlighted_inscription error: ${e}` }], isError: true };
      }
    },
  });

  // ── Tool: khora_sync_queue_push ──────────────────────────────────
  api.registerTool({
    name: "khora_sync_queue_push",
    label: "Khora Sync Queue Push",
    description: "Enqueue a graph write event to .khora-sync-queue.jsonl. Called automatically by khora_write.",
    parameters: Type.Object({
      path: Type.String(),
      coordinate: Type.Optional(Type.String()),
      action: Type.Union([Type.Literal("write"), Type.Literal("delete"), Type.Literal("move")]),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      await enqueue_sync_event(params);
      return { content: [{ type: "text", text: "queued" }] };
    },
  });

  // ── Tool: khora_sync_queue_flush ─────────────────────────────────
  api.registerTool({
    name: "khora_sync_queue_flush",
    label: "Khora Sync Queue Flush",
    description: "Flush .khora-sync-queue.jsonl to Neo4j via `epi graph sync` per path-batch (Hen/S2 own the write law). Appends the flushed audit companion; idempotent on (path, ts). Returns counts + failures + Janus staleness warning.",
    parameters: Type.Object({}),
    async execute(_id: string, _params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      // CCT-16 (ii): the real flush path (was: "Neo4j not yet wired" stub).
      const { flushSyncQueue } = await import("./modules/sync-queue-flush.ts");
      const repoRoot = process.env.EPI_REPO_ROOT || ".";
      const report = flushSyncQueue(repoRoot, (path: string) => {
        const result = spawnSync("epi", ["graph", "sync", path], { encoding: "utf8" });
        return {
          ok: result.status === 0,
          output: (result.stdout || "") + (result.stderr || ""),
        };
      });
      const lines = [
        `sync_queue_flush: ${report.processed} event(s) flushed in ${report.batches} batch(es); ${report.skippedAlreadyFlushed} already-flushed skipped`,
      ];
      for (const failure of report.failures) {
        lines.push(`FAILED ${failure.path}: ${failure.output.slice(0, 200)}`);
      }
      if (report.staleWarning) {
        lines.push(report.staleWarning);
      }
      return { content: [{ type: "text", text: lines.join("\n") }] };
    },
  });

  // ── Tool: khora_continuation_write ───────────────────────────────
  api.registerTool({
    name: "khora_continuation_write",
    label: "Khora Continuation Write",
    description: "Write CONTINUATION.md with resumable state snapshot before compaction. Includes session_id, day_id, now_path, and optional summary.",
    parameters: Type.Object({
      summary: Type.Optional(Type.String({ description: "Free-form summary appended to continuation" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const args = ["agent", "session", "continuation"];
      if (params.summary) args.push("--summary", params.summary);
      const result = spawnSync("epi", args, { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }] };
    },
  });

  // ── Tool: khora_session_close ────────────────────────────────────
  // C2 / Z-cycle rehear: ENRICH the upcoming Sophia disclosure.
  //
  // Single-writer inversion (see I1 fix): this tool DOES NOT fire the
  // disclosure itself. It stashes caller-supplied artifacts +
  // improvement_vectors into module-scope pending state via
  // `recordPendingSophia`. The `session_shutdown` lifecycle handler is the
  // ONLY writer to the Sophia JSONL inbox — it reads + clears the pending
  // state and calls `fireSophiaDisclosure`. This guarantees Aletheia (C4)
  // never sees two entries for one session.
  api.registerTool({
    name: "khora_session_close",
    label: "Khora Session Close",
    description: "Enrich the upcoming Sophia disclosure with artifacts + improvement_vectors. The disclosure itself is fired by session_shutdown — call this tool BEFORE shutdown to populate the envelope. Repeated calls overwrite (last writer wins).",
    parameters: Type.Object({
      artifacts: Type.Optional(Type.Array(Type.String(), { description: "Absolute paths of vault notes touched during the session." })),
      improvement_vectors: Type.Optional(Type.Array(Type.String(), { description: "Free-form improvement vectors surfaced during the session — read by Epii recompose." })),
      q_proposals: Type.Optional(Type.Array(Type.Object({
        target_coordinate: Type.String(),
        q_key: Type.String(),
        q_value_candidate: Type.String(),
        qm_witness_session: Type.String(),
        qm_witness_vak: Type.Any(),
        qm_witness_agent: Type.String(),
        rationale: Type.String(),
        opens_questions: Type.Array(Type.String()),
        source_artifacts: Type.Array(Type.String()),
      }), { description: "Candidate q_ refinements surfaced during session-close; not canon writes." })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      try {
        const session_id = getSessionId();
        if (!session_id) {
          return { content: [{ type: "text", text: "khora_session_close skipped: no session_id (session not initialised)" }] };
        }
        recordPendingSophia(
          session_id,
          params.artifacts ?? [],
          params.improvement_vectors ?? [],
          params.q_proposals ?? [],
        );
        const closed = closeM4SessionProtein(session_id);
        const suffix = closed
          ? `; m4 protein sealed (${String(closed.protein_handle ?? "protected handle")})`
          : "";
        return { content: [{ type: "text", text: `sophia disclosure enriched for ${session_id} (fires at session_shutdown)${suffix}` }] };
      } catch (e) {
        return { content: [{ type: "text", text: `khora_session_close error: ${e}` }], isError: true };
      }
    },
  });

  api.on("session_start", async () => {
    const repoRoot = process.env.EPI_REPO_ROOT || process.cwd();
    const bootstrapSessionKey = currentGatewaySessionKey();
    if (bootstrapSessionKey) {
      // Track 39 AP-2 + Track 42.4: read durable harness binding before
      // CONTINUATION.md recovery or session re-bootstrap work can run.
      applyBootstrapHarnessBinding(bootstrapSessionKey, repoRoot);
    }

    // 1. EPI_VAULT_NAME: autodetect from .obsidian/ in repo root (skip if already set by base.env)
    if (!process.env.EPI_VAULT_NAME) {
      if (existsSync(join(repoRoot, ".obsidian"))) {
        process.env.EPI_VAULT_NAME = basename(repoRoot);
      }
    }

    // 2. EPILOGOS_VAULT: autodetect from {repo_root}/Idea (skip if already set)
    // This MUST be set before `epi agent session init` runs so resolve_vault_root picks it up.
    if (!process.env.EPILOGOS_VAULT) {
      const ideaDir = join(repoRoot, "Idea");
      if (existsSync(ideaDir)) {
        process.env.EPILOGOS_VAULT = ideaDir;
      }
    }

    // 3. Create today's Day folder + daily-note from template (idempotent).
    // Runs here so EPILOGOS_VAULT is set before any other extension's session_start fires.
    const dayInit = spawnSync("epi", ["vault", "day-init"], { encoding: "utf8" });
    if (dayInit.status !== 0) console.warn(`[khora] day-init: ${dayInit.stderr?.trim()}`);

    // 4. Z-cycle COMPOSE phase fires here — the dialogical Nous-clearing entry state.
    //    Export EPI_SESSION_VAK_ADDRESS so child processes (Anima dispatches, Aletheia
    //    thoughts, Hen template renders) inherit the initial VAK before any task is bound.
    //    See: Body/S/S4/ta-onta/S4-0p-khora/modules/z-phase-vak.ts and the Z-thread
    //    docstring in docs/superpowers/plans/2026-05-22-vak-as-operational-substrate.md.
    const composeVak = composePhaseVakAddress();
    // SAFETY: mutating process.env here is safe today because composePhaseVakAddress() is a
    // pure constant (same value for every session). If it ever becomes session-parameterised,
    // this mutation must move into per-child-spawn context (e.g. spawnSync env override) to
    // avoid cross-session bleed.
    process.env.EPI_SESSION_VAK_ADDRESS = JSON.stringify(composeVak);

    // 5. Initialize the Khora session (idempotent: reuses today's session if already started)
    const initResult = spawnSync("epi", ["agent", "session", "init"], { encoding: "utf8" });
    if (initResult.status === 0) {
      for (const line of initResult.stdout.split("\n")) {
        if (line.startsWith("EPI_SESSION_ID=")) {
          _sessionId = line.slice("EPI_SESSION_ID=".length).trim() || null;
          if (_sessionId) process.env.EPI_SESSION_ID = _sessionId;
        } else if (line.startsWith("EPI_DAY_ID=")) {
          _dayId = line.slice("EPI_DAY_ID=".length).trim() || null;
          if (_dayId) process.env.EPI_DAY_ID = _dayId;
        } else if (line.startsWith("EPI_NOW_PATH=")) {
          _nowPath = line.split("=").slice(1).join("=").trim() || null;
          if (_nowPath) process.env.EPI_NOW_PATH = _nowPath;
        }
      }

      // 6. Create NOW folder structure from template (thinking/thoughts/tasks/patterns + rendered now.md).
      // Uses vault now-init which renders Idea/Bimba/World/NOW.md — overwrites any previous stub.
      if (_sessionId) {
        const nowInit = spawnSync("epi", ["vault", "now-init", "--session-id", _sessionId], { encoding: "utf8" });
        if (nowInit.status !== 0) console.warn(`[khora] now-init: ${nowInit.stderr?.trim()}`);
        // Update EPI_NOW_PATH to the rendered path (now-init output is "created {path}")
        const nowInitOut = nowInit.stdout.trim().replace(/^created\s+/, "");
        if (nowInitOut && nowInitOut.endsWith("now.md")) {
          _nowPath = nowInitOut;
          process.env.EPI_NOW_PATH = _nowPath;
        }
        if (_nowPath) {
          try {
            stampNowFibonacciGroundFrontmatter(_nowPath);
          } catch (e) {
            console.warn(`[khora] NOW Fibonacci Ground stamp skipped: ${e}`);
          }
          // Session-start only: user override is absolute and the weighting
          // persists for the session, so flow events never re-stamp it (12.18).
          try {
            stampNowKleinWeightingFrontmatter(_nowPath, _sessionId);
          } catch (e) {
            console.warn(`[khora] NOW Klein-weighting stamp skipped: ${e}`);
          }
        }

        _flowWatcher?.stop();
        _flowWatcher = createKhoraFlowWatcher({
          sessionId: _sessionId,
          dayId: _dayId ?? new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
          nowPath: _nowPath,
          dailyNotePath: dailyNotePath(_dayId),
          resultDropNowDir: process.env.EPI_RESULT_DROP_DIR ?? (_nowPath ? dirname(_nowPath) : null),
          resultDropDayDir: process.env.EPI_RESULT_DAY_DIR ?? (_nowPath ? dirname(dirname(_nowPath)) : null),
          onEvent: (event) => recordFlowWatcherEvent(api, event),
        });
        _flowWatcher.start();

        // 7. Echo the compose-phase VAK into the gateway SessionRecord.
        //    Env-propagation (step 4) is the load-bearing channel for child
        //    processes; this gateway patch is additive — it makes the VAK
        //    visible to multi-session surfaces / inspection tooling that
        //    read the SessionRecord directly. Non-blocking: if the patch
        //    fails (gateway not running, schema drift, etc.), session_start
        //    still succeeds via the env channel.
        const patchResult = spawnSync(
          "epi",
          [
            "gate",
            "sessions",
            "patch",
            "--session-id",
            _sessionId,
            "--vak-address-json",
            JSON.stringify(composeVak),
          ],
          { encoding: "utf8" }
        );
        if (patchResult.status !== 0) {
          console.warn(
            `[khora] gateway sessions.patch failed (non-blocking): ${patchResult.stderr?.trim() || "no stderr"}`
          );
        }

        // 8. START codon: bind Khora's compose phase to the M4 session
        //    transcription chain. The protected protein handle is retained
        //    locally; the body never crosses the profile bus under defaults.
        openM4SessionProtein(_sessionId);

        // 9. Track 42.4: persist the canonical parent Pi harness binding.
        //    Sub-session launchers pass EPI_HARNESS_ID / EPI_PARENT_SESSION_KEY /
        //    EPI_SUBAGENT_LINEAGE so the same binding path records their lease
        //    lineage without introducing a separate session store.
        bindCurrentPiHarness(repoRoot);
      }
    } else {
      console.warn(`[khora] session init skipped: ${initResult.stderr?.trim() || "no vault config"}`);
    }

    // Session breadcrumb is handled by the CLI — no GUI auto-open
  });

  (api.on as unknown as (event: string, handler: (payload: Record<string, unknown>) => void) => void)(
    "nara.activity.keystroke",
    (payload) => _flowWatcher?.recordKeystroke(String(payload.path ?? payload.now_path ?? "")),
  );

  (api.on as unknown as (event: string, handler: (payload: Record<string, unknown>) => void) => void)(
    "nara.activity.file_reentry",
    (payload) => _flowWatcher?.handleFileOpened(String(payload.path ?? payload.now_path ?? "")),
  );

  api.on("session_before_compact", async () => {
    spawnSync("epi", ["agent", "session", "continuation"], { stdio: "inherit" });
  });

  api.on("session_shutdown", async () => {
    _flowWatcher?.stop();
    _flowWatcher = null;

    // Z-cycle rehear (C2): this lifecycle handler is the SINGLE WRITER to the
    // Sophia JSONL inbox. Callers that want to enrich the disclosure must invoke
    // `khora_session_close` first — it stashes artifacts + improvement_vectors
    // into module-scope pending state, which we now consume + clear atomically.
    // Empty defaults if nobody enriched. Exactly one JSONL line per session.
    try {
      const session_id = getSessionId();
      const day_id = getDayId();
      closeM4SessionProtein(session_id);
      // had_pending true ⇔ `khora_session_close` was called this session →
      // closure_kind = "rehear" (deliberate Möbius return).
      // had_pending false ⇔ lifecycle fired without the tool call → process
      // killed before deliberate close → closure_kind = "force_closed".
      const consumed = session_id
        ? consumePendingSophia(session_id)
        : { had_pending: false, artifacts: [], improvement_vectors: [], q_proposals: [] };
      const closure_kind = consumed.had_pending ? "rehear" : "force_closed";
      fireSophiaDisclosure({
        session_id,
        day_id,
        artifacts: consumed.artifacts,
        improvement_vectors: consumed.improvement_vectors,
        q_proposals: consumed.q_proposals,
        closure_kind,
      });
    } catch (e) {
      console.warn(`[khora] sophia disclosure: ${e}`);
    }

    const hookPath = new URL("./S0/post-session-close.sh", import.meta.url).pathname;
    if (existsSync(hookPath)) {
      spawnSync("sh", [hookPath], { stdio: "inherit" });
    }
  });
}

// Internal helper
async function enqueue_sync_event(event: { path: string; coordinate?: string; action: string }) {
  const queuePath = join(process.env.EPI_REPO_ROOT || ".", ".khora-sync-queue.jsonl");
  const line = JSON.stringify({ ...event, ts: new Date().toISOString() }) + "\n";
  appendFileSync(queuePath, line, "utf8");
}
