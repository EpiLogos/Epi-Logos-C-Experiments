import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { computeDayId } from "./modules/temporal-frame.ts";
import { dayArc, formatDayArcResult } from "./modules/graphiti-day-arc.ts";
import { khora_write_highlighted_inscription } from "../S4-0p-khora/extension.ts";
import {
  dispatchTeamMember,
  vakAddressForTeamDispatch,
  type TeamDispatchVakAddressDefaults,
} from "../S4-4p-anima/extension/dispatch.ts";
import type { VakAddress } from "../shared/vak_address.ts";

export type ChronosResponseOrbit = "immediate" | `hours:${number}` | "next-morning" | "saturnine";
export type ChronosCronWakeMode = "now" | "next-heartbeat";

export interface ChronosOrbitInput {
  readonly session_id: string;
  readonly trigger_event: Record<string, unknown>;
  readonly orbit: ChronosResponseOrbit;
}

export interface ChronosOrbitResult {
  readonly scheduled_at: string;
  readonly response_token: string;
}

export interface ChronosCronFireInput {
  readonly payload: Record<string, unknown>;
  readonly session_target?: string;
  readonly wake_mode?: ChronosCronWakeMode;
  readonly agent?: string;
  readonly task?: string;
  readonly vak_address?: unknown;
  readonly job_id?: string;
  readonly job_name?: string;
  readonly fired_at_ms?: number;
}

export interface ChronosCronFireResult {
  readonly agent: string;
  readonly session_target: string;
  readonly wake_mode: ChronosCronWakeMode;
  readonly vak_address: VakAddress;
  readonly dispatch_output: string;
}

export type ChronosCronDispatch = (
  agent: string,
  task: string,
  vakAddress: VakAddress,
) => Promise<string>;

function responseToken(sessionId: string, triggerEvent: Record<string, unknown>, scheduledAt: Date): string {
  const trigger = String(triggerEvent.kind ?? triggerEvent.type ?? "tranche.complete");
  const stamp = scheduledAt.toISOString().replace(/[^0-9TZ]/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);
  return `chronos_${sessionId}_${trigger.replace(/[^a-zA-Z0-9_-]/g, "_")}_${stamp}_${suffix}`;
}

function nextMorning(now = new Date()): Date {
  const target = new Date(now);
  target.setDate(target.getDate() + 1);
  target.setHours(6, 0, 0, 0);
  return target;
}

function hoursOrbit(orbit: string, now: Date): Date | null {
  const match = /^hours:(\d+(?:\.\d+)?)$/.exec(orbit);
  if (!match) return null;
  const hours = Number.parseFloat(match[1]);
  if (!Number.isFinite(hours) || hours < 0) return null;
  return new Date(now.getTime() + hours * 60 * 60_000);
}

function collectSaturnCandidates(value: unknown, into: Date[] = []): Date[] {
  if (!value || typeof value !== "object") return into;
  if (Array.isArray(value)) {
    for (const item of value) collectSaturnCandidates(item, into);
    return into;
  }
  const record = value as Record<string, unknown>;
  const haystack = JSON.stringify(record).toLowerCase();
  if (haystack.includes("saturn")) {
    for (const key of ["exact_at", "exactAt", "at", "starts_at", "startsAt", "scheduled_at", "scheduledAt"]) {
      const raw = record[key];
      if (typeof raw === "string") {
        const date = new Date(raw);
        if (!Number.isNaN(date.getTime())) into.push(date);
      }
      if (typeof raw === "number") {
        const date = new Date(raw);
        if (!Number.isNaN(date.getTime())) into.push(date);
      }
    }
  }
  for (const nested of Object.values(record)) collectSaturnCandidates(nested, into);
  return into;
}

function nearestSaturnAspect(now: Date): Date | null {
  const kairos = spawnSync("epi", ["vault", "kairos", "status", "--json"], { encoding: "utf8", timeout: 30_000 });
  if (kairos.status !== 0 || !kairos.stdout.trim()) return null;
  try {
    const parsed = JSON.parse(kairos.stdout) as Record<string, unknown>;
    const windowMs = 7 * 24 * 60 * 60_000;
    return collectSaturnCandidates(parsed)
      .filter((candidate) => Math.abs(candidate.getTime() - now.getTime()) <= windowMs)
      .sort((a, b) => Math.abs(a.getTime() - now.getTime()) - Math.abs(b.getTime() - now.getTime()))[0] ?? null;
  } catch {
    return null;
  }
}

