// Kairos Python Adapter — kerykeion natal chart provider
// Invoked by Janus within Chronos session for temporal boundary execution
//
// Three temporal modes M4 uses:
// - Natal: degree = sun_degree_anchor (cosmic state at birth)
// - Real-time: degree from current time mapping
// - Kairotic: degree at oracle consultation moment
//
// FR-3 compliance: KAIROS enrichment is additive, never a hard dependency.
// M4 works at 0 planets (planet_valid = 0x00). Feature-flagged.

import { spawnSync } from "node:child_process";
import { dirname } from "node:path";

const PLANET_COUNT = 10;
const PLANET_VALID_ALL = (1 << PLANET_COUNT) - 1;
const PLANET_NAME_TO_INDEX: Record<string, number> = {
  sun: 0,
  moon: 1,
  mercury: 2,
  venus: 3,
  mars: 4,
  jupiter: 5,
  saturn: 6,
  uranus: 7,
  neptune: 8,
  pluto: 9,
};

export type PlanetDegreeTuple = [
  number, number, number, number, number,
  number, number, number, number, number,
];

export interface KairosResult {
  sun_degree: number;        // 0-719 (SU(2) double cover)
  moon_degree: number;
  planet_degrees: PlanetDegreeTuple;  // Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
  planet_valid: number;      // bitmask 0x000-0x3FF
  chart_path: string;        // vault path where chart.json was written
  mode: "natal" | "realtime" | "kairotic";
}

export type KairosFrameKind = "NATAL" | "REALTIME" | "KAIROTIC";

export interface KairosFrame {
  kind: KairosFrameKind;
  captured_at_ns: number;
  decays_at_ns: number;
  planet_degrees: PlanetDegreeTuple;
  pp: number;
  mm: number;
  mp: number;
  pn: number;
  _pad: number;
}

export interface KairosNatalRef {
  birth_date: string;        // YYYY-MM-DD (from c_0_birth_date)
  birth_location: string;    // "City, Country" or "lat,lon" (from c_0_birth_location)
  vault_root: string;
  chart_output_path: string; // vault path for chart.json
  chronos_epoch?: number;    // Unix seconds; defaults to current wall time for relay payloads
}

export interface M4_Temporal_Now {
  degree: number;
  chronos_epoch: number;
  natal: KairosFrame;
  realtime: KairosFrame;
  kairotic: KairosFrame;
  kairotic_active: boolean;
  planet_valid: number;
  chart_path: string;
  mode: "natal" | "realtime" | "kairotic";
}

export interface MercuriusPlanetSnapshot {
  readonly planet_id: number;
  readonly degree: number;
  readonly retrograde: boolean;
}

export interface MercuriusKairosSnapshot {
  readonly captured_at: string;
  readonly planets: readonly MercuriusPlanetSnapshot[];
  readonly active_decan: number | null;
  readonly active_tattva: number | null;
}

export interface MercuriusKairosDelta {
  readonly current: MercuriusKairosSnapshot | null;
  readonly summary: string;
}

function epiBinary(): string {
  return process.env.EPI_BIN || "epi";
}

export function mercurius_kairos_snapshot(): MercuriusKairosSnapshot | null {
  const result = spawnSync(epiBinary(), ["--json", "nara", "kairos", "show"], {
    encoding: "utf8",
    timeout: 30_000,
  });
  if (result.status !== 0 || !result.stdout.trim()) return null;
  try {
    const parsed = JSON.parse(result.stdout) as Record<string, unknown>;
    const planets = Array.isArray(parsed.planets)
      ? parsed.planets.flatMap((value) => {
          if (!value || typeof value !== "object") return [];
          const row = value as Record<string, unknown>;
          if (typeof row.planet_id !== "number" || typeof row.degree !== "number") return [];
          return [{
            planet_id: row.planet_id,
            degree: row.degree,
            retrograde: row.retrograde === true,
          }];
        })
      : [];
    if (planets.length === 0) return null;
    return {
      captured_at: new Date().toISOString(),
      planets,
      active_decan: typeof parsed.active_decan === "number" ? parsed.active_decan : null,
      active_tattva: typeof parsed.active_tattva === "number" ? parsed.active_tattva : null,
    };
  } catch {
    return null;
  }
}

function circularDegreeDelta(previous: number, current: number): number {
  const raw = ((current - previous + 540) % 360) - 180;
  return Math.round(raw * 100) / 100;
}

