// 47.2 — Chronos fire-job to Anima dispatch.
// A fired cron payload routes through Anima as a normal VAK dispatch, never a
// side channel: the payload resolves to (agent, task, VakAddress) and goes
// through the same dispatchTeamMember seam every other dispatch uses.
// Lives in modules/ (not extension.ts) so the unit is importable without the
// pi-agent/typebox tool-registration context — the aeon-scheduling pattern.

import {
  dispatchTeamMember,
  vakAddressForTeamDispatch,
  type TeamDispatchVakAddressDefaults,
} from "../../S4-4p-anima/extension/dispatch.ts";
import type { VakAddress } from "../../shared/vak_address.ts";

export type ChronosCronWakeMode = "now" | "next-heartbeat";

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
