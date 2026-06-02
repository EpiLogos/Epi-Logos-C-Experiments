import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { computeDayId } from "./modules/temporal-frame.ts";
import { dayArc, formatDayArcResult } from "./modules/graphiti-day-arc.ts";

function injectSeedIntoQuestion(content: string, seedContent: string) {
  const heading = "## #0 Question";
  const trimmedSeed = seedContent.trim();
  if (!trimmedSeed) {
    return content;
  }
  if (content.includes(trimmedSeed)) {
    return content;
  }

  const lines = content.split(/\r?\n/);
  const headingIndex = lines.findIndex((line) => line.trim() === heading);
  if (headingIndex === -1) {
    return `${content.trimEnd()}\n\n${heading}\n\n${trimmedSeed}\n`;
  }

  let insertAt = lines.length;
  for (let i = headingIndex + 1; i < lines.length; i += 1) {
    if (lines[i].startsWith("## ")) {
      insertAt = i;
      break;
    }
  }

  lines.splice(insertAt, 0, "", trimmedSeed, "");
  return lines.join("\n");
}

export async function chronosExtension(api: ExtensionAPI) {
  // ── Tool: chronos_day_init ───────────────────────────────────────
  api.registerTool({
    name: "chronos_day_init",
    label: "Chronos Day Init",
    description: "Trigger creation of today's Day folder + daily-note.md (CT4b'). Delegates to Hen for structure, Khora for write. Idempotent — safe to call if folder already exists.",
    parameters: Type.Object({
      now_override: Type.Optional(Type.String({ description: "ISO8601 date override (testing)" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      // Step 1: Create/verify today's Day folder structure via epi
      const args = ["vault", "day-init"];
      if (params.now_override) args.push("--now", params.now_override);
      const result = spawnSync("epi", args, { encoding: "utf8" });
      if (result.status !== 0) {
        return { content: [{ type: "text", text: result.stderr }], isError: true };
      }

      // Step 2: Open/create today's daily note via the supported vault CLI surface.
      spawnSync("epi", ["vault", "daily"], { encoding: "utf8" });

      // Step 3: Inject SEED.md into ## #0 Question of daily note (morning pickup)
      // SEED.md lives at /Idea/Empty/Present/SEED.md — written by Aletheia night' pass
      const seedResult = spawnSync("epi", ["vault", "read", "Empty/Present/SEED.md"], { encoding: "utf8" });
      if (seedResult.status === 0 && seedResult.stdout.trim()) {
        const dailyPath = result.stdout.trim().replace(/^created\s+/, "");
        try {
          const dailyContent = readFileSync(dailyPath, "utf8");
          writeFileSync(dailyPath, injectSeedIntoQuestion(dailyContent, seedResult.stdout));
        } catch (error) {
          return {
            content: [{ type: "text", text: `day-init: seed injection failed: ${String(error)}` }],
            isError: true,
          };
        }
      } else if (seedResult.status !== 0) {
        // seed-read failure is non-fatal (SEED.md may not exist yet on first day)
        // but we surface it as a warning in output
      }

      // Step 4: Create FLOW.md (CT0 free-flow journal) in today's Day folder
      const flowArgs = ["vault", "flow-init", ...(params.now_override ? ["--now", params.now_override] : [])];
      const flowResult = spawnSync("epi", flowArgs, { encoding: "utf8" });
      if (flowResult.status !== 0) {
        return { content: [{ type: "text", text: `day-init: flow-init failed: ${flowResult.stderr}` }], isError: true };
      }

      // Step 5: Open Graphiti day arc (non-fatal)
      const dayId = computeDayId();
      void dayArc({ action: "open", dayId, timeoutMs: 4000 });

      return { content: [{ type: "text", text: result.stdout || "day-init complete" }] };
    },
  });

  // ── Tool: chronos_now_init ───────────────────────────────────────
  api.registerTool({
    name: "chronos_now_init",
    label: "Chronos Now Init",
    description: "Trigger creation of a NOW folder within today's Day. Creates thinking/, thoughts/, tasks/, patterns/ subdirs and now.md (CT4b').",
    parameters: Type.Object({
      session_id: Type.String({ description: "Session ID (format: YYYYMMDD-HHmmss-suffix)" }),
      now_override: Type.Optional(Type.String()),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const args = ["vault", "now-init", "--session-id", params.session_id];
      if (params.now_override) args.push("--now", params.now_override);
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
    label: "Chronos Archive Day",
    description: "Rotate Day folder to Pratibimba History archive (path: {YYYY}/{MM}/W{WW}/{DD}/). Requires c_5_reflection_complete: true in daily-note frontmatter, or --force flag.",
    parameters: Type.Object({
      date: Type.String({ description: "Date to archive (DD-MM-YYYY format)" }),
      force: Type.Optional(Type.Boolean({ description: "Skip c_5_reflection_complete check", default: false })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      // Step 1: epi CLI resolves paths + checks c_5_reflection_complete guard
      const checkArgs = ["vault", "archive-day", params.date, "--plan"];
      if (params.force) checkArgs.push("--force");
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
      const move = spawnSync("obsidian-cli", [
        "move", `path="${sourcePath}"`, `name="${destPath}"`,
      ], { encoding: "utf8" });
      // Close Graphiti day arc (non-fatal)
      const dayId = (params.date || computeDayId()).replace(/\//g, "-");
      void dayArc({ action: "close", dayId, timeoutMs: 4000 });

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
    label: "Chronos Cron Register",
    description: "Register a cron job via S3 gateway (gate/cron.rs). Persists to state file, survives restart. Use for: 6 AM day-init, evening Möbius pass, SEED.md generation.",
    parameters: Type.Object({
      name: Type.String({ description: "Job name (e.g. 'morning-day-init')" }),
      description: Type.Optional(Type.String({ description: "Human description of what it does" })),
      schedule: Type.String({ description: "Cron schedule string (e.g. '0 6 * * *')" }),
      session_target: Type.Optional(Type.String({ description: "Target session type (e.g. 'main')", default: "main" })),
      wake_mode: Type.Optional(Type.String({ description: "Wake mode: 'wake' | 'no_wake'", default: "no_wake" })),
      payload: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const args = [
        "gate", "cron", "add",
        "--name", params.name,
        "--description", params.description ?? params.name,
        "--schedule", params.schedule,
        "--session-target", params.session_target ?? "main",
        "--wake-mode", params.wake_mode ?? "no_wake",
        "--payload", JSON.stringify(params.payload ?? {}),
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
    label: "Chronos Cron List",
    description: "List all registered cron jobs (delegates to epi gate cron list).",
    parameters: Type.Object({}),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const result = spawnSync("epi", ["gate", "cron", "list"], { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }] };
    },
  });

  // ── Tool: chronos_kairos_fetch ──────────────────────────────────
  api.registerTool({
    name: "chronos_kairos_fetch",
    label: "Chronos Kairos Fetch",
    description: "Invoke Kerykeion to compute natal chart + planetary degrees from PASU.md birth data. Populates c_0_natal_chart_path. Fails if kerykeion not installed.",
    parameters: Type.Object({
      force_refresh: Type.Optional(Type.Boolean({ description: "Recompute even if chart already exists" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const args = ["vault", "kairos", "fetch"];
      if (params.force_refresh) args.push("--force");
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
    label: "Chronos Kairos Status",
    description: "Get kairos temporal enrichment status: mode (natal/stub), planet_valid bitmask, chart path.",
    parameters: Type.Object({}),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const result = spawnSync("epi", ["vault", "kairos", "status"], { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }] };
    },
  });

  // ── Tool: chronos_temporal_status ────────────────────────────────
  api.registerTool({
    name: "chronos_temporal_status",
    label: "Chronos Temporal Status",
    description: "Current Day folder state, active NOWs, archive backlog.",
    parameters: Type.Object({}),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const result = spawnSync("epi", ["agent", "session", "status"], { encoding: "utf8" });
      if (result.status !== 0) {
        return { content: [{ type: "text", text: result.stderr || "session status check failed" }], isError: true };
      }
      return { content: [{ type: "text", text: result.stdout }] };
    },
  });

  // ── Tool: chronos_graphiti_day_arc ───────────────────────────────
  api.registerTool({
    name: "chronos_graphiti_day_arc",
    label: "Chronos Graphiti Day Arc",
    description: "Open or close the day-level Graphiti Saga arc ('day:{day_id}'). chronos_day_init calls open; chronos_archive_day calls close. Non-fatal if Graphiti sidecar is not running.",
    parameters: Type.Object({
      action: Type.Union([Type.Literal("open"), Type.Literal("close")], { description: "Whether to open or close the day arc" }),
      day_id: Type.Optional(Type.String({ description: "Day identifier (DD-MM-YYYY). Defaults to current day if omitted." })),
      kairos_snapshot: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
      crystallisation: Type.Optional(Type.String({ description: "Sophia synthesis text for arc close metadata (arc close only)" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const dayId = params.day_id ?? computeDayId();
      const metadata =
        params.action === "open"
          ? (params.kairos_snapshot ?? {})
          : { crystallisation: params.crystallisation ?? "" };
      const result = await dayArc({ action: params.action, dayId, metadata });
      return { content: [{ type: "text", text: formatDayArcResult(params.action, dayId, result) }] };
    },
  });

  // ── Tool: chronos_decan_check ─────────────────────────────────────
  api.registerTool({
    name: "chronos_decan_check",
    label: "Chronos Decan Check",
    description: "Check for sun/moon decan boundary transitions. Fetches current kairos state, compares to last stored decan (Redis/Graphiti). Fires arc open/close events on boundaries. Register as a cron job (every 2h) via chronos_cron_register.",
    parameters: Type.Object({}),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const graphitiBase = process.env.GRAPHITI_URL ?? "http://localhost:37778";
      // Fetch current kairos state from epi CLI
      const kairosResult = spawnSync("epi", ["vault", "kairos", "status", "--json"], { encoding: "utf8" });
      if (kairosResult.status !== 0) {
        return { content: [{ type: "text", text: `chronos_decan_check: kairos unavailable — ${kairosResult.stderr}` }] };
      }

      let kairosState: Record<string, unknown> = {};
      try {
        kairosState = JSON.parse(kairosResult.stdout);
      } catch {
        return { content: [{ type: "text", text: `chronos_decan_check: kairos JSON parse failed` }] };
      }

      const sunDecan = kairosState["sun_decan"] as string | undefined;
      const moonDecan = kairosState["moon_decan"] as string | undefined;
      if (!sunDecan) {
        return { content: [{ type: "text", text: "chronos_decan_check: no sun_decan in kairos state — skipped" }] };
      }

      const messages: string[] = [];

      try {
        // Check stats from Graphiti to get last known decan
        const statsResp = await fetch(`${graphitiBase}/stats`, { signal: AbortSignal.timeout(5000) });
        const stats = await statsResp.json() as Record<string, unknown>;
        const lastSunDecan = stats["last_sun_decan"] as string | undefined;
        const lastMoonDecan = stats["last_moon_decan"] as string | undefined;
        const dayId = computeDayId();

        if (sunDecan !== lastSunDecan) {
          // Close previous sun-decan arc, open new one
          if (lastSunDecan) {
            await fetch(`${graphitiBase}/arc/close`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ arc_id: `sun-decan:${lastSunDecan}`, ql_position: "ql5", cpf: "(5/0)", ct: 2, metadata: {} }),
              signal: AbortSignal.timeout(5000),
            });
          }
          await fetch(`${graphitiBase}/arc/open`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ arc_id: `sun-decan:${sunDecan}`, arc_type: "decan", ql_position: "ql0", cpf: "(00/00)", ct: 2, metadata: { decan: sunDecan, planet: "sun", day_id: dayId } }),
            signal: AbortSignal.timeout(5000),
          });
          messages.push(`sun decan transition: ${lastSunDecan ?? "?"} → ${sunDecan}`);
        }

        if (moonDecan && moonDecan !== lastMoonDecan) {
          // Moon decan: add ql3 episode (no full arc lifecycle for moon)
          await fetch(`${graphitiBase}/episode`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: `moon enters ${moonDecan}: ${kairosState["moon_ruler"] ?? ""}, ${kairosState["moon_body_zone"] ?? ""}`.trim(),
              ql_position: "ql3",
              cpf: "(0/1/2)",
              ct: 2,
              metadata: { decan: moonDecan, planet: "moon", day_id: dayId },
            }),
            signal: AbortSignal.timeout(5000),
          });
          messages.push(`moon decan transition: ${lastMoonDecan ?? "?"} → ${moonDecan}`);
        }

        if (messages.length === 0) {
          messages.push(`no decan transitions (sun: ${sunDecan}, moon: ${moonDecan ?? "n/a"})`);
        }
      } catch (e) {
        return { content: [{ type: "text", text: `chronos_decan_check: graphiti not reachable (${e}) — skipped` }] };
      }

      return { content: [{ type: "text", text: messages.join("\n") }] };
    },
  });

}
