// hen/spine-contribution.ts

import type { SpineContribution, InjectionSlot, LedgerChannel, CompilerPass, SpineQuery, SessionContext } from "../spine/types.ts";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function vaultDevRoot(): string {
  return join(process.env.EPILOGOS_PROJECT_ROOT ?? process.cwd(), "epi-dev-vault");
}

export function henSpineContribution(): SpineContribution {
  return {
    coordinate: "S1/S1'",

    async injectionSlot(): Promise<InjectionSlot> {
      // Vendor baseline: knowledge/index.md — unchanged, ported as S1' injection slot
      const indexPath = join(vaultDevRoot(), "knowledge", "index.md");
      const index = existsSync(indexPath)
        ? readFileSync(indexPath, "utf8")
        : "(knowledge base empty — no sessions compiled yet)";

      // Truncate to leave budget for other layers
      const truncated = index.length > 6000 ? index.slice(0, 6000) + "\n...(truncated)" : index;

      return {
        coordinate: "S1/S1'",
        cost: "hot",
        content: truncated,
        charEstimate: truncated.length,
      };
    },

    ledgerChannel(): LedgerChannel {
      return {
        coordinate: "S1/S1'",
        // S1' uses coordinate ledger channel — vendor daily/ handles the actual content flush
        ledgerDir: "s1",
        async extract(ctx: SessionContext): Promise<string | null> {
          return [
            `### [[S1']] Vault Activity — ${ctx.sessionId}`,
            `- day_id: ${ctx.dayId}`,
            `- now_path: ${ctx.nowPath ?? "(none)"}`,
            `- vendor_flush: epi-dev-vault/daily/${ctx.dayId}.md`,
          ].join("\n");
        },
      };
    },

    compilerPass(): CompilerPass {
      return {
        coordinate: "S1/S1'",
        // The vendor's compile.py IS this pass — delegate to it
        schedule: "cold",
        async compile(_ledgerPath, _outputDir): Promise<void> {
          spawnSync("uv", ["run", "--directory", vaultDevRoot(), "python", "scripts/compile.py"], {
            encoding: "utf8",
            cwd: vaultDevRoot(),
          });
        },
        async readCompiled(_compiledDir): Promise<string> {
          const indexPath = join(vaultDevRoot(), "knowledge", "index.md");
          return existsSync(indexPath) ? readFileSync(indexPath, "utf8") : "";
        },
      };
    },

    queryHandler(): SpineQuery {
      return {
        coordinate: "S1/S1'",
        async query(question): Promise<string> {
          const obsResult = spawnSync("obsidian-cli", ["search", `query="${question}"`, "limit=5"], { encoding: "utf8" });
          return obsResult.stdout || "(no vault results)";
        },
      };
    },
  };
}
