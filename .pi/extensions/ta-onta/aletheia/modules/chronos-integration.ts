import { spawnSync } from "node:child_process";

export function buildTemporalContextEnvelope(dayId?: string, sessionIds: string[] = []) {
  const kairos = spawnSync("epi", ["vault", "kairos-status", "--json"], { encoding: "utf8", timeout: 30_000 });
  return {
    dayId: dayId ?? "unknown",
    sessionIds,
    kairos: kairos.stdout || kairos.stderr || "",
  };
}

export function adjustKairosThreshold(baseThreshold: number, quality?: string) {
  return quality === "guarded" ? baseThreshold + 0.15 : baseThreshold;
}

export function registerMobiusTrigger() {
  return spawnSync("epi", ["gate", "cron", "add", "--label", "mobius-return", "--schedule", "0 23 * * *"], {
    encoding: "utf8",
    timeout: 30_000,
  });
}

export function triggerSixAmBootstrap() {
  return spawnSync("epi", ["gate", "cron", "add", "--label", "day-bootstrap", "--schedule", "0 6 * * *"], {
    encoding: "utf8",
    timeout: 30_000,
  });
}

export function coordinateMobiusReturn(dayId?: string) {
  return spawnSync("epi", ["vault", "archive-day", dayId ?? "today"], { encoding: "utf8", timeout: 30_000 });
}
