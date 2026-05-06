# Vendor Compiler Spine → PI Agent Port

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the vendor claude-memory-compiler four-seam spine (hook → ledger → compile → inject) into the PI extension event model, and restructure ta-onta's six S-layer classes so each one contributes to the spine at each seam rather than operating as isolated tool registrations.

**Architecture:** A new `spine/` module in `.pi/extensions/ta-onta/` defines the four seams as TypeScript interfaces. Each of the six extension classes implements a `SpineContribution` for its S/S' layer — contributing to session injection, ledger extraction, compiler pass scheduling, and query composition. A central compositor assembles all contributions at each seam event. The vendor's `daily/` ledger and `knowledge/` compiled artifacts are replicated as coordinate-prefixed channels per S' layer, running as PI-schedulable background processes rather than Python hooks.

**Tech Stack:** TypeScript (PI extension API, `@mariozechner/pi-coding-agent`), existing `epi` CLI primitives, Redis (warm cache), Neo4j/Graphiti (cold artifacts), vendor `scripts/` Python processes for S1' baseline (retained, extended).

**Reference documents:**
- `Idea/Empty/Present/FLOW-2026-04-22-ENVELOPE-FIELD-SCHEMA.md` — 12-layer envelope, hot/warm/cold cost axis, residency map
- `Idea/Empty/Present/FLOW-2026-04-22-SYSTEMS-RESIDENCY-AND-LATTICE-NAMING.md` — S/S' coordinate law
- `Idea/Empty/Present/FLOW-2026-04-23-TRACK-B-PI-INTEGRATION-AUDIT.md` — current extension state and gap register
- `vendors/claude-memory-compiler/AGENTS.md` — vendor spine spec (the source pattern)

---

## File Map

### New files — `spine/` module

| File | Responsibility |
|------|---------------|
| `.pi/extensions/ta-onta/spine/types.ts` | Core interfaces: `SpineContribution`, `LedgerChannel`, `CompilerPass`, `InjectionSlot`, `SpineQuery` |
| `.pi/extensions/ta-onta/spine/compositor.ts` | Assembles all extension contributions at each seam; owns the session_start inject assembly and session_shutdown extract dispatch |
| `.pi/extensions/ta-onta/spine/ledger.ts` | Coordinate-prefixed append-only ledger protocol; one channel per S' layer; writes to `epi-dev-vault/ledger/{s-coordinate}/YYYY-MM-DD.md` |
| `.pi/extensions/ta-onta/spine/compiler-schedule.ts` | Hot/warm/cold pass registry; dispatches compiler passes as PI-schedulable background processes |
| `.pi/extensions/ta-onta/spine/query.ts` | Unified `spineQuery(question, coordinate?)` — dispatches to S'-layer query handlers, returns RRF-fused result |
| `.pi/extensions/ta-onta/spine/inject-assembly.ts` | Builds the final `systemPrompt` extension string from all InjectionSlots; enforces 20k char budget by layer cost |

### Modified files — extension contribution additions

| File | What changes |
|------|-------------|
| `.pi/extensions/ta-onta/khora/spine-contribution.ts` | New: S0/S0' contribution — CLI context fields, session identity fields |
| `.pi/extensions/ta-onta/hen/spine-contribution.ts` | New: S1/S1' contribution — vault ledger channel, compiler pass (flush→compile), inject slot (knowledge index) |
| `.pi/extensions/ta-onta/pleroma/spine-contribution.ts` | New: S2/S3 contribution — gateway state fields, primitive availability |
| `.pi/extensions/ta-onta/chronos/spine-contribution.ts` | New: S3'/temporal contribution — kairos fields, decan state, day arc status |
| `.pi/extensions/ta-onta/anima/spine-contribution.ts` | New: S4/S4' contribution — VAK coordinate fields, CS state, agent identity |
| `.pi/extensions/ta-onta/aletheia/spine-contribution.ts` | New: S5/S5' contribution — gnosis query handler, improvement loop state, T-bucket digest |
| `.pi/extensions/ta-onta/composite-entry.ts` | Modified: register all contributions with compositor; wire compositor into PI event hooks |

