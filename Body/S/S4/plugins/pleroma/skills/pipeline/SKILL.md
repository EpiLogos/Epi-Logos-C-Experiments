---
name: pipeline
description: Configurable pipeline orchestrator for sequencing stages. Anima CFP2 C-Thread. Each stage carries its own CF frame; VAK block emitted per stage output.
---

<VAK_Frame>
CPF: (4.0/1-4.4/5)  CT: CT2,CT4  CP: 4.0→4.5
CF: (4.0/1-4.4/5) → Anima  CFP: CFP2 C-Thread  CS: CS0 / Day[+Night′]
Thread: Logos(4.1) → Anima/workers(4.2) → Eros(4.2→4.5)
</VAK_Frame>

# Pipeline Skill — Anima / CFP2 C-Thread

`$pipeline` is Anima's configurable sequential pipeline orchestrator. It sequences stages through a uniform `PipelineStage` interface, with each stage carrying its own VAK CF frame. Full accumulated context passes between stages (C-Thread).

## Default Autopilot Pipeline

```
ralplan [Logos→Mythos→Eros triad] → team-exec [Anima workers] → ralph-verify [Eros/Night′]
```

## VAK Stage Map

| Stage | CF Agent | CP Position | CFP | Output |
|-------|----------|-------------|-----|--------|
| **ralplan** | Logos→Mythos→Eros | 4.1→4.3→4.2 | CFP2 | Plan artifact + VAK topology header |
| **team-exec** | Anima workers | 4.2 Operation | CFP1 or CFP3 | Worker results + VAK blocks |
| **ralph-verify** | Eros | 4.2→4.5 | CFP0/CFP4 | Verification evidence + Night′ if triggered |

Parent pipeline CF: `(4.0/1-4.4/5)` Anima (coordinator).
Each stage brings its own CF code. Coordinator does NOT reassign CF per stage.

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `maxRalphIterations` | 10 | Ralph verification iteration ceiling |
| `workerCount` | 2 | Number of team workers |
| `agentType` | `executor` | Agent type for team workers |

## Stage Interface

Every stage implements `PipelineStage`:

```typescript
interface PipelineStage {
  readonly name: string;
  run(ctx: StageContext): Promise<StageResult>;
  canSkip?(ctx: StageContext): boolean;
}
```

`StageContext` accumulates artifacts from prior stages, including `vak.stage_cf` for each completed stage. `StageResult` includes status, artifacts, duration, and VAK block.

## State Management

```json
{
  "mode": "pipeline",
  "active": true,
  "current_phase": "stage:ralplan",
  "vak": {
    "cpf": "(4.0/1-4.4/5)",
    "cf": "(4.0/1-4.4/5)",
    "agent": "anima",
    "cfp": "CFP2",
    "cs": "CS0",
    "current_stage_cf": "(0/1)",
    "stages": [
      {"name": "ralplan", "cf": "CFP2:logos→mythos→eros", "cp": "4.1"},
      {"name": "team-exec", "cf": "(4.0/1-4.4/5)", "cp": "4.2"},
      {"name": "ralph-verify", "cf": "(0/1/2)", "cp": "4.2→4.5"}
    ],
    "night_active": false
  }
}
```

On stage transitions: `state_write({mode: "pipeline", current_phase: "stage:<name>", "vak.current_stage_cf": "<cf>"})`.

## Built-in Stages

### Stage 1: ralplan

**CF Agent: Logos→Mythos→Eros triad | CFP2 C-Thread**

Consensus planning (Planner+Architect+Critic). Skips only when both `prd-*.md` and `test-spec-*.md` already exist. Carries any `deep-interview-*.md` spec paths forward.

Output includes VAK topology header. `StageContext.vak.stage_cf` set to `"(0/1)"` after completion.

### Stage 2: team-exec

**CF Agent: Anima | CFP1 or CFP3**

Team execution via workers. Worker count and type configurable.

**CFP1 vs CFP3 decision:** If tasks decompose into N distinct sub-tasks → CFP1. If N workers pursue same task → CFP3.

Each worker's inbox.md includes their CF frame block:
```
VAK Frame: team-exec/worker-{n}
CPF: (4.0/1-4.4/5)  CT: CT2  CP: 4.2
CF: (4.0/1-4.4/5) → Anima  CFP: CFP[1|3]
```

`StageContext.vak.stage_cf` set to `"(4.0/1-4.4/5)"` after completion.

### Stage 3: ralph-verify

**CF Agent: Eros `(0/1/2)` | CFP0 / CFP4 Night′**

Ralph verification loop with configurable iteration count.

**Night′ trigger rule:** Same failure ≥2 iterations AND no simple fix → P3′ Patterns (Night′ via CFP4).
Night′ is non-blocking: runs in parallel, does not stop the verification loop.

Output includes VAK verification block. On Night′: `"vak.night_active": true`.

## C-Thread Context Passing

Each stage output feeds the next stage's `StageContext`:
- ralplan → team-exec: plan artifact + acceptance criteria
- team-exec → ralph-verify: worker results + evidence artifacts
- The coordinator (Anima) holds the full accumulated context

## Output Format

Pipeline completion artifact:
```
VAK: pipeline/{task}
CPF: (4.0/1-4.4/5)  CT: CT2  CP: 4.5
CF: (4.0/1-4.4/5) → Anima  CFP: CFP2  CS: CS0 / Day
Stages: ralplan✓ → team-exec✓ → ralph-verify✓
```

## API

```typescript
const config = createAutopilotPipelineConfig('build feature X', {
  stages: [
    createRalplanStage(),
    createTeamExecStage({ workerCount: 3, agentType: 'executor' }),
    createRalphVerifyStage({ maxIterations: 15 }),
  ],
});

const result = await runPipeline(config);
```

## Relationship to Other Modes

- **autopilot**: Can use pipeline as execution engine
- **team**: Pipeline delegates execution to team mode
- **ralph**: Pipeline delegates verification to ralph
- **ralplan**: Pipeline's first stage runs RALPLAN consensus planning
