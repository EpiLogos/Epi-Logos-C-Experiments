// chronos/spine-contribution.ts

import type { SpineContribution, InjectionSlot, LedgerChannel, CompilerPass, SpineQuery, SessionContext } from "../spine/types.ts";
import { spawnSync } from "node:child_process";

export function chronosSpineContribution(): SpineContribution {
  return {
    coordinate: "S3'/Temporal",

    async injectionSlot(): Promise<InjectionSlot> {
      const kairosResult = spawnSync("epi", ["vault", "kairos", "status", "--json"], { encoding: "utf8" });
      let kairosFields = "(kairos unavailable)";
      if (kairosResult.status === 0 && kairosResult.stdout) {
        try {
          const k = JSON.parse(kairosResult.stdout) as Record<string, unknown>;
          kairosFields = [
            `**s_3_kairos_mode:** ${k["mode"] ?? "stub"}`,
            `**s_3_sun_decan:** ${k["sun_decan"] ?? "(unknown)"}`,
            `**s_3_moon_decan:** ${k["moon_decan"] ?? "(unknown)"}`,
            `**s_3_tick12:** ${k["tick12"] ?? "(unknown)"}`,
          ].join("\n");
        } catch { /* parse fail — leave stub */ }
      }

      const dayId = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
      const content = [`**s_3_day_id:** ${dayId}`, kairosFields].join("\n");

      return {
        coordinate: "S3'/Temporal",
        cost: "hot",
        content,
        charEstimate: content.length,
      };
    },

    ledgerChannel(): LedgerChannel {
      return {
        coordinate: "S3'/Temporal",
        ledgerDir: "s3",
        async extract(ctx: SessionContext): Promise<string | null> {
          const kairosResult = spawnSync("epi", ["vault", "kairos", "status", "--json"], { encoding: "utf8" });
          const kairos = kairosResult.status === 0 ? kairosResult.stdout.trim() : "{}";
          return `### [[S3']] Temporal — ${ctx.dayId}\n\`\`\`json\n${kairos}\n\`\`\``;
        },
      };
    },

    compilerPass(): CompilerPass {
      return {
        coordinate: "S3'/Temporal",
        schedule: "warm",
        async compile(_ledgerPath, _outputDir): Promise<void> {
          // Compile: produce daily temporal digest from s3 ledger channel
        },
        async readCompiled(_compiledDir): Promise<string> {
          return "";
        },
      };
    },

    queryHandler(): SpineQuery {
      return {
        coordinate: "S3'/Temporal",
        async query(_question): Promise<string> {
          const result = spawnSync("epi", ["vault", "kairos", "status"], { encoding: "utf8" });
          return result.stdout || "(temporal status unavailable)";
        },
      };
    },
  };
}
