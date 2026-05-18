# VAK Musical Execution Z-Thread Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the minimum closed loop where VAK agent execution emits a typed musical performance trace, Aletheia rehears that trace, and S5 Epii can recompose the next goal/improvement vector from what was heard.

**Architecture:** Keep VAK evaluation pure and add musicality as a deterministic projection over real dispatch/runtime events. S4 Anima owns performance event emission and Z-thread phase envelopes; S4/S5' Aletheia owns rehearing/instrumentation; S5 Epii owns recomposition/autoresearch intake. Start with JSONL traces and offline diagnostics before live audio, so the loop is testable without a GUI/audio runtime.

**Tech Stack:** TypeScript Pi extensions using Node 24 `--experimental-strip-types` tests, Python unittest for plugin capability contracts, Rust crates for S5 Epii review/autoresearch, JSONL trace envelopes, Pleroma/Epi-Logos plugin skills.

---

## Preflight Scope And Guardrails

- GitNexus is required by `AGENTS.md` before editing symbols, but current local execution fails with a native architecture mismatch:

```text
Error: dlopen(.../lbugjs.node): mach-o file, but is an incompatible architecture (have 'arm64', need 'x86_64')
```

- Before implementation, rerun the GitNexus step. If it still fails, record the failure in the task log and continue only with local impact mapping plus narrow file ownership.
- The worktree is already dirty across S0/S2/S3/S4/S5 and docs. Do not revert unrelated changes. Touch only the files listed in each task.
- Keep test quality production-facing: tests must exercise actual mapping, persistence, skill manifests, and Rust store behavior. No mocked service success paths.

## Affected Areas

- S4 Anima runtime: `Body/S/S4/ta-onta/S4-4p-anima/extension.ts`, `Body/S/S4/ta-onta/S4-4p-anima/S4/agent-team.ts`, `Body/S/S4/ta-onta/S4-4p-anima/S4/agent-chain.ts`
- S4 Pi team customization: `Body/S/S4/pi-agent/agents/teams.yaml`, `Body/S/S4/pi-agent/agents/agent-chain.yaml`
- S4 Pleroma plugin: `Body/S/S4/plugins/pleroma/capability-matrix.json`, `Body/S/S4/plugins/pleroma/skills/*`, `Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py`
- S4/S5' Aletheia extension: `Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts`, `Body/S/S4/ta-onta/S4-5p-aletheia/modules/*`, `Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/*`
- S5 Epii: `Body/S/S5/epii-autoresearch-core/src/lib.rs`, `Body/S/S5/epii-autoresearch-core/tests/improvement_loop.rs`, `Body/S/S5/plugins/epi-logos/skills/*`
- Kernel docs/specs: `docs/epi-logos-kernel/*`, `docs/specs/S/S4/*`

## Baseline Verification Already Run

```bash
python3 -m unittest Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py
```

Expected/current: `Ran 5 tests ... OK`

```bash
cargo test --manifest-path Body/S/S5/epii-review-core/Cargo.toml
```

Expected/current: `4 passed`

```bash
cargo test --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml
```

Expected/current: `7 passed`

---

### Task 1: GitNexus Health And Impact Snapshot

**Files:**
- Create: `docs/plans/artifacts/2026-05-19-vak-musical-execution-impact.md`

**Step 1: Run GitNexus analyze**

Run:

```bash
npx gitnexus analyze
```

Expected: PASS and index summary.

If it fails with the known `lbugjs.node` architecture mismatch, record that exact failure in the artifact and proceed with local impact mapping only for this planning branch.

**Step 2: Write local impact artifact**

Create `docs/plans/artifacts/2026-05-19-vak-musical-execution-impact.md` with:

```markdown
# VAK Musical Execution Impact Snapshot

## GitNexus

- Status: pass|blocked
- Command: `npx gitnexus analyze`
- Output summary: ...

## Local Impact Map

- S4 Anima event emission: ...
- S4 Aletheia rehearing: ...
- S5 Epii recomposition: ...
- Pleroma/Epi-Logos skills: ...

## Non-Interference

- Existing dirty files not touched: ...
```

**Step 3: Verify artifact exists**

Run:

```bash
test -f docs/plans/artifacts/2026-05-19-vak-musical-execution-impact.md
```

Expected: exit `0`.

**Step 4: Commit**

```bash
git add docs/plans/artifacts/2026-05-19-vak-musical-execution-impact.md
git commit -m "docs: record vak musical execution impact scope"
```

---

### Task 2: Deterministic VAK Musical Projection

**Files:**
- Create: `Body/S/S4/ta-onta/S4-4p-anima/S4/vak-performance.ts`
- Create: `Body/S/S4/ta-onta/S4-4p-anima/S4/vak-performance.test.ts`

**Step 1: Write the failing test**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  cfToPitch,
  cfpToTexture,
  csToContour,
  createVakPerformanceEvent,
} from "./vak-performance.ts";

test("maps CF agents to the Lens 0 diatonic performance row", () => {
  assert.equal(cfToPitch("(00/00)").pitchClass, "C");
  assert.equal(cfToPitch("(0/1)").pitchClass, "D");
  assert.equal(cfToPitch("(0/1/2)").pitchClass, "E");
  assert.equal(cfToPitch("(0/1/2/3)").pitchClass, "F");
  assert.equal(cfToPitch("(4.0/1-4.4/5)").pitchClass, "G");
  assert.equal(cfToPitch("(4.5/0)").pitchClass, "A");
  assert.equal(cfToPitch("(5/0)").pitchClass, "B");
});

