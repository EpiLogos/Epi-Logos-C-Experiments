---
name: mlx-lora
description: Apple-Silicon native local-only LoRA training, merge, quantize, and eval path for the Nara parser slot and other local LoRA adapters.
privacy_class: local-only
---

# mlx-lora

## Coordinate Header

- **Coordinate:** `S4-4`
- **Residency:** `Body/S/S4/ta-onta/S4-x/skills/mlx-lora/SKILL.md` (cross-carrier S4 residency, actualises [[M4']])
- **Position (#4):** Lived context / personal substrate
- **Actualises:** [[M'-ML-SKILL-SURFACE-SPEC]], [[M'-MODEL-SLOT-SPEC]], and [[05-m4-nara-reconciliation]] tranche 5.22
- **Public surface:** local Apple-Silicon train, merge, quantize, and evaluation scripts
- **Does NOT own:** Corpus selection, [[E_4]] energy math, or any cloud execution path

Use this skill when the runtime target is Apple Silicon and a LoRA adapter must be trained or served locally. It implements the custom `mlx-lora` path named by [[M'-ML-SKILL-SURFACE-SPEC]] §3.1 and preserves the local-only privacy commitment in [[M'-MODEL-SLOT-SPEC]].

## Contract

- Refuse every non-`local-only` training, merge, quantize, or eval request.
- Refuse remote paths such as `https://`, `s3://`, and `gs://`.
- Do not offer a cloud opt-in path. Nara LoRA content stays on-device.
- Record runtime provenance as `mlx-lora`; this is a runtime-target decision, not a privacy-class change.
- Keep rank, learning rate, checkpoint version, and output paths config-driven.

## Entrypoints

- `scripts/train.py --config config.json [--dry-run]`
- `scripts/merge.py --adapter PATH --base-model MODEL --output PATH [--dry-run]`
- `scripts/quantize.py --model PATH --output PATH --bits 4|5|8 [--dry-run]`
- `scripts/eval.py --checkpoint PATH --validation-jsonl PATH`

## Verification

Run:

```bash
python3 -m unittest Body/S/S4/ta-onta/S4-x/skills/mlx-lora/tests/test_local_only_gate.py
```
