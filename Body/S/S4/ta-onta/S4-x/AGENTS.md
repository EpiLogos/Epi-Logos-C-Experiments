# AGENTS.md — S4-x

## Purpose
Cross-carrier S4 skill surface for local-only [[Nara]] LoRA/corpus skills that feed the [[E_4]] personal-energy substrate. No crate/package manifest sits here — the executable surfaces are individual skill scripts and tests.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S4-SPEC]] -> [[M'-ML-SKILL-SURFACE-SPEC]]

## Ownership
- `skills/nara-voice-training/` — local-only LoRA adaptation over journal, dream, and phone-writing corpus; materialises the real local JSONL consumed by MLX and emits checkpoint references for `E4PersonalInputs.lora_checkpoint`. Invoked through `epi nara train-lora` or directly by its skill entrypoint.
- `skills/nara-journal-parser/` — local-only parser that emits handle-safe summaries and hashes; never emits raw private body text.
- `skills/mlx-lora/` — Apple-Silicon native local-only LoRA train/merge/quantize/eval path named by [[M'-ML-SKILL-SURFACE-SPEC]] §3.1.
- Does NOT own [[PASU]] mutation, [[M4']] domain law, cloud model routing, or kernel energy math. [[PASU]] remains a read substrate; kernel scalar/gradient math lives in `Body/S/S0/portal-core/src/kernel.rs`.

## Local Contracts
- `skills/nara-voice-training/SKILL.md`
- `skills/nara-journal-parser/SKILL.md`
- `skills/mlx-lora/SKILL.md`
- Owning specs: [[M'-ML-SKILL-SURFACE-SPEC]], [[M'-MODEL-SLOT-SPEC]], [[M4'-SPEC]].

## Work Guidance
- Keep every training, parsing, checkpoint, merge, quantize, and eval path `local-only`; refuse cloud routes unconditionally per [[M'-MODEL-SLOT-SPEC]].
- Do not add a cloud opt-in branch for [[Nara]] LoRA content.
- Keep hyperparameters and output paths config-driven; do not hardcode training thresholds.
- Emit hashes/checkpoint refs/handle-safe summaries, not raw journal/dream/phone-writing body text.

## Verification
- `python3 -m unittest Body/S/S4/ta-onta/S4-x/skills/nara-voice-training/tests/test_voice_training_pipeline.py`
- `python3 -m unittest Body/S/S4/ta-onta/S4-x/skills/nara-journal-parser/tests/test_journal_parser.py`
- `python3 -m unittest Body/S/S4/ta-onta/S4-x/skills/mlx-lora/tests/test_local_only_gate.py`
- `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test nara_train_lora_cli` for the real S0 command membrane into this skill family.

## Child DOX Index
- (leaf)