export function resolveChronosOrbit(orbit: ChronosResponseOrbit, now = new Date()): Date {
  if (orbit === "immediate") return now;
  if (orbit === "next-morning") return nextMorning(now);
  if (orbit === "saturnine") return nearestSaturnAspect(now) ?? nextMorning(now);
  const hours = hoursOrbit(orbit, now);
  if (hours) return hours;
  throw new Error(`Unsupported Chronos orbit: ${orbit}`);
}

function registerOrbitCron(input: ChronosOrbitInput, scheduledAt: Date, token: string) {
  const result = spawnSync("epi", [
    "gate", "cron", "add",
    "--name", `chronos-response-orbit-${token}`,
    "--description", `Chronos response orbit for ${input.session_id}`,
    "--schedule", JSON.stringify({ kind: "at", atMs: scheduledAt.getTime() }),
    "--session-target", "main",
    "--wake-mode", input.orbit === "immediate" ? "now" : "next-heartbeat",
    "--payload", JSON.stringify({
      kind: "systemEvent",
      text: "chronos_response_orbit",
      session_id: input.session_id,
      trigger_event: input.trigger_event,
      response_token: token,
    }),
  ], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "chronos orbit cron registration failed");
  }
}

export function chronos_response_orbit(input: ChronosOrbitInput, now = new Date()): ChronosOrbitResult {
  const scheduledAt = resolveChronosOrbit(input.orbit, now);
  const token = responseToken(input.session_id, input.trigger_event, scheduledAt);
  registerOrbitCron(input, scheduledAt, token);
  return { scheduled_at: scheduledAt.toISOString(), response_token: token };
}

