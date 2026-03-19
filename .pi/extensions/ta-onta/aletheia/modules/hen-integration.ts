import { closeSync, openSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";

const TEMPLATE_KEYS: Record<string, string> = {
  seed: "CT0'",
  thought: "CT5'",
  daily: "CT4a'",
  context: "CT4b'",
};

export function buildTemplateInvocation(artifactType: string) {
  return TEMPLATE_KEYS[artifactType] ?? "CT4b'";
}

export function refreshTopology() {
  return spawnSync("epi", ["vault", "sync-status"], { encoding: "utf8", timeout: 30_000 });
}

export function validateHenSync() {
  const result = spawnSync("epi", ["vault", "sync-status"], { encoding: "utf8", timeout: 30_000 });
  const stdout = result.stdout || result.stderr || "";
  const stale = /stale|lag|out[- ]of[- ]date/i.test(stdout);
  return { ok: result.status === 0 && !stale, stale, output: stdout };
}

export function allowPromotionPath(path: string) {
  return !/(transcript|session-history|jsonl)/i.test(path);
}

export function acquireCoordinateLock(lockPath: string) {
  const fd = openSync(lockPath, "wx");
  closeSync(fd);
  return lockPath;
}

export function releaseCoordinateLock(lockPath: string) {
  unlinkSync(lockPath);
}
