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

export interface KairosResult {
  sun_degree: number;        // 0-719 (SU(2) double cover)
  moon_degree: number;
  planet_degrees: number[];  // [sun, moon, mercury, venus, mars, jupiter, saturn]
  planet_valid: number;      // bitmask 0x00-0x7F
  chart_path: string;        // vault path where chart.json was written
  mode: "natal" | "realtime" | "kairotic";
}

export async function fetchKairosData(params: {
  birth_date: string;        // YYYY-MM-DD (from c_0_birth_date)
  birth_location: string;    // "City, Country" or "lat,lon" (from c_0_birth_location)
  vault_root: string;
  chart_output_path: string; // vault path for chart.json
}): Promise<KairosResult> {
  // 1. Check KAIROS_ENABLED env var — fail-fast if explicitly disabled
  if (process.env.KAIROS_ENABLED === "false") {
    throw new Error("KAIROS_ENABLED=false — kairos enrichment is disabled by environment");
  }

  // 2. Delegate to epi CLI (which handles kerykeion invocation)
  const result = spawnSync("epi", ["vault", "kairos", "fetch"], { encoding: "utf8" });

  if (result.status !== 0) {
    throw new Error(`kairos fetch failed: ${result.stderr || result.stdout}`);
  }

  // 3. Read the chart file written by epi vault kairos fetch
  const fs = await import("node:fs/promises");
  const chartPath = `${params.vault_root}/${params.chart_output_path}`;
  const content = await fs.readFile(chartPath, "utf8");
  const data = JSON.parse(content);

  if (!data.planet_valid || data.planet_valid === 0) {
    throw new Error(`kairos fetch produced invalid chart: planet_valid=${data.planet_valid}`);
  }

  return {
    sun_degree: data.sun_degree,
    moon_degree: data.moon_degree,
    planet_degrees: data.planet_degrees,
    planet_valid: data.planet_valid,
    chart_path: params.chart_output_path,
    mode: "natal",
  };
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
