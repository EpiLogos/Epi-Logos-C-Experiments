import { appendFileSync, existsSync } from "node:fs";
import { acquireCoordinateLock, releaseCoordinateLock } from "./hen-integration.ts";

export function maybeUpdateCoordinateMap(args: {
  coordinatePath: string;
  insight?: string;
  recommendation?: string;
}) {
  if (!args.insight || !args.recommendation) {
    return { updated: false, reason: "no coordinate insight" };
  }

  if (!["enrich-current", "promote-planned"].includes(args.recommendation)) {
    return { updated: false, reason: "recommendation did not require a write" };
  }

  const lockPath = `${args.coordinatePath}.lock`;
  acquireCoordinateLock(lockPath);
  try {
    if (!existsSync(args.coordinatePath)) {
      return { updated: false, reason: "coordinate map missing" };
    }
    appendFileSync(
      args.coordinatePath,
      `\n- ${new Date().toISOString()}: ${args.recommendation} -> ${args.insight}\n`,
      "utf8",
    );
    return { updated: true };
  } finally {
    releaseCoordinateLock(lockPath);
  }
}
