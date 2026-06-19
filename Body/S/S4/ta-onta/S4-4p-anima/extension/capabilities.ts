import { readFileSync } from "node:fs";
import { resolve as resolvePath, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { isValidVakAddress, type VakAddress } from "../../shared/vak_address.ts";
import { findSkillsForVak, type CapabilityMatrix } from "../modules/skill-registry.ts";

export const animaDefaultTools = [
  "vak_evaluate",
  "goal_prelude",
  "anima_orchestrate",
  "anima_arena_orchestrate",
  "nous_disclose",
  "dispatch_agent",
  "dispatch_parallel_agents",
  "dispatch_fusion_agents",
  "dispatch_moirai_night_pass",
  "anima_self_invoke",
  "run_chain",
  "subagent_create",
  "subagent_continue",
  "subagent_list",
  "subagent_remove",
  "tilldone",
];

// Lazily-loaded pleroma capability matrix. Cached after first read because the
// matrix is shipped-with-the-plugin static data; in-process mutation is not a
// concern. If the file is missing or malformed we surface `null` so callers
// can degrade gracefully (matrix-aware features are advisory, not gating).
let _capabilityMatrix: CapabilityMatrix | null | undefined;

export function loadCapabilityMatrix(): CapabilityMatrix | null {
  if (_capabilityMatrix !== undefined) return _capabilityMatrix;
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const matrixPath = resolvePath(here, "../../../plugins/pleroma/capability-matrix.json");
    const raw = readFileSync(matrixPath, "utf8");
    const parsed = JSON.parse(raw) as CapabilityMatrix;
    _capabilityMatrix = parsed && Array.isArray(parsed.skills) ? parsed : null;
  } catch {
    _capabilityMatrix = null;
  }
  return _capabilityMatrix;
}

export function suggestedSkillsForVak(vakAddress: unknown): string[] | undefined {
  if (!vakAddress || !isValidVakAddress(vakAddress)) {
    return undefined;
  }
  const matrix = loadCapabilityMatrix();
  if (!matrix) {
    return undefined;
  }
  return findSkillsForVak(matrix, vakAddress as VakAddress).map((s) => s.name);
}

export const validCfCodes = [
  "(0/1)",
  "(0/1/2)",
  "(0/1/2/3)",
  "(4.0/1-4.4/5)",
  "(4.5/0)",
  "(5/0)",
  "(00/00)",
];
