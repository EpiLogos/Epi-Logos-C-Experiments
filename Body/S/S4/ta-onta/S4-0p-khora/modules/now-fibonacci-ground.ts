import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const PISANO_DIGIT_LUT = Object.freeze([
  0, 1, 1, 2, 3, 5, 8, 3, 1, 4,
  5, 9, 4, 3, 7, 0, 7, 7, 4, 1,
  5, 6, 1, 7, 8, 5, 3, 8, 1, 9,
  0, 9, 9, 8, 7, 5, 2, 7, 9, 6,
  5, 1, 6, 7, 3, 0, 3, 3, 6, 9,
  5, 4, 9, 3, 2, 5, 7, 2, 9, 1,
] as const);

export interface NowFibonacciGroundStamp {
  readonly fibonacciPosition: number;
  readonly fibonacciDigit: number;
  readonly tick12: number;
  readonly backboneIndex: number;
}

interface PlanetPosition {
  readonly planet_id?: unknown;
  readonly degree?: unknown;
}

interface KairosCache {
  readonly sun_degree?: unknown;
  readonly planet_degrees?: unknown;
  readonly M4_Temporal_Now?: {
    readonly planet_degrees?: unknown;
    readonly realtime?: { readonly planet_degrees?: unknown };
    readonly kairotic?: { readonly planet_degrees?: unknown };
    readonly kairotic_active?: unknown;
  };
  readonly planets?: unknown;
}

export function fibonacciPositionFromSunDegree(sunDegree: number): number {
  if (!Number.isFinite(sunDegree)) {
    throw new Error(`sun degree is not finite: ${sunDegree}`);
  }
  const normalized = ((sunDegree % 360) + 360) % 360;
  return Math.min(59, Math.floor(normalized / 6));
}

export function fibonacciGroundStampFromSunDegree(sunDegree: number): NowFibonacciGroundStamp {
  const fibonacciPosition = fibonacciPositionFromSunDegree(sunDegree);
  return Object.freeze({
    fibonacciPosition,
    fibonacciDigit: PISANO_DIGIT_LUT[fibonacciPosition],
    tick12: Math.floor(fibonacciPosition / 5),
    backboneIndex: Math.floor((fibonacciPosition * 24) / 60),
  });
}

export function currentKairosCachePath(): string {
  const naraHome = process.env.EPI_NARA_HOME ?? join(homedir(), ".epi-logos", "nara");
  return join(naraHome, "kairos", "current.json");
}

export function readCurrentKairosSunDegree(path = currentKairosCachePath()): number | null {
  if (!existsSync(path)) return null;
  const parsed = JSON.parse(readFileSync(path, "utf8")) as KairosCache;
  const framed = liveM4TemporalNowPlanetDegrees(parsed.M4_Temporal_Now);
  const degree =
    finiteNumber(parsed.sun_degree) ??
    finiteNumberFromArray(framed, 0) ??
    finiteNumberFromArray(parsed.M4_Temporal_Now?.planet_degrees, 0) ??
    finiteNumberFromArray(parsed.planet_degrees, 0) ??
    finiteSunDegreeFromPlanets(parsed.planets);
  return degree ?? null;
}

function liveM4TemporalNowPlanetDegrees(now: KairosCache["M4_Temporal_Now"]): unknown {
  if (!now) return undefined;
  const kairoticActive = now.kairotic_active === true || now.kairotic_active === 1;
  if (kairoticActive && now.kairotic?.planet_degrees !== undefined) {
    return now.kairotic.planet_degrees;
  }
  return now.realtime?.planet_degrees;
}

export function stampNowFibonacciGroundFrontmatter(nowPath: string): NowFibonacciGroundStamp | null {
  const sunDegree = readCurrentKairosSunDegree();
  if (sunDegree === null) return null;

  const stamp = fibonacciGroundStampFromSunDegree(sunDegree);
  const content = readFileSync(nowPath, "utf8");
  const next = upsertNowFibonacciGroundFrontmatter(content, stamp);
  if (next !== content) writeFileSync(nowPath, next, "utf8");
  return stamp;
}

export function upsertNowFibonacciGroundFrontmatter(
  content: string,
  stamp: NowFibonacciGroundStamp,
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
  const values: ReadonlyArray<readonly [string, number]> = [
    ["c_3_fibonacci_position", stamp.fibonacciPosition],
    ["c_3_fibonacci_digit", stamp.fibonacciDigit],
    ["c_3_tick12", stamp.tick12],
    ["c_3_backbone_index", stamp.backboneIndex],
  ];

  let insertAt = insertionIndex(lines);
  for (const [key, value] of values) {
    const index = lines.findIndex((line) => line.startsWith(`${key}:`));
    if (index >= 0) {
      lines[index] = `${key}: ${value}`;
    } else {
      lines.splice(insertAt, 0, `${key}: ${value}`);
      insertAt += 1;
    }
  }

  return `---\n${lines.join("\n")}\n${body}`;
}

function insertionIndex(lines: readonly string[]): number {
  const anchors = ["c_3_created_at:", "c_3_day_id:", "c_2_session_id:"];
  for (const anchor of anchors) {
    const index = lines.findIndex((line) => line.startsWith(anchor));
    if (index >= 0) return index + 1;
  }
  return lines.length;
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function finiteNumberFromArray(value: unknown, index: number): number | null {
  return Array.isArray(value) ? finiteNumber(value[index]) : null;
}

function finiteSunDegreeFromPlanets(value: unknown): number | null {
  if (!Array.isArray(value)) return null;
  const sun = (value as readonly PlanetPosition[]).find((planet) => planet?.planet_id === 0);
  return finiteNumber(sun?.degree);
}
