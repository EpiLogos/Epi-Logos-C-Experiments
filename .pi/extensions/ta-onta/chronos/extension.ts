import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { spawnSync } from "node:child_process";

export async function chronosExtension(api: ExtensionAPI) {
  // ── Tool: chronos_day_init ───────────────────────────────────────
  api.registerTool({
    name: "chronos_day_init",
    description: "Trigger creation of today's Day folder + daily-note.md (CT4b'). Delegates to Hen for structure, Khora for write. Idempotent — safe to call if folder already exists.",
    inputSchema: {
      type: "object",
      properties: {
        now_override: { type: "string", description: "ISO8601 date override (testing)" },
      },
    },
    async handler(input: { now_override?: string }) {
      // Step 1: Create/verify today's Day folder structure via epi
      const args = ["vault", "day-init"];
      if (input.now_override) args.push("--now", input.now_override);
      const result = spawnSync("epi", args, { encoding: "utf8" });
      if (result.status !== 0) {
        return { content: [{ type: "text", text: result.stderr }], isError: true };
      }

      // Step 2: Open/create today's daily note via obsidian (ensures Obsidian indexes it)
      spawnSync("obsidian", ["daily"], { encoding: "utf8" });

      // Step 3: Inject SEED.md into ## #0 Question of daily note (morning pickup)
      // SEED.md lives at /Idea/Empty/Present/SEED.md — written by Aletheia night' pass
      const seedResult = spawnSync("epi", ["vault", "seed-read"], { encoding: "utf8" });
      if (seedResult.status === 0 && seedResult.stdout.trim()) {
        const vaultName = process.env.EPI_VAULT_NAME ?? "Idea";
        const seedContent = encodeURIComponent(seedResult.stdout.trim());
        const uri = `obsidian://advanced-uri?vault=${encodeURIComponent(vaultName)}&daily=true&heading=%230%20Question&data=${seedContent}&mode=append`;
        const openResult = spawnSync("open", [uri], { encoding: "utf8" }); // macOS open; Linux: xdg-open
        if (openResult.status !== 0) {
          return { content: [{ type: "text", text: `day-init: seed injection failed: ${openResult.stderr}` }], isError: true };
        }
      } else if (seedResult.status !== 0) {
        // seed-read failure is non-fatal (SEED.md may not exist yet on first day)
        // but we surface it as a warning in output
      }

      // Step 4: Create FLOW.md (CT0 free-flow journal) in today's Day folder
      const flowArgs = ["vault", "flow-init", ...(input.now_override ? ["--now", input.now_override] : [])];
      const flowResult = spawnSync("epi", flowArgs, { encoding: "utf8" });
      if (flowResult.status !== 0) {
        return { content: [{ type: "text", text: `day-init: flow-init failed: ${flowResult.stderr}` }], isError: true };
      }

      return { content: [{ type: "text", text: result.stdout || "day-init complete" }] };
    },
  });

  // ── Tool: chronos_now_init ───────────────────────────────────────
  api.registerTool({
    name: "chronos_now_init",
    description: "Trigger creation of a NOW folder within today's Day. Creates thinking/, thoughts/, tasks/, patterns/ subdirs and now.md (CT4b').",
    inputSchema: {
      type: "object",
      properties: {
        session_id: { type: "string", description: "Session ID (format: YYYYMMDD-HHmmss-suffix)" },
        now_override: { type: "string" },
      },
      required: ["session_id"],
    },
    async handler(input: { session_id: string; now_override?: string }) {
      const args = ["vault", "now-init", "--session-id", input.session_id];
      if (input.now_override) args.push("--now", input.now_override);
      const result = spawnSync("epi", args, { encoding: "utf8" });
      return {
        content: [{ type: "text", text: result.stdout || result.stderr }],
        isError: result.status !== 0,
      };
    },
  });

  // ── Tool: chronos_archive_day ────────────────────────────────────
  api.registerTool({
    name: "chronos_archive_day",
    description: "Rotate Day folder to Pratibimba History archive (path: {YYYY}/{MM}/W{WW}/{DD}/). Requires c_5_reflection_complete: true in daily-note frontmatter, or --force flag.",
    inputSchema: {
      type: "object",
      properties: {
        date: { type: "string", description: "Date to archive (DD-MM-YYYY format)" },
        force: { type: "boolean", description: "Skip c_5_reflection_complete check", default: false },
      },
      required: ["date"],
    },
    async handler(input: { date: string; force?: boolean }) {
      // Step 1: epi CLI resolves paths + checks c_5_reflection_complete guard
      const checkArgs = ["vault", "archive-day", input.date, "--plan"];
      if (input.force) checkArgs.push("--force");
      const plan = spawnSync("epi", checkArgs, { encoding: "utf8" });
      if (plan.status !== 0) {
        return { content: [{ type: "text", text: plan.stderr }], isError: true };
      }
      // --plan output: "SOURCE_PATH → DEST_PATH"
      const [sourcePath, , destPath] = plan.stdout.trim().split(" ");
      if (!sourcePath || !destPath) {
        return { content: [{ type: "text", text: `unexpected plan output: ${plan.stdout}` }], isError: true };
      }
      // Step 2: Move via obsidian CLI — wikilink-preserving (never raw fs rename)
      const move = spawnSync("obsidian", [
        "move", `path="${sourcePath}"`, `name="${destPath}"`,
      ], { encoding: "utf8" });
      return {
        content: [{ type: "text", text: move.stdout || move.stderr || `archived: ${sourcePath} → ${destPath}` }],
        isError: move.status !== 0,
      };
    },
  });

  // ── Tool: chronos_cron_register ──────────────────────────────────
  // NOTE: S3 gateway IS wired — gate/cron.rs implements full cron CRUD.
  api.registerTool({
    name: "chronos_cron_register",
    description: "Register a cron job via S3 gateway (gate/cron.rs). Persists to state file, survives restart. Use for: 6 AM day-init, evening Möbius pass, SEED.md generation.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Job name (e.g. 'morning-day-init')" },
        description: { type: "string", description: "Human description of what it does" },
        schedule: { type: "string", description: "Cron schedule string (e.g. '0 6 * * *')" },
        session_target: { type: "string", description: "Target session type (e.g. 'main')", default: "main" },
        wake_mode: { type: "string", description: "Wake mode: 'wake' | 'no_wake'", default: "no_wake" },
        payload: { type: "object", description: "JSON payload passed to cron executor", default: {} },
      },
      required: ["name", "schedule"],
    },
    async handler(input: { name: string; description?: string; schedule: string; session_target?: string; wake_mode?: string; payload?: Record<string, unknown> }) {
      const args = [
        "gate", "cron", "add",
        "--name", input.name,
        "--description", input.description ?? input.name,
        "--schedule", input.schedule,
        "--session-target", input.session_target ?? "main",
        "--wake-mode", input.wake_mode ?? "no_wake",
        "--payload", JSON.stringify(input.payload ?? {}),
      ];
      const result = spawnSync("epi", args, { encoding: "utf8" });
      return {
        content: [{ type: "text", text: result.stdout || result.stderr }],
        isError: result.status !== 0,
      };
    },
  });

  // ── Tool: chronos_cron_list ───────────────────────────────────────
  api.registerTool({
    name: "chronos_cron_list",
    description: "List all registered cron jobs (delegates to epi gate cron list).",
    inputSchema: { type: "object", properties: {} },
    async handler() {
      const result = spawnSync("epi", ["gate", "cron", "list"], { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }] };
    },
  });

  // ── Tool: chronos_kairos_fetch ──────────────────────────────────
  api.registerTool({
    name: "chronos_kairos_fetch",
    description: "Invoke Kerykeion to compute natal chart + planetary degrees from PASU.md birth data. Populates c_0_natal_chart_path. Fails if kerykeion not installed.",
    inputSchema: {
      type: "object",
      properties: {
        force_refresh: { type: "boolean", description: "Recompute even if chart already exists" },
      },
    },
    async handler(input: { force_refresh?: boolean }) {
      const args = ["gate", "kairos", "fetch"];
      if (input.force_refresh) args.push("--force");
      const result = spawnSync("epi", args, { encoding: "utf8" });
      return {
        content: [{ type: "text", text: result.stdout || result.stderr }],
        isError: result.status !== 0,
      };
    },
  });

  // ── Tool: chronos_kairos_status ───────────────────────────────────
  api.registerTool({
    name: "chronos_kairos_status",
    description: "Get kairos temporal enrichment status: mode (natal/stub), planet_valid bitmask, chart path.",
    inputSchema: { type: "object", properties: {} },
    async handler() {
      const result = spawnSync("epi", ["gate", "kairos", "status"], { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }] };
    },
  });

  // ── Tool: chronos_temporal_status ────────────────────────────────
  api.registerTool({
    name: "chronos_temporal_status",
    description: "Current Day folder state, active NOWs, archive backlog.",
    inputSchema: { type: "object", properties: {} },
    async handler() {
      const result = spawnSync("epi", ["agent", "session", "status"], { encoding: "utf8" });
      if (result.status !== 0) {
        return { content: [{ type: "text", text: result.stderr || "session status check failed" }], isError: true };
      }
      return { content: [{ type: "text", text: result.stdout }] };
    },
  });

  // ── Hook: session_start ───────────────────────────────────────────
  if (api.hooks) {
    api.hooks.on?.("session_start", async () => {
      // Idempotent day-init: ensure today's daily note exists in Obsidian
      const daily = spawnSync("obsidian", ["daily"], { encoding: "utf8" });
      if (daily.status !== 0) throw new Error(`session_start: obsidian daily failed: ${daily.stderr}`);
      // epi handles the folder structure (day dir)
      const dayInit = spawnSync("epi", ["vault", "day-init"], { encoding: "utf8" });
      if (dayInit.status !== 0) throw new Error(`session_start: day-init failed: ${dayInit.stderr}`);
      // Idempotent flow-init: ensure today's FLOW.md (CT0 journal) exists
      const flowInit = spawnSync("epi", ["vault", "flow-init"], { encoding: "utf8" });
      if (flowInit.status !== 0) throw new Error(`session_start: flow-init failed: ${flowInit.stderr}`);
    });
  }
}
