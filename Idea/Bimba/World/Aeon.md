---
coordinate: "C1"
c_4_artifact_role: "aeon-template"
c_1_ct_type: "CT4b"
c_3_ctx_frame: "4.0/1-4.4/5"
c_4_vak_coordinate: "{{vak_coordinate}}"
c_5_crystallisation_state: "crystallised_world_form"
c_0_source_coordinates:
  - "[[CT1]]"
  - "[[CT4b]]"
  - "[[CT5]]"
  - "[[NOW]]"
  - "[[Seed]]"
  - "[[CT4b-MASTER-TEMPLATE]]"
  - "[[TYPE-REGISTRY]]"
  - "[[S1']]"
  - "[[S4']]"
  - "[[S5']]"
  - "[[S1'-WORLD-TYPES-CRYSTALLIZATION-PROTOCOL]]"
  - "[[46-aeon-loop-unit-paradigm]]"
c_4_parameterisation:
  aeon_id: "{{aeon_id}}"
  aeon_name: "{{aeon_name}}"
  z_thread_id: "{{z_thread_id}}"
  vak_coordinate: "{{vak_coordinate}}"
  cpf: "{{cpf}}"
  ct: "CT4b"
  cp: "{{cp}}"
  cf: "{{cf}}"
  cfp: "{{cfp}}"
  cs: "{{cs}}"
  consent_gate: "{{consent_gate}}"
  invocation_profile: "{{invocation_profile}}"
  schedule: "{{cron_expression}}"
  on_event:
    kind: "result-drop"
    purpose: "{{result_drop_purpose}}"
  consent_posture:
    cpf: "{{cpf}}"
    granted: "{{consent_granted}}"
    consent_gate: "{{consent_gate}}"
  rubric_ref: "{{rubric_ref}}"
  eval_ledger_ref: "{{eval_ledger_ref}}"
  transcript_ref: "{{transcript_ref}}"
  return_insight_ref: "{{return_insight_ref}}"
---

# [[Aeon]]

An [[Aeon]] is a reusable, named, parameterised loop form: a proven Z-thread from [[46-aeon-loop-unit-paradigm]] crystallised as a [[CT4b]] /World template so it can be invoked, verified, improved, and returned through the [[S5']] synthesis/verification surface rather than rebuilt per run.

It spans [[CT1]] definition, [[CT4b]] running shape, and [[CT5]] synthesis. Its residency is [[CT4b]] because the live form is the full #0-#5 fractal loop with a Mobius return.

## #0 Ground - Proven Loop

- Source loop: `{{z_thread_id}}`
- Aeon name: `{{aeon_name}}`
- Prior proof: `{{transcript_ref}}`
- Consent / CPF gate: `{{consent_gate}}`
- Ground question: `{{ground_question}}`

## #1 Definition - VAK Address

```yaml
vak_coordinate: "{{vak_coordinate}}"
cpf: "{{cpf}}"
ct: "CT4b"
cp: "{{cp}}"
cf: "{{cf}}"
cfp: "{{cfp}}"
cs: "{{cs}}"
```

The definition binds the difference between runs. The VAK address under [[S4']] is the Aeon's invocation argument, while this template remains the stable CT4b form.

Autonomous invocation is valid only when the consent posture grants CPF `(4.0/1-4.4/5)`. CPF `(00/00)` remains dialogical: it can prepare or propose an Aeon run, but it must not fire without renewed user dialogue.

## #2 Operation - Dispatch Composition

- Invocation profile: `{{invocation_profile}}`
- Schedule: `{{cron_expression}}`
- On-event trigger: `result-drop:{{result_drop_purpose}}`
- Consent posture: `{{consent_posture}}`
- CFP composition: `{{cfp_composition}}`
- Required tools / skills: `{{required_capabilities}}`
- Inputs: `{{inputs}}`
- Outputs: `{{outputs}}`
- Verification gate: `{{verification_gate}}`

## #3 Pattern - Reusable Loop Shape

- Pattern name: `{{pattern_name}}`
- What repeats: `{{repeating_structure}}`
- What must vary by run: `{{variable_bindings}}`
- What must not vary: `{{invariants}}`
- Failure signals: `{{failure_signals}}`

## #4 Context - Residency And Retrieval

- Home coordinate: [[CT4b]]
- Type source: [[TYPE-REGISTRY]]
- Template authority: [[S1']] via [[S1'-WORLD-TYPES-CRYSTALLIZATION-PROTOCOL]]
- Runtime holder: [[S4']]
- Invocation carrier: `techne_vama_summon`
- Discovery surface: `{{discovery_surface}}`
- Entitlement class: `{{entitlement_class}}`

## #5 Integration - Syzygy Return

- Rubric: `{{rubric_ref}}`
- Eval ledger: `{{eval_ledger_ref}}`
- What crystallised: `{{p5_insight}}`
- What reopens: `{{p0_questions}}`

AEON_RETURN: [P5′ insight] | [P0′ questions]

The return is the Aeon's improvement seam: [[P5']] insight is distilled through [[S5']], [[P0']] questions reopen the next ground, and the verified change carries into the next invocation.

## Graduation Accrual Ledger

The Night' rehear/recompose path may append or replace an `aeon-graduation` block for a named [[Aeon]] after a proven Z-thread receives explicit CPF `(00/00)` graduation consent. Each block preserves the loop's CFP composition, current rubric, accumulated eval history, run history with bound VAK args, and the q-proposal payload that `aletheia_session_promote` can promote as the rubric-improvement candidate.

The block is additive by [[Aeon]] id: a second run reuses the same form, appends the new run/eval evidence, and replaces only the current rubric/proposal surface so the [[Aeon]] improves across cycles rather than being rewritten.
