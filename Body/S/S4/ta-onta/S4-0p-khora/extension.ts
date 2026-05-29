import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { spawnSync } from "node:child_process";
import { existsSync, writeFileSync, appendFileSync, mkdirSync } from "node:fs";
import { join, basename } from "node:path";
// cross-agent disabled: Claude/Gemini/Codex @-discovery not needed for pi-native agent dispatch
// import registerCrossAgent from "./S0'/cross-agent.ts";
import registerSystemSelect from "./S0'/system-select.ts";
import { composePhaseVakAddress } from "./modules/z-phase-vak.ts";

// Session state singleton (persists within a PI process)
let _sessionId: string | null = null;
let _dayId: string | null = null;
let _nowPath: string | null = null;

// Exported getters — other extensions and agent-team.ts read these
export function getSessionId() { return _sessionId ?? process.env.EPI_SESSION_ID ?? null; }
export function getDayId()     { return _dayId     ?? process.env.EPI_DAY_ID     ?? null; }
export function getNowPath()   { return _nowPath   ?? process.env.EPI_NOW_PATH   ?? null; }

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
    description: "Flush .khora-sync-queue.jsonl to Neo4j (delegated to Hen/S2 for execution). Returns count of events processed.",
    parameters: Type.Object({}),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      // Stub: real implementation requires Neo4j connection (Phase 6)
      return { content: [{ type: "text", text: "sync_queue_flush: stub (Neo4j not yet wired)" }] };
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

  api.on("session_start", async () => {
    const repoRoot = process.env.EPI_REPO_ROOT || process.cwd();

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
    //
    //    NOTE (gateway patch deferred): the SessionRecord.vak_address field exists on the
    //    Rust side (A2 / commit cfdafb1b) and `sessions.patch` JSON-RPC handler in
    //    Body/S/S0/epi-cli/src/gate/server.rs needs to be extended to accept a
    //    `vak_address` param. Once that's wired + an `epi gate sessions patch` CLI lands
    //    (or a TS gateway-RPC client is available here), call it here with
    //    `{ vak_address: composeVak }` so the gateway record matches the env-propagated VAK.
    //    For now, env-propagation is the load-bearing channel (consumed by A5 in
    //    Body/S/S4/ta-onta/S4-4p-anima/extension.ts line 62, etc.).
    const composeVak = composePhaseVakAddress();
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
      }
    } else {
      console.warn(`[khora] session init skipped: ${initResult.stderr?.trim() || "no vault config"}`);
    }

    // Session breadcrumb is handled by the CLI — no GUI auto-open
  });

  api.on("session_before_compact", async () => {
    spawnSync("epi", ["agent", "session", "continuation"], { stdio: "inherit" });
  });

  api.on("session_shutdown", async () => {
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