test("keeps musical axes distinct instead of flattening CT, CF, and lens", () => {
  const event = createVakPerformanceEvent({
    source: "anima",
    phase: "perform",
    agent: "sophia",
    vak: {
      cpf: "(4.0/1-4.4/5)",
      ct: ["CT5"],
      cp: "4.5",
      cf: "(5/0)",
      cfp: "CFP3",
      cs: "CS5",
      direction: "night_prime",
    },
    task: "Crystallise rehearing",
  });

  assert.equal(event.music.pitch.pitchClass, "B");
  assert.equal(event.music.materialRegister, "CT5");
  assert.equal(event.music.texture, "fusion_cadence");
  assert.equal(event.music.contour, "descending_rehearing");
});

test("maps Z-thread to self-composing form, not silence", () => {
  assert.equal(cfpToTexture("Z"), "self_composing_cycle");
});

test("maps CS direction to phrase contour", () => {
  assert.equal(csToContour("CS0", "day"), "ascending_synthesis");
  assert.equal(csToContour("CS0", "night_prime"), "descending_rehearing");
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
node --experimental-strip-types --test Body/S/S4/ta-onta/S4-4p-anima/S4/vak-performance.test.ts
```

Expected: FAIL with module/function not found.

**Step 3: Write minimal implementation**

```ts
export type CFCode =
  | "(00/00)"
  | "(0/1)"
  | "(0/1/2)"
  | "(0/1/2/3)"
  | "(4.0/1-4.4/5)"
  | "(4.5/0)"
  | "(5/0)";

export type AgentName = "nous" | "logos" | "eros" | "mythos" | "anima" | "psyche" | "sophia";
export type CFP = "CFP0" | "CFP1" | "CFP2" | "CFP3" | "CFP4" | "CFP5" | "Z";
export type CS = "CS0" | "CS1" | "CS2" | "CS3" | "CS4" | "CS5";
export type CSDirection = "day" | "night_prime";
export type ZThreadPhase = "compose" | "perform" | "record" | "rehear" | "recompose";

export interface VakAddress {
  cpf: "(00/00)" | "(4.0/1-4.4/5)";
  ct: string[];
  cp: "4.0" | "4.1" | "4.2" | "4.3" | "4.4" | "4.5";
  cf: CFCode;
  cfp: CFP;
  cs: CS;
  direction: CSDirection;
}

export interface PitchProjection {
  pitchClass: "C" | "D" | "E" | "F" | "G" | "A" | "B";
  justRatio: "1/1" | "9/8" | "81/64" | "4/3" | "3/2" | "27/16" | "243/128";
  role: string;
}

export interface VakPerformanceEvent {
  id: string;
  occurredAt: string;
  source: "anima" | "aletheia" | "epii" | "pi";
  phase: ZThreadPhase;
  agent: AgentName;
  task: string;
  vak: VakAddress;
  music: {
    pitch: PitchProjection;
    texture: ReturnType<typeof cfpToTexture>;
    contour: ReturnType<typeof csToContour>;
    materialRegister: string;
  };
}

const CF_PITCH: Record<CFCode, PitchProjection> = {
  "(00/00)": { pitchClass: "C", justRatio: "1/1", role: "nous_ground" },
  "(0/1)": { pitchClass: "D", justRatio: "9/8", role: "logos_definition" },
  "(0/1/2)": { pitchClass: "E", justRatio: "81/64", role: "eros_operation" },
  "(0/1/2/3)": { pitchClass: "F", justRatio: "4/3", role: "mythos_pattern" },
  "(4.0/1-4.4/5)": { pitchClass: "G", justRatio: "3/2", role: "anima_executive" },
  "(4.5/0)": { pitchClass: "A", justRatio: "27/16", role: "psyche_bridge" },
  "(5/0)": { pitchClass: "B", justRatio: "243/128", role: "sophia_return" },
};

export function cfToPitch(cf: CFCode): PitchProjection {
  return CF_PITCH[cf];
}

export function cfpToTexture(cfp: CFP) {
  const texture = {
    CFP0: "single_voice",
    CFP1: "parallel_chord",
    CFP2: "chained_melody",
    CFP3: "fusion_cadence",
    CFP4: "long_drone",
    CFP5: "nested_canon",
    Z: "self_composing_cycle",
  } as const;
  return texture[cfp];
}

export function csToContour(_cs: CS, direction: CSDirection) {
  return direction === "day" ? "ascending_synthesis" : "descending_rehearing";
}

export function createVakPerformanceEvent(input: Omit<VakPerformanceEvent, "id" | "occurredAt" | "music">): VakPerformanceEvent {
  return {
    ...input,
    id: `${Date.now()}-${input.source}-${input.agent}`,
    occurredAt: new Date().toISOString(),
    music: {
      pitch: cfToPitch(input.vak.cf),
      texture: cfpToTexture(input.vak.cfp),
      contour: csToContour(input.vak.cs, input.vak.direction),
      materialRegister: input.vak.ct[0] ?? "CT0",
    },
  };
}
```

**Step 4: Run test to verify it passes**

```bash
node --experimental-strip-types --test Body/S/S4/ta-onta/S4-4p-anima/S4/vak-performance.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add Body/S/S4/ta-onta/S4-4p-anima/S4/vak-performance.ts Body/S/S4/ta-onta/S4-4p-anima/S4/vak-performance.test.ts
git commit -m "feat: add vak musical performance projection"
```

---

### Task 3: JSONL Performance Recorder

**Files:**
- Create: `Body/S/S4/ta-onta/S4-4p-anima/S4/vak-performance-recorder.ts`
- Create: `Body/S/S4/ta-onta/S4-4p-anima/S4/vak-performance-recorder.test.ts`

**Step 1: Write the failing test**

```ts
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createVakPerformanceEvent } from "./vak-performance.ts";
import { appendVakPerformanceEvent, readVakPerformanceTrace } from "./vak-performance-recorder.ts";

test("persists real VAK performance events as JSONL", () => {
  const root = mkdtempSync(join(tmpdir(), "vak-performance-"));
  try {
    const tracePath = join(root, "events.jsonl");
    const event = createVakPerformanceEvent({
      source: "anima",
      phase: "perform",
      agent: "logos",
      task: "Define score envelope",
      vak: {
        cpf: "(4.0/1-4.4/5)",
        ct: ["CT1"],
        cp: "4.1",
        cf: "(0/1)",
        cfp: "CFP2",
        cs: "CS1",
        direction: "day",
      },
    });

    appendVakPerformanceEvent(tracePath, event);

    assert.match(readFileSync(tracePath, "utf8"), /"pitchClass":"D"/);
    assert.equal(readVakPerformanceTrace(tracePath)[0].music.texture, "chained_melody");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
```

**Step 2: Run test to verify it fails**

```bash
node --experimental-strip-types --test Body/S/S4/ta-onta/S4-4p-anima/S4/vak-performance-recorder.test.ts
```

Expected: FAIL with missing module.

**Step 3: Write minimal implementation**

```ts
import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import type { VakPerformanceEvent } from "./vak-performance.ts";

export function appendVakPerformanceEvent(tracePath: string, event: VakPerformanceEvent) {
  mkdirSync(dirname(tracePath), { recursive: true });
  appendFileSync(tracePath, `${JSON.stringify(event)}\n`, "utf8");
}

export function readVakPerformanceTrace(tracePath: string): VakPerformanceEvent[] {
  const raw = readFileSync(tracePath, "utf8").trim();
  if (!raw) return [];
  return raw.split("\n").map((line) => JSON.parse(line) as VakPerformanceEvent);
}

export function defaultVakPerformanceTracePath(cwd = process.cwd()) {
  return `${cwd}/.pi/vak-performance/events.jsonl`;
}
```

**Step 4: Run test**

```bash
node --experimental-strip-types --test Body/S/S4/ta-onta/S4-4p-anima/S4/vak-performance-recorder.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add Body/S/S4/ta-onta/S4-4p-anima/S4/vak-performance-recorder.ts Body/S/S4/ta-onta/S4-4p-anima/S4/vak-performance-recorder.test.ts
git commit -m "feat: persist vak musical performance traces"
```

---

### Task 4: Instrument Anima Dispatch Without Changing Routing Semantics

**Files:**
- Modify: `Body/S/S4/ta-onta/S4-4p-anima/extension.ts`
- Modify: `Body/S/S4/ta-onta/S4-4p-anima/S4/agent-team.ts`
- Test: `Body/S/S4/ta-onta/S4-4p-anima/S4/vak-performance-recorder.test.ts`

**Step 1: Add a dispatch recording test**

Extend `vak-performance-recorder.test.ts`:

```ts
import { eventFromDispatch } from "./vak-performance-recorder.ts";

test("builds a performance event from dispatch metadata", () => {
  const event = eventFromDispatch({
    agent: "anima",
    task: "Coordinate parallel execution",
    cf: "(4.0/1-4.4/5)",
    cfp: "CFP1",
    cs: "CS0",
    direction: "day",
    ct: ["CT4"],
    cp: "4.4",
  });

  assert.equal(event.music.pitch.pitchClass, "G");
  assert.equal(event.music.texture, "parallel_chord");
});
```

**Step 2: Run test to verify it fails**

```bash
node --experimental-strip-types --test Body/S/S4/ta-onta/S4-4p-anima/S4/vak-performance-recorder.test.ts
```

Expected: FAIL with `eventFromDispatch is not a function`.

**Step 3: Implement dispatch event helper**

Add to `vak-performance-recorder.ts`:

```ts
import { createVakPerformanceEvent, type AgentName, type CFCode, type CFP, type CS, type CSDirection } from "./vak-performance.ts";

export function eventFromDispatch(input: {
  agent: AgentName;
  task: string;
  cf: CFCode;
  cfp: CFP;
  cs: CS;
  direction: CSDirection;
  ct: string[];
  cp: "4.0" | "4.1" | "4.2" | "4.3" | "4.4" | "4.5";
}) {
  return createVakPerformanceEvent({
    source: "anima",
    phase: "perform",
    agent: input.agent,
    task: input.task,
    vak: {
      cpf: input.cf === "(00/00)" ? "(00/00)" : "(4.0/1-4.4/5)",
      ct: input.ct,
      cp: input.cp,
      cf: input.cf,
      cfp: input.cfp,
      cs: input.cs,
      direction: input.direction,
    },
  });
}
```

**Step 4: Wire dispatch call sites**

- In `extension.ts`, import `appendVakPerformanceEvent`, `defaultVakPerformanceTracePath`, and `eventFromDispatch`.
- In `dispatch_parallel_agents`, append one event per task before `dispatchTeamMember`.
- In `dispatch_fusion_agents`, append one event per agent with `cfp: "CFP3"`.
- In `agent-team.ts`, append a `CFP0` event at the start of `dispatchAgent`.

Use conservative fallback metadata when no full VAK address is available:

```ts
const event = eventFromDispatch({
  agent,
  task,
  cf: "(4.0/1-4.4/5)",
  cfp: "CFP0",
  cs: "CS0",
  direction: "day",
  ct: ["CT2"],
  cp: "4.2",
});
appendVakPerformanceEvent(defaultVakPerformanceTracePath(ctx?.cwd ?? process.cwd()), event);
```

**Step 5: Run tests**

```bash
node --experimental-strip-types --test Body/S/S4/ta-onta/S4-4p-anima/S4/vak-performance.test.ts Body/S/S4/ta-onta/S4-4p-anima/S4/vak-performance-recorder.test.ts
```

Expected: PASS.

**Step 6: Commit**

```bash
git add Body/S/S4/ta-onta/S4-4p-anima/extension.ts Body/S/S4/ta-onta/S4-4p-anima/S4/agent-team.ts Body/S/S4/ta-onta/S4-4p-anima/S4/vak-performance-recorder.ts Body/S/S4/ta-onta/S4-4p-anima/S4/vak-performance-recorder.test.ts
git commit -m "feat: record anima dispatch performance events"
```

---

### Task 5: Z-Thread Phase Envelope

**Files:**
- Create: `Body/S/S4/ta-onta/S4-4p-anima/S4/z-thread.ts`
- Create: `Body/S/S4/ta-onta/S4-4p-anima/S4/z-thread.test.ts`

**Step 1: Write the failing test**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { advanceZThread, createZThreadEnvelope } from "./z-thread.ts";

test("Z-thread is a self-composing cycle", () => {
  const envelope = createZThreadEnvelope({
    goalPreludePath: "Idea/Empty/Present/19-05-2026/session/goals/goal-prelude.md",
    tracePath: ".pi/vak-performance/events.jsonl",
    dayId: "19-05-2026",
    sessionKey: "agent:anima:main",
  });

  assert.equal(envelope.phase, "compose");
  assert.equal(advanceZThread(envelope).phase, "perform");
  assert.equal(advanceZThread({ ...envelope, phase: "perform" }).phase, "record");
  assert.equal(advanceZThread({ ...envelope, phase: "record" }).phase, "rehear");
  assert.equal(advanceZThread({ ...envelope, phase: "rehear" }).phase, "recompose");
  assert.equal(advanceZThread({ ...envelope, phase: "recompose" }).phase, "compose");
});
```

**Step 2: Run test to verify it fails**

```bash
node --experimental-strip-types --test Body/S/S4/ta-onta/S4-4p-anima/S4/z-thread.test.ts
```

Expected: FAIL with missing module.

**Step 3: Implement envelope**

```ts
export type ZThreadPhase = "compose" | "perform" | "record" | "rehear" | "recompose";

export interface ZThreadEnvelope {
  phase: ZThreadPhase;
  goalPreludePath: string;
  tracePath: string;
  dayId: string;
  sessionKey: string;
  rehearingEnvelopePath?: string;
  epiiRecomposeRequestPath?: string;
}

const NEXT_PHASE: Record<ZThreadPhase, ZThreadPhase> = {
  compose: "perform",
  perform: "record",
  record: "rehear",
  rehear: "recompose",
  recompose: "compose",
};

export function createZThreadEnvelope(input: Omit<ZThreadEnvelope, "phase">): ZThreadEnvelope {
  return { ...input, phase: "compose" };
}

export function advanceZThread(envelope: ZThreadEnvelope): ZThreadEnvelope {
  return { ...envelope, phase: NEXT_PHASE[envelope.phase] };
}
```

**Step 4: Run test**

```bash
node --experimental-strip-types --test Body/S/S4/ta-onta/S4-4p-anima/S4/z-thread.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add Body/S/S4/ta-onta/S4-4p-anima/S4/z-thread.ts Body/S/S4/ta-onta/S4-4p-anima/S4/z-thread.test.ts
git commit -m "feat: model z-thread self-composing envelope"
```

---

### Task 6: Pi Team And Chain Customization For Musical Execution

**Files:**
- Modify: `Body/S/S4/pi-agent/agents/teams.yaml`
- Modify: `Body/S/S4/pi-agent/agents/agent-chain.yaml`
- Create: `Body/S/S4/pi-agent/tests/test_agent_team_config.py`

**Step 1: Write the failing test**

```python
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class PiAgentTeamConfigTest(unittest.TestCase):
    def test_musical_execution_team_and_chain_are_declared(self):
        teams = (ROOT / "agents" / "teams.yaml").read_text(encoding="utf-8")
        chain = (ROOT / "agents" / "agent-chain.yaml").read_text(encoding="utf-8")

        self.assertIn("musical-execution:", teams)
        for member in ["ext-expert", "skill-expert", "tui-expert", "config-expert"]:
            self.assertIn(f"- {member}", teams)

        self.assertIn("z-thread-instrumentation-review:", chain)
        self.assertIn("Vak performance event surfaces", chain)
        self.assertIn("Aletheia rehearing instruments", chain)


if __name__ == "__main__":
    unittest.main()
```

**Step 2: Run test to verify it fails**

```bash
python3 -m unittest Body/S/S4/pi-agent/tests/test_agent_team_config.py
```

Expected: FAIL because the team and chain are not declared.

**Step 3: Update team config**

Append to `teams.yaml`:

```yaml
musical-execution:
  - ext-expert
  - skill-expert
  - tui-expert
  - config-expert
```

Append to `agent-chain.yaml`:

```yaml
z-thread-instrumentation-review:
  description: "Review VAK musical execution integration across Pi extension, skill, TUI, and config surfaces."
  steps:
    - agent: ext-expert
      prompt: "Review Vak performance event surfaces for extension/runtime safety.\n\n$ORIGINAL"
    - agent: skill-expert
      prompt: "Review Pleroma and Epi-Logos skill propagation for Z-thread musical execution.\n\n$INPUT"
    - agent: tui-expert
      prompt: "Review musical trace UX affordances and avoid overfitting to live audio before JSONL/MIDI is stable.\n\n$INPUT"
    - agent: config-expert
      prompt: "Review team/chain config, capability matrix, and enablement boundaries.\n\n$INPUT"
```

**Step 4: Run test**

```bash
python3 -m unittest Body/S/S4/pi-agent/tests/test_agent_team_config.py
```

Expected: PASS.

**Step 5: Commit**

```bash
git add Body/S/S4/pi-agent/agents/teams.yaml Body/S/S4/pi-agent/agents/agent-chain.yaml Body/S/S4/pi-agent/tests/test_agent_team_config.py
git commit -m "feat: add pi musical execution review team"
```

---

### Task 7: Aletheia Instrumentation Registry

**Files:**
- Create: `Body/S/S4/ta-onta/S4-5p-aletheia/modules/performance-instruments.ts`
- Create: `Body/S/S4/ta-onta/S4-5p-aletheia/modules/performance-instruments.test.ts`
- Modify: `Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/README.md`

**Step 1: Write the failing test**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { aletheiaPerformanceInstruments } from "./performance-instruments.ts";

test("declares every Aletheia subagent as an instrumented rehearing function", () => {
  const names = aletheiaPerformanceInstruments.map((entry) => entry.name).sort();
  assert.deepEqual(names, ["agora", "anansi", "janus", "mercurius", "moirai", "zeithoven"]);
});

test("separates Aletheia instruments from Anima player voices", () => {
  const moirai = aletheiaPerformanceInstruments.find((entry) => entry.name === "moirai");
  assert.equal(moirai?.executionRelation, "rehearing_instrument");
  assert.deepEqual(moirai?.tools, [
    "aletheia_session_promote",
    "aletheia_gnosis_query",
    "aletheia_crystallise",
    "aletheia_thought_route",
    "aletheia_seed_refresh",
  ]);
});
```

**Step 2: Run test to verify it fails**

```bash
node --experimental-strip-types --test Body/S/S4/ta-onta/S4-5p-aletheia/modules/performance-instruments.test.ts
```

Expected: FAIL with missing module.

**Step 3: Implement registry**

```ts
export interface AletheiaPerformanceInstrument {
  name: "anansi" | "moirai" | "janus" | "mercurius" | "agora" | "zeithoven";
  executionRelation: "rehearing_instrument";
  musicalFunction: string;
  tools: string[];
  skills: string[];
}

export const aletheiaPerformanceInstruments: AletheiaPerformanceInstrument[] = [
  {
    name: "anansi",
    executionRelation: "rehearing_instrument",
    musicalFunction: "silence_and_gap_detector",
    tools: ["aletheia_gnosis_query", "hen_hybrid_retrieve"],
    skills: ["aletheia:gnosis-retrieve", "aletheia:repl"],
  },
  {
    name: "moirai",
    executionRelation: "rehearing_instrument",
    musicalFunction: "trace_measure_cut",
    tools: ["aletheia_session_promote", "aletheia_gnosis_query", "aletheia_crystallise", "aletheia_thought_route", "aletheia_seed_refresh"],
    skills: ["aletheia:thought-distil", "aletheia:gnosis-retrieve"],
  },
  {
    name: "janus",
    executionRelation: "rehearing_instrument",
    musicalFunction: "temporal_threshold",
    tools: ["chronos_temporal_status", "chronos_kairos_fetch", "hen_hybrid_retrieve", "aletheia_gnosis_query"],
    skills: ["aletheia-stack-traverse"],
  },
  {
    name: "mercurius",
    executionRelation: "rehearing_instrument",
    musicalFunction: "cross_domain_signal_transport",
    tools: ["chronos_kairos_status", "chronos_kairos_fetch", "hen_hybrid_retrieve", "aletheia_gnosis_query"],
    skills: ["aletheia-improvement-propose"],
  },
  {
    name: "agora",
    executionRelation: "rehearing_instrument",
    musicalFunction: "parallel_evidence_square",
    tools: ["aletheia_gnosis_query", "hen_hybrid_retrieve"],
    skills: ["aletheia-plugin-integrate"],
  },
  {
    name: "zeithoven",
    executionRelation: "rehearing_instrument",
    musicalFunction: "next_theme_manifestor",
    tools: ["chronos_cron_register", "chronos_cron_list", "chronos_temporal_status", "hen_template_invoke"],
    skills: ["aletheia-self-extend", "aletheia-improvement-propose"],
  },
];
```

**Step 4: Update README**

Add a short section to `S5'/agents/README.md`:

```markdown
## Musical Execution Instrumentation

Aletheia agents are not player voices in the Anima choir. They are rehearing instruments: they listen, measure, translate, aggregate, and recompose from VAK performance traces.
```

**Step 5: Run test**

```bash
node --experimental-strip-types --test Body/S/S4/ta-onta/S4-5p-aletheia/modules/performance-instruments.test.ts
```

Expected: PASS.

**Step 6: Commit**

```bash
git add Body/S/S4/ta-onta/S4-5p-aletheia/modules/performance-instruments.ts Body/S/S4/ta-onta/S4-5p-aletheia/modules/performance-instruments.test.ts "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/README.md"
git commit -m "feat: declare aletheia musical rehearing instruments"
```

---

### Task 8: Aletheia Rehearing Diagnostics

**Files:**
- Create: `Body/S/S4/ta-onta/S4-5p-aletheia/modules/vak-rehearing.ts`
- Create: `Body/S/S4/ta-onta/S4-5p-aletheia/modules/vak-rehearing.test.ts`

**Step 1: Write the failing test**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { rehearVakPerformanceTrace } from "./vak-rehearing.ts";

test("detects Sophia leading-tone without enriched Nous return", () => {
  const result = rehearVakPerformanceTrace([
    { music: { pitch: { pitchClass: "B" } }, agent: "sophia", vak: { cf: "(5/0)", direction: "night_prime" } },
    { music: { pitch: { pitchClass: "B" } }, agent: "sophia", vak: { cf: "(5/0)", direction: "night_prime" } },
  ] as any);

  assert.equal(result.resolvedCadence, false);
  assert.equal(result.diagnostics[0].kind, "unresolved_leading_tone");
});

test("accepts B to C as resolved cadence", () => {
  const result = rehearVakPerformanceTrace([
    { music: { pitch: { pitchClass: "B" } }, agent: "sophia", vak: { cf: "(5/0)", direction: "night_prime" } },
    { music: { pitch: { pitchClass: "C" } }, agent: "nous", vak: { cf: "(00/00)", direction: "day" } },
  ] as any);

  assert.equal(result.resolvedCadence, true);
  assert.equal(result.diagnostics.length, 0);
});
```

**Step 2: Run test to verify it fails**

```bash
node --experimental-strip-types --test Body/S/S4/ta-onta/S4-5p-aletheia/modules/vak-rehearing.test.ts
```

Expected: FAIL with missing module.

**Step 3: Implement rehearing**

```ts
interface Diagnostic {
  kind: "unresolved_leading_tone" | "missing_night_rehearing" | "anima_drone" | "logos_loop";
  message: string;
}

export function rehearVakPerformanceTrace(events: any[]) {
  const diagnostics: Diagnostic[] = [];
  const pitches = events.map((event) => event.music?.pitch?.pitchClass).filter(Boolean);
  const hasSophia = pitches.includes("B");
  const resolvedCadence = hasSophia && pitches[pitches.lastIndexOf("B") + 1] === "C";

  if (hasSophia && !resolvedCadence) {
    diagnostics.push({
      kind: "unresolved_leading_tone",
      message: "Sophia/B appeared without enriched Nous/C return.",
    });
  }

  if (!events.some((event) => event.vak?.direction === "night_prime")) {
    diagnostics.push({
      kind: "missing_night_rehearing",
      message: "Performance trace has no Night' rehearing events.",
    });
  }

  return { resolvedCadence, diagnostics };
}
```

**Step 4: Run test**

```bash
node --experimental-strip-types --test Body/S/S4/ta-onta/S4-5p-aletheia/modules/vak-rehearing.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add Body/S/S4/ta-onta/S4-5p-aletheia/modules/vak-rehearing.ts Body/S/S4/ta-onta/S4-5p-aletheia/modules/vak-rehearing.test.ts
git commit -m "feat: diagnose vak musical rehearing traces"
```

---

### Task 9: S5 Epii Recompose From Rehearing

**Files:**
- Modify: `Body/S/S5/epii-autoresearch-core/src/lib.rs`
- Modify: `Body/S/S5/epii-autoresearch-core/tests/improvement_loop.rs`

**Step 1: Write the failing Rust test**

Append to `improvement_loop.rs`:

```rust
#[test]
fn propose_from_rehearing_creates_recomposition_vector() {
    let root = temp_store_root("propose_from_rehearing_creates_recomposition_vector");
    let store = ImprovementStore::new(&root);

    let run = store
        .propose_from_rehearing(RehearingEnvelope {
            trace_path: ".pi/vak-performance/events.jsonl".to_owned(),
            day_id: "19-05-2026".to_owned(),
            session_key: "agent:anima:main".to_owned(),
            target_family: "S".to_owned(),
            target_coordinate: "S4/S4'".to_owned(),
            diagnostics: vec![MusicalDiagnostic {
                kind: "unresolved_leading_tone".to_owned(),
                message: "Sophia/B appeared without enriched Nous/C return.".to_owned(),
            }],
        })
        .expect("rehearing envelope should create autoresearch vector");

    assert_eq!(run.loop_state, LoopState::Hypothesis);
    assert_eq!(run.target_coordinate, "S4/S4'");
    assert!(run.direction.contains("unresolved_leading_tone"));
    assert_eq!(run.baseline.kind.as_deref(), Some("vak-performance-trace"));
}
```

Also add imports:

```rust
use epi_s5_epii_autoresearch_core::{MusicalDiagnostic, RehearingEnvelope};
```

**Step 2: Run test to verify it fails**

```bash
cargo test --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml propose_from_rehearing_creates_recomposition_vector
```

Expected: FAIL with missing types/method.

**Step 3: Implement types and method**

In `src/lib.rs`:

```rust
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct MusicalDiagnostic {
    pub kind: String,
    pub message: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RehearingEnvelope {
    pub trace_path: String,
    pub day_id: String,
    pub session_key: String,
    pub target_family: String,
    pub target_coordinate: String,
    pub diagnostics: Vec<MusicalDiagnostic>,
}
```

Add to `impl ImprovementStore`:

```rust
pub fn propose_from_rehearing(&self, envelope: RehearingEnvelope) -> Result<ImprovementRun, String> {
    if envelope.trace_path.trim().is_empty() {
        return Err("trace_path is required".to_owned());
    }
    if envelope.diagnostics.is_empty() {
        return Err("at least one musical diagnostic is required".to_owned());
    }

    let direction = envelope
        .diagnostics
        .iter()
        .map(|diagnostic| format!("{}: {}", diagnostic.kind, diagnostic.message))
        .collect::<Vec<_>>()
        .join("; ");

    self.propose(ProposeRequest {
        target_family: envelope.target_family,
        target_coordinate: envelope.target_coordinate,
        direction,
        source_review_item_id: None,
        baseline: ArtifactRef {
            path: envelope.trace_path,
            coordinate: Some(format!("day:{} session:{}", envelope.day_id, envelope.session_key)),
            kind: Some("vak-performance-trace".to_owned()),
        },
    })
}
```

**Step 4: Run test**

```bash
cargo test --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml propose_from_rehearing_creates_recomposition_vector
```

Expected: PASS.

**Step 5: Run full crate tests**

```bash
cargo test --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml
```

Expected: PASS.

**Step 6: Commit**

```bash
git add Body/S/S5/epii-autoresearch-core/src/lib.rs Body/S/S5/epii-autoresearch-core/tests/improvement_loop.rs
git commit -m "feat: let epii recompose from vak rehearing"
```

---

### Task 10: Pleroma And Epi-Logos Skill Propagation

**Files:**
- Create: `Body/S/S4/plugins/pleroma/skills/z-thread/SKILL.md`
- Modify: `Body/S/S4/plugins/pleroma/capability-matrix.json`
- Modify: `Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py`
- Create: `Body/S/S5/plugins/epi-logos/skills/recompose-from-rehearing/SKILL.md`
- Modify: `Body/S/S5/tests/test_epii_agent_contract.py`

**Step 1: Extend Pleroma matrix test**

In `test_capability_matrix.py`, add `z-thread` to the required skill list and assert Anima can use it:

```python
self.assertIn("z-thread", skill_names)
self.assertIn("z-thread", anima_skills)
```

**Step 2: Run test to verify it fails**

```bash
python3 -m unittest Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py
```

Expected: FAIL because `z-thread` is not in the matrix.

**Step 3: Add Pleroma z-thread skill**

Create `Body/S/S4/plugins/pleroma/skills/z-thread/SKILL.md`:

```markdown
---
name: z-thread
description: Self-composing VAK execution cycle: compose goal, perform via Anima, record performance trace, rehear through Aletheia, and hand Epii a recomposition envelope.
---

# Z-Thread

Use when a goal should become a self-composing development loop rather than a one-shot dispatch.

## Contract

Z-thread encloses CFP0-CFP5 textures. It does not replace them.

1. Compose from `/goal` or `goal-prelude`.
2. Perform through `vak-evaluate`, `anima-orchestration`, and the selected CFP dispatch.
3. Record VAK performance events to `.pi/vak-performance/events.jsonl`.
4. Rehear with Aletheia Night' diagnostics.
5. Deposit a recomposition request for Epii.

## Guard

Do not schedule raw user intent. Chronos may schedule only compiled GoalSpec or Z-thread envelopes with trace/rehearing destinations.
```

**Step 4: Update capability matrix**

Add to `skills`:

```json
{
  "name": "z-thread",
  "layer": "S4/S4'",
  "kind": "self-composing-execution"
}
```

Add `"z-thread"` to `agent_capability_gates.anima.skills`.

**Step 5: Add S5 Epi-Logos skill**

Create `Body/S/S5/plugins/epi-logos/skills/recompose-from-rehearing/SKILL.md`:

```markdown
---
name: recompose-from-rehearing
description: Use when Aletheia has produced a VAK musical rehearing envelope and S5 Epii must produce the next improvement vector or goal-prelude seed.
---

# Recompose From Rehearing

Use the rehearing envelope as evidence, not as a verdict. Epii proposes or evaluates the next form; it does not bypass review gates or human-required approvals.

Required input:

- VAK performance trace path
- Aletheia diagnostics
- target family and coordinate
- day/session identity

Output:

- Epii autoresearch proposal
- keep/discard evaluation evidence when available
- next GoalPrelude seed or explicit unresolved cadence note
```

**Step 6: Add S5 plugin contract test**

In `Body/S/S5/tests/test_epii_agent_contract.py`, assert the new skill exists:

```python
def test_recompose_from_rehearing_skill_exists():
    skill = Path("Body/S/S5/plugins/epi-logos/skills/recompose-from-rehearing/SKILL.md")
    assert skill.is_file()
    text = skill.read_text(encoding="utf-8")
    assert "VAK musical rehearing envelope" in text
    assert "does not bypass review gates" in text
```

**Step 7: Run tests**

```bash
python3 -m unittest Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py
```

Expected: PASS.

```bash
python3 -m pytest Body/S/S5/tests/test_epii_agent_contract.py
```

Expected: PASS.

**Step 8: Commit**

```bash
git add Body/S/S4/plugins/pleroma/skills/z-thread/SKILL.md Body/S/S4/plugins/pleroma/capability-matrix.json Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py Body/S/S5/plugins/epi-logos/skills/recompose-from-rehearing/SKILL.md Body/S/S5/tests/test_epii_agent_contract.py
git commit -m "feat: propagate z-thread rehearing skills"
```

---

### Task 11: Focused Spec Documentation

**Files:**
- Create: `docs/specs/S/S4/2026-05-19-vak-musical-execution.md`

**Step 1: Write the spec**

```markdown
# VAK Musical Execution

## Thesis

VAK musicality is a deterministic projection of the execution grammar, not a decorative UI layer.

## Axis Separation

- 12 MEF lenses: scale-beneath / substrate
- 7 CFs: modal-relational grammar and agent voice
- 6 VAK layers: score address fields
- constitutional agents: player voices under Anima
- Aletheia agents: rehearing instruments

## Minimum Evolute

1. Emit VAK performance events.
2. Persist JSONL trace.
3. Rehear with Aletheia.
4. Recompose through Epii.
5. Render MIDI/audio later.

## Z-Thread

Z-thread is self-composing, not zero-touch. Completion means the cycle returns to enriched ground with either a next playable score or an explicit unresolved cadence.
```

**Step 2: Verify key phrases**

```bash
rg "self-composing|Axis Separation|Minimum Evolute" docs/specs/S/S4/2026-05-19-vak-musical-execution.md
```

Expected: all three phrases appear.

**Step 3: Commit**

```bash
git add docs/specs/S/S4/2026-05-19-vak-musical-execution.md
git commit -m "docs: specify vak musical execution loop"
```

---

### Task 12: Final Verification Pass

**Files:**
- No new files.

**Step 1: Run S4 TypeScript tests**

```bash
node --experimental-strip-types --test Body/S/S4/ta-onta/S4-4p-anima/S4/vak-performance.test.ts Body/S/S4/ta-onta/S4-4p-anima/S4/vak-performance-recorder.test.ts Body/S/S4/ta-onta/S4-4p-anima/S4/z-thread.test.ts Body/S/S4/ta-onta/S4-5p-aletheia/modules/performance-instruments.test.ts Body/S/S4/ta-onta/S4-5p-aletheia/modules/vak-rehearing.test.ts
```

Expected: PASS.

**Step 2: Run plugin contract tests**

```bash
python3 -m unittest Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py Body/S/S4/pi-agent/tests/test_agent_team_config.py
```

Expected: PASS.

**Step 3: Run S5 tests**

```bash
cargo test --manifest-path Body/S/S5/epii-review-core/Cargo.toml
```

Expected: PASS.

```bash
cargo test --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml
```

Expected: PASS.

**Step 4: Run GitNexus detect changes if available**

```bash
npx gitnexus analyze
```

Expected: PASS, or document native module architecture blocker if still present.

**Step 5: Inspect status**

```bash
git status --short
```

Expected: only intentional files from this plan are changed, alongside pre-existing unrelated dirty work.

**Step 6: Commit final verification note if needed**

If an implementation log was created, commit it:

```bash
git add docs/plans/artifacts/2026-05-19-vak-musical-execution-impact.md
git commit -m "docs: record vak musical execution verification"
```

---

## Execution Notes

- Do not add live audio, cpal, Bevy, or Tauri UI in this first increment.
- Do not let musical projection influence VAK evaluation decisions yet. It observes and diagnoses first.
- Do not make Z-thread cron-capable until it only accepts compiled GoalSpec/Z envelopes.
- Keep Aletheia subagents as instruments/listeners and Anima subagents as player voices.
- Epii receives rehearing envelopes as evidence and proposes recomposition; it must not bypass review or human gates.