function stringField(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function recordField(record: Record<string, unknown>, key: string): Record<string, unknown> | undefined {
  const value = record[key];
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function resolveCronFireAgent(input: ChronosCronFireInput): string {
  const nestedTarget = recordField(input.payload, "target");
  const agent =
    input.agent ??
    stringField(input as unknown as Record<string, unknown>, ["agent", "agent_name", "agentName", "agentId"]) ??
    stringField(input.payload, ["agent", "agent_name", "agentName", "agentId"]) ??
    (nestedTarget ? stringField(nestedTarget, ["agent", "agent_name", "agentName", "agentId"]) : undefined);
  if (!agent) {
    throw new Error("chronos_cron_fire requires agent/agent_name/agentId in the fire input or payload");
  }
  return agent;
}

function resolveCronFireTask(input: ChronosCronFireInput): string {
  const task =
    input.task ??
    stringField(input.payload, ["task", "prompt", "message", "text", "description"]);
  if (task) return task;
  return JSON.stringify(input.payload);
}

function resolveCronFireWakeMode(input: ChronosCronFireInput): ChronosCronWakeMode {
  const raw = input.wake_mode ?? stringField(input.payload, ["wake_mode", "wakeMode"]);
  if (raw === "now" || raw === "next-heartbeat") return raw;
  throw new Error(`chronos_cron_fire wake_mode must be 'now' or 'next-heartbeat', got '${raw ?? ""}'`);
}

export function buildChronosCronFireVakAddress(
  input: ChronosCronFireInput,
  agent: string,
  wakeMode: ChronosCronWakeMode,
): VakAddress {
  const payloadVak = input.payload["vak_address"] ?? input.payload["vakAddress"];
  const defaults: TeamDispatchVakAddressDefaults = {
    agentName: agent,
    vakAddress: input.vak_address ?? payloadVak,
    ct: ["CT4b"],
    cp: wakeMode === "now" ? "CP4.2" : "CP4.4",
    cfp: "CFP0",
    cs: {
      code: wakeMode === "now" ? "CS2" : "CS4",
      direction: "Day",
    },
  };
  return vakAddressForTeamDispatch(defaults);
}

function chronosCronFireTaskEnvelope(input: ChronosCronFireInput, task: string, wakeMode: ChronosCronWakeMode): string {
  return [
    "Chronos fired a scheduled cron job. Route this as a normal Anima VAK dispatch.",
    `session_target: ${input.session_target ?? "main"}`,
    `wake_mode: ${wakeMode}`,
    input.job_id ? `job_id: ${input.job_id}` : undefined,
    input.job_name ? `job_name: ${input.job_name}` : undefined,
    typeof input.fired_at_ms === "number" ? `fired_at_ms: ${input.fired_at_ms}` : undefined,
    "",
    task,
  ].filter((line): line is string => line !== undefined).join("\n");
}

export async function chronos_cron_fire(
  input: ChronosCronFireInput,
  dispatch: ChronosCronDispatch = dispatchTeamMember,
): Promise<ChronosCronFireResult> {
  const wakeMode = resolveCronFireWakeMode(input);
  const sessionTarget = input.session_target ?? stringField(input.payload, ["session_target", "sessionTarget"]) ?? "main";
  const agent = resolveCronFireAgent(input);
  const task = resolveCronFireTask(input);
  const vakAddress = buildChronosCronFireVakAddress(input, agent, wakeMode);
  const dispatchOutput = await dispatch(agent, chronosCronFireTaskEnvelope({ ...input, session_target: sessionTarget }, task, wakeMode), vakAddress);
  return {
    agent,
    session_target: sessionTarget,
    wake_mode: wakeMode,
    vak_address: vakAddress,
    dispatch_output: dispatchOutput,
  };
}

function summarizeDelta(content: string, responseTokenValue?: string, since?: string): string {
  const tokenIndex = responseTokenValue ? content.lastIndexOf(responseTokenValue) : -1;
  const rawDelta = tokenIndex >= 0 ? content.slice(tokenIndex + responseTokenValue.length) : content;
  const sinceLine = since ? ` since ${since}` : "";
  const words = rawDelta.trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
  if (words.length === 0) return `No new body text detected${sinceLine}.`;
  return `${words.slice(0, 48).join(" ")}${words.length > 48 ? " ..." : ""}`;
}

function liveSpreadState(content: string): { alive: string; mute: string } {
  const lines = content.split(/\r?\n/);
  const alive = lines.filter((line) => /live-spread|still alive|active spread/i.test(line)).slice(-5);
  const mute = lines.filter((line) => /gone mute|resolved|closed spread|mute/i.test(line)).slice(-5);
  return {
    alive: alive.length ? alive.join(" / ") : "No live-spread references found in the current file.",
    mute: mute.length ? mute.join(" / ") : "No muted or resolved spread positions found in the current file.",
  };
}

function kairosUpdateSummary(): string {
  const result = spawnSync("epi", ["vault", "kairos", "status", "--json"], { encoding: "utf8", timeout: 30_000 });
  if (result.status !== 0) return `Kairos unavailable: ${result.stderr || result.stdout || "no status"}`;
  try {
    const parsed = JSON.parse(result.stdout) as Record<string, unknown>;
    return [
      `mode=${parsed.mode ?? "stub"}`,
      `sun_decan=${parsed.sun_decan ?? "unknown"}`,
      `moon_decan=${parsed.moon_decan ?? "unknown"}`,
      `tick12=${parsed.tick12 ?? "unknown"}`,
    ].join("; ");
  } catch {
    return result.stdout.trim() || "Kairos returned an empty status.";
  }
}

export async function chronos_reentry(input: {
  readonly session_id: string;
  readonly path: string;
  readonly response_token?: string;
  readonly since?: string;
}): Promise<{ path: string; response_token: string; category: "retrospective-surfacing" }> {
  const content = readFileSync(input.path, "utf8");
  const spread = liveSpreadState(content);
  const token = input.response_token ?? `chronos_reentry_${input.session_id}_${Date.now()}`;
  const block = [
    `> [!retrospective-surfacing] Chronos re-entry`,
    `> response_token: ${token}`,
    `> what is new: ${summarizeDelta(content, input.response_token, input.since)}`,
    `> what is still alive: ${spread.alive}`,
    `> what has gone mute: ${spread.mute}`,
    `> what kairos has activated: ${kairosUpdateSummary()}`,
  ].join("\n");

  return khora_write_highlighted_inscription({
    path: input.path,
    category: "retrospective-surfacing",
    position: "top",
    content: block,
    response_token: token,
  });
}

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
      wake_mode: Type.Optional(Type.Union([
        Type.Literal("now"),
        Type.Literal("next-heartbeat"),
      ], { description: "Wake mode for fired jobs", default: "next-heartbeat" })),
      payload: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const args = [
        "gate", "cron", "add",
        "--name", params.name,
        "--description", params.description ?? params.name,
        "--schedule", params.schedule,
        "--session-target", params.session_target ?? "main",
        "--wake-mode", params.wake_mode ?? "next-heartbeat",
        "--payload", JSON.stringify(params.payload ?? {}),
      ];
      const result = spawnSync("epi", args, { encoding: "utf8" });
      return {
        content: [{ type: "text", text: result.stdout || result.stderr }],
        isError: result.status !== 0,
      };
    },
  });

  // ── Tool: chronos_cron_fire ─────────────────────────────────────
  api.registerTool({
    name: "chronos_cron_fire",
    label: "Chronos Cron Fire",
    description: "Route a fired cron payload through Anima as a normal VAK dispatch. Accepts gateway cron.fired payloads and honours wake_mode.",
    parameters: Type.Object({
      payload: Type.Record(Type.String(), Type.Unknown()),
      session_target: Type.Optional(Type.String({ default: "main" })),
      wake_mode: Type.Optional(Type.Union([
        Type.Literal("now"),
        Type.Literal("next-heartbeat"),
      ], { default: "next-heartbeat" })),
      agent: Type.Optional(Type.String({ description: "Target constitutional/team agent; also accepted inside payload as agent/agent_name/agentId" })),
      task: Type.Optional(Type.String({ description: "Task text; also accepted inside payload as task/prompt/message/text/description" })),
      vak_address: Type.Optional(Type.Any({ description: "Canonical VakAddress; also accepted inside payload as vak_address/vakAddress" })),
      job_id: Type.Optional(Type.String()),
      job_name: Type.Optional(Type.String()),
      fired_at_ms: Type.Optional(Type.Number()),
    }),
    async execute(_id: string, params: ChronosCronFireInput, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      try {
        const result = await chronos_cron_fire(params);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `chronos_cron_fire error: ${e}` }], isError: true };
      }
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

  // ── Tool: chronos_response_orbit ─────────────────────────────────
  api.registerTool({
    name: "chronos_response_orbit",
    label: "Chronos Response Orbit",
    description: "Schedule a tranche response orbit through the existing cron infrastructure and return the response token binding future inscriptions.",
    parameters: Type.Object({
      session_id: Type.String(),
      trigger_event: Type.Record(Type.String(), Type.Unknown()),
      orbit: Type.Union([
        Type.Literal("immediate"),
        Type.String({ pattern: "^hours:\\d+(?:\\.\\d+)?$" }),
        Type.Literal("next-morning"),
        Type.Literal("saturnine"),
      ]),
    }),
    async execute(_id: string, params: ChronosOrbitInput, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      try {
        const result = chronos_response_orbit(params);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `chronos_response_orbit error: ${e}` }], isError: true };
      }
    },
  });

  // ── Tool: chronos_reentry ────────────────────────────────────────
  api.registerTool({
    name: "chronos_reentry",
    label: "Chronos Reentry",
    description: "On tranche.complete.rhythm, compose a retrospective surfacing from file delta, live-spread traces, and kairos status, then inscribe it through Khora.",
    parameters: Type.Object({
      session_id: Type.String(),
      path: Type.String(),
      response_token: Type.Optional(Type.String()),
      since: Type.Optional(Type.String()),
    }),
    async execute(_id: string, params: { session_id: string; path: string; response_token?: string; since?: string }, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      try {
        const result = await chronos_reentry(params);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `chronos_reentry error: ${e}` }], isError: true };
      }
    },
  });

  (api.on as unknown as (event: string, handler: (payload: Record<string, unknown>) => Promise<void>) => void)(
    "tranche.complete.rhythm",
    async (payload) => {
      const path = String(payload.path ?? "");
      const session_id = String(payload.session_id ?? process.env.EPI_SESSION_ID ?? "");
      if (!path || !session_id) return;
      await chronos_reentry({
        path,
        session_id,
        response_token: typeof payload.response_token === "string" ? payload.response_token : undefined,
      });
    },
  );

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
