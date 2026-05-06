import { spawnSync } from "node:child_process";

function defaultDayId() {
  const now = new Date();
  const day = String(now.getUTCDate()).padStart(2, "0");
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const year = String(now.getUTCFullYear());
  return `${day}-${month}-${year}`;
}

export function buildTemporalContextEnvelope(dayId?: string, sessionIds: string[] = []) {
  const kairos = spawnSync("epi", ["--json", "vault", "kairos", "status"], { encoding: "utf8", timeout: 30_000 });
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
  return spawnSync("epi", ["gate", "cron", "add", "--name", "mobius-return", "--schedule", "0 23 * * *"], {
    encoding: "utf8",
    timeout: 30_000,
  });
}

export function triggerSixAmBootstrap() {
  return spawnSync("epi", ["gate", "cron", "add", "--name", "day-bootstrap", "--schedule", "0 6 * * *"], {
    encoding: "utf8",
    timeout: 30_000,
  });
}

export function coordinateMobiusReturn(dayId?: string) {
  return spawnSync("epi", ["vault", "archive-day", dayId ?? defaultDayId()], { encoding: "utf8", timeout: 30_000 });
}
