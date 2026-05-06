// spine/compositor.ts

import type { SpineContribution, SessionContext, InjectionSlot } from "./types.ts";
import { mkdirSync, appendFileSync } from "node:fs";
import { join } from "node:path";

const INJECT_CHAR_BUDGET = 18_000; // leave headroom under vendor's 20k

export class SpineCompositor {
  private contributions: SpineContribution[] = [];

  register(contribution: SpineContribution) {
    this.contributions.push(contribution);
  }

  /** Seam 1: session_start — assemble injection package */
  async assembleInjection(): Promise<string> {
    const slots: InjectionSlot[] = [];
    for (const c of this.contributions) {
      try {
        slots.push(await c.injectionSlot());
      } catch (e) {
        console.warn(`[spine] injection slot failed for ${c.coordinate}: ${e}`);
      }
    }

    // Sort: hot first, warm second, cold excluded
    const hot = slots.filter(s => s.cost === "hot");
    const warm = slots.filter(s => s.cost === "warm");
    const ordered = [...hot, ...warm];

    // Budget enforcement
    let used = 0;
    const included: InjectionSlot[] = [];
    for (const slot of ordered) {
      if (used + slot.charEstimate > INJECT_CHAR_BUDGET) break;
      included.push(slot);
      used += slot.charEstimate;
    }

    return included
      .map(s => `### [[${s.coordinate}]]\n\n${s.content}`)
      .join("\n\n---\n\n");
  }

  /** Seam 2: session_shutdown — extract to ledger */
  async extractToLedger(ctx: SessionContext): Promise<void> {
    for (const c of this.contributions) {
      const channel = c.ledgerChannel();
      try {
        const entry = await channel.extract(ctx);
        if (entry) {
          appendToLedger(channel.ledgerDir, ctx.dayId, entry);
        }
      } catch (e) {
        console.warn(`[spine] ledger extract failed for ${c.coordinate}: ${e}`);
      }
    }
  }

  /** Seam 3: get warm/hot compiler passes for scheduling */
  getCompilerPasses() {
    return this.contributions
      .map(c => {
        try {
          return c.compilerPass();
        } catch (e) {
          console.warn(`[spine] compiler pass failed for ${c.coordinate}: ${e}`);
          return null;
        }
      })
      .filter((pass): pass is NonNullable<typeof pass> => pass !== null);
  }

  /** Seam 4: unified query — dispatches to coordinate-matching handler */
  async query(question: string, coordinateFilter?: string): Promise<string> {
    const filtered = this.contributions
      .filter(c => !coordinateFilter || c.coordinate.startsWith(coordinateFilter));
    const handlers = filtered.map(c => c.queryHandler().query(question, coordinateFilter));
    const results = await Promise.allSettled(handlers);
    return results
      .filter(r => r.status === "fulfilled")
      .map((r, i) => {
        const coord = filtered[i]?.coordinate ?? "?";
        return `[${coord}] ${(r as PromiseFulfilledResult<string>).value}`;
      })
      .join("\n\n");
  }
}

function appendToLedger(ledgerDir: string, dayId: string, entry: string): void {
  const vaultRoot = process.env.EPILOGOS_PROJECT_ROOT ?? process.cwd();
  const dir = join(vaultRoot, "epi-dev-vault", "ledger", ledgerDir);
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${dayId}.md`);
  appendFileSync(file, `\n\n${entry}`, "utf8");
}

export const compositor = new SpineCompositor();
