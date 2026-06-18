---
name: nara-voice-training
description: Local-only Nara LoRA adaptation over the user's journal, dream, and phone-writing corpus; writes checkpoint references for E_4 personal energy.
privacy_class: local-only
---

# nara-voice-training

Use this skill for `pi nara train-lora` training runs. It prepares the local Nara corpus and delegates to `mlx-lora` on Apple Silicon or the Rust-native local LoRA path once Stream B/D binds the kernel runtime.

## Contract

- Corpus is exactly local journal + dream + phone-writings content.
- The script emits hashes and checkpoint references, not raw body text.
- The checkpoint reference carries `path`, `version`, and `privacy_class = local-only` for `E4PersonalInputs.lora_checkpoint`.
- Cloud routing is refused unconditionally per [[M'-MODEL-SLOT-SPEC]].
- Cache/checkpoint versioning uses per-document SHA-256 hashes plus `model_version_key`.

## Entrypoint

```bash
python3 Body/S/S4/ta-onta/S4-x/skills/nara-voice-training/scripts/train_lora.py --config config.json
```

## Verification

```bash
python3 -m unittest Body/S/S4/ta-onta/S4-x/skills/nara-voice-training/tests/test_voice_training_pipeline.py
```