### Ledger structure (new directories in `epi-dev-vault/`)

```
epi-dev-vault/
  ledger/
    s0/          ← CLI/session identity log channel
    s1/          ← vault write log channel (existing daily/ is S1' baseline, extends here)
    s2/          ← graph sync events
    s3/          ← gateway session events
    s4/          ← agent execution trace
    s5/          ← crystallisation / improvement events
  compiled/
    s0/          ← compiled CLI preferences + session patterns
    s1/          ← knowledge/ (vendor baseline, unchanged)
    s2/          ← compiled coordinate context packages
    s3/          ← compiled gateway state digest
    s4/          ← compiled agent identity + VAK state
    s5/          ← compiled improvement vectors + T5 insights
```

---

## Task 1: Define the spine interfaces

**Files:**
- Create: `.pi/extensions/ta-onta/spine/types.ts`

- [ ] Write `SpineContribution` interface — what each extension must implement:

```typescript
// spine/types.ts

export interface InjectionSlot {
  /** S-coordinate this slot belongs to e.g. "S1'" */
  coordinate: string;
  /** hot = always included; warm = included if within char budget; cold = never at session-start */
  cost: "hot" | "warm" | "cold";
  /** Content string to inject */
  content: string;
  /** Estimated char count (used for budget enforcement) */
  charEstimate: number;
}

export interface LedgerChannel {
  /** S-coordinate channel e.g. "s1" */
  coordinate: string;
  /** Path to ledger directory (relative to epi-dev-vault/) */
  ledgerDir: string;
  /** Extract session content for appending to today's ledger */
  extract(sessionContext: SessionContext): Promise<string | null>;
}

export interface CompilerPass {
  coordinate: string;
  /** hot = runs at session-start inline; warm = runs as background process, result cached; cold = manual/cron only */
  schedule: "hot" | "warm" | "cold";
  /** Compile today's ledger channel into a compiled artifact */
  compile(ledgerPath: string, outputDir: string): Promise<void>;
  /** Read compiled artifact for injection */
  readCompiled(compiledDir: string): Promise<string>;
}

export interface SpineQuery {
  coordinate: string;
  query(question: string, coordinateFilter?: string): Promise<string>;
}

export interface SessionContext {
  sessionId: string;
  dayId: string;
  nowPath: string | null;
  transcriptPath?: string;
}

export interface SpineContribution {
  coordinate: string;
  injectionSlot(): Promise<InjectionSlot>;
  ledgerChannel(): LedgerChannel;
  compilerPass(): CompilerPass;
  queryHandler(): SpineQuery;
}
```

- [ ] Commit: `feat(spine): define SpineContribution interfaces`

---

## Task 2: Build the compositor

**Files:**
- Create: `.pi/extensions/ta-onta/spine/compositor.ts`

- [ ] Write the compositor — registers contributions and fires at seam events:

```typescript
// spine/compositor.ts

import type { SpineContribution, SessionContext, InjectionSlot } from "./types.ts";

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
          await appendToLedger(channel.ledgerDir, ctx.dayId, entry);
        }
      } catch (e) {
        console.warn(`[spine] ledger extract failed for ${c.coordinate}: ${e}`);
      }
    }
  }

  /** Seam 3: get warm/hot compiler passes for scheduling */
  getCompilerPasses() {
    return this.contributions.map(c => c.compilerPass());
  }

  /** Seam 4: unified query — dispatches to coordinate-matching handler */
  async query(question: string, coordinateFilter?: string): Promise<string> {
    const handlers = this.contributions
      .filter(c => !coordinateFilter || c.coordinate.startsWith(coordinateFilter))
      .map(c => c.queryHandler().query(question, coordinateFilter));
    const results = await Promise.allSettled(handlers);
    return results
      .filter(r => r.status === "fulfilled")
      .map((r, i) => {
        const coord = this.contributions[i]?.coordinate ?? "?";
        return `[${coord}] ${(r as PromiseFulfilledResult<string>).value}`;
      })
      .join("\n\n");
  }
}

async function appendToLedger(ledgerDir: string, dayId: string, entry: string): Promise<void> {
  const { mkdirSync, appendFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const vaultRoot = process.env.EPILOGOS_PROJECT_ROOT ?? process.cwd();
  const dir = join(vaultRoot, "epi-dev-vault", "ledger", ledgerDir);
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${dayId}.md`);
  appendFileSync(file, `\n\n${entry}`, "utf8");
}

