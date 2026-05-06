# Anima VAK Gate + Skill Injection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the three broken integration points that cause Anima to bypass all VAK gates and dispatch subagents with empty skill contexts.

**Architecture:** Three targeted code changes across two files. No new files. No new abstractions. Fix the active-tools lock, inject VAK skills into the main session, inject entitled skills into each subagent prompt.

**Tech Stack:** TypeScript, Pi coding agent extension API (`@mariozechner/pi-coding-agent`), Node.js ESM

---

## Root Cause Summary (for context)

**Bug 1 — VAK tools locked out of the main Anima session (`agent-team.ts:696`)**
```typescript
pi.setActiveTools(["dispatch_agent"]);  // ← blocks vak_evaluate and anima_orchestrate
```
The system prompt tells Anima "call vak_evaluate first, then anima_orchestrate, then dispatch_agent" but only `dispatch_agent` is in the active tools set. The model sees the instruction, cannot execute it, and confabulates dispatch decisions in prose.

**Bug 2 — Subagent skill content never injected (`agent-team.ts` ~line 372)**
Each ANIMA.md declares `skills: vak-coordinate-frame,vak-evaluate,...` in frontmatter. That field is parsed into `AgentDef.skills` but the comment says "informational" and it is never read again. Subagents spawn with their ANIMA.md body as system prompt and zero skill content — so Nous hallucinates what the VAK framework is instead of following it.

**Bug 3 — Main session only gets one of three VAK skills (`extension.ts:342-355`)**
`before_agent_start` injects `anima-orchestration` but not `vak-coordinate-frame` or `vak-evaluate`. Anima has the dispatch table but not the evaluation protocol it must run before dispatching.

---

## Files Modified

- **Modify:** `.pi/extensions/ta-onta/anima/S4/agent-team.ts`
  - Fix `pi.setActiveTools` call (~line 696)
  - Add skill-loading block inside `dispatchAgent()` (~line 372)
  - Add `fileURLToPath` import at top

- **Modify:** `.pi/extensions/ta-onta/anima/extension.ts`
  - Expand `before_agent_start` to inject all three core VAK skills (~line 342)

---

## Task 1: Fix the Active Tools Lock

**Files:**
- Modify: `.pi/extensions/ta-onta/anima/S4/agent-team.ts:696`

- [ ] **Step 1: Locate the lock line**

Open `agent-team.ts`. Find `pi.setActiveTools` inside the `session_start` handler (~line 696). It currently reads:
```typescript
pi.setActiveTools(["dispatch_agent"]);
```

- [ ] **Step 2: Replace with the full VAK tool set**

```typescript
pi.setActiveTools([
  "vak_evaluate",
  "anima_orchestrate",
  "nous_disclose",
  "dispatch_agent",
  "dispatch_parallel_agents",
  "dispatch_fusion_agents",
]);
```

These are the exact tool names registered in `extension.ts` via `api.registerTool({ name: "..." })`. Adding them to the active set gives Anima access to the full VAK gate before any dispatch.

- [ ] **Step 3: Verify the tools are registered before setActiveTools runs**

`extension.ts` calls `registerAgentTeam(api)` which runs `export default function(pi)` in `agent-team.ts`. The `session_start` hook fires after all `registerTool` calls. The tools registered in `extension.ts` (vak_evaluate etc.) are all registered before session_start fires. No ordering issue.

- [ ] **Step 4: Start pi session and confirm vak_evaluate appears in the tool list**

Start the anima session. In Pi, check that `vak_evaluate`, `anima_orchestrate`, and `dispatch_agent` all appear as callable tools (the model should attempt to call vak_evaluate before dispatching on the next task).

---

## Task 2: Add Skill Content Injection to Subagents

**Files:**
- Modify: `.pi/extensions/ta-onta/anima/S4/agent-team.ts` (imports + `dispatchAgent` function)

- [ ] **Step 1: Add `fileURLToPath` to the imports**

At the top of `agent-team.ts`, the existing imports include:
```typescript
import { readdirSync, readFileSync, existsSync, mkdirSync, unlinkSync } from "fs";
import { join, resolve } from "path";
```

Add:
```typescript
import { fileURLToPath } from "node:url";
```

- [ ] **Step 2: Locate the `fullSystemPrompt` build block in `dispatchAgent()`**

