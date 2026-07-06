/**
 * Aletheia extension facade - composes S4-5' tool families and hook wiring.
 *
 * @coordinate   S4-5'  |  Aletheia carrier
 * @residency    Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts
 * @position     #5 - Epii integration / truth-disclosure
 * @actualises   Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md; [[S4-5'-SPEC]]
 *
 * Public surface:
 *   aletheiaExtension(api) - registers Aletheia tools and lifecycle hooks.
 * Does NOT own:
 *   Tool-family implementation, Anima dispatch routing, vault CRUD, or Chronos scheduling.
 *
 * @contract     Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md
 */
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { spawnSync } from "node:child_process";
import { buildTemporalContextEnvelope, adjustKairosThreshold, coordinateMobiusReturn } from "./modules/chronos-integration.ts";
import { validateHenSync } from "./modules/hen-integration.ts";
import { maybeUpdateCoordinateMap } from "./modules/coordinate-loop.ts";
import { registerEpisodicTools } from "./S5'/tools/episodic-tools.ts";
import { registerGnosisTools } from "./S5'/tools/gnosis-tools.ts";
import { registerSeedTools } from "./S5'/tools/seed-tools.ts";
import { registerThoughtTools } from "./S5'/tools/thought-tools.ts";

export async function aletheiaExtension(api: ExtensionAPI) {
  registerEpisodicTools(api);
  registerThoughtTools(api);
  registerGnosisTools(api);
  registerSeedTools(api);

  api.on("session_shutdown", async () => {
    // Sophia has already classified thinking/ -> thoughts/ before this fires.
    // Aletheia routes thoughts/ -> T-buckets via aletheia_thought_route.
    // HOT->COLD promotion happens during night' pass only.
  });

  (api.on as unknown as (event: string, handler: (event: { janus_envelope?: string }) => Promise<void>) => void)(
    "cron_evening",
    async (event: { janus_envelope?: string }) => {
      const envelope = event?.janus_envelope
        ? JSON.parse(event.janus_envelope)
        : null;
      const temporalEnvelope = buildTemporalContextEnvelope(envelope?.day_id, envelope?.session_ids ?? []);
      const threshold = adjustKairosThreshold(0.5, /guarded/i.test(temporalEnvelope.kairos) ? "guarded" : undefined);
      void threshold;

      if (envelope?.session_ids?.length) {
        // Hen (S1') topology must be current before Aletheia promotes —
        // crystallising against a stale coordinate map corrupts T-buckets.
        const henSync = validateHenSync();
        if (!henSync.ok) {
          return;
        }
        const allIds: string[] = [...envelope.session_ids];
        if (envelope.child_session_map) {
          for (const children of Object.values(envelope.child_session_map) as string[][]) {
            allIds.push(...children);
          }
        }
        spawnSync("epi", [
          "agent", "run", "--tool", "aletheia_session_promote",
          "--session-ids", allIds.join(","),
          "--day-id", envelope.day_id,
        ], { encoding: "utf8" });
      }

      coordinateMobiusReturn(envelope?.day_id);
      maybeUpdateCoordinateMap({
        coordinatePath: `${process.cwd()}/Idea/Empty/COORDINATE-MAP.md`,
        insight: envelope?.mobius_insight,
        recommendation: envelope?.coordinate_recommendation,
      });

      const graphitiBase = process.env.GRAPHITI_URL ?? "http://localhost:37778";
      fetch(`${graphitiBase}/communities/build`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day_id: envelope?.day_id }),
        signal: AbortSignal.timeout(120_000),
      }).catch(() => {/* non-fatal if sidecar not running */});

      spawnSync("epi", ["gate", "cron", "status"], { encoding: "utf8" });
    },
  );
}
