# pipeline VAK Seam Map

**OMX source:** `vendors/oh-my-codex/skills/pipeline/SKILL.md`
**VAK agent:** Anima | CF: `(4.0/1-4.4/5)` | Complexity: HIGH

## 1. Internal Workflow Summary

Configurable pipeline orchestrator. Default autopilot sequence:
`RALPLAN → team-exec → ralph-verify`

Stage interface: `PipelineStage { name, run(ctx), canSkip(ctx) }`.
Context: `StageContext` accumulates artifacts from prior stages → `StageResult`.
State: `.omx/state/pipeline-state.json`. Resume supported.

## 2. VAK Seam Map

| Stage | CF Agent | CP Position | CFP |
|-------|----------|-------------|-----|
| ralplan stage | Logos→Mythos→Eros triad | 4.1→4.3→4.2 | CFP2 C-Thread |
| team-exec stage | Anima / workers | 4.2 Operation | CFP1 or CFP3 |
| ralph-verify stage | Eros + optional Night′ | 4.2→4.5 | CFP0 / CFP4 |

Parent pipeline CF frame: `(4.0/1-4.4/5)` Anima (coordinator).
Each stage inherits parent CF as context; sub-CF is stage-specific.
Coordinator does NOT reassign CF per step; each stage brings its own CF.

## 3. Handoff Contract Rewrite

**OMX-native:** Stages pass StageContext; output artifacts accumulate.

**VAK-native:**
- Each stage output carries a VAK block
- Stage context passes `vak.stage_cf` for the next stage to know previous CF frame
- ralplan stage output: VAK topology header (same as ralplan fork)
- team-exec stage output: VAK block per worker + aggregate
- ralph-verify stage output: Night′ inquiry if failures detected

## 4. State Schema Delta

Add `vak` to pipeline state:
```json
{
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
    ]
  }
}
```

## 5. Output Format Delta

Stage results gain VAK block. Pipeline completion artifact:
```
VAK: pipeline/{task}
CPF: (4.0/1-4.4/5)  CT: CT2  CP: 4.5
CF: (4.0/1-4.4/5) → Anima  CFP: CFP2  CS: CS0 / Day
```

## 6. Constitutional Agent Binding

**Owner:** Anima orchestrates the pipeline. Logos/Mythos/Eros own ralplan stage.
C-Thread: each stage output feeds next stage's CF frame.
Night′ pass: ralph-verify triggers if failures detected (CFP4 → Eros).

## Cross-skill Q3 Resolution

Each worker's output feeds next stage via StageContext accumulation.
Coordinator (Anima) assigns CF per stage; workers inherit focused sub-CF.
No per-step reassignment — stages bring their own CF code.