export function mercurius_kairos_delta(previous: MercuriusKairosSnapshot | null): MercuriusKairosDelta {
  const current = mercurius_kairos_snapshot();
  if (!current) return { current: null, summary: "Mercurius kairos query unavailable." };
  if (!previous) {
    return {
      current,
      summary: `current decan=${current.active_decan ?? "unknown"}; tattva=${current.active_tattva ?? "unknown"}`,
    };
  }
  const movements = current.planets.flatMap((planet) => {
    const before = previous.planets.find((candidate) => candidate.planet_id === planet.planet_id);
    if (!before) return [`planet ${planet.planet_id} newly present at ${planet.degree.toFixed(2)} degrees`];
    const delta = circularDegreeDelta(before.degree, planet.degree);
    const retrogradeChanged = before.retrograde !== planet.retrograde;
    if (Math.abs(delta) < 0.01 && !retrogradeChanged) return [];
    return [`planet ${planet.planet_id} ${delta >= 0 ? "+" : ""}${delta} degrees${retrogradeChanged ? `; retrograde=${planet.retrograde}` : ""}`];
  });
  if (previous.active_decan !== current.active_decan) {
    movements.push(`active decan ${previous.active_decan ?? "unknown"}->${current.active_decan ?? "unknown"}`);
  }
  return {
    current,
    summary: movements.length > 0 ? movements.join("; ") : "no material planetary movement since last contact",
  };
}

export async function fetchKairosData(params: KairosNatalRef): Promise<KairosResult> {
  // 1. Check KAIROS_ENABLED env var — fail-fast if explicitly disabled
  if (process.env.KAIROS_ENABLED === "false") {
    throw new Error("KAIROS_ENABLED=false — kairos enrichment is disabled by environment");
  }

  // 2. Delegate to epi CLI (which handles kerykeion invocation)
  const result = spawnSync("epi", ["vault", "kairos", "fetch"], { encoding: "utf8" });

  // 3. Read the chart file written by epi vault kairos fetch
  const fs = await import("node:fs/promises");
  const chartPath = `${params.vault_root}/${params.chart_output_path}`;
  let data: unknown;
  if (result.status === 0) {
    const content = await fs.readFile(chartPath, "utf8");
    data = JSON.parse(content);
  } else {
    data = await runKerykeionFullChart(params, chartPath, result.stderr || result.stdout);
  }

  let canonical: ReturnType<typeof canonicalPlanetDegrees>;
  try {
    canonical = canonicalPlanetDegrees(data);
  } catch (err) {
    if (!isLegacyPlanetDegreesError(err)) throw err;
    data = await runKerykeionFullChart(params, chartPath, String((err as Error).message));
    canonical = canonicalPlanetDegrees(data);
  }

  if ((canonical.planet_valid & PLANET_VALID_ALL) !== PLANET_VALID_ALL) {
    throw new Error(
      `kairos fetch produced incomplete canonical chart: planet_valid=${canonical.planet_valid}`,
    );
  }

  return {
    sun_degree: normalizeM4Degree(data.sun_degree ?? canonical.planet_degrees[0]),
    moon_degree: normalizeM4Degree(data.moon_degree ?? canonical.planet_degrees[1]),
    planet_degrees: canonical.planet_degrees,
    planet_valid: canonical.planet_valid,
    chart_path: params.chart_output_path,
    mode: "natal",
  };
}

export async function mercurius_kairos_now(natal_ref: KairosNatalRef): Promise<M4_Temporal_Now> {
  const kairos = await fetchKairosData(natal_ref);
  const chronos_epoch = natal_ref.chronos_epoch ?? Math.floor(Date.now() / 1000);
  const captured_at_ns = chronos_epoch * 1_000_000_000;
  return {
    degree: kairos.sun_degree,
    chronos_epoch,
    natal: kairosFrame("NATAL", captured_at_ns, kairos.planet_degrees),
    realtime: kairosFrame("REALTIME", captured_at_ns, kairos.planet_degrees),
    kairotic: kairosFrame("KAIROTIC", captured_at_ns, zeroPlanetDegrees()),
    kairotic_active: false,
    planet_valid: kairos.planet_valid,
    chart_path: kairos.chart_path,
    mode: kairos.mode,
  };
}

function kairosFrame(
  kind: KairosFrameKind,
  captured_at_ns: number,
  planet_degrees: PlanetDegreeTuple,
): KairosFrame {
  return {
    kind,
    captured_at_ns,
    decays_at_ns: 0,
    planet_degrees,
    pp: 0,
    mm: 0,
    mp: 0,
    pn: 0,
    _pad: 0,
  };
}

function zeroPlanetDegrees(): PlanetDegreeTuple {
  return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
}

export function getKairosStatus(): { mode: string; planet_valid: string } {
  const result = spawnSync("epi", ["vault", "kairos", "status"], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`kairos status failed: ${result.stderr || result.stdout}`);
  }
  const lines = result.stdout.trim().split("\n");
  const mode = lines.find(l => l.startsWith("mode:"))?.split(":")[1]?.trim();
  const pv = lines.find(l => l.startsWith("planet_valid:"))?.split(":")[1]?.trim();
  if (!mode || !pv) {
    throw new Error(`kairos status output malformed: ${result.stdout}`);
  }
  return { mode, planet_valid: pv };
}