Find (~line 366-374):
```typescript
const fullSystemPrompt = sessionCtxLines.length > 0
  ? `${state.def.systemPrompt}\n\n---\n\n## Current Session\n${sessionCtxLines.join("\n")}\n\nAll vault writes must use the now_path above as the session anchor. Reference [[NOW-${process.env.EPI_SESSION_ID}]] in any artifact you create.`
  : state.def.systemPrompt;
```

- [ ] **Step 3: Add the skill-loading block immediately after `fullSystemPrompt` is defined**

Insert this block after line 374 (after the `fullSystemPrompt` const, before the `args` array):

```typescript
// ── Skill injection ──────────────────────────────────────────────────────────
// Load the content of each skill listed in the agent's `skills:` frontmatter
// field and append it to the system prompt. Skills are looked up in two dirs:
//   1. S4'/skills/   — VAK-specific skills (vak-evaluate, anima-orchestration, …)
//   2. plugins/pleroma/skills/  — shared pleroma skills (web-research, tdd, …)
const skillNames = state.def.skills.split(",").map((s: string) => s.trim()).filter(Boolean);
if (skillNames.length > 0) {
  const animaSkillsDir = fileURLToPath(new URL("../S4'/skills", import.meta.url));
  const pleromaSkillsDir = join((ctx as any).cwd || process.cwd(), "plugins", "pleroma", "skills");
  const skillBlocks: string[] = [];
  for (const skillName of skillNames) {
    for (const base of [animaSkillsDir, pleromaSkillsDir]) {
      const skillPath = join(base, skillName, "SKILL.md");
      if (existsSync(skillPath)) {
        const raw = readFileSync(skillPath, "utf-8");
        const body = raw.replace(/^---[\s\S]*?---\n/, "").trim();
        skillBlocks.push(`## Skill: ${skillName}\n\n${body}`);
        break; // found it — don't search further
      }
    }
  }
  if (skillBlocks.length > 0) {
    fullSystemPrompt += `\n\n---\n\n## Your Entitled Skills\n\nThese skills define your operational methodology. Follow them exactly.\n\n${skillBlocks.join("\n\n---\n\n")}`;
  }
}
```

- [ ] **Step 4: Verify path resolution manually**

`agent-team.ts` lives at:
`.pi/extensions/ta-onta/anima/S4/agent-team.ts`

`new URL("../S4'/skills", import.meta.url)` resolves to:
`.pi/extensions/ta-onta/anima/S4'/skills`

Check the apostrophe: `S4'` — Node.js `fileURLToPath` handles the apostrophe correctly in file:// URLs. Confirm with:
```typescript
console.log(fileURLToPath(new URL("../S4'/skills", import.meta.url)));
// should print: .../ta-onta/anima/S4'/skills
```
(Remove after verification.)

- [ ] **Step 5: Check an agent frontmatter has skills declared**

Read `.pi/extensions/ta-onta/anima/S4'/agents/nous.md`. Confirm it has a `skills:` frontmatter line like:
```yaml
skills: vak-coordinate-frame,vak-evaluate
```

If the field is missing for any agent, add it before testing. The skill injection block silently no-ops if `skills` is empty.

- [ ] **Step 6: Dispatch a test agent and confirm skill content appears**

Run a test dispatch where nous is the target. Add a temporary log line before the `args` array construction:
```typescript
console.error("[skill-inject]", state.def.name, "→", skillBlocks.map(b => b.slice(0, 60)));
```
Confirm vous sees its entitled skill blocks in stderr. Remove the log after confirming.

---

## Task 3: Expand Main Session VAK Skill Injection

**Files:**
- Modify: `.pi/extensions/ta-onta/anima/extension.ts` (the `before_agent_start` hook)

- [ ] **Step 1: Locate the existing before_agent_start hook**

