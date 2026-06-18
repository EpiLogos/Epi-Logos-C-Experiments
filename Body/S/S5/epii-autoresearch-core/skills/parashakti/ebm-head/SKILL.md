---
name: parashakti-ebm-head
description: Rust-native N-channel 72-dimensional tritone-symmetric EBM training surface.
version: 0.1.0
tags: [parashakti, ebm, resonance, rust-native]
dependencies: [Body/S/S5/epii-autoresearch-core/src/resonance_ebm, scripts/train.rs]
---

# parashakti-ebm-head

Use this skill to train or export the Parashakti EBM head that consumes `MathemeHarmonicProfile` channels and produces a sigmoid-normalised 72-vector.

## Architecture

- N parallel channel encoders over `lens_resonance_72`, `audio_octet`, `nodal_quartet`, `planetary_chakral`, `mahamaya`, `codon_rotation_projection`, and `q_cosmic`.
- Cross-channel attention pattern is selected by config and tracked as the architecture variant.
- Three tritone-symmetric sub-heads preserve X+Y=5 mirror symmetry.
- Bioquaternion projection is learned with the head.

## Config

All latent dimensions, attention widths, learning rates, batch sizes, severity weights, and loss weights must resolve from `~/.epi-logos/config.toml` `[ml.parashakti_ebm_head]`.

Stream E's Gemini Embedding 2 accessor is required before real corpus embedding fetch can run.
