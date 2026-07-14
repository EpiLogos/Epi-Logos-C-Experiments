// Coordinate: S4-0' Khora (NOW frontmatter authority) — Tranche 12.18 write-through
// Residency: Body/S/S4/ta-onta/S4-0p-khora/modules
// Actualises: the Janus-computes / Khora-writes seam — janus_weight_session
//   (S4-5' Aletheia, CF1 + CF(0/1) Klein-binary) supplies the per-session
//   prospective/retrospective weighting; Khora, as the only canonical write
//   authority, stamps it onto the session NOW as `c_3_klein_weighting`
//   (nested shape validated by hen-compiler-core klein_weighting_validation,
//   5.19). Stamped ONCE at session_start — user override is absolute and the
//   weighting persists for the session, so flow events never re-stamp it.
// Does NOT own: the weighting computation (janus-doorway.ts), the value
//   validation law (hen-compiler-core), the briefing/ambient consumers.
//   Never fabricates: absent or malformed kairos → no stamp, the consumer's
//   `pending-weighting` seam stays truthful.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import {
  janus_weight_session,
  type JanusWeightSessionResult,
  type KleinWeighting,
  type M4TemporalNow,
} from "../../S4-5p-aletheia/modules/janus-doorway.ts";
import { currentKairosCachePath } from "./now-fibonacci-ground.ts";

interface KairosCacheShape {
  readonly planet_degrees?: unknown;
  readonly M4_Temporal_Now?: M4TemporalNow & {
    readonly natal?: { readonly planet_degrees?: unknown };
  };
}

export interface KleinWeightingInputs {
  readonly temporalNow: M4TemporalNow;
  readonly natalPlanetDegrees?: number[];
}

export function readCurrentKairosKleinInputs(
  path = currentKairosCachePath(),
): KleinWeightingInputs | null {
  if (!existsSync(path)) return null;
  const parsed = JSON.parse(readFileSync(path, "utf8")) as KairosCacheShape;
  const now = parsed.M4_Temporal_Now;
  if (now) {
    const natal = degreeArray(now.natal?.planet_degrees);
    return { temporalNow: now, natalPlanetDegrees: natal ?? undefined };
  }
  const flat = degreeArray(parsed.planet_degrees);
  return flat ? { temporalNow: { planet_degrees: flat } } : null;
}

export function stampNowKleinWeightingFrontmatter(
  nowPath: string,
  sessionId: string,
): JanusWeightSessionResult | null {
  const inputs = readCurrentKairosKleinInputs();
  if (inputs === null) return null;

  let result: JanusWeightSessionResult;
  try {
    result = janus_weight_session({
      session_id: sessionId,
      M4_Temporal_Now: inputs.temporalNow,
      natal_planet_degrees: inputs.natalPlanetDegrees,
    });
  } catch {
    return null; // malformed degrees — never fabricate a split
  }

  const content = readFileSync(nowPath, "utf8");
  const next = upsertNowKleinWeightingFrontmatter(content, result.c_3_klein_weighting);
  if (next !== content) writeFileSync(nowPath, next, "utf8");
  return result;
}

export function upsertNowKleinWeightingFrontmatter(
  content: string,
  weighting: KleinWeighting,
): string {
  if (!content.startsWith("---\n")) {
    throw new Error("NOW.md must begin with YAML frontmatter");
  }
  const end = content.indexOf("\n---", 4);
  if (end === -1) {
    throw new Error("NOW.md frontmatter is missing closing delimiter");
  }

  const frontmatter = content.slice(4, end).replace(/\n$/, "");
  const body = content.slice(end);
  const lines = frontmatter.length > 0 ? frontmatter.split("\n") : [];
  const block = [
    "c_3_klein_weighting:",
    `  prospective: ${weighting.prospective}`,
    `  retrospective: ${weighting.retrospective}`,
  ];

  const keyIndex = lines.findIndex((line) => line.startsWith("c_3_klein_weighting:"));
  if (keyIndex >= 0) {
    let span = 1;
    while (keyIndex + span < lines.length && /^\s+\S/.test(lines[keyIndex + span])) span += 1;
    lines.splice(keyIndex, span, ...block);
  } else {
    lines.splice(insertionIndex(lines), 0, ...block);
  }

  return `---\n${lines.join("\n")}\n${body}`;
}

function insertionIndex(lines: readonly string[]): number {
  const anchors = ["c_3_backbone_index:", "c_3_created_at:", "c_3_day_id:", "c_2_session_id:"];
  for (const anchor of anchors) {
    const index = lines.findIndex((line) => line.startsWith(anchor));
    if (index >= 0) return index + 1;
  }
  return lines.length;
}

function degreeArray(value: unknown): number[] | null {
  if (!Array.isArray(value)) return null;
  const nums = value.filter((d): d is number => typeof d === "number" && Number.isFinite(d));
  return nums.length === value.length ? nums : null;
}