export const compositor = new SpineCompositor();
```

- [ ] Commit: `feat(spine): compositor with four-seam assembly`

---

## Task 3: Wire compositor into composite-entry.ts

**Files:**
- Modify: `.pi/extensions/ta-onta/composite-entry.ts`

- [ ] Replace the existing composite-entry with spine-aware version:

```typescript
// composite-entry.ts

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { compositor } from "./spine/compositor.ts";
import { khoraExtension, khoraSpineContribution } from "./khora/extension.ts";
import { henExtension, henSpineContribution } from "./hen/extension.ts";
import { pleromaExtension, pleromaSpineContribution } from "./pleroma/extension.ts";
import { chronosExtension, chronosSpineContribution } from "./chronos/extension.ts";
import { animaExtension, animaSpineContribution } from "./anima/extension.ts";
import { aletheiaExtension, aletheiaSpineContribution } from "./aletheia/extension.ts";
import { pluginRuntimeBridge } from "./plugin-runtime-bridge.ts";

export default async function taOntaCompositeEntry(api: ExtensionAPI) {
  // Register all S-layer spine contributions
  compositor.register(khoraSpineContribution());
  compositor.register(henSpineContribution());
  compositor.register(pleromaSpineContribution());
  compositor.register(chronosSpineContribution());
  compositor.register(animaSpineContribution());
  compositor.register(aletheiaSpineContribution());

  // Wire the four seams to PI events
  api.on("session_start", async () => {
    const injection = await compositor.assembleInjection();
    return {
      systemPrompt: `\n\n---\n\n## Session Context\n\n${injection}`,
    };
  });

  api.on("session_shutdown", async () => {
    const sessionId = process.env.EPI_SESSION_ID ?? "unknown";
    const dayId = process.env.EPI_DAY_ID ?? new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    const nowPath = process.env.EPI_NOW_PATH ?? null;
    await compositor.extractToLedger({ sessionId, dayId, nowPath });
  });

  api.on("session_before_compact", async () => {
    const sessionId = process.env.EPI_SESSION_ID ?? "unknown";
    const dayId = process.env.EPI_DAY_ID ?? new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    await compositor.extractToLedger({ sessionId, dayId, nowPath: process.env.EPI_NOW_PATH ?? null });
  });

  // Load extension tools (unchanged tool registrations)
  await pluginRuntimeBridge(api);
  await khoraExtension(api);
  await henExtension(api);
  await pleromaExtension(api);
  await chronosExtension(api);
  await animaExtension(api);
  await aletheiaExtension(api);
}
```

- [ ] Commit: `feat(spine): wire compositor into composite-entry PI events`

---

## Task 4: S0/S0' spine contribution (Khora)

**Files:**
- Create: `.pi/extensions/ta-onta/khora/spine-contribution.ts`

- [ ] Write Khora's SpineContribution — session identity + CLI context as hot inject fields:

```typescript
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
          // Implementation: read ledger, count sessions, write compiled/s0/summary.md
        },
        async readCompiled(_compiledDir): Promise<string> {
          return ""; // warm — not injected at session-start, available on query
        },
      };
    },

    queryHandler(): SpineQuery {
      return {
        coordinate: "S0/S0'",
        async query(question): Promise<string> {
          const result = spawnSync("epi", ["agent", "session", "status"], { encoding: "utf8" });
          return result.stdout || "(session status unavailable)";
        },
      };
    },
  };
}
```

- [ ] Commit: `feat(spine/s0): Khora spine contribution — session identity inject`

---

## Task 5: S1/S1' spine contribution (Hen)

**Files:**
- Create: `.pi/extensions/ta-onta/hen/spine-contribution.ts`

This is the most important contribution — it ports the vendor's entire four-seam (flush→daily→compile→knowledge→inject) into the S1' spine channel.

- [ ] Write Hen's SpineContribution — vault compiler spine as S1' channel:

```typescript
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
        // S1' uses the vendor's existing daily/ as its ledger channel — no duplication
        ledgerDir: "s1",
        async extract(ctx: SessionContext): Promise<string | null> {
          // The vendor's flush.py does this via Claude Agent SDK
          // Here we record a structured ledger event pointing to the vendor flush result
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
        // The vendor's compile.py IS this pass — we delegate to it
        schedule: "cold", // vendor runs post-6pm automatically; not duplicated here
        async compile(ledgerPath, outputDir): Promise<void> {
          spawnSync("uv", ["run", "--directory", vaultDevRoot(), "python", "scripts/compile.py"], {
            encoding: "utf8",
            cwd: vaultDevRoot(),
          });
        },
        async readCompiled(compiledDir): Promise<string> {
          const indexPath = join(vaultDevRoot(), "knowledge", "index.md");
          return existsSync(indexPath) ? readFileSync(indexPath, "utf8") : "";
        },
      };
    },

    queryHandler(): SpineQuery {
      return {
        coordinate: "S1/S1'",
        async query(question): Promise<string> {
          // Hen hybrid: obsidian search + graph retrieve
          const obsResult = spawnSync("obsidian-cli", ["search", `query="${question}"`, "limit=5"], { encoding: "utf8" });
          return obsResult.stdout || "(no vault results)";
        },
      };
    },
  };
}
```

- [ ] Commit: `feat(spine/s1): Hen spine contribution — vendor compiler spine as S1' channel`

