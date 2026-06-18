---
name: epii-distillation
description: Pro-to-local teacher/student distillation with multi-channel preservation annotations.
version: 0.1.0
tags: [epii, distillation, teacher-student, ml]
dependencies: [peft-fine-tuning, unsloth, mlx-lora]
---

# epii-distillation

Use this skill when Epii needs to manufacture local student artifacts from Pro-class teacher outputs while preserving lens coherence, verifier pass/fail signal, and user-articulation simulation.

## Entrypoints

- `scripts/distill_dataset_gen.py --source-jsonl INPUT --output-jsonl OUTPUT`
- `scripts/distill_train.py --dataset-jsonl INPUT --artifact-dir DIR --config-json CONFIG`
- `scripts/distill_eval.py --dataset-jsonl INPUT --predictions-jsonl PREDICTIONS`

The training script chooses `mlx-lora` on Darwin/arm64 and PEFT+Unsloth on Linux/CUDA from config/runtime metadata.
