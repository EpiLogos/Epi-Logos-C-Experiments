// Coordinate: S4-3' / S3 temporal control plane
// Residency: Body/S/S4/ta-onta/S4-3p-chronos/modules
// Position (#n): #3 response orbit and rhythm re-entry
// Actualises: [[S4-3'-SPEC]] scheduling across Khora, Hen, Janus, Mercurius
// Public surface: chronos_response_orbit, chronos_reentry, responseOrbitFromFrontmatter
// Does NOT own: vault writes, content interpretation, agent dispatch, or cron persistence
// Contract: ../CONTRACT.md

import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { hen_content_delta_since } from "../../S4-1p-hen/modules/hybrid-retrieve.ts";
import { khora_write_highlighted_inscription } from "../../S4-0p-khora/modules/highlighted-inscription.ts";
import { janus_spread_delta } from "../../S4-5p-aletheia/modules/janus-doorway.ts";
import {
  mercurius_kairos_delta,
  mercurius_kairos_snapshot,
  type MercuriusKairosSnapshot,
} from "../S3'/kairos-python-adapter.ts";

export type ChronosResponseOrbit = "immediate" | `hours:${number}` | "next-morning" | "saturnine";

export interface ChronosOrbitInput {
  readonly session_id: string;
  readonly trigger_event: Record<string, unknown>;
  readonly orbit: ChronosResponseOrbit;
}

export interface ChronosOrbitResult {
  readonly scheduled_at: string;
  readonly response_token: string;
}

interface ChronosOrbitRecord extends ChronosOrbitResult {
  readonly session_id: string;
  readonly trigger_event: Record<string, unknown>;
  readonly orbit: ChronosResponseOrbit;
  readonly recorded_at: string;
  readonly kairos_snapshot: MercuriusKairosSnapshot | null;
}

function epiBinary(): string {
  return process.env.EPI_BIN || "epi";
}

function orbitLedgerPath(): string {
  return process.env.EPI_CHRONOS_ORBIT_LEDGER
    || join(process.env.EPI_REPO_ROOT || ".", ".chronos-response-orbits.jsonl");
}

function responseToken(sessionId: string, triggerEvent: Record<string, unknown>, scheduledAt: Date): string {
  const trigger = String(triggerEvent.kind ?? triggerEvent.type ?? "tranche.complete");
  const stamp = scheduledAt.toISOString().replace(/[^0-9TZ]/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);
  return `chronos_${sessionId}_${trigger.replace(/[^a-zA-Z0-9_-]/g, "_")}_${stamp}_${suffix}`;
}

function nextMorning(now: Date): Date {
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
  if (JSON.stringify(record).toLowerCase().includes("saturn")) {
    for (const key of ["exact_at", "exactAt", "at", "starts_at", "startsAt", "scheduled_at", "scheduledAt"]) {
      const raw = record[key];
      if (typeof raw === "string" || typeof raw === "number") {
        const date = new Date(raw);
        if (!Number.isNaN(date.getTime())) into.push(date);
      }
    }
  }
  for (const nested of Object.values(record)) collectSaturnCandidates(nested, into);
  return into;
}

function nearestSaturnAspect(now: Date): Date | null {
  const result = spawnSync(epiBinary(), ["vault", "kairos", "status", "--json"], {
    encoding: "utf8",
    timeout: 30_000,
  });
  if (result.status !== 0 || !result.stdout.trim()) return null;
  try {
    const parsed = JSON.parse(result.stdout) as Record<string, unknown>;
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

function registerOrbitCron(input: ChronosOrbitInput, scheduledAt: Date, token: string): void {
  const result = spawnSync(epiBinary(), [
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

function appendOrbitRecord(record: ChronosOrbitRecord): void {
  const path = orbitLedgerPath();
  mkdirSync(dirname(path), { recursive: true });
  appendFileSync(path, `${JSON.stringify(record)}\n`, "utf8");
}

function latestOrbitRecord(sessionId: string, responseToken?: string): ChronosOrbitRecord | null {
  const path = orbitLedgerPath();
  if (!existsSync(path)) return null;
  let latest: ChronosOrbitRecord | null = null;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const record = JSON.parse(line) as ChronosOrbitRecord;
      if (record.session_id !== sessionId) continue;
      if (responseToken && record.response_token !== responseToken) continue;
      latest = record;
    } catch {
      // Preserve prior valid append-only receipts when an interrupted final line is present.
    }
  }
  return latest;
}

export function chronos_response_orbit(input: ChronosOrbitInput, now = new Date()): ChronosOrbitResult {
  const scheduledAt = resolveChronosOrbit(input.orbit, now);
  const token = responseToken(input.session_id, input.trigger_event, scheduledAt);
  const kairosSnapshot = mercurius_kairos_snapshot();
  registerOrbitCron(input, scheduledAt, token);
  const result = { scheduled_at: scheduledAt.toISOString(), response_token: token };
  appendOrbitRecord({
    ...result,
    session_id: input.session_id,
    trigger_event: input.trigger_event,
    orbit: input.orbit,
    recorded_at: new Date().toISOString(),
    kairos_snapshot: kairosSnapshot,
  });
  return result;
}

function summarizeDelta(content: string, since?: string): string {
  const words = content.trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
  if (words.length === 0) return `No new body text detected${since ? ` since ${since}` : ""}.`;
  return `${words.slice(0, 48).join(" ")}${words.length > 48 ? " ..." : ""}`;
}

export function responseOrbitFromFrontmatter(path: string, fallback: ChronosResponseOrbit = "immediate"): ChronosResponseOrbit {
  if (!existsSync(path)) return fallback;
  const match = /^c_3_response_orbit:\s*["']?([^"'\n]+)["']?/m.exec(readFileSync(path, "utf8"));
  const value = match?.[1]?.trim();
  if (value === "immediate" || value === "next-morning" || value === "saturnine") return value;
  if (value && /^hours:\d+(?:\.\d+)?$/.test(value)) return value as `hours:${number}`;
  return fallback;
}

export async function chronos_reentry(input: {
  readonly session_id: string;
  readonly path: string;
  readonly response_token?: string;
  readonly since?: string;
}): Promise<{ path: string; response_token: string; category: "retrospective-surfacing" }> {
  const orbit = latestOrbitRecord(input.session_id, input.response_token);
  const token = input.response_token ?? orbit?.response_token ?? `chronos_reentry_${input.session_id}_${Date.now()}`;
  const delta = hen_content_delta_since({
    path: input.path,
    since: input.since,
    response_token: token,
  });
  const spread = janus_spread_delta(delta.content);
  const kairos = mercurius_kairos_delta(orbit?.kairos_snapshot ?? null);
  const block = [
    "> [!retrospective-surfacing] Chronos re-entry",
    `> response_token: ${token}`,
    `> what is new: ${summarizeDelta(delta.content, input.since)}`,
    `> what is still alive: ${spread.still_alive.length ? spread.still_alive.join(" / ") : "No live spread positions changed in the gap."}`,
    `> what has gone mute: ${spread.gone_mute.length ? spread.gone_mute.join(" / ") : "No spread positions went mute in the gap."}`,
    `> what kairos has activated: ${kairos.summary}`,
  ].join("\n");

  return khora_write_highlighted_inscription({
    path: input.path,
    category: "retrospective-surfacing",
    position: "top",
    content: block,
    response_token: token,
  });
}