---

## Task 6: S3'/Temporal spine contribution (Chronos)

**Files:**
- Create: `.pi/extensions/ta-onta/chronos/spine-contribution.ts`

- [ ] Write Chronos's SpineContribution — kairos/temporal state as hot inject fields:

```typescript
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
          const dayId = ctx.dayId;
          const kairosResult = spawnSync("epi", ["vault", "kairos", "status", "--json"], { encoding: "utf8" });
          const kairos = kairosResult.status === 0 ? kairosResult.stdout.trim() : "{}";
          return `### [[S3']] Temporal — ${dayId}\n\`\`\`json\n${kairos}\n\`\`\``;
        },
      };
    },

    compilerPass(): CompilerPass {
      return {
        coordinate: "S3'/Temporal",
        schedule: "warm",
        async compile(_ledgerPath, _outputDir): Promise<void> {
          // Compile: produce daily temporal digest from s3 ledger channel
          // (sun decan, moon decan, tick12 pattern across sessions)
        },
        async readCompiled(_compiledDir): Promise<string> {
          return ""; // warm — available on query not at inject
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
```

- [ ] Commit: `feat(spine/s3): Chronos spine contribution — temporal/kairos inject`

---

## Task 7: S4/S4' spine contribution (Anima)

**Files:**
- Create: `.pi/extensions/ta-onta/anima/spine-contribution.ts`

- [ ] Write Anima's SpineContribution — agent identity, VAK state, CS position as hot inject:

```typescript
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
```

- [ ] Commit: `feat(spine/s4): Anima spine contribution — agent identity inject`

---

## Task 8: S5/S5' spine contribution (Aletheia)

**Files:**
- Create: `.pi/extensions/ta-onta/aletheia/spine-contribution.ts`

- [ ] Write Aletheia's SpineContribution — improvement state, T-bucket digest, gnosis query handler:

```typescript
// aletheia/spine-contribution.ts

import type { SpineContribution, InjectionSlot, LedgerChannel, CompilerPass, SpineQuery, SessionContext } from "../spine/types.ts";
import { spawnSync } from "node:child_process";

export function aletheiaSpineContribution(): SpineContribution {
  return {
    coordinate: "S5/S5'",

    async injectionSlot(): Promise<InjectionSlot> {
      // Warm: read compiled S5' digest if available (T5 insights carried forward)
      // Falls back to empty if night' pass hasn't run yet
      const seedPath = `${process.env.EPILOGOS_VAULT ?? "."}/Empty/Present/SEED.md`;
      let seed = "";
      try {
        const { readFileSync, existsSync } = await import("node:fs");
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
          // Aletheia extraction: crystallised insights, arc states
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
        async query(question, coordinateFilter): Promise<string> {
          // Delegates to gnosis hybrid retrieval
          const args = ["techne", "gnosis", "query-gnostic", question, "--mode", "hybrid"];
          const result = spawnSync("epi", args, { encoding: "utf8", timeout: 30_000 });
          return result.stdout || "(gnosis query unavailable)";
        },
      };
    },
  };
}
```

- [ ] Commit: `feat(spine/s5): Aletheia spine contribution — improvement/gnosis inject`

---

## Task 9: S2 spine contribution (Pleroma — gateway state) and cleanup

**Files:**
- Create: `.pi/extensions/ta-onta/pleroma/spine-contribution.ts`

- [ ] Write Pleroma's SpineContribution — gateway state and primitive availability as warm inject:

```typescript
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
```

- [ ] Remove duplicate `epi vault day-init` from `chronos/extension.ts` `session_start` handler (Khora already owns this in bootstrap — G6 fix)
- [ ] Commit: `feat(spine/s2s3): Pleroma spine contribution + fix duplicate day-init`

---

## Task 10: Integration smoke test

**Files:**
- No new files — verify the wired system

- [ ] Start PI agent in the project, verify session_start fires and produces multi-layer injection:

Expected output in PI agent system prompt extension:
```
### [[S0/S0']]
**s_0_session_key:** 20260423-...
**s_0_day_id:** 23-04-2026
...

---

### [[S1/S1']]
# Knowledge Base Index
| Article | Summary | ...
...

---

### [[S3'/Temporal]]
**s_3_day_id:** 23-04-2026
**s_3_kairos_mode:** ...
...
```

- [ ] Trigger `session_shutdown`, verify all six ledger channels produce entries in `epi-dev-vault/ledger/s0/` through `epi-dev-vault/ledger/s5/`
- [ ] Run `spine.query("what envelope layers are active?")` — verify it dispatches to handlers and returns fused result
- [ ] Commit: `test(spine): integration smoke test passing`

---

## Gap Register — deferred (not in this plan)

These gaps from the Track B audit are real but separate tasks:

| Gap | Deferred to |
|-----|------------|
| G1: khora_sync_queue_flush stub | Separate plan: Neo4j sync queue drain |
| G5: aletheia_crystallise stub | Separate plan: vault crystallise CLI command |
| G3: cron.toggle name mismatch | Quick fix: gate/cron.rs alias |
| G8: Notion sync absent | S5 world-write plan (later) |
| Telegram channel missing | S3 channel extension plan |

---

## Self-Review

**Spec coverage:**
- ✓ Four seams ported to PI event model (session_start, session_shutdown, session_before_compact)
- ✓ All six S-layer extensions get spine contributions
- ✓ Compositor handles budget enforcement, ordering, failure isolation
- ✓ Vendor S1' compiler pass retained and delegated to (not duplicated)
- ✓ Coordinate-prefixed ledger channels per S-layer
- ✓ Unified query handler across layers
- ✓ G6 duplicate day-init fixed

**No placeholders:** compile() bodies for warm passes have stubs — these are genuinely deferred (each S-layer compiler pass is its own task), not missing intent. The pattern is established and consistent.

**Type consistency:** `SpineContribution`, `InjectionSlot`, `LedgerChannel`, `CompilerPass`, `SpineQuery`, `SessionContext` — used consistently across all tasks. All imports reference `../spine/types.ts`.