In `extension.ts`, find the hook (~line 342-355):
```typescript
api.on("before_agent_start", async () => {
  setCSState(undefined, { value: "CS0", directionality: "day", cpPosition: "4.0" });

  const skillPath = new URL("./S4'/skills/anima-orchestration/SKILL.md", import.meta.url).pathname;
  if (!existsSync(skillPath)) return {};
  const skillRaw = readFileSync(skillPath, "utf-8");
  const skillBody = skillRaw.replace(/^---[\s\S]*?---\n/, "").trim();
  return {
    systemPrompt: `\n\n---\n\n## Operative Dispatch Procedure\n\nThe following is your routing logic. Every CF code assignment in step 2 of the VAK workflow maps directly to an agent and dispatch method via this table. Follow it precisely.\n\n${skillBody}`,
  };
});
```

- [ ] **Step 2: Replace with multi-skill injection**

The main Anima session needs all three VAK skills: the coordinate reference (`vak-coordinate-frame`), the evaluation protocol (`vak-evaluate`), and the dispatch table (`anima-orchestration`). Replace the whole hook with:

```typescript
api.on("before_agent_start", async () => {
  setCSState(undefined, { value: "CS0", directionality: "day", cpPosition: "4.0" });

  // Inject the full VAK skill stack so Anima has the evaluation protocol,
  // the coordinate reference, and the dispatch table in context at session start.
  const VAK_SKILLS = ["vak-coordinate-frame", "vak-evaluate", "anima-orchestration"];
  const skillBlocks: string[] = [];
  for (const name of VAK_SKILLS) {
    const skillPath = new URL(`./S4'/skills/${name}/SKILL.md`, import.meta.url).pathname;
    if (!existsSync(skillPath)) continue;
    const raw = readFileSync(skillPath, "utf-8");
    const body = raw.replace(/^---[\s\S]*?---\n/, "").trim();
    skillBlocks.push(`## ${name}\n\n${body}`);
  }
  if (skillBlocks.length === 0) return {};
  return {
    systemPrompt: `\n\n---\n\n## VAK Operative Skills\n\nThese three skills govern your evaluation and dispatch protocol. Follow them in sequence for every non-trivial task.\n\n${skillBlocks.join("\n\n---\n\n")}`,
  };
});
```

- [ ] **Step 3: Verify template literal URL works with apostrophe**

`extension.ts` already uses `new URL("./S4'/skills/anima-orchestration/SKILL.md", import.meta.url).pathname` and it works. The template literal version `` `./S4'/skills/${name}/SKILL.md` `` is equivalent. The apostrophe is a literal character in the URL path, not a percent-encoded special character, so interpolation is safe.

- [ ] **Step 4: Restart pi and confirm the three skills appear in the injected context**

After restarting the anima session, trigger any task. The system prompt should now contain sections headed `## vak-coordinate-frame`, `## vak-evaluate`, and `## anima-orchestration`. Confirm Anima calls `vak_evaluate` as its first tool call before any dispatch.

---

## Task 4: Verify End-to-End Gate Behaviour

- [ ] **Step 1: Invoke `/skill web-research` with no further input**

Expected flow:
1. Anima calls `vak_evaluate("web-research skill invoked with no args — intent unclear")`
2. vak_evaluate returns `CPF: (00/00)` (ambiguous, no task specified)
3. Anima sees CPF=(00/00) and stops — does NOT dispatch
4. Anima asks the user for intent

If Anima immediately dispatches Psyche or Nous without calling `vak_evaluate`, Bug 1 is still present.

- [ ] **Step 2: Give a clear task**

Say "research the Pleroma concept in Gnostic philosophy". Expected flow:
1. Anima calls `vak_evaluate("research the Pleroma concept...")`
2. vak_evaluate returns something like `CPF:(4.0/1-4.4/5) CT:CT1 CP:4.1 CF:(0/1)->Logos CFP:CFP0 CS:CS2/Day`
3. Anima calls `anima_orchestrate(cf_code="(0/1)", task="research Pleroma...")`
4. anima_orchestrate returns `agent: logos`
5. Anima calls `dispatch_agent(agent="logos", task="...")`
6. Logos runs with `vak-coordinate-frame`, `writing-plans`, `brainstorming` in its prompt (from its `skills:` frontmatter)

- [ ] **Step 3: Check Nous prompt when dispatched as the epistemic clearing agent**

Dispatch something that triggers `CF:(0000)` → Nous. Open the spawned pi process output. Confirm:
- Nous system prompt contains `## Skill: vak-coordinate-frame` and `## Skill: vak-evaluate`
- Nous does NOT invent an explanation of the system
- Nous asks P0'/P1' questions: "What assumptions? What evidence? What don't we know?"

---

## Self-Review

**Spec coverage:**
- Bug 1 (setActiveTools) → Task 1 ✓
- Bug 2 (skill injection to subagents) → Task 2 ✓
- Bug 3 (only anima-orchestration injected to main session) → Task 3 ✓
- End-to-end verification → Task 4 ✓

**Placeholder scan:** None. All code blocks are complete and runnable.

**Type consistency:**
- `state.def.skills` is `string` (from `AgentDef.skills: string`) — `.split(",")` is safe
- `ctx as any` is the existing pattern in `dispatchAgent()` — consistent
- `fileURLToPath`, `join`, `existsSync`, `readFileSync` all already imported or added in Task 2 Step 1