function canonicalPlanetDegrees(data: unknown): {
  planet_degrees: PlanetDegreeTuple;
  planet_valid: number;
} {
  if (!data || typeof data !== "object") {
    throw new Error("kairos fetch produced invalid chart: chart JSON must be an object");
  }

  const value = data as {
    planet_degrees?: unknown;
    planet_valid?: unknown;
    planets?: unknown;
  };

  if (Array.isArray(value.planet_degrees)) {
    if (value.planet_degrees.length !== PLANET_COUNT) {
      throw new Error(
        `kairos fetch produced legacy planet_degrees length=${value.planet_degrees.length}; expected 10 canonical mod-10 slots`,
      );
    }
    const planet_degrees = value.planet_degrees.map(normalizeM4Degree) as PlanetDegreeTuple;
    const planet_valid = normalizePlanetValid(value.planet_valid ?? PLANET_VALID_ALL);
    return { planet_degrees, planet_valid };
  }

  if (Array.isArray(value.planets)) {
    const planet_degrees = new Array<number>(PLANET_COUNT).fill(0);
    let planet_valid = 0;
    for (const planet of value.planets) {
      if (!planet || typeof planet !== "object") continue;
      const p = planet as Record<string, unknown>;
      const idx = planetIndex(p);
      if (idx === undefined) continue;
      planet_degrees[idx] = planetDegreeAnchor(p);
      planet_valid |= 1 << idx;
    }
    return {
      planet_degrees: planet_degrees as PlanetDegreeTuple,
      planet_valid: normalizePlanetValid(value.planet_valid ?? planet_valid),
    };
  }

  throw new Error("kairos fetch produced invalid chart: expected planet_degrees[10] or planets[]");
}

async function runKerykeionFullChart(
  params: KairosNatalRef,
  chartPath: string,
  priorFailure: string,
): Promise<unknown> {
  const script = String.raw`
import json, sys

try:
    from kerykeion import AstrologicalSubject
except ImportError:
    print("ERROR: kerykeion not installed — run: pip3 install kerykeion", file=sys.stderr)
    sys.exit(1)

birth_date = sys.argv[1]
birth_location = sys.argv[2]
year, month, day = [int(part) for part in birth_date.split("-")]

def make_subject():
    if "," in birth_location:
        pieces = [piece.strip() for piece in birth_location.split(",")]
        if len(pieces) == 2:
            try:
                lat = float(pieces[0])
                lng = float(pieces[1])
                return AstrologicalSubject("User", year, month, day, 12, 0, lat=lat, lng=lng)
            except ValueError:
                pass
    try:
        return AstrologicalSubject("User", year, month, day, 12, 0, birth_location)
    except TypeError:
        return AstrologicalSubject("User", year, month, day, 12, 0, city=birth_location)

subject = make_subject()
planet_names = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]
degrees = []
for name in planet_names:
    planet = getattr(subject, name)
    longitude = getattr(planet, "abs_pos", getattr(planet, "position", None))
    if longitude is None:
        raise RuntimeError(f"kerykeion planet {name} has no longitude")
    degrees.append(round(float(longitude) * 2))

print(json.dumps({
    "sun_degree": degrees[0],
    "moon_degree": degrees[1],
    "planet_degrees": degrees,
    "planet_valid": 1023
}))
`;

  const result = spawnSync("python3", ["-c", script, params.birth_date, params.birth_location], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(
      `kairos fetch failed: ${priorFailure}; direct kerykeion failed: ${result.stderr || result.stdout}`,
    );
  }

  const data = JSON.parse(result.stdout);
  const fs = await import("node:fs/promises");
  await fs.mkdir(dirname(chartPath), { recursive: true });
  await fs.writeFile(chartPath, JSON.stringify(data, null, 2));
  return data;
}

function isLegacyPlanetDegreesError(err: unknown): boolean {
  return err instanceof Error && /legacy planet_degrees length=7/.test(err.message);
}

function planetIndex(planet: Record<string, unknown>): number | undefined {
  if (typeof planet.planet_id === "number" && planet.planet_id >= 0 && planet.planet_id < PLANET_COUNT) {
    return planet.planet_id;
  }
  const rawName = planet.name ?? planet.planet_name;
  if (typeof rawName !== "string") return undefined;
  const normalized = rawName.toLowerCase().replace(/^the\s+/, "").trim();
  return PLANET_NAME_TO_INDEX[normalized];
}

function planetDegreeAnchor(planet: Record<string, unknown>): number {
  if (typeof planet.degree_anchor === "number") return normalizeM4Degree(planet.degree_anchor);
  const degree = planet.degree ?? planet.abs_pos ?? planet.position;
  if (typeof degree !== "number") {
    throw new Error("kairos fetch produced planet without degree or degree_anchor");
  }
  return normalizeM4Degree(degree * 2);
}

function normalizeM4Degree(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`kairos fetch produced non-numeric degree: ${value}`);
  }
  return ((Math.round(value) % 720) + 720) % 720;
}

function normalizePlanetValid(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`kairos fetch produced invalid planet_valid=${value}`);
  }
  return Math.trunc(value) & PLANET_VALID_ALL;
}
