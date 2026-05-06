// khora/spine-contribution.ts

import type { SpineContribution, InjectionSlot, LedgerChannel, CompilerPass, SpineQuery, SessionContext } from "../spine/types.ts";
import { spawnSync } from "node:child_process";

export function khoraSpineContribution(): SpineContribution {
  return {
    coordinate: "S0/S0'",

    async injectionSlot(): Promise<InjectionSlot> {
      const sessionId = process.env.EPI_SESSION_ID ?? "(not set)";
      const dayId = process.env.EPI_DAY_ID ?? "(not set)";
      const nowPath = process.env.EPI_NOW_PATH ?? "(not set)";
      const vaultRoot = process.env.EPILOGOS_VAULT ?? "(not set)";

      const content = [
        `**s_0_session_key:** ${sessionId}`,
        `**s_0_day_id:** ${dayId}`,
        `**s_0_now_path:** ${nowPath}`,
        `**s_0_vault_root:** ${vaultRoot}`,
        `**s_0_preferred_tools:** bat(read), rg(search), eza(list), zoxide(nav), jq(json), gh(github), just(tasks)`,
      ].join("\n");

      return {
        coordinate: "S0/S0'",
        cost: "hot",
        content,
        charEstimate: content.length,
      };
    },

    ledgerChannel(): LedgerChannel {
      return {
        coordinate: "S0/S0'",
        ledgerDir: "s0",
        async extract(ctx: SessionContext): Promise<string | null> {
          return [
            `### Session ${ctx.sessionId} — ${ctx.dayId}`,
            `- s_0_session_key: ${ctx.sessionId}`,
            `- s_0_day_id: ${ctx.dayId}`,
            `- s_0_now_path: ${ctx.nowPath ?? "(none)"}`,
          ].join("\n");
        },
      };
    },

    compilerPass(): CompilerPass {
      return {
        coordinate: "S0/S0'",
        schedule: "warm",
        async compile(_ledgerPath, _outputDir) {
          // S0 compiled artifact: session count, tool preference history
        },
        async readCompiled(_compiledDir): Promise<string> {
          return "";
        },
      };
    },

    queryHandler(): SpineQuery {
      return {
        coordinate: "S0/S0'",
        async query(_question): Promise<string> {
          const result = spawnSync("epi", ["agent", "session", "status"], { encoding: "utf8" });
          return result.stdout || "(session status unavailable)";
        },
      };
    },
  };
}
