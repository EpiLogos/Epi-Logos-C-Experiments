// aletheia/spine-contribution.ts

import type { SpineContribution, InjectionSlot, LedgerChannel, CompilerPass, SpineQuery, SessionContext } from "../spine/types.ts";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

export function aletheiaSpineContribution(): SpineContribution {
  return {
    coordinate: "S5/S5'",

    async injectionSlot(): Promise<InjectionSlot> {
      // Warm: read compiled S5' digest if available (T5 insights carried forward)
      const seedPath = `${process.env.EPILOGOS_VAULT ?? "."}/Empty/Present/SEED.md`;
      let seed = "";
      try {
        if (existsSync(seedPath)) {
          const raw = readFileSync(seedPath, "utf8");
          // Extract the carried-forward sections only (T5 insights + T0 questions)
          const match = raw.match(/## #0.*?(?=^##|\Z)/ms);
          seed = match ? match[0].slice(0, 1500) : "";
        }
      } catch { /* non-fatal */ }

      const content = seed || "(no SEED.md — night' pass not yet run)";
      return {
        coordinate: "S5/S5'",
        cost: "warm",
        content,
        charEstimate: content.length,
      };
    },

    ledgerChannel(): LedgerChannel {
      return {
        coordinate: "S5/S5'",
        ledgerDir: "s5",
        async extract(ctx: SessionContext): Promise<string | null> {
          const graphitiBase = process.env.GRAPHITI_URL ?? "http://localhost:37778";
          try {
            const resp = await fetch(`${graphitiBase}/stats`, { signal: AbortSignal.timeout(3000) });
            const stats = await resp.json() as Record<string, unknown>;
            const arcCount = stats["open_arcs"] ?? "?";
            return `### [[S5']] Improvement — ${ctx.dayId}\n- open_arcs: ${arcCount}\n- session: ${ctx.sessionId}`;
          } catch {
            return `### [[S5']] Improvement — ${ctx.dayId}\n- graphiti: unreachable`;
          }
        },
      };
    },

    compilerPass(): CompilerPass {
      return {
        coordinate: "S5/S5'",
        // The night' pass IS this compiler — runs via cron_evening event, not session-start
        schedule: "cold",
        async compile() {},
        async readCompiled(): Promise<string> { return ""; },
      };
    },

    queryHandler(): SpineQuery {
      return {
        coordinate: "S5/S5'",
        async query(question): Promise<string> {
          const args = ["techne", "gnosis", "query-gnostic", question, "--mode", "hybrid"];
          const result = spawnSync("epi", args, { encoding: "utf8", timeout: 30_000 });
          return result.stdout || "(gnosis query unavailable)";
        },
      };
    },
  };
}
