// pleroma/spine-contribution.ts

import type { SpineContribution, InjectionSlot, LedgerChannel, CompilerPass, SpineQuery, SessionContext } from "../spine/types.ts";
import { spawnSync } from "node:child_process";
import { listPrimitives } from "./S2/pleroma-primitives.ts";

export function pleromaSpineContribution(): SpineContribution {
  return {
    coordinate: "S2/S3",

    async injectionSlot(): Promise<InjectionSlot> {
      const gatewayResult = spawnSync("epi", ["gate", "status", "--json"], { encoding: "utf8", timeout: 5000 });
      const running = gatewayResult.status === 0;
      const primitives = listPrimitives();

      const content = [
        `**s_3_gateway_running:** ${running}`,
        `**s_3_gateway_port:** 18794`,
        `**s_2_primitives:** ${primitives.join(", ")}`,
      ].join("\n");

      return {
        coordinate: "S2/S3",
        cost: "warm",
        content,
        charEstimate: content.length,
      };
    },

    ledgerChannel(): LedgerChannel {
      return {
        coordinate: "S2/S3",
        ledgerDir: "s2",
        async extract(ctx: SessionContext): Promise<string | null> {
          const r = spawnSync("epi", ["gate", "sessions", "list", "--json"], { encoding: "utf8", timeout: 5000 });
          if (r.status !== 0) return null;
          return `### [[S3]] Gateway — ${ctx.dayId}\n${r.stdout.trim().slice(0, 500)}`;
        },
      };
    },

    compilerPass(): CompilerPass {
      return {
        coordinate: "S2/S3",
        schedule: "cold",
        async compile() {},
        async readCompiled(): Promise<string> { return ""; },
      };
    },

    queryHandler(): SpineQuery {
      return {
        coordinate: "S2/S3",
        async query(): Promise<string> {
          const r = spawnSync("epi", ["gate", "status", "--json"], { encoding: "utf8", timeout: 5000 });
          return r.stdout || "(gateway status unavailable)";
        },
      };
    },
  };
}
