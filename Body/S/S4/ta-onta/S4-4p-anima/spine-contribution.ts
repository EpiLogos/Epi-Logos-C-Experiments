// anima/spine-contribution.ts

import type { SpineContribution, InjectionSlot, LedgerChannel, CompilerPass, SpineQuery, SessionContext } from "../spine/types.ts";
import { spawnSync } from "node:child_process";

export function animaSpineContribution(): SpineContribution {
  return {
    coordinate: "S4/S4'",

    async injectionSlot(): Promise<InjectionSlot> {
      const agentName = process.env.EPI_AGENT_NAME ?? "anima";
      const agentMode = process.env.EPI_AGENT_MODE ?? "standard";
      const csState = process.env.EPI_CS_STATE ?? "CS0:day:4.0";

      const content = [
        `**s_4_agent_name:** ${agentName}`,
        `**s_4_agent_mode:** ${agentMode}`,
        `**s_4_cs_state:** ${csState}`,
        `**s_4_cpf_gate:** (00/00) requires user co-action before autonomous dispatch`,
        `**s_4_cf_routing:** (0/1)→logos | (0/1/2)→eros | (0/1/2/3)→mythos | (4.0/1-4.4/5)→anima | (4.5/0)→psyche | (5/0)→sophia | (00/00)→nous`,
      ].join("\n");

      return {
        coordinate: "S4/S4'",
        cost: "hot",
        content,
        charEstimate: content.length,
      };
    },

    ledgerChannel(): LedgerChannel {
      return {
        coordinate: "S4/S4'",
        ledgerDir: "s4",
        async extract(ctx: SessionContext): Promise<string | null> {
          const agentName = process.env.EPI_AGENT_NAME ?? "anima";
          return `### [[S4']] Agent — ${ctx.sessionId}\n- agent: ${agentName}\n- session_id: ${ctx.sessionId}`;
        },
      };
    },

    compilerPass(): CompilerPass {
      return {
        coordinate: "S4/S4'",
        schedule: "cold",
        async compile() {},
        async readCompiled(): Promise<string> { return ""; },
      };
    },

    queryHandler(): SpineQuery {
      return {
        coordinate: "S4/S4'",
        async query(question): Promise<string> {
          const result = spawnSync("epi", ["agent", "vak", "evaluate", question], { encoding: "utf8" });
          return result.stdout || "(vak evaluate unavailable)";
        },
      };
    },
  };
}
