import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { spawnSync } from "node:child_process";
import { existsSync, writeFileSync, appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// Session state singleton (persists within a PI process)
let _sessionId: string | null = null;
let _dayId: string | null = null;
let _nowPath: string | null = null;

export async function khoraExtension(api: ExtensionAPI) {
  // ── Tool: khora_session_init ─────────────────────────────────────
  api.registerTool({
    name: "khora_session_init",
    description: "Initialize a Khora session: generate session ID, run bootstrap sequence, export env vars. Must be called before any vault operations.",
    inputSchema: {
      type: "object",
      properties: {
        now: { type: "string", description: "ISO8601 override for deterministic testing" },
        random_suffix: { type: "string", description: "Override random suffix (testing only)" },
      },
    },
    async handler(input: { now?: string; random_suffix?: string }) {
      try {
        const args = ["agent", "session", "init"];
        if (input.now) args.push("--now", input.now);
        if (input.random_suffix) args.push("--random-suffix", input.random_suffix);
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
    description: "Return current session identity (session_id, day_id, now_path) and bootstrap state.",
    inputSchema: { type: "object", properties: {} },
    async handler() {
      const result = spawnSync("epi", ["agent", "session", "status"], { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }] };
    },
  });

  // ── Tool: khora_write ────────────────────────────────────────────
  api.registerTool({
    name: "khora_write",
    description: "THE canonical vault write primitive. ALL vault filesystem writes MUST route through this tool. Writes content to path, then enqueues a graph sync event.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Absolute filesystem path to write" },
        content: { type: "string", description: "File content to write" },
        coordinate: { type: "string", description: "Coordinate of the artifact (for graph sync)" },
        create_dirs: { type: "boolean", description: "Create parent directories if missing", default: true },
      },
      required: ["path", "content"],
    },
    async handler(input: { path: string; content: string; coordinate?: string; create_dirs?: boolean }) {
      try {
        if (input.create_dirs !== false) {
          const dir = input.path.substring(0, input.path.lastIndexOf("/"));
          if (dir) mkdirSync(dir, { recursive: true });
        }
        writeFileSync(input.path, input.content, "utf8");
        // Enqueue graph sync event
        await enqueue_sync_event({ path: input.path, coordinate: input.coordinate, action: "write" });
        return { content: [{ type: "text", text: `wrote ${input.path}` }] };
      } catch (e) {
        return { content: [{ type: "text", text: `khora_write error: ${e}` }], isError: true };
      }
    },
  });

  // ── Tool: khora_sync_queue_push ──────────────────────────────────
  api.registerTool({
    name: "khora_sync_queue_push",
    description: "Enqueue a graph write event to .khora-sync-queue.jsonl. Called automatically by khora_write.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string" },
        coordinate: { type: "string" },
        action: { type: "string", enum: ["write", "delete", "move"] },
      },
      required: ["path", "action"],
    },
    async handler(input: { path: string; coordinate?: string; action: string }) {
      await enqueue_sync_event(input);
      return { content: [{ type: "text", text: "queued" }] };
    },
  });

  // ── Tool: khora_sync_queue_flush ─────────────────────────────────
  api.registerTool({
    name: "khora_sync_queue_flush",
    description: "Flush .khora-sync-queue.jsonl to Neo4j (delegated to Hen/S2 for execution). Returns count of events processed.",
    inputSchema: { type: "object", properties: {} },
    async handler() {
      // Stub: real implementation requires Neo4j connection (Phase 6)
      return { content: [{ type: "text", text: "sync_queue_flush: stub (Neo4j not yet wired)" }] };
    },
  });

  // ── Tool: khora_continuation_write ───────────────────────────────
  api.registerTool({
    name: "khora_continuation_write",
    description: "Write CONTINUATION.md with resumable state snapshot before compaction. Includes session_id, day_id, now_path, and optional summary.",
    inputSchema: {
      type: "object",
      properties: {
        summary: { type: "string", description: "Free-form summary appended to continuation" },
      },
    },
    async handler(input: { summary?: string }) {
      const args = ["agent", "session", "continuation"];
      if (input.summary) args.push("--summary", input.summary);
      const result = spawnSync("epi", args, { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }] };
    },
  });

  // ── Hook: session_start ──────────────────────────────────────────
  if (api.hooks) {
    api.hooks.on?.("session_start", async (event: { session_id?: string }) => {
      // Run pre-session-init hook if present
      const hookPath = new URL("./S0/pre-session-init.sh", import.meta.url).pathname;
      if (existsSync(hookPath)) {
        spawnSync("sh", [hookPath], { stdio: "inherit" });
      }
      // Write [[NOW-{session_id}]] breadcrumb into today's daily-note ## Sessions heading
      if (event.session_id) {
        const breadcrumb = encodeURIComponent(`\n- [[NOW-${event.session_id}]]`);
        const vault = process.env.EPI_VAULT_NAME ?? "Idea";
        const uri = `obsidian://advanced-uri?vault=${encodeURIComponent(vault)}&daily=true&heading=Sessions&data=${breadcrumb}&mode=append`;
        spawnSync("open", [uri], { encoding: "utf8" });
      }
    });

    api.hooks.on?.("before_compaction", async () => {
      // Auto-write CONTINUATION.md
      spawnSync("epi", ["agent", "session", "continuation"], { stdio: "inherit" });
    });

    api.hooks.on?.("session_end", async () => {
      // Run post-session-close hook if present
      const hookPath = new URL("./S0/post-session-close.sh", import.meta.url).pathname;
      if (existsSync(hookPath)) {
        spawnSync("sh", [hookPath], { stdio: "inherit" });
      }
    });
  }
}

// Internal helper
async function enqueue_sync_event(event: { path: string; coordinate?: string; action: string }) {
  const queuePath = join(process.env.EPI_REPO_ROOT || ".", ".khora-sync-queue.jsonl");
  const line = JSON.stringify({ ...event, ts: new Date().toISOString() }) + "\n";
  appendFileSync(queuePath, line, "utf8");
}
